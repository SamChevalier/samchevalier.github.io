---
title: Dragons
layout: default
---
{% include mathjax-config.html %}

<h1>
    Here be dragons.
  <img src="/photos/dragon.jpg" alt="logo" style="height:34px; vertical-align:middle; margin-left:10px;">
</h1>

>"[Here be dragons](https://en.wikipedia.org/wiki/Here_be_dragons)" is a phrase used to indicate dangerous or **unexplored** territories, in imitation of a medieval practice of putting illustrations of dragons, sea monsters and other mythological creatures on uncharted areas of maps where potential dangers were thought to exist.

During my PhD, I audited a nonlinear dynamics course with Rodolfo Rosales. Dr. Rosales started the course by explaining that the world of **linear** dyanmical systems is fully explored: we know everything there is to know. However, the world of **nonlinear** dynamics is fairly unexplored: here be dragons.

This is a running blog of research questions which are at the limits of knowledge.

* Some questions are mathematical
* Some are pseudomathematical
* All have some degree of research value

> My thinking is this: if I write down a sufficiently large number of research questions, a good one [**must** eventually emerge](https://en.wikipedia.org/wiki/Infinite_monkey_theorem).

***


### **Question #2: Can we use Lagrangian mechanics to simulate optimization problems?**

In graduate school, I took a course 2 (MechE) graduate level dynamics course, taught by Dr. Akylas. This course focused on mechanical dynamics, where we derove the equations of motion ($\dot x = f(x)$) for various mechanical systems: spinning tops, bouncing balls, vibrating strings, etc. 

Generally, there are two methods for deriving the equations of motion: a direct method (i.e., $m {\ddot x}=\sum f_i$ for translational systems, and $j {\ddot \theta}=\sum \tau_i$ for rotational systems). I


<details markdown="1">
<summary><code>Post Date: 10/21/25</code></summary>

In graduate school, I took a course 2 (MechE) graduate level dynamics course, taught by Dr. Akylas. This course focused on mechanical dynamics, where we derove the equations of motion ($\dot x = f(x)$) for various mechanical systems: spinning tops, bouncing balls, vibrating strings, etc. 

Generally, there are two methods for deriving the equations of motion: a direct method (i.e., $m {\ddot x}=\sum f_i$ for translational systems, and $j {\ddot \theta}=\sum \tau_i$ for rotational systems). I

</details>

<hr style="height:15px; visibility:hidden;" />

### **Question #1: When does constraint relaxation hurt (instead of help) your objective?**
<details markdown="1">
<summary><code>Post Date: 10/16/25</code></summary>

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

<p align="center">
  <img src="/photos/dragon.jpg" width="200">
</p>