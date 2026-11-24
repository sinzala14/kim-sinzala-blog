# Kim Sinzala — Personal Website & Blog

Official personal website and engineering blog of **Kim Sinzala** (Computer Science student, Developer at TechBack, and technology builder in Zambia).

- **Live Production URL:** `https://kim-sinzala-blog.voxreadstudio.workers.dev`
- **Architecture:** Vanilla HTML, CSS, JavaScript + Node/Express (`server.js`) and Cloudflare Workers (`worker.js`) with shared server-side SEO and structured data rendering (`seo.js`).

## Local Development

```bash
npm install
npm start
# Opens http://localhost:3000
```

## Cloudflare Workers Deployment

```bash
npx wrangler deploy
```

## Content & SEO Structure

- **Articles:** [data/posts.json](file:///c:/Users/Ctrl%20Hub%20Zambia/Downloads/personal-blog/personal-blog/data/posts.json) — Set `"published": true` for indexable articles (or `"published": false` for drafts excluded from `/sitemap.xml` and public listings).
- **Projects:** [data/projects.json](file:///c:/Users/Ctrl%20Hub%20Zambia/Downloads/personal-blog/personal-blog/data/projects.json) — Powers `/projects`, `/work`, and individual case study pages at `/projects/:slug`.
- **Technical SEO:** `/robots.txt`, `/sitemap.xml`, canonical tags, Open Graph metadata, and Schema.org (`Person`, `BlogPosting`, `CreativeWork`, `BreadcrumbList`) are generated dynamically via [seo.js](file:///c:/Users/Ctrl%20Hub%20Zambia/Downloads/personal-blog/personal-blog/seo.js).
