// Express server: serves SSR pages, injects SEO <head>, exposes robots.txt, sitemap.xml, and JSON APIs.
const express = require('express');
const fs = require('fs');
const path = require('path');
const seo = require('./seo');

const app = express();
const PUB = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://kim-sinzala-blog.voxreadstudio.workers.dev').replace(/\/+$/, '');

const readJSON = (f) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
  catch (e) { console.error('Read failed:', f, e.message); return []; }
};

function renderPage(file, pathname, customMeta = null, customTransforms = null) {
  let html;
  try {
    html = fs.readFileSync(path.join(PUB, file), 'utf8');
  } catch (e) {
    return null;
  }

  const posts = readJSON('posts.json').filter((p) => p.published !== false);
  const projects = readJSON('projects.json');

  html = html.replace(/<!--HEAD (.*?)\|(.*?)-->/, (_, defaultTitle, defaultDesc) => {
    const title = (customMeta && customMeta.title) || defaultTitle;
    const desc = (customMeta && customMeta.desc) || defaultDesc;
    const ogType = (customMeta && customMeta.ogType) || 'website';
    const ogImage = (customMeta && customMeta.ogImage) || '/assets/og-card.svg';
    const schemas = (customMeta && customMeta.schemas) || [];
    return seo.buildHead({ title, desc, pathname, siteUrl: SITE_URL, ogType, ogImage, schemas });
  });

  html = seo.renderShellHTML(html, pathname);
  html = html.replace('<!--SSR_HOME_PROJECTS-->', projects.slice(0, 3).map(seo.renderProjectCard).join(''));
  html = html.replace('<!--SSR_PROJECTS-->', projects.map(seo.renderProjectCard).join(''));
  html = html.replace('<!--SSR_HOME_POSTS-->', posts.slice(0, 3).map(seo.renderPostCard).join(''));
  html = html.replace('<!--SSR_POSTS-->', posts.map(seo.renderPostCard).join(''));
  html = html.replace('<!--SSR_SOCIAL-->', seo.renderSocialCards());

  if (customTransforms) {
    html = customTransforms(html, { posts, projects });
  }
  return html;
}

app.get(/\.html$/, (req, res) => res.redirect(301, req.path.replace(/\.html$/, '').replace(/^\/index$/, '/')));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(seo.buildRobotsTxt(SITE_URL));
});

app.get('/sitemap.xml', (req, res) => {
  const posts = readJSON('posts.json');
  const projects = readJSON('projects.json');
  res.type('application/xml').send(seo.buildSitemapXml(SITE_URL, posts, projects));
});

app.use(express.static(PUB, { index: false, maxAge: 0 }));

const STATIC_ROUTES = {
  '/': ['index.html', [['Home', '/']]],
  '/about': ['about.html', [['Home', '/'], ['About', '/about']]],
  '/work': ['work.html', [['Home', '/'], ['Work', '/work']]],
  '/projects': ['projects.html', [['Home', '/'], ['Projects', '/projects']]],
  '/writing': ['writing.html', [['Home', '/'], ['Writing', '/writing']]],
  '/now': ['now.html', [['Home', '/'], ['Now', '/now']]],
  '/contact': ['contact.html', [['Home', '/'], ['Contact', '/contact']]]
};

for (const [route, [file, trail]] of Object.entries(STATIC_ROUTES)) {
  app.get(route, (req, res) => {
    const schemas = trail.length > 1 ? [seo.breadcrumbSchema(SITE_URL, trail)] : [];
    const html = renderPage(file, route, { schemas });
    if (!html) return res.status(404).send('404 — Page not found.');
    res.status(200).type('html').send(html);
  });
}

app.get('/writing/:slug', (req, res) => {
  const posts = readJSON('posts.json').filter((p) => p.published !== false);
  const post = posts.find((x) => x.slug === req.params.slug);
  if (!post) {
    return res.status(404).type('html').send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Article Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Article not found</h1><p><a href="/writing">Return to Writing</a></p></body></html>');
  }
  const pathname = `/writing/${post.slug}`;
  const schemas = [
    seo.blogPostingSchema(SITE_URL, post),
    seo.breadcrumbSchema(SITE_URL, [['Home', '/'], ['Writing', '/writing'], [post.title, pathname]])
  ];
  const html = renderPage(
    'article.html',
    pathname,
    {
      title: `${post.title} — Kim Sinzala`,
      desc: post.excerpt,
      ogType: 'article',
      ogImage: post.image || '/assets/og-card.svg',
      schemas
    },
    (raw, { posts: allPosts, projects: allProjects }) =>
      raw.replace('<!--SSR_ARTICLE-->', seo.renderArticleBody(post, allPosts, allProjects, SITE_URL))
  );
  res.status(200).type('html').send(html);
});

app.get('/projects/:slug', (req, res) => {
  const projects = readJSON('projects.json');
  const project = projects.find((x) => x.slug === req.params.slug);
  if (!project) {
    return res.status(404).type('html').send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Project Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Project not found</h1><p><a href="/projects">Return to Projects</a></p></body></html>');
  }
  const pathname = `/projects/${project.slug}`;
  const schemas = [
    seo.projectSchema(SITE_URL, project),
    seo.breadcrumbSchema(SITE_URL, [['Home', '/'], ['Projects', '/projects'], [project.title, pathname]])
  ];
  const html = renderPage(
    'project.html',
    pathname,
    {
      title: `${project.title} — ${project.category} Project by Kim Sinzala`,
      desc: project.description,
      ogType: 'website',
      ogImage: project.image || '/assets/og-card.svg',
      schemas
    },
    (raw, { posts: allPosts, projects: allProjects }) =>
      raw.replace('<!--SSR_PROJECT_DETAIL-->', seo.renderProjectDetailBody(project, allProjects, allPosts))
  );
  res.status(200).type('html').send(html);
});

app.get('/api/posts', (req, res) =>
  res.json(
    readJSON('posts.json')
      .filter((p) => p.published !== false)
      .map(({ body, ...meta }) => meta)
  )
);

app.get('/api/posts/:slug', (req, res) => {
  const p = readJSON('posts.json').find((x) => x.published !== false && x.slug === req.params.slug);
  p ? res.json(p) : res.status(404).json({ error: 'Post not found' });
});

app.get('/api/projects', (req, res) => res.json(readJSON('projects.json')));

app.get('/api/projects/:slug', (req, res) => {
  const p = readJSON('projects.json').find((x) => x.slug === req.params.slug);
  p ? res.json(p) : res.status(404).json({ error: 'Project not found' });
});

app.use((req, res) =>
  res
    .status(404)
    .type('html')
    .send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Nothing here yet.</h1><p><a href="/">Return to Kim Sinzala homepage</a></p></body></html>')
);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
