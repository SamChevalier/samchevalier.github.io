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
\min \quad & f(x)\\
{\rm s.t.} \quad & f_1(x) \le 0\\
                 & f_2(x) \le 0\\
\end{aligned}
\end{equation}
$$ 

a *constrained* optimization problem. If nonconvexity is present in this problem, we may take a "convex relaxation" of the problem. The resulting convex relaxation solution will necessarily lower bound the original optimization problem.

Another valid relaxation is to *drop a constraint entirely* (e.g., $f_2(x)$). In this case, the relaxation will still result in a valid lower bound of the original problem. 

Sometimes in life,  
