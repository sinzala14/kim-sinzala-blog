const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const SOCIALS = [
  ['Email', 'fa-solid fa-envelope', 'mailto:kimccsinzala@gmail.com', 'kimccsinzala@gmail.com'],
  ['WhatsApp', 'fa-brands fa-whatsapp', 'https://wa.me/260776840567', '+260 776 840 567 · Chat on WhatsApp'],
  ['Direct Call', 'fa-solid fa-phone', 'tel:+260773582361', '+260 773 582 361 · Voice calls'],
  ['GitHub', 'fa-brands fa-github', 'https://github.com/sinzala14', 'Code, experiments & projects'],
  ['LinkedIn', 'fa-brands fa-linkedin', 'https://zm.linkedin.com/in/kim-sinzala-245a5426b', 'Professional journey'],
  ['Instagram', 'fa-brands fa-instagram', 'https://www.instagram.com/kim_sinzala/', 'Building, day to day'],
  ['Facebook', 'fa-brands fa-facebook', 'https://www.facebook.com/voxreadstudios/', 'Voxread Studio']
];

const NAV_ITEMS = [
  ['/about', 'about'],
  ['/work', 'work'],
  ['/projects', 'projects'],
  ['/writing', 'writing'],
  ['/now', 'now'],
  ['/contact', 'contact']
];

function personSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#kim-sinzala`,
    name: 'Kim Sinzala',
    url: `${siteUrl}/`,
    image: `${siteUrl}/assets/profile.jpg`,
    jobTitle: 'Developer at TechBack',
    description: 'Computer Science student, software developer, and technology builder in Zambia focusing on software engineering, circular technology at TechBack, and intelligent systems.',
    homeLocation: {
      '@type': 'Place',
      name: 'Zambia'
    },
    worksFor: {
      '@type': 'Organization',
      name: 'TechBack',
      url: 'https://techback.voxreadstudio.workers.dev'
    },
    knowsAbout: [
      'Computer Science',
      'Software Engineering',
      'Web Application Development',
      'Flutter Mobile Development',
      'Database Design',
      'Circular Economy Technology',
      'Artificial Intelligence'
    ],
    sameAs: [
      'https://github.com/sinzala14',
      'https://zm.linkedin.com/in/kim-sinzala-245a5426b',
      'https://www.instagram.com/kim_sinzala/',
      'https://www.facebook.com/voxreadstudios/'
    ]
  };
}

function breadcrumbSchema(siteUrl, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name,
      item: `${siteUrl}${path}`
    }))
  };
}

function blogPostingSchema(siteUrl, post) {
  const canonical = `${siteUrl}/writing/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
    },
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl}${post.image || '/assets/og-card.svg'}`,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    author: {
      '@type': 'Person',
      '@id': `${siteUrl}/#kim-sinzala`,
      name: 'Kim Sinzala',
      url: `${siteUrl}/`
    },
    publisher: {
      '@type': 'Person',
      '@id': `${siteUrl}/#kim-sinzala`,
      name: 'Kim Sinzala',
      url: `${siteUrl}/`
    }
  };
}

function projectSchema(siteUrl, project) {
  const canonical = `${siteUrl}/projects/${project.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': canonical,
    name: project.title,
    headline: `${project.title} — ${project.category}`,
    description: project.description,
    url: canonical,
    image: `${siteUrl}${project.image || '/assets/og-card.svg'}`,
    keywords: project.tech.join(', '),
    author: {
      '@type': 'Person',
      '@id': `${siteUrl}/#kim-sinzala`,
      name: 'Kim Sinzala',
      url: `${siteUrl}/`
    }
  };
}

function buildHead({ title, desc, pathname, siteUrl, ogType = 'website', ogImage = '/assets/og-card.svg', schemas = [] }) {
  const canonical = `${siteUrl}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
  const fullImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const allSchemas = [personSchema(siteUrl), ...schemas];
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Kim Sinzala">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:site_name" content="Kim Sinzala">
<meta property="og:locale" content="en_ZM">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(fullImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="/css/main.css?v=5"><link rel="stylesheet" href="/css/animations.css?v=5"><link rel="stylesheet" href="/css/responsive.css?v=5">
${allSchemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}`;
}

function renderShellHTML(html, pathname) {
  const seg = pathname.split('/')[1] || '';
  const navHTML = `<nav class="top" aria-label="Main"><div class="wrap"><a class="logo" href="/">kim<b>.</b>sinzala</a>
  <ul class="links" id="links">${NAV_ITEMS.map(([h, n]) => `<li><a href="${h}" ${seg === n ? 'aria-current="page"' : ''}>${n}</a></li>`).join('')}
  <li><button class="icon-btn" id="theme" aria-label="Toggle light or dark theme"><i class="fa-solid fa-circle-half-stroke"></i></button></li></ul>
  <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="links"><i class="fa-solid fa-bars"></i></button></div></nav>`;
  const footHTML = `<footer><div class="wrap"><div><strong>Kim Sinzala</strong><br><span class="muted">Computer Science · Software · Technology</span></div>
  <div class="muted mono">© ${new Date().getFullYear()} Kim Sinzala · Built from Zambia.</div>
  <div>${SOCIALS.map(([n, i, u]) => `<a href="${u}" aria-label="${n}" style="margin-right:.45rem"><i class="${i}"></i></a>`).join('')}</div></div></footer>`;
  return html.replace('<div id="nav"></div>', navHTML).replace('<div id="foot"></div>', footHTML);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderProjectCard(p) {
  return `<article class="card reveal in tilt"><div class="meta"><span class="kind ${esc(p.kind)}">${esc(p.kind)}</span><span>${esc(p.category)}</span></div>
  <h3><a href="/projects/${esc(p.slug)}" style="text-decoration:none">${esc(p.title)}</a></h3><p>${esc(p.description)}</p><div class="meta">${p.tech.map(esc).join(' · ')}</div><div class="meta"><strong>${esc(p.status)}</strong>
  <a href="/projects/${esc(p.slug)}">Case study →</a>${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Live ↗</a>` : ''}</div></article>`;
}

function renderPostCard(p) {
  return `<a class="card reveal in tilt" href="/writing/${esc(p.slug)}" style="text-decoration:none"><div class="meta"><span class="kind FACT">${esc(p.category)}</span><span>${fmtDate(p.date)}</span><span>${p.readingTime} min read</span></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`;
}

function renderSocialCards() {
  return SOCIALS.map(([n, i, u, d]) => `<a class="card reveal in" href="${esc(u)}" target="_blank" rel="noopener"><i class="${i}"></i><h3>${esc(n)}</h3><p>${esc(d)}</p></a>`).join('');
}

function renderArticleBody(post, allPosts, allProjects, siteUrl) {
  let n = 0;
  const heads = [];
  const bodyHTML = post.body.map((b) => {
    if (b.t === 'h') {
      const id = 'h' + ++n;
      heads.push([id, b.x]);
      return `<h2 id="${id}">${esc(b.x)}</h2>`;
    }
    if (b.t === 'code') return `<pre><code>${esc(b.x)}</code></pre>`;
    if (b.t === 'img') return `<img loading="lazy" src="${esc(b.x)}" alt="${esc(b.alt || post.title)}">`;
    return `<p>${esc(b.x)}</p>`;
  }).join('');

  const pageUrl = encodeURIComponent(`${siteUrl}/writing/${post.slug}`);
  const titleEnc = encodeURIComponent(post.title);
  const relPosts = allPosts.filter((x) => x.published !== false && x.slug !== post.slug).slice(0, 2);
  const relProjects = allProjects.filter((pr) => (post.relatedProjects || []).includes(pr.slug));

  return `<nav aria-label="Breadcrumb" class="mono muted" style="font-size:.82rem;margin-bottom:1rem"><a href="/">Home</a> / <a href="/writing">Writing</a> / <span>${esc(post.title)}</span></nav>
  <div class="meta" style="margin-top:1rem"><span class="kind FACT">${esc(post.category)}</span><time datetime="${esc(post.date)}">${fmtDate(post.date)}</time><span>${post.readingTime} min read</span><span>By <a href="/about">Kim Sinzala</a></span></div>
  <h1 style="font-size:clamp(2rem,5vw,3.2rem);margin:0.6rem 0 1.2rem">${esc(post.title)}</h1>
  ${post.image ? `<img src="${esc(post.image)}" alt="${esc(post.imageAlt || post.title)}" width="1200" height="630" loading="lazy" style="margin-bottom:1.5rem;border:1px solid var(--line)">` : ''}
  ${heads.length ? `<nav class="toc" aria-label="Table of contents"><strong>On this page</strong>${heads.map(([i, x]) => `<a href="#${i}">${esc(x)}</a>`).join('')}</nav>` : ''}
  ${bodyHTML}
  <div class="card" style="margin:2.2rem 0;padding:1.4rem 1.6rem"><p style="margin:0"><strong>Written by <a href="/about">Kim Sinzala</a></strong> — Computer Science student in Zambia and Developer at <a href="/projects/techback">TechBack</a>.</p></div>
  <div class="share"><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${titleEnc}%20${pageUrl}"><i class="fa-brands fa-whatsapp"></i> Share on WhatsApp</a><a class="btn ghost" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}"><i class="fa-brands fa-linkedin"></i> Share on LinkedIn</a></div>
  ${relProjects.length ? `<h2>Related Projects</h2><div class="grid" style="margin-bottom:2rem">${relProjects.map(renderProjectCard).join('')}</div>` : ''}
  ${relPosts.length ? `<h2>Related Articles</h2><div class="grid">${relPosts.map(renderPostCard).join('')}</div>` : ''}`;
}

function renderProjectDetailBody(project, allProjects, allPosts) {
  const relPosts = allPosts.filter((p) => p.published !== false && (project.relatedPosts || []).includes(p.slug));
  const otherProjects = allProjects.filter((p) => p.slug !== project.slug).slice(0, 2);

  return `<nav aria-label="Breadcrumb" class="mono muted" style="font-size:.82rem;margin-bottom:1rem"><a href="/">Home</a> / <a href="/projects">Projects</a> / <span>${esc(project.title)}</span></nav>
  <div class="meta" style="margin-top:1rem"><span class="kind ${esc(project.kind)}">${esc(project.kind)}</span><span>${esc(project.category)}</span><strong>${esc(project.status)}</strong></div>
  <h1 style="font-size:clamp(2.2rem,5vw,3.4rem);margin:0.6rem 0 1rem">${esc(project.title)}</h1>
  <p class="lead muted" style="font-size:1.15rem;margin-bottom:1.5rem">${esc(project.description)}</p>
  <div class="cta" style="margin-bottom:2rem">
    ${project.link ? `<a class="btn" href="${esc(project.link)}" target="_blank" rel="noopener">Explore live platform ↗</a>` : ''}
    ${project.github ? `<a class="btn ghost" href="${esc(project.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> View GitHub profile</a>` : ''}
    <a class="btn ghost" href="/projects">← All projects</a>
  </div>
  ${project.image ? `<img src="${esc(project.image)}" alt="${esc(project.imageAlt || project.title)}" width="1200" height="630" loading="lazy" style="margin-bottom:1.8rem;border:1px solid var(--line)">` : ''}
  <h2>The Problem It Addresses</h2>
  <p>${esc(project.problem)}</p>
  <h2>Technology &amp; Approach</h2>
  <p>${esc(project.approach)}</p>
  <div class="skills" style="margin:1.2rem 0 1.8rem">${project.tech.map((t) => `<span class="skill" data-tier="build">${esc(t)}</span>`).join('')}</div>
  <h2>Kim Sinzala’s Contribution</h2>
  <p>${esc(project.contribution)}</p>
  <h2>Development Status</h2>
  <p>Current classification: <strong>${esc(project.kind)}</strong> — ${esc(project.status)}.</p>
  ${relPosts.length ? `<h2>Related Writing</h2><div class="grid" style="margin-bottom:2rem">${relPosts.map(renderPostCard).join('')}</div>` : ''}
  <h2>More Projects by Kim Sinzala</h2>
  <div class="grid">${otherProjects.map(renderProjectCard).join('')}</div>`;
}

function buildRobotsTxt(siteUrl) {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function buildSitemapXml(siteUrl, posts, projects) {
  const staticPages = ['/', '/about', '/work', '/projects', '/writing', '/now', '/contact'];
  const urls = [];

  for (const p of staticPages) {
    urls.push(`  <url>
    <loc>${siteUrl}${p}</loc>
  </url>`);
  }

  for (const pr of projects) {
    urls.push(`  <url>
    <loc>${siteUrl}/projects/${esc(pr.slug)}</loc>
  </url>`);
  }

  for (const post of posts.filter((x) => x.published !== false)) {
    urls.push(`  <url>
    <loc>${siteUrl}/writing/${esc(post.slug)}</loc>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

module.exports = {
  esc,
  SOCIALS,
  personSchema,
  breadcrumbSchema,
  blogPostingSchema,
  projectSchema,
  buildHead,
  renderShellHTML,
  renderProjectCard,
  renderPostCard,
  renderSocialCards,
  renderArticleBody,
  renderProjectDetailBody,
  buildRobotsTxt,
  buildSitemapXml
};
