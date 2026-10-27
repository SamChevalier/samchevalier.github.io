/*
 * gridflow.js: a toy power grid drawn as a point cloud.
 *
 * Every bus obeys the swing equation
 *     M θ̈ + D θ̇ = P − Σⱼ Bᵢⱼ sin(θᵢ − θⱼ)
 * so a disturbance (load step, line trip, generator trip) makes power slosh
 * between machines until droop and AGC settle it. Dots stream along each
 * line at a speed proportional to its real power flow; lines near their
 * rating turn to the accent color.
 *
 * Click a line to trip or reclose it; click anywhere else for the next
 * scenario. Markup: <button class="gridflow"><canvas></canvas></button>
 * Style inspired by the parametric point cloud on plugins.omarchy.org.
 */
(function () {
  "use strict";

  const DAY = 150;          // simulated seconds per 24 h load cycle
  const TIME_SCALE = 0.6;   // slow the electromechanical swings for the eye
  const SUBSTEP = 0.004;    // integrator step (s)
  const KI = 1.2;           // AGC integral gain
  const FLOW_SPEED = 24;    // px/s of dot travel per unit of flow (100 MW)
  const TWO_PI = 2 * Math.PI;

  // Coordinates are normalized to the drawing area; powers are per unit.
  const BUSES = [
    { id: "hydro", name: "HYDRO", kind: "gen", x: .03, y: .24, dispatch: 1, pmax: 5 },
    { id: "nuclear", name: "NUCLEAR", kind: "gen", x: .06, y: .84, base: 4, pmax: 4 },
    { id: "subA", name: "SUB A", kind: "hub", x: .21, y: .52, load: .3 },
    { id: "campus", name: "CAMPUS", kind: "load", x: .35, y: .16, load: 2.8 },
    { id: "subB", name: "SUB B", kind: "hub", x: .39, y: .76, load: .3 },
    { id: "wind", name: "WIND", kind: "wind", x: .53, y: .06, cap: 3 },
    { id: "subC", name: "SUB C", kind: "hub", x: .57, y: .46, load: .3 },
    { id: "town", name: "TOWN", kind: "load", x: .58, y: .94, load: 1.1 },
    { id: "factory", name: "FACTORY", kind: "load", x: .75, y: .74, load: 2.4 },
    { id: "gas", name: "GAS", kind: "gen", x: .77, y: .2, dispatch: 1, pmax: 5 },
    { id: "solar", name: "SOLAR", kind: "solar", x: .96, y: .08, cap: 3 },
    { id: "city", name: "CITY", kind: "load", x: .96, y: .56, load: 3.2 },
  ];

  // [from, to, susceptance B, rating]
  const LINE_LIST = [
    ["hydro", "subA", 12, 3.2], ["hydro", "campus", 10, 2.8],
    ["nuclear", "subA", 12, 3.2], ["nuclear", "subB", 12, 3.2],
    ["subA", "campus", 14, 2.6], ["subA", "subB", 12, 1.6],
    ["campus", "subC", 10, 1.8], ["campus", "wind", 10, 2.4],
    ["wind", "gas", 10, 2], ["subB", "subC", 12, 2.2],
    ["subB", "town", 10, 2.2], ["subC", "gas", 12, 2.6],
    ["subC", "factory", 10, 2], ["town", "factory", 8, 1.2],
    ["factory", "city", 10, 1.6], ["gas", "solar", 12, 2.4],
    ["solar", "city", 10, 2.6], ["gas", "city", 10, 2.8],
    ["subC", "city", 8, 1.8],
  ];

  const KIND = {
    gen: { M: .8, D: .4 },
    hub: { M: .06, D: .15 },
    load: { M: .08, D: .3 },
    wind: { M: .04, D: .1 },
    solar: { M: .04, D: .1 },
  };

  const SCENARIOS = [
    { name: "BALANCED", every: 6, events: ["load"] },
    { name: "LINE TRIP", every: 8, events: ["line"], pick: "max", hold: 4.5 },
    { name: "GEN TRIP", every: 12, events: ["gen"] },
    { name: "WIND GUST", every: 9, events: ["load"], windCap: 5, gust: 1.4 },
    { name: "LOW INERTIA", every: 6, events: ["load", "gen"], mScale: .15, windCap: 5, solarCap: 5, gust: .5 },
    { name: "STORM", every: 4, events: ["line", "line", "load"], pick: "random", hold: 3, mScale: .6, windCap: 4.5, gust: 1.1 },
  ];

  const index = Object.fromEntries(BUSES.map((bus, i) => [bus.id, i]));
  const LINES = LINE_LIST.map(([from, to, B, cap]) => ({ i: index[from], j: index[to], B, cap }));
  const DISPATCH = BUSES.flatMap((bus, i) => (bus.dispatch ? [i] : []));
  const TRIPPABLE = ["gas", "nuclear", "hydro"].map((id) => index[id]);
  const LOADS = BUSES.flatMap((bus, i) => (bus.kind === "load" ? [i] : []));

  const bump = (x, mu, sigma) => Math.exp(-(((x - mu) / sigma) ** 2));
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const gauss = (rand) => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TWO_PI * rand());

  function createSim(rand = Math.random) {
    const n = BUSES.length;
    const m = LINES.length;
    const theta = new Float64Array(n);
    const omega = new Float64Array(n);
    const P = new Float64Array(n);
    const out = new Float64Array(n);
    const flow = new Float64Array(m);
    const on = new Uint8Array(m).fill(1);
    const reclose = new Float64Array(m);
    const avail = new Float64Array(n).fill(1);
    const back = new Float64Array(n);
    const extra = new Float64Array(n);
    const extraUntil = new Float64Array(n);
    const noise = new Float64Array(n);
    const s = {
      theta, omega, P, flow, on, avail, extra,
      time: 0, hour: 7, shape: 1, need: 0, z: 0, wcoi: 0,
      wind: .55, solar: 0, curtail: 1,
      scenario: SCENARIOS[0], nextEvent: 3, genTurn: 0, lastEvent: "",
    };

    const windCap = () => s.scenario.windCap ?? BUSES[index.wind].cap;
    const solarCap = () => s.scenario.solarCap ?? BUSES[index.solar].cap;
    const mass = (i) => {
      const bus = BUSES[i];
      const M = KIND[bus.kind].M;
      if (bus.kind !== "gen") return M;
      return (.08 + avail[i] * (M - .08)) * (s.scenario.mScale ?? 1);
    };

    // Slow quantities: daily load shape, solar, curtailment, scheduled dispatch.
    function schedule() {
      const hour = (s.time / DAY * 24 + 7) % 24;
      s.hour = hour;
      s.shape = .66 + .2 * bump(hour, 9, 2.5) + .32 * bump(hour, 19, 3)
        - .1 * bump(hour, 3.5, 3) - .1 * bump(hour, 27.5, 3);
      s.solar = hour > 6 && hour < 18 ? Math.sin(Math.PI * (hour - 6) / 12) ** 1.5 : 0;
      let load = 0;
      let firm = 0;
      for (let i = 0; i < n; i += 1) {
        const bus = BUSES[i];
        if (bus.load) load += bus.load * s.shape;
        if (bus.base) firm += bus.base;
      }
      const renewables = windCap() * s.wind + solarCap() * s.solar;
      s.curtail = renewables > 0 ? clamp((load - firm - 1.5) / renewables, 0, 1) : 1;
      s.need = load - firm - renewables * s.curtail;
    }

    function inject() {
      let weight = 0;
      for (const i of DISPATCH) weight += avail[i];
      const dispatch = s.need + s.z;
      for (let i = 0; i < n; i += 1) {
        const bus = BUSES[i];
        let p = 0;
        if (bus.load) p = -(bus.load * s.shape * (1 + .05 * noise[i]) + extra[i]);
        else if (bus.kind === "wind") p = windCap() * s.wind * s.curtail;
        else if (bus.kind === "solar") p = solarCap() * s.solar * s.curtail;
        else if (bus.base) p = avail[i] * (bus.base - .5 * omega[i]);
        else if (bus.dispatch) p = (weight ? dispatch * avail[i] / weight : 0) - 1.5 * avail[i] * omega[i];
        P[i] = p;
      }
    }

    function substep(dt) {
      inject();
      out.fill(0);
      for (let l = 0; l < m; l += 1) {
        const { i, j, B } = LINES[l];
        const f = on[l] ? B * Math.sin(theta[i] - theta[j]) : 0;
        flow[l] = f;
        out[i] += f;
        out[j] -= f;
      }
      let num = 0;
      let den = 0;
      for (let i = 0; i < n; i += 1) {
        const M = mass(i);
        omega[i] += dt * (P[i] - out[i] - KIND[BUSES[i].kind].D * omega[i]) / M;
        theta[i] += dt * omega[i];
        num += M * omega[i];
        den += M;
      }
      s.wcoi = num / den;
      s.z -= dt * KI * s.wcoi;
    }

    // Would removing line `skip` (with the current outages) island a bus?
    function connectedWithout(skip) {
      const seen = new Uint8Array(n);
      const stack = [0];
      seen[0] = 1;
      let count = 1;
      while (stack.length) {
        const k = stack.pop();
        for (let l = 0; l < m; l += 1) {
          if (l === skip || !on[l]) continue;
          const { i, j } = LINES[l];
          const other = i === k ? j : j === k ? i : -1;
          if (other >= 0 && !seen[other]) {
            seen[other] = 1;
            count += 1;
            stack.push(other);
          }
        }
      }
      return count === n;
    }

    function tripLine(l, hold) {
      on[l] = 0;
      reclose[l] = s.time + hold;
    }

    function fire() {
      const sc = s.scenario;
      const kind = sc.events[Math.floor(rand() * sc.events.length)];
      if (kind === "load") {
        const i = LOADS[Math.floor(rand() * LOADS.length)];
        const sign = rand() < .7 ? 1 : -1;
        extra[i] = sign * (.5 + .5 * rand());
        extraUntil[i] = s.time + 5;
        s.lastEvent = `${BUSES[i].name} ${sign > 0 ? "+" : "−"}${Math.round(Math.abs(extra[i]) * 100)} MW`;
      } else if (kind === "line") {
        const safe = [];
        for (let l = 0; l < m; l += 1) if (on[l] && connectedWithout(l)) safe.push(l);
        if (!safe.length) return;
        let l = safe[Math.floor(rand() * safe.length)];
        if (sc.pick === "max") {
          for (const k of safe) {
            if (Math.abs(flow[k]) / LINES[k].cap > Math.abs(flow[l]) / LINES[l].cap) l = k;
          }
        }
        tripLine(l, sc.hold);
        s.lastEvent = `${lineName(l)} tripped`;
      } else if (kind === "gen") {
        const i = TRIPPABLE[s.genTurn++ % 2];
        if (avail[i] < 1) return;
        avail[i] = 0;
        back[i] = s.time + 5;
        s.lastEvent = `${BUSES[i].name} tripped`;
      }
    }

    function events(dt) {
      for (let l = 0; l < m; l += 1) if (!on[l] && s.time >= reclose[l]) on[l] = 1;
      for (let i = 0; i < n; i += 1) {
        if (extra[i] && s.time >= extraUntil[i]) extra[i] = 0;
        if (avail[i] < 1 && s.time >= back[i]) avail[i] = Math.min(1, avail[i] + dt / 4);
      }
      if (s.time >= s.nextEvent) {
        fire();
        s.nextEvent = s.time + s.scenario.every * (.75 + .5 * rand());
      }
    }

    function advance(dtReal) {
      const dt = dtReal * TIME_SCALE;
      s.time += dt;
      const decay = Math.exp(-dt / 3);
      const kick = Math.sqrt(1 - decay * decay);
      for (const i of LOADS) noise[i] = decay * noise[i] + kick * gauss(rand);
      const gust = s.scenario.gust ?? .25;
      const target = .5 + .25 * Math.sin(TWO_PI * s.time / (DAY * .7));
      s.wind = clamp(s.wind + dt * (target - s.wind) / 4 + gust * Math.sqrt(dt) * .12 * gauss(rand), .02, 1);
      events(dt);
      schedule();
      const steps = Math.ceil(dt / SUBSTEP);
      for (let k = 0; k < steps; k += 1) substep(dt / steps);
    }

    // Start from the DC power flow solution so the first frame is settled.
    function init() {
      schedule();
      inject();
      const size = n - 1;
      const A = Array.from({ length: size }, () => new Float64Array(size + 1));
      for (const { i, j, B } of LINES) {
        for (const [a, b] of [[i, j], [j, i]]) {
          if (a === 0) continue;
          A[a - 1][a - 1] += B;
          if (b !== 0) A[a - 1][b - 1] -= B;
        }
      }
      for (let i = 1; i < n; i += 1) A[i - 1][size] = P[i];
      for (let c = 0; c < size; c += 1) {
        for (let r = c + 1; r < size; r += 1) {
          const f = A[r][c] / A[c][c];
          for (let k = c; k <= size; k += 1) A[r][k] -= f * A[c][k];
        }
      }
      for (let r = size - 1; r >= 0; r -= 1) {
        let sum = A[r][size];
        for (let k = r + 1; k < size; k += 1) sum -= A[r][k] * theta[k + 1];
        theta[r + 1] = sum / A[r][r];
      }
      for (let k = 0; k < 60; k += 1) advance(.05);
    }

    function lineName(l) {
      return `${BUSES[LINES[l].i].name}–${BUSES[LINES[l].j].name}`;
    }

    s.advance = advance;
    s.lineName = lineName;
    s.frequency = () => 60 + s.wcoi / TWO_PI;
    s.setScenario = (k) => {
      s.scenario = SCENARIOS[k];
      for (let l = 0; l < m; l += 1) if (!on[l] && reclose[l] !== Infinity) on[l] = 1;
      s.nextEvent = s.time + 1.5;
      s.lastEvent = "";
    };
    // Returns "tripped", "closed", or "island" (refused: would split the grid).
    s.toggleLine = (l) => {
      if (!on[l]) {
        on[l] = 1;
        return "closed";
      }
      if (!connectedWithout(l)) return "island";
      tripLine(l, Infinity);
      return "tripped";
    };

    init();
    return s;
  }

  function mount(frame) {
    const canvas = frame.querySelector("canvas");
    const context = canvas?.getContext("2d");
    if (!context) return;

    const sim = createSim();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const font = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    const trace = new Float32Array(180);
    let traceHead = 0;
    let scenarioIndex = 0;
    let width = 0;
    let height = 0;
    let nodes = [];
    let geometry = [];
    let hover = -1;
    let message = "";
    let messageUntil = 0;
    let windAngle = 0;
    let text = "#111";
    let accent = "#e4572e";

    const updateColors = () => {
      const styles = getComputedStyle(frame);
      text = styles.color || text;
      accent = styles.getPropertyValue("--gridflow-accent").trim() || accent;
    };

    const layout = () => {
      const bounds = frame.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);

      const left = 28;
      const right = 28;
      const top = 32;
      const bottom = 26;
      nodes = BUSES.map((bus) => ({
        x: left + bus.x * (width - left - right),
        y: top + bus.y * (height - top - bottom),
      }));

      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      geometry = LINES.map(({ i, j }, l) => {
        const a = nodes[i];
        const b = nodes[j];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const count = Math.max(10, Math.round(length / 2.6));
        const u = new Float32Array(count);
        const offset = new Float32Array(count);
        const show = new Float32Array(count);
        for (let k = 0; k < count; k += 1) {
          u[k] = (k + rand()) / count;
          offset[k] = rand() + rand() - 1;
          show[k] = rand();
        }
        return {
          ax: a.x, ay: a.y,
          dx: b.x - a.x, dy: b.y - a.y,
          nx: -(b.y - a.y) / length, ny: (b.x - a.x) / length,
          length, u, offset, show, count,
          phase: geometry[l]?.phase ?? rand(),
        };
      });
    };

    const nearestLine = (x, y) => {
      let best = -1;
      let bestDistance = 10;
      geometry.forEach((g, l) => {
        const t = clamp(((x - g.ax) * g.dx + (y - g.ay) * g.dy) / (g.length * g.length), .08, .92);
        const d = Math.hypot(g.ax + g.dx * t - x, g.ay + g.dy * t - y);
        if (d < bestDistance) {
          bestDistance = d;
          best = l;
        }
      });
      return best;
    };

    const dot = (x, y, size) => context.fillRect(x - size / 2, y - size / 2, size, size);

    const drawLines = (dt, now) => {
      for (let l = 0; l < geometry.length; l += 1) {
        const g = geometry[l];
        const line = LINES[l];
        const f = sim.flow[l];
        const loading = Math.abs(f) / line.cap;
        const closed = sim.on[l] === 1;

        context.fillStyle = closed ? text : accent;
        context.globalAlpha = closed
          ? (l === hover ? .6 : .24)
          : .3 + .25 * Math.sin(now * .008);
        const spacing = closed ? 6 : 4;
        for (let d = spacing / 2; d < g.length; d += spacing) {
          dot(g.ax + g.dx * d / g.length, g.ay + g.dy * d / g.length, closed ? .9 : 1.2);
        }
        if (!closed) continue;

        g.phase = (g.phase + FLOW_SPEED * f * dt / g.length) % 1;
        const visible = Math.min(1, .15 + .85 * loading);
        const spread = .6 + 4.5 * Math.min(loading, 1.2);
        const hot = loading > .9;
        context.globalAlpha = .35 + .5 * Math.min(loading, 1);
        for (let pass = 0; pass < 2; pass += 1) {
          context.fillStyle = pass ? accent : text;
          for (let k = 0; k < g.count; k += 1) {
            if (g.show[k] > visible) continue;
            if ((hot || k % 23 === 0) !== (pass === 1)) continue;
            let t = (g.u[k] + g.phase) % 1;
            if (t < 0) t += 1;
            const o = g.offset[k] * spread * Math.sin(Math.PI * t);
            dot(g.ax + g.dx * t + g.nx * o, g.ay + g.dy * t + g.ny * o, k % 11 === 0 ? 1.8 : 1.25);
          }
        }
      }
    };

    const drawBus = (bus, i, now) => {
      const { x, y } = nodes[i];
      const p = sim.P[i];
      let r = 4;
      context.fillStyle = text;

      if (bus.kind === "gen") {
        const level = clamp(p / bus.pmax, 0, 1);
        r = 9 + 6 * Math.sqrt(level);
        const spin = now * .0011 + 3 * sim.theta[i];
        const tripped = sim.avail[i] < 1;
        context.fillStyle = tripped ? accent : text;
        context.globalAlpha = tripped ? .35 + .3 * sim.avail[i] : .6;
        const ringDots = 22;
        for (let k = 0; k < ringDots; k += 1) {
          const a = spin * .35 + k * TWO_PI / ringDots;
          dot(x + r * Math.cos(a), y + r * Math.sin(a), 1.2);
        }
        context.globalAlpha = tripped ? .3 : .45 + .4 * level;
        for (let arm = 0; arm < 3; arm += 1) {
          const a = spin + arm * TWO_PI / 3;
          for (let d = 1.5; d < r - 1.5; d += 1.6) dot(x + d * Math.cos(a), y + d * Math.sin(a), 1.3);
        }
      } else if (bus.kind === "wind") {
        const level = clamp(p / Math.max(1e-6, sim.scenario.windCap ?? bus.cap), 0, 1);
        r = 15;
        context.globalAlpha = .65;
        for (let arm = 0; arm < 3; arm += 1) {
          const a = windAngle + arm * TWO_PI / 3;
          for (let d = 1.5; d < r; d += 1.5) {
            dot(x + d * Math.cos(a), y + d * Math.sin(a), d < 4 ? 1.7 : 1.2);
          }
        }
        context.globalAlpha = .25 + .5 * level;
        dot(x, y, 2.2);
      } else if (bus.kind === "solar") {
        const level = sim.solar * sim.curtail;
        r = 10;
        context.globalAlpha = .18 + .7 * level;
        for (let row = 0; row < 4; row += 1) {
          for (let col = 0; col < 5; col += 1) dot(x - 11 + col * 5 + row * 1.4, y - 6 + row * 4.2, 1.7);
        }
      } else if (bus.kind === "load") {
        const demand = -p;
        const stepped = sim.extra[i] !== 0;
        r = 6 + 3 * Math.sqrt(Math.max(0, demand));
        const count = Math.round(18 + 14 * Math.max(0, demand));
        let seed = i * 977 + 3;
        const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
        for (let k = 0; k < count; k += 1) {
          const a = rand() * TWO_PI;
          const d = r * Math.sqrt(rand());
          context.globalAlpha = .3 + .3 * Math.sin(now * .003 + k * 1.7) ** 2;
          context.fillStyle = stepped && k % 2 ? accent : text;
          dot(x + d * Math.cos(a), y + d * Math.sin(a), 1.4);
        }
      } else {
        context.globalAlpha = .5;
        for (let k = 0; k < 8; k += 1) dot(x + 4 * Math.cos(k * TWO_PI / 8), y + 4 * Math.sin(k * TWO_PI / 8), 1.3);
      }

      if (bus.kind !== "hub") {
        context.globalAlpha = .5;
        context.fillStyle = text;
        context.fillText(bus.name, x, y + r + 10);
      }
    };

    const drawReadout = () => {
      const f = sim.frequency();
      trace[traceHead] = f;
      traceHead = (traceHead + 1) % trace.length;

      context.font = `10px ${font}`;
      context.textAlign = "left";
      context.textBaseline = "alphabetic";
      context.fillStyle = text;
      context.globalAlpha = .7;
      const label = SCENARIOS[scenarioIndex].name;
      context.fillText(label, 2, 12);
      context.globalAlpha = .4;
      const hh = Math.floor(sim.hour);
      const mm = Math.floor((sim.hour - hh) * 60 / 15) * 15;
      const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      const status = sim.lastEvent && width >= 520 ? `${clock} · ${sim.lastEvent}` : clock;
      context.fillText(` · ${status}`, 2 + context.measureText(label).width, 12);

      // Frequency trace: ±0.1 Hz around 60 Hz.
      const traceWidth = Math.min(110, width * .2);
      const x0 = width - 2 - traceWidth;
      const yMid = 9;
      context.globalAlpha = .18;
      for (let x = 0; x < traceWidth; x += 4) dot(x0 + x, yMid, .8);
      for (let k = 0; k < trace.length; k += 1) {
        const value = trace[(traceHead + k) % trace.length];
        if (!value) continue;
        const dev = clamp((value - 60) / .1, -1, 1);
        context.globalAlpha = .25 + .5 * k / trace.length;
        context.fillStyle = Math.abs(dev) > .5 ? accent : text;
        dot(x0 + k * traceWidth / trace.length, yMid - dev * 8, 1.6);
      }
      context.textAlign = "right";
      context.fillStyle = text;
      context.globalAlpha = .7;
      context.fillText(`${f.toFixed(3)} Hz`, x0 - 8, 12);

      let hint = width < 520 ? "tap a line to trip it" : "click a line to trip it · elsewhere: next scenario";
      if (hover >= 0) {
        const l = hover;
        const f = sim.flow[l];
        const line = LINES[l];
        const [a, b] = f >= 0 ? [line.i, line.j] : [line.j, line.i];
        hint = sim.on[l]
          ? `${BUSES[a].name} → ${BUSES[b].name} · ${Math.round(Math.abs(f) * 100)} MW · ${Math.round(Math.abs(f) / line.cap * 100)}% of rating`
          : `${sim.lineName(l)} is open · click to reclose`;
      }
      if (performance.now() < messageUntil) hint = message;
      context.textAlign = "center";
      context.globalAlpha = .45;
      context.fillText(hint, width / 2, height - 4);
    };

    let last = 0;
    const draw = (now) => {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 30;
      last = now;
      if (!reducedMotion) {
        sim.advance(dt);
        windAngle += dt * (.4 + 4 * sim.wind * sim.curtail);
      }
      context.clearRect(0, 0, width, height);
      drawLines(reducedMotion ? 0 : dt, now);
      context.font = `9px ${font}`;
      context.textAlign = "center";
      BUSES.forEach((bus, i) => drawBus(bus, i, now));
      drawReadout();
      context.globalAlpha = 1;
    };

    const redrawStatic = () => {
      if (!reducedMotion) return;
      for (let k = 0; k < 120; k += 1) sim.advance(.05);
      window.requestAnimationFrame(draw);
    };

    const pointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      return nearestLine(event.clientX - bounds.left, event.clientY - bounds.top);
    };

    frame.addEventListener("pointermove", (event) => {
      hover = pointer(event);
    });
    frame.addEventListener("pointerleave", () => {
      hover = -1;
    });
    frame.addEventListener("click", (event) => {
      const l = event.detail ? pointer(event) : -1;
      if (l >= 0) {
        const result = sim.toggleLine(l);
        message = result === "island"
          ? `can't trip ${sim.lineName(l)}: it would island part of the grid`
          : `${sim.lineName(l)} ${result}`;
        messageUntil = performance.now() + 2500;
      } else {
        scenarioIndex = (scenarioIndex + 1) % SCENARIOS.length;
        sim.setScenario(scenarioIndex);
        frame.setAttribute("aria-label", `Toy power grid simulation, scenario ${SCENARIOS[scenarioIndex].name.toLowerCase()}. Activate for the next scenario.`);
      }
      redrawStatic();
    });

    new ResizeObserver(() => {
      layout();
      if (reducedMotion) window.requestAnimationFrame(draw);
    }).observe(frame);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", updateColors);
    updateColors();
    layout();

    if (reducedMotion) {
      redrawStatic();
      return;
    }

    // Animate at 30 fps only while the canvas is on screen and the tab is visible.
    let frameId = 0;
    let visible = false;
    let nextDrawAt = 0;
    const active = () => visible && document.visibilityState === "visible";
    const tick = (now) => {
      frameId = 0;
      if (!active()) return;
      if (now >= nextDrawAt) {
        nextDrawAt = now + 1000 / 30 - 1;
        draw(now);
      }
      frameId = window.requestAnimationFrame(tick);
    };
    const sync = () => {
      if (active() && !frameId) {
        last = 0;
        frameId = window.requestAnimationFrame(tick);
      }
      if (!active() && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(frame);
    document.addEventListener("visibilitychange", sync);
  }

  if (typeof module !== "undefined") {
    module.exports = { createSim, LINES, BUSES, SCENARIOS };
  } else {
    document.querySelectorAll(".gridflow").forEach(mount);
  }
})();
