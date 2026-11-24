import posts from './data/posts.json';
import projects from './data/projects.json';

const head = (title, desc, url, siteUrl) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${siteUrl}${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}"><meta property="og:url" content="${siteUrl}${url}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="/css/main.css?v=3"><link rel="stylesheet" href="/css/animations.css?v=3"><link rel="stylesheet" href="/css/responsive.css?v=3">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Kim Sinzala","jobTitle":"Developer at TechBack","email":"mailto:kimccsinzala@gmail.com","telephone":"+260773582361","homeLocation":"Zambia","sameAs":["https://github.com/sinzala14","https://zm.linkedin.com/in/kim-sinzala-245a5426b"]}</script>`;

const ROUTES = {
  '/': '/index.html',
  '/about': '/about.html',
  '/work': '/work.html',
  '/writing': '/writing.html',
  '/contact': '/contact.html'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const siteUrl = env.SITE_URL || url.origin;

    // Redirect .html URLs to clean routes
    if (pathname.endsWith('.html')) {
      const clean = pathname.replace(/\.html$/, '').replace(/^\/index$/, '/');
      return Response.redirect(`${url.origin}${clean}`, 301);
    }

    // JSON API endpoints
    if (pathname === '/api/posts') {
      const list = posts.map(({ body, ...meta }) => meta);
      return Response.json(list);
    }

    if (pathname.startsWith('/api/posts/')) {
      const slug = decodeURIComponent(pathname.slice('/api/posts/'.length));
      const post = posts.find((x) => x.slug === slug);
      return post
        ? Response.json(post)
        : Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (pathname === '/api/projects') {
      return Response.json(projects);
    }

    // Determine if route is an HTML page
    let assetPath = ROUTES[pathname];
    if (!assetPath && pathname.startsWith('/writing/') && pathname.length > '/writing/'.length) {
      assetPath = '/article.html';
    }

    if (assetPath) {
      const assetUrl = new URL(assetPath, request.url);
      const res = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (!res.ok) {
        return new Response('Not found', { status: 404 });
      }
      let html = await res.text();
      html = html.replace(/<!--HEAD (.*?)\|(.*?)-->/, (_, t, d) => head(t, d, pathname, siteUrl));
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Static assets (/css/*, /js/*, /assets/*)
    const assetRes = await env.ASSETS.fetch(request);
    if (assetRes.status !== 404) {
      return assetRes;
    }

    return new Response('404 — nothing here yet.', { status: 404 });
  }
};
