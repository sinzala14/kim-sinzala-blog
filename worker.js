import posts from './data/posts.json';
import projects from './data/projects.json';
import seo from './seo.js';

const DEFAULT_SITE_URL = 'https://kim-sinzala-blog.voxreadstudio.workers.dev';

const STATIC_ROUTES = {
  '/': ['/index.html', [['Home', '/']]],
  '/about': ['/about.html', [['Home', '/'], ['About', '/about']]],
  '/work': ['/work.html', [['Home', '/'], ['Work', '/work']]],
  '/projects': ['/projects.html', [['Home', '/'], ['Projects', '/projects']]],
  '/writing': ['/writing.html', [['Home', '/'], ['Writing', '/writing']]],
  '/now': ['/now.html', [['Home', '/'], ['Now', '/now']]],
  '/contact': ['/contact.html', [['Home', '/'], ['Contact', '/contact']]]
};

async function fetchTemplate(env, requestUrl, assetPath) {
  let res = await env.ASSETS.fetch(new Request(new URL(assetPath, requestUrl).toString()));
  if (!res.ok) {
    res = await env.ASSETS.fetch(new Request(new URL(assetPath.replace(/\.html$/, ''), requestUrl).toString()));
  }
  return res.ok ? await res.text() : null;
}

function hydrateTemplate(html, pathname, siteUrl, customMeta, customTransforms, publishedPosts) {
  html = html.replace(/<!--HEAD (.*?)\|(.*?)-->/, (_, defaultTitle, defaultDesc) => {
    const title = (customMeta && customMeta.title) || defaultTitle;
    const desc = (customMeta && customMeta.desc) || defaultDesc;
    const ogType = (customMeta && customMeta.ogType) || 'website';
    const ogImage = (customMeta && customMeta.ogImage) || '/assets/og-card.svg';
    const schemas = (customMeta && customMeta.schemas) || [];
    return seo.buildHead({ title, desc, pathname, siteUrl, ogType, ogImage, schemas });
  });

  html = seo.renderShellHTML(html, pathname);
  html = html.replace('<!--SSR_HOME_PROJECTS-->', projects.slice(0, 3).map(seo.renderProjectCard).join(''));
  html = html.replace('<!--SSR_PROJECTS-->', projects.map(seo.renderProjectCard).join(''));
  html = html.replace('<!--SSR_HOME_POSTS-->', publishedPosts.slice(0, 3).map(seo.renderPostCard).join(''));
  html = html.replace('<!--SSR_POSTS-->', publishedPosts.map(seo.renderPostCard).join(''));
  html = html.replace('<!--SSR_SOCIAL-->', seo.renderSocialCards());

  if (customTransforms) {
    html = customTransforms(html);
  }
  return html;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    const siteUrl = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
    const publishedPosts = posts.filter((p) => p.published !== false);

    // Google Search Console verification file (do not redirect .html)
    if (pathname === '/google9ad48d50885f2ede.html') {
      return new Response('google-site-verification: google9ad48d50885f2ede.html', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Redirect .html URLs to clean routes
    if (pathname.endsWith('.html')) {
      const clean = pathname.replace(/\.html$/, '').replace(/^\/index$/, '/');
      return Response.redirect(`${url.origin}${clean}`, 301);
    }

    // Technical SEO endpoints
    if (pathname === '/robots.txt') {
      return new Response(seo.buildRobotsTxt(siteUrl), {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    if (pathname === '/sitemap.xml' || pathname === '/sitemap-index.xml') {
      return new Response(seo.buildSitemapXml(siteUrl, publishedPosts, projects), {
        status: 200,
        headers: {
          'content-type': 'application/xml; charset=utf-8',
          'cache-control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // JSON API endpoints
    if (pathname === '/api/posts') {
      const list = publishedPosts.map(({ body, ...meta }) => meta);
      return Response.json(list);
    }

    if (pathname.startsWith('/api/posts/')) {
      const slug = decodeURIComponent(pathname.slice('/api/posts/'.length));
      const post = publishedPosts.find((x) => x.slug === slug);
      return post
        ? Response.json(post)
        : Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (pathname === '/api/projects') {
      return Response.json(projects);
    }

    if (pathname.startsWith('/api/projects/')) {
      const slug = decodeURIComponent(pathname.slice('/api/projects/'.length));
      const project = projects.find((x) => x.slug === slug);
      return project
        ? Response.json(project)
        : Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Static HTML pages
    if (STATIC_ROUTES[pathname]) {
      const [assetPath, trail] = STATIC_ROUTES[pathname];
      const raw = await fetchTemplate(env, request.url, assetPath);
      if (!raw) return new Response('404 — Not found', { status: 404 });
      const schemas = trail.length > 1 ? [seo.breadcrumbSchema(siteUrl, trail)] : [];
      const html = hydrateTemplate(raw, pathname, siteUrl, { schemas }, null, publishedPosts);
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Individual Blog Article SSR (/writing/:slug)
    if (pathname.startsWith('/writing/') && pathname.length > '/writing/'.length) {
      const slug = decodeURIComponent(pathname.slice('/writing/'.length));
      const post = publishedPosts.find((x) => x.slug === slug);
      if (!post) {
        return new Response(
          '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Article Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Article not found</h1><p><a href="/writing">Return to Writing</a></p></body></html>',
          { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
        );
      }
      const raw = await fetchTemplate(env, request.url, '/article.html');
      if (!raw) return new Response('404 — Not found', { status: 404 });
      const schemas = [
        seo.blogPostingSchema(siteUrl, post),
        seo.breadcrumbSchema(siteUrl, [['Home', '/'], ['Writing', '/writing'], [post.title, pathname]])
      ];
      const html = hydrateTemplate(
        raw,
        pathname,
        siteUrl,
        {
          title: `${post.title} — Kim Sinzala`,
          desc: post.excerpt,
          ogType: 'article',
          ogImage: post.image || '/assets/og-card.svg',
          schemas
        },
        (tpl) => tpl.replace('<!--SSR_ARTICLE-->', seo.renderArticleBody(post, publishedPosts, projects, siteUrl)),
        publishedPosts
      );
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Individual Project Detail SSR (/projects/:slug)
    if (pathname.startsWith('/projects/') && pathname.length > '/projects/'.length) {
      const slug = decodeURIComponent(pathname.slice('/projects/'.length));
      const project = projects.find((x) => x.slug === slug);
      if (!project) {
        return new Response(
          '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Project Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Project not found</h1><p><a href="/projects">Return to Projects</a></p></body></html>',
          { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
        );
      }
      const raw = await fetchTemplate(env, request.url, '/project.html');
      if (!raw) return new Response('404 — Not found', { status: 404 });
      const schemas = [
        seo.projectSchema(siteUrl, project),
        seo.breadcrumbSchema(siteUrl, [['Home', '/'], ['Projects', '/projects'], [project.title, pathname]])
      ];
      const html = hydrateTemplate(
        raw,
        pathname,
        siteUrl,
        {
          title: `${project.title} — ${project.category} Project by Kim Sinzala`,
          desc: project.description,
          ogType: 'website',
          ogImage: project.image || '/assets/og-card.svg',
          schemas
        },
        (tpl) => tpl.replace('<!--SSR_PROJECT_DETAIL-->', seo.renderProjectDetailBody(project, projects, publishedPosts)),
        publishedPosts
      );
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

    return new Response(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Not Found | Kim Sinzala</title><meta name="robots" content="noindex"></head><body><h1>404 — Nothing here yet.</h1><p><a href="/">Return to Kim Sinzala homepage</a></p></body></html>',
      { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }
};
