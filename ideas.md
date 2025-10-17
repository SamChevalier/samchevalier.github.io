---
layout: default
title: Ideas
---
{% include mathjax-config.html %}

# A running list of ideas. Est: 10/25.

Some are mathematical. Some are pseudomathematical.

### Post 1: When does a relaxation hurt?
`Post Date: 10/16/25`

We call the problem

$$
\begin{equation}\label{eq:opt}
\begin{aligned}
\min \quad & f_0(x)\\
{\rm s.t.} \quad & f_1(x) \le 0\\
                 & f_2(x) \le 0\\
\end{aligned}
\end{equation}
$$ 

a *constrained* optimization problem. If nonconvexity is present in this problem, we may take a "convex relaxation" of the problem. The resulting convex relaxation solution will necessarily lower bound the original optimization problem \eqref{eq:opt}.

Another valid relaxation is to *drop a constraint entirely* (e.g., remove $f_2(x)\le 0$). In this case, the solution to the relaxed problem will lower bound the original problem. 

Sometimes in life, we drop constraints. For example, this post was inspired by the problem of parking at UVM. I am a new faculty member, so I park far from my office in Billings. This is a hard constraint which causes me to lose a lot of time walk (or long boarding) acorss campus.
