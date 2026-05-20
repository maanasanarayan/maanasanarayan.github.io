// Dev toolbar app: lists drafts + scheduled posts, fetched from /__drafts.json.
export default {
  id: 'maanasa-drafts',
  name: 'Drafts',
  icon: '📝',
  async init(canvas) {
    const root = document.createElement('astro-dev-toolbar-window');
    canvas.append(root);

    const wrap = document.createElement('div');
    wrap.style.cssText =
      'font-family: system-ui, sans-serif; padding: 1rem; min-width: 360px;';

    const h = document.createElement('h1');
    h.textContent = 'Draft & scheduled posts';
    h.style.cssText =
      'margin: 0 0 0.75rem; font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;';
    wrap.append(h);

    const list = document.createElement('ol');
    list.style.cssText = 'margin: 0; padding-left: 1.25rem; line-height: 1.6;';
    wrap.append(list);

    const footer = document.createElement('p');
    footer.style.cssText =
      'margin-top: 1rem; font-size: 0.75rem; opacity: 0.7;';
    wrap.append(footer);

    root.append(wrap);

    try {
      const res = await fetch('/__drafts.json');
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      if (data.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No drafts or future-dated posts.';
        li.style.opacity = '0.6';
        list.append(li);
      } else {
        for (const post of data) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = post.url;
          a.textContent = post.title;
          a.style.cssText = 'font-weight: 700;';
          a.target = '_top';
          const meta = document.createElement('span');
          meta.style.cssText =
            'display: block; font-size: 0.75rem; opacity: 0.7;';
          const tags = [];
          if (post.draft) tags.push('DRAFT');
          if (post.future) tags.push(`SCHEDULED · ${post.pubDate}`);
          meta.textContent = tags.join(' · ');
          li.append(a, meta);
          list.append(li);
        }
      }
      footer.textContent = `${data.length} item(s) · refresh to update`;
    } catch (err) {
      const li = document.createElement('li');
      li.textContent = `Couldn't load drafts (${err.message}).`;
      li.style.color = 'crimson';
      list.append(li);
    }
  },
};
