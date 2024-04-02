---
layout: default
title: My GitHub Pages Site
---
# Welcome to My GitHub Pages Site!

This is the landing page for my GitHub Pages site.

## Folders:

{% for file in site.static_files %}
  {% if file.path contains '/' %}
    {% assign folder_parts = file.path | split: '/' %}
    {% assign folder_name = folder_parts[0] %}
    [{{ folder_name }}]({{ site.baseurl }}/{{ folder_name }})
  {% endif %}
{% endfor %}