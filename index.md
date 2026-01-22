---
layout: default
---

# Bellamy Food Blog 🍔

Welcome to my food blog.

## Posts
{% for post in site.posts %}
- [{{ post.title }}]({{ post.url }})
{% endfor %}
