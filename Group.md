---
layout: default
title: Lab Group
---

# Lab Members

<div class="lab-grid">
  {% for person in site.data.people %}
    <div class="lab-card">
      <img src="{{ person.img }}" alt="{{ person.name }}">
      <h3>{{ person.name }}</h3>
      <p class="role">{{ person.role }}</p>
      {% if person.bio %}
        <p class="bio">{{ person.bio }}</p>
      {% endif %}
      {% if person.website %}
        <p><a href="{{ person.website }}" target="_blank">Website</a></p>
      {% endif %}
    </div>
  
    ---
    
  {% endfor %}
</div>

# Group Alumni

<div class="lab-grid">
  {% for person in site.data.alumni %}
    <div class="lab-card">
      <img src="{{ person.img }}" alt="{{ person.name }}">
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
