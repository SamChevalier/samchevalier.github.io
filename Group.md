---
layout: default
title: Group
---

# Lab Members

<div class="lab-grid">
  {% for person in site.data.people %}
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <img src="{{ person.img }}" width="100" align="left" style="margin: 0px 25px 0px 0px" alt="{{ person.name }}">
      <div style="flex: 1;">
        {% if person.name == "Sam Chevalier" %}
          <h3 style="font-weight: bold; margin-bottom: 4px;"><a href="https://samchevalier.github.io/">Sam Chevalier</a></h3>
        {% else %}
          <h3 style="font-weight: bold; margin-bottom: 4px;">{{ person.name }}</h3>
        {% endif %}
        <p class="role" style="margin: 0 0 2px 0;">{{ person.role }}</p>
        {% if person.bio %}
          <p class="bio" style="margin: 0 0 2px 0;"><strong>Research:</strong> {{ person.bio }}</p>
        {% endif %}
        {% if person.contact %}
          <p class="contact" style="margin: 0 0 2px 0;">{{ person.contact }}</p>
        {% endif %}
        {% if person.website %}
          <p style="margin: 0 0 2px 0;"><a href="{{ person.website }}" target="_blank">Website</a></p>
        {% endif %}
      </div>
    </div>
    <br>
    <hr>
  {% endfor %}
</div>

<br>
# Group Alumni

<div class="lab-grid">
  {% for person in site.data.alumni %}
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <img src="{{ person.img }}" width="100" align="left" style="margin: 0px 25px 0px 0px" alt="{{ person.name }}">
      <div style="flex: 1;">
        <h3 style="font-weight: bold; margin-bottom: 4px;">{{ person.name }}</h3>
        <p class="role" style="margin: 0 0 2px 0;">{{ person.role }}</p>
        {% if person.bio %}
          <p class="bio" style="margin: 0 0 2px 0;">{{ person.bio }}</p>
        {% endif %}
        {% if person.contact %}
          <p class="contact" style="margin: 0 0 2px 0;">{{ person.contact }}</p>
        {% endif %}
        {% if person.website %}
          <p style="margin: 0 0 2px 0;"><a href="{{ person.website }}" target="_blank">Website</a></p>
        {% endif %}
      </div>
    </div>
  {% endfor %}
</div>
