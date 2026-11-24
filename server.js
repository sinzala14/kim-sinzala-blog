// Express server: serves pages, injects shared <head>, exposes JSON APIs (swap JSON for a DB later).
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PUB = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || 'https://YOUR_CANONICAL_URL';

const readJSON = (f) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
  catch (e) { console.error('Read failed:', f, e.message); return []; }
};

const head = (title, desc, url) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE_URL}${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}"><meta property="og:url" content="${SITE_URL}${url}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="/css/main.css?v=3"><link rel="stylesheet" href="/css/animations.css?v=3"><link rel="stylesheet" href="/css/responsive.css?v=3">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Kim Sinzala","jobTitle":"Developer at TechBack","email":"mailto:kimccsinzala@gmail.com","telephone":"+260773582361","homeLocation":"Zambia","sameAs":["https://github.com/sinzala14","https://zm.linkedin.com/in/kim-sinzala-245a5426b"]}</script>`;

function page(file, url) {
  return (req, res) => {
    fs.readFile(path.join(PUB, file), 'utf8', (err, html) => {
      if (err) return res.status(404).send('Not found');
      html = html.replace(/<!--HEAD (.*?)\|(.*?)-->/, (_, t, d) => head(t, d, url || req.path));
      res.type('html').send(html);
    });
  };
}

app.get(/\.html$/, (req, res) => res.redirect(req.path.replace(/\.html$/, '').replace(/^\/index$/, '/')));
app.use(express.static(PUB, { index: false, maxAge: 0 }));

app.get('/', page('index.html'));
app.get('/about', page('about.html'));
app.get('/work', page('work.html'));
app.get('/writing', page('writing.html'));
app.get('/writing/:slug', page('article.html'));
app.get('/contact', page('contact.html'));

app.get('/api/posts', (req, res) => res.json(readJSON('posts.json').map(({ body, ...meta }) => meta)));
app.get('/api/posts/:slug', (req, res) => {
  const p = readJSON('posts.json').find((x) => x.slug === req.params.slug);
  p ? res.json(p) : res.status(404).json({ error: 'Post not found' });
});
app.get('/api/projects', (req, res) => res.json(readJSON('projects.json')));

app.use((req, res) => res.status(404).send('404 — nothing here yet.'));
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
