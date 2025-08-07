---
layout: default
title: Lab Group
---

# Lab Members

<div class="lab-grid">
  {% for person in site.data.people %}
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <img src="{{ person.img }}" width="100" align="left" style="margin: 0px 25px 0px 0px" alt="{{ person.name }}">
      <div style="flex: 1;">
        <h3>{{ person.name }}</h3>
        <p class="role">{{ person.role }}</p>
        {% if person.bio %}
          <p class="bio">{{ person.bio }}</p>
        {% endif %}
        {% if person.contact %}
          <p class="contact">{{ person.contact }}</p>
        {% endif %}
        {% if person.website %}
          <p><a href="{{ person.website }}" target="_blank">Website</a></p>
        {% endif %}
      </div>
    </div>
    <br>
    <hr>
  {% endfor %}
</div>

# Group Alumni

<div class="lab-grid">
  {% for person in site.data.alumni %}
    <div class="lab-card">
      <img src="{{ person.img }}" width="100" align="left" style="margin: 0px 25px 0px 0px" alt="{{ person.name }}">
      <h3>{{ person.name }}</h3>
      <p class="role">{{ person.role }}</p>
      {% if person.bio %}
        <p class="bio">{{ person.bio }}</p>
      {% endif %}
      {% if person.contact %}
        <p class="contact">{{ person.contact }}</p>
      {% endif %}
      {% if person.website %}
        <p><a href="{{ person.website }}" target="_blank">Website</a></p>
      {% endif %}
    </div>
  {% endfor %}
</div>
