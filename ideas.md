---
layout: default
title: Ideas
---
{% include mathjax-config.html %}

# A running list of ideas. Established 10/25.

Some ideas are mathematical. Some are pseudomathematical. All end with an "intersting" research question.

### **Idea 1: When relaxation hurts (instead of helps)**
`Post Date: 10/16/25`

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

It seems, therefore, that dropping a constraint will probably make me less happy (i.e., it will raise my objective function, rather than lower it (lower is better!)). This is a paradox. It is similar in nature to [Braess' paradox](https://en.wikipedia.org/wiki/Braess%27_paradox), which tells us that sometimes, adding a new road (i.e., dropping a constraint) can slow traffic down. In this case, with self-interested rational agents, the optimal traffic pattern is somehow an **unstable equilibrium**, so suboptimality emerges naturally. For Braess' paradox to emerge, you need multiple competing agents. In my parking conundrum, there is just one agent: me.

To resolve my problem mathematically, I think I need to admit that there are "latent" constraints that I am not enforcing, nor needing to enfocrce, when I park across campus (e.g., daily step count, human interaction, etc.). When I drop a constraint, these latent constraints become violated, and my happiness pays the price.

`Research question: when does mathematical relaxation (i.e., constraint dropping) lead to worse, and not better, system performance?`

Here's to walking.
