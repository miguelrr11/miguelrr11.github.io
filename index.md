---
layout: default
title: My GitHub Pages Site
---
# Welcome to My GitHub Pages Site!

This is the landing page for my GitHub Pages site.

## Folders

{% for file in site.static_files %}
  {% if file.path contains '/' %}
    {% assign folder = file.path | split: '/' | first %}
    {% if folder != 'assets' and folder != 'docs' and folder != 'images' %}
      - [{{ folder }}]({{ folder | append: '/' }})
    {% endif %}
  {% endif %}
{% endfor %}
