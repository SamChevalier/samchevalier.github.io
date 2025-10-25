---
title: Dragons
layout: default
---
{% include mathjax-config.html %}

<h1  align="center">
    Optimization. Verification. Dynamics.<br>
    Here be dragons. <img src="/photos/dragon.jpg" alt="logo" style="height:32px; vertical-align:middle; margin-left:10px;">
</h1>

>"[Here be dragons](https://en.wikipedia.org/wiki/Here_be_dragons)" is a phrase used to indicate dangerous or **unexplored** territories, in imitation of a medieval practice of putting illustrations of dragons, sea monsters and other mythological creatures on uncharted areas of maps where potential dangers were thought to exist.

During my PhD, I audited nonlinear dynamics. Dr. Rosales started the course by explaining that **linear** dyanmical systems are fully explored: we know everything there is to know. However, the world of **nonlinear** dynamics is fairly unexplored: here be dragons.

This is a running **blog** of research questions, both mathematical and pseudomathematical. <!--, which are at the limits of my knowledge. -->

<!--
* Some questions are mathematical
* Some are pseudomathematical
* All are inspired by real life observations and hopefully have some degree of research value
-->

> My thinking is this: if I write down a sufficiently large number of research questions, a good one [**must** eventually emerge](https://en.wikipedia.org/wiki/Infinite_monkey_theorem). In the meantime, not every idea needs to be paper: some can be a blog post.

***




<!--
<h3 style="font-weight:bold; margin-bottom:5px;">Question #3: Does information propagate non-locally through a sparse graph?</h3>
<details markdown="1">
<summary><code>Post Date: 10/24/25</code></summary>

</details>
<hr style="height:15px; visibility:hidden;" />

-->











<h3 style="font-weight:bold; margin-bottom:5px;">Question #2: Can we use Lagrangian mechanics to simulate optimization problems?</h3>
<details markdown="1">
<summary><code>Post Date: 10/23/25</code></summary>

**tl;dr**: Quantum people do this all the time.

Drop a ping-pong ball into a mountain crevasse. It will ping-pong about until it reaches the bottom. And if we make some light convexity assumptions, it should reliably reach the true, actual bottom. 

This post is inspired by a computational problem: gradient-based methods tend to have a hard time solving some convex optimization problems. For example, problem **(6b)** in [our recent paper](https://arxiv.org/pdf/2406.13191) is easily solvable in the DC-OPF context, but when we posed a similar problem in the AC context, gradient descent had a very hard time solving the problem. This problem is convex, and it is virtually unconstrained, but we still couldn't solve it with gradient-based methods.

This is surprising: if you keep moving downhill, won't you *eventually* just reach the bottom? Maybe.

In graduate school, I took the Course 2 (MechE) graduate level dynamics class, taught by Dr. Akylas. This course focused on mechanical dynamics, where we derove the equations of motion ($\dot x = f(x)$) for various mechanical systems: spinning tops, bouncing balls, vibrating strings, etc. 

Generally, there are two methods for deriving the equations of motion. In the **direct** method, equations of motions are written down, well, directly (i.e., $m {\ddot x}=\sum f_i$ for translational systems, and $j {\ddot \theta}=\sum \tau_i$ for rotational systems). For complex dynamical systems, this method can become extremely hard, intractable even.

The indirect method uses the **Lagrangian** ${\mathcal L}=T-U$, which captures the energy of the system in a single scalar function. By then computing the partial derivative equation

$$
\begin{equation}\label{eq:Lag_eqs}
\frac{d}{dt}\frac{d\mathcal{L}}{d\dot{x}}-\frac{d\mathcal{L}}{dx}=0,
\end{equation}
$$ 

the equations of motion magically appear. This method is built on the **principle of least action**: in passing from one state to another, the integral of the kinetic energy must be least.

Anyways, we can view an optimization problem like 

$$
\begin{equation}\label{eq:opt_classical}
\begin{aligned}
\min\quad & f(x)\\
\text{s.t.}\quad & g(x)\le0\\
 & h(x)=0.
\end{aligned}
\end{equation}
$$ 

as a problem of simulating a dynamical system. In this system:
* $f(x)$ represents the potential energy of the state
* $g(x)$ and $h(x)$ represent hard constraints (e.g., crevasse walls)
* $m{\ddot x}$ is the state's kinetic energy, where $m$ is some assigned mass

Using \eqref{eq:Lag_eqs}, we can then simulate this system; by adding a little bit of friction, this system's final energy state should be the local minimum solution to the optimization problem.

Now, I am not the first one to make this observation: this approach is popular in the Quantum world (see, for example, [Quantum Hamiltonian Descent (QHD)](https://arxiv.org/pdf/2303.01471)). However, my curiosity is a bit more pure: does direct CPU/GPU-based simulation of \eqref{eq:Lag_eqs} with e.g., foreward Euler, provide a reliable method of solving convex optimization problems? Nature is pretty good at solving equations of motion. Can we copy her and improve upon vanilla gradient descent/[PDHG](https://www.gurobi.com/resources/introducing-gurobis-first-gpu-accelerated-solver/?utm_source=linkedin&utm_medium=social&utm_content=blog)?


</details>
<hr style="height:15px; visibility:hidden;" />















<h3 style="font-weight:bold; margin-bottom:5px;">Question #1: When does constraint relaxation hurt (instead of help) your objective?</h3>
<details markdown="1">
<summary><code>Post Date: 10/16/25</code></summary>

Sometimes, constraints make us happier.

We call the problem

$$
\begin{equation}\label{eq:opt}
\begin{aligned}
\min \quad & f_0(x)\\
\text{s.t.} \quad & f_1(x) \le 0\\
                 & f_2(x) \le 0\\
\end{aligned}
\end{equation}
$$ 

a *constrained* optimization problem. If nonconvexity is present in this problem, we may take a "convex relaxation" of the problem. The resulting convex relaxation solution will necessarily lower bound the original optimization problem \eqref{eq:opt}.

Another valid relaxation is to *drop a constraint entirely* (e.g., remove $f_2(x)\le 0$). In this case, the solution to the relaxed problem will also lower bound the original problem. 

Sometimes in life, we get to drop constraints. For example, this post was inspired by the problem of parking at UVM. I am a new faculty member, so I park **far** from my office in Billings. This is a hard constraint which causes me to "lose" a lot of time walking (or long boarding) across campus. For two+ years, I have looked forward to being elevated to a "green" parking permit, which will allow me to park right next to my office.

Will a green permit make me happier? It will allow me to drop a constraint, so, mathematically, I will provably be *at least as happy as I was before I was promoted to a green permit*. The proof is simple: if parking near my office makes me *less* happy, then I can continue to park on the far side of campus.

However, we all know this would never happen. The moment I receive the green permit, I will never walk across campus again. No more fun long board rides. No more scurrying across main street with the undergrads. No more trudging through the ice and snow. These things are hard, and they do consume a lot of time, but whether I admit it or not, they do make me happier. They improve my fitness, they get me out amoung the people, and they keep me "alive". 

It seems, therefore, that dropping a constraint will probably make me less happy (i.e., it will raise my objective function, rather than lower it (lower is better!)). This is a paradox. It is similar in nature to [Braess' paradox](https://en.wikipedia.org/wiki/Braess%27_paradox), which tells us that sometimes, adding a new road (i.e., dropping a constraint) can slow traffic down. In this case, with self-interested rational agents, the optimal traffic pattern is somehow an **unstable equilibrium**, so suboptimality emerges naturally. For Braess' paradox to appear, you need multiple competing agents. In my parking conundrum, however, there is just one agent: me.

To resolve my problem mathematically, I think I need to admit that there are "latent" constraints that I am not enforcing, nor needing to enfocrce, when I park across campus (e.g., daily step count, human interaction, etc.). When I drop a constraint, these latent constraints become violated, and my happiness pays the price.

`Research question: in single-operator/agent systems, when does mathematical relaxation (i.e., constraint dropping) lead to worse, and not better, system performance?`

Here's to walking.
</details>
<hr style="height:15px; visibility:hidden;" />










<h3 style="font-weight:bold; margin-bottom:5px;">Question #0: LLMs are prolific. Why blog?</h3>
<details markdown="1">
<summary><code>Post Date: -Inf</code></summary>

I enjoy writing. I also enjoy exploring technical ideas. I think writing helps *flesh out* these ideas. It helps to concretize them, bring them into focus, and acknowledge their limitations. I especially like when ideas are inspired by our daily, lived experiences. Science is filled with examples of brilliant ideas that were inspired by the everyday happens of life. For example:

* Luitzen Egbertus Jan Brouwer [stirring his coffee](https://sites.pitt.edu/~armin/publicdocs/Delta%20-%20Brouwer.pdf) and proposing his fixed point theorem
* Einstein's ["happiest" thought](https://arxiv.org/pdf/2209.13781): realizing that falling and weightless are equivalent
* Leonhard Euler trying to cross the [seven bridges of Königsberg](https://en.wikipedia.org/wiki/Seven_Bridges_of_K%C3%B6nigsberg) only once
* James Clerk Maxwell conceptualizing electromagetism via [mechanical gears](https://qstbb.pa.msu.edu/storage/new_ed/e_and_m/J-140_Maxwell_3_S4.html)
* Terance Tao [rolling around on the floor](https://mathstodon.xyz/@tao/113465889558324816), with his eyes closed, to solve the  wave maps equation 
* Stan Ulman using his experience gambling and playing cards to concoct the [Monte Carlo](https://en.wikipedia.org/wiki/Monte_Carlo_method) method
* The apple [falling on Newton's head](https://scottberkun.com/wp-content/uploads/2010/01/Newton_apple.jpg)...

LLMs do not (yet) have these daily lived experiences. They can synthesize the discoveries of humans in beautiful ways, and they can even suggest some cool new ones, but they can't pole vault, they can't walk across campus, they can't stick their hand out a car window and feel their hand flutter in the wind...

So, I am blogging about ideas. Not in spite of LLMs, but because of them. With the amout of AI-assistance I receive in my daily life, I crave clarity of thought more than ever before. And I want to make room for synthesizing the mathematical with the everday. Since, in the end, life and math should be somehow invariant.

</details>

<p align="center">
  <img src="/photos/dragon.jpg" width="200">
</p>