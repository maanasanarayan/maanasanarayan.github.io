---
title: 'Hello, world'
description: 'A first post on a new blog: why it exists, what I plan to write about, and how it is put together.'
pubDate: 2026-11-01
tags: ['meta']
---

Hi, I'm Maanasa. I'm a software engineer, and this is the first post on my
blog.

I have kept notes for years, mostly in private docs that I rarely went back to.
Writing in public is a way to make those notes better. If I have to explain
something clearly enough for someone else to follow, I usually end up
understanding it better myself.

## What I plan to write about

Nothing grand. Mostly things I run into at work and on side projects:

- Backend services and the APIs between them
- Testing, debugging, and keeping an eye on things in production
- Small lessons from building this site
- The occasional note that is only useful to future me

Posts will be short and specific. If one helps another engineer get unstuck,
that is a good outcome.

## How this blog is built

The site is built with Astro. Each post is a Markdown file in the repository,
so publishing is a commit:

```sh
git add src/content/blog/hello-world.md
git commit -m "feat(blog): add hello world post"
```

There is an RSS feed if you want to follow along, and every post is also
available as plain Markdown.

Thanks for reading.
