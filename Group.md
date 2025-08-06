---
layout: default
title: Lab Group
---

# Our Lab Members

# testing2

<div class="lab-grid">
  {% for person in site.data.people %}
    <div class="lab-card">
      <img src="{{ person.img }}" alt="{{ person.name }}">
      <h3>{{ people.name }}</h3>
      <p class="role">{{ person.role }}</p>
      {% if person.bio %}
        <p class="bio">{{ person.bio }}</p>
      {% endif %}
      {% if person.website %}
        <p><a href="{{ person.website }}" target="_blank">Website</a></p>
      {% endif %}
    </div>
  {% endfor %}
</div>
