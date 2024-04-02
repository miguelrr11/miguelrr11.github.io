---
layout: default
title: My GitHub Pages Site
---
# Welcome to My GitHub Pages Site!

This is the landing page for my GitHub Pages site.

## Folders:

{% assign folder_urls = site.pages | map: 'url' | uniq | sort %}
{% for folder_url in folder_urls %}
  {% if folder_url contains '/' %}
    {% assign folder_parts = folder_url | split: '/' %}
    {% assign folder_name = folder_parts[1] %}
    [{{ folder_name }}]({{ site.baseurl }}{{ folder_url | remove: '/index.html' }})
  {% endif %}
{% endfor %}
