// Navigation, theme, footer, data-driven skills & projects.
const SOCIALS = [
  ['Email', 'fa-solid fa-envelope', 'mailto:kimccsinzala@gmail.com', 'kimccsinzala@gmail.com'],
  ['WhatsApp', 'fa-brands fa-whatsapp', 'https://wa.me/260776840567', '+260 776 840 567 · Chat on WhatsApp'],
  ['Direct Call', 'fa-solid fa-phone', 'tel:+260773582361', '+260 773 582 361 · Voice calls'],
  ['GitHub', 'fa-brands fa-github', 'https://github.com/sinzala14', 'Code, experiments & projects'],
  ['LinkedIn', 'fa-brands fa-linkedin', 'https://zm.linkedin.com/in/kim-sinzala-245a5426b', 'Professional journey'],
  ['Instagram', 'fa-brands fa-instagram', 'https://www.instagram.com/kim_sinzala/', 'Building, day to day'],
  ['Facebook', 'fa-brands fa-facebook', 'https://www.facebook.com/voxreadstudios/', 'Voxread Studio']
];
// tier: build = built real things with it · project = used in projects · learning = actively learning. Edit to match reality.
const SKILLS = {
  Programming: [['PHP','build','Backend for web platforms.'],['JavaScript','build','Interfaces and this site.'],['HTML','build','Semantic pages.'],['CSS','build','Responsive layouts.'],['SQL','project','Queries behind web apps.'],['Dart','project','Flutter apps.'],['C++','learning','Coursework and algorithms.']],
  'Application Development': [['Flutter','project','Mobile apps.'],['Web applications','build','Full-stack web platforms.'],['REST APIs','project','Serving data to apps.'],['Responsive interfaces','build','Mobile-first design.'],['Desktop applications','learning','Exploring.'],['Mobile applications','project','Flutter-based apps.']],
  Databases: [['PostgreSQL','project','Relational data.'],['MySQL','build','Web platform storage.'],['Database design','project','Modelling real systems.']],
  Tools: [['Git','build','Version control.'],['GitHub','build','Hosting code (sinzala14).'],['Node.js','project','Runs this site.'],['Express.js','project','Serves this site.']],
  'AI / Data': [['Python','learning','Data and ML.'],['Machine learning fundamentals','learning','Studying.'],['Data analysis','learning','Studying.'],['Intelligent systems','learning','Link Mine research.'],['Algorithmic thinking','project','Coursework.']]
};
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function shell() {
  const path = location.pathname.split('/')[1] || '';
  const items = [['/about', 'about'], ['/work', 'work'], ['/writing', 'writing'], ['/contact', 'contact']];
  $('#nav').outerHTML = `<nav class="top" aria-label="Main"><div class="wrap"><a class="logo" href="/">kim<b>.</b>sinzala</a>
  <ul class="links" id="links">${items.map(([h, n]) => `<li><a href="${h}" ${path === n ? 'aria-current="page"' : ''}>${n}</a></li>`).join('')}
  <li><button class="icon-btn" id="theme" aria-label="Toggle light or dark theme"><i class="fa-solid fa-circle-half-stroke"></i></button></li></ul>
  <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="links"><i class="fa-solid fa-bars"></i></button></div></nav>`;
  $('#foot').outerHTML = `<footer><div class="wrap"><div><strong>Kim Sinzala</strong><br><span class="muted">Computer Science · Software · Technology</span></div>
  <div class="muted mono">© ${new Date().getFullYear()} Kim Sinzala · Built from Zambia.</div>
  <div>${SOCIALS.map(([n, i, u]) => `<a href="${u}" aria-label="${n}" style="margin-right:.45rem"><i class="${i}"></i></a>`).join('')}</div></div></footer>`;
}
function nav() {
  const n = $('nav.top'), b = $('#burger'), l = $('#links');
  const f = () => n.classList.toggle('scrolled', scrollY > 20); f(); addEventListener('scroll', f, { passive: true });
  b.onclick = () => { const o = l.classList.toggle('open'); b.setAttribute('aria-expanded', o); };
  l.onclick = (e) => e.target.closest('a') && (l.classList.remove('open'), b.setAttribute('aria-expanded', false));
  const root = document.documentElement, saved = localStorage.getItem('theme');
  root.dataset.theme = saved || 'light';
  $('#theme').onclick = () => { const t = root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme = t; localStorage.setItem('theme', t); };
}
function renderSocial() {
  const el = $('#social'); if (!el) return;
  el.innerHTML = SOCIALS.map(([n, i, u, d]) => `<a class="card reveal" href="${esc(u)}" target="_blank" rel="noopener"><i class="${i}"></i><h3>${n}</h3><p>${d}</p></a>`).join('');
}
function renderSkills() {
  const el = $('#skills'); if (!el) return;
  el.innerHTML = Object.entries(SKILLS).map(([g, a]) => `<div class="skillgroup reveal"><h3>${g}</h3><div class="skills">${a.map(([n, t, d]) => `<button class="skill" data-tier="${t}">${n}<span role="tooltip">${d}</span></button>`).join('')}</div></div>`).join('') +
    '<p class="legend">Solid green = built real things · orange = used in projects · dashed = learning</p>';
}
async function renderProjects() {
  const el = $('#projects'), homeEl = $('#home-projects');
  if (!el && !homeEl) return;
  try {
    const list = await (await fetch('/api/projects')).json();
    const cardHTML = (p) => `<article class="card reveal tilt"><div class="meta"><span class="kind ${p.kind}">${p.kind}</span><span>${esc(p.category)}</span>${p.year && p.year !== 'YEAR' ? `<span>${esc(p.year)}</span>` : ''}</div>
    <h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="meta">${p.tech.map(esc).join(' · ')}</div><div class="meta"><strong>${esc(p.status)}</strong>
    ${p.link && p.link !== '#' ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Explore →</a>` : ''}${p.github ? `<a href="${esc(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ''}</div></article>`;
    if (el) el.innerHTML = list.map(cardHTML).join('');
    if (homeEl) homeEl.innerHTML = list.slice(0, 3).map(cardHTML).join('');
  } catch (e) {
    if (el) el.textContent = 'Could not load projects.';
    if (homeEl) homeEl.textContent = 'Could not load projects.';
  }
}
async function renderHomePosts() {
  const el = $('#home-posts'); if (!el) return;
  try {
    const posts = await (await fetch('/api/posts')).json();
    const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    el.innerHTML = posts.slice(0, 3).map((p) => `<a class="card reveal tilt" href="/writing/${esc(p.slug)}" style="text-decoration:none"><div class="meta"><span class="kind FACT">${esc(p.category)}</span><span>${fmt(p.date)}</span><span>${p.readingTime} min read</span></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></a>`).join('');
  } catch (e) { el.textContent = 'Could not load posts.'; }
}
shell(); nav(); renderSocial(); renderSkills(); Promise.all([renderProjects(), renderHomePosts()]).then(() => document.dispatchEvent(new Event('content-ready')));
