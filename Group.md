---
layout: default
title: Lab Group
---

# Our Lab Members

# testing

<div class="lab-grid">
  {% for student in site.data.students %}
    <div class="lab-card">
      <img src="{{ student.img }}" alt="{{ student.name }}">
      <h3>{{ student.name }}</h3>
      <p class="role">{{ student.role }}</p>
      {% if student.bio %}
        <p class="bio">{{ student.bio }}</p>
      {% endif %}
      {% if student.website %}
        <p><a href="{{ student.website }}" target="_blank">Website</a></p>
      {% endif %}
    </div>
  {% endfor %}
</div>
