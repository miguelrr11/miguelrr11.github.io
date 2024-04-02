---
layout: default
title: My GitHub Pages Site
---
# Welcome to My GitHub Pages Site!

This is the landing page for my GitHub Pages site.

## Folders:

{% for page in site.pages %}
  {% if page.url != '/index.html' %}
    {% assign folder_name = page.url | remove: '/index.html' %}
    [{{ folder_name | remove: '/' }}]({{ site.baseurl }}{{ folder_name }})
  {% endif %}
{% endfor %}

