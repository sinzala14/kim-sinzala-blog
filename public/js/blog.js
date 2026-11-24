// Blog list + filtering, article rendering, reading progress, TOC, related, share.
const $b = (s) => document.querySelector(s);
const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CATS = ['All', 'Building', 'Technology', 'AI', 'Business', 'Engineering', 'Lessons', 'Ideas', 'Career', 'Zambia / Africa Tech'];
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
const card = (p) => `<a class="card reveal tilt" href="/writing/${e(p.slug)}" style="text-decoration:none"><div class="meta"><span class="kind FACT">${e(p.category)}</span><span>${fmt(p.date)}</span><span>${p.readingTime} min read</span></div><h3>${e(p.title)}</h3><p>${e(p.excerpt)}</p></a>`;

async function list() {
  const box = $b('#posts'); if (!box) return;
  try {
    const posts = await (await fetch('/api/posts')).json();
    const f = $b('#filters');
    const draw = (c) => {
      box.innerHTML = posts.filter((p) => c === 'All' || p.category === c).map(card).join('') || '<p class="muted">No posts in this category yet.</p>';
      document.dispatchEvent(new Event('content-ready'));
    };
    if (f) {
      f.innerHTML = CATS.map((c, i) => `<button aria-pressed="${i === 0}">${c}</button>`).join('');
      f.onclick = (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        f.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        draw(b.textContent);
      };
    }
    if (box.children.length === 0) draw('All');
  } catch (err) {
    if (box.children.length === 0) box.textContent = 'Could not load posts.';
  }
}

async function article() {
  const box = $b('#article'); if (!box) return;
  const bar = $b('#progress');
  if (bar) {
    const f = () => {
      const h = document.documentElement;
      bar.style.width = (scrollY / Math.max(1, h.scrollHeight - innerHeight)) * 100 + '%';
    };
    addEventListener('scroll', f, { passive: true });
  }
  // If already server-side rendered, simply trigger reveal animations
  if (box.children.length > 0 && !box.querySelector('.loading')) {
    document.dispatchEvent(new Event('content-ready'));
    return;
  }
  const slug = location.pathname.split('/').pop();
  try {
    const r = await fetch('/api/posts/' + slug); if (!r.ok) throw 0; const p = await r.json();
    document.title = p.title + ' — Kim Sinzala';
    let n = 0; const heads = [];
    const body = p.body.map((b) => b.t === 'h' ? (heads.push(['h' + ++n, b.x]), `<h2 id="h${n}">${e(b.x)}</h2>`) : b.t === 'code' ? `<pre><code>${e(b.x)}</code></pre>` : b.t === 'img' ? `<img loading="lazy" src="${e(b.x)}" alt="${e(b.alt || '')}">` : `<p>${e(b.x)}</p>`).join('');
    const url = encodeURIComponent(location.href), t = encodeURIComponent(p.title);
    const all = await (await fetch('/api/posts')).json();
    const rel = all.filter((x) => x.slug !== p.slug).slice(0, 2);
    box.innerHTML = `<a href="/writing" class="mono muted">← Back to writing</a><div class="meta" style="margin-top:1.5rem"><span class="kind FACT">${e(p.category)}</span><span>${fmt(p.date)}</span><span>${p.readingTime} min read</span></div>
    <h1 style="font-size:clamp(2rem,5vw,3.2rem)">${e(p.title)}</h1>${heads.length ? `<nav class="toc" aria-label="Table of contents">${heads.map(([i, x]) => `<a href="#${i}">${e(x)}</a>`).join('')}</nav>` : ''}${body}
    <div class="share"><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${t}%20${url}"><i class="fa-brands fa-whatsapp"></i> Share on WhatsApp</a><a class="btn ghost" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${url}"><i class="fa-brands fa-linkedin"></i> Share on LinkedIn</a></div>
    <h2>Related</h2><div class="grid">${rel.map(card).join('')}</div>`;
    document.dispatchEvent(new Event('content-ready'));
  } catch (err) { box.innerHTML = '<p>Post not found. <a href="/writing">Back to writing</a></p>'; }
}
list(); article();
