// Scroll reveal, soft cursor aura, gentle float, magnetic buttons, warm organic hero blobs, timeline draw.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

function init() {
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => reduce ? el.classList.add('in') : io.observe(el));
  if (reduce || !fine) return;

  document.querySelectorAll('.tilt').forEach((c) => {
    c.onmousemove = (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `translateY(-6px) perspective(900px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
    };
    c.onmouseleave = () => (c.style.transform = '');
  });

  document.querySelectorAll('.btn').forEach((b) => {
    b.classList.add('mag');
    b.onmousemove = (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2 - 2}px)`;
    };
    b.onmouseleave = () => (b.style.transform = '');
  });
}

init();
document.addEventListener('content-ready', () => setTimeout(init, 50));

if (!reduce && fine) {
  const g = Object.assign(document.createElement('div'), { id: 'glow' });
  document.body.append(g);
  addEventListener('mousemove', (e) => (g.style.transform = `translate(${e.clientX}px,${e.clientY}px)`), { passive: true });
}

// Soft organic floating ambient blobs in hero canvas
const cv = document.getElementById('net');
if (cv && !reduce) {
  const ctx = cv.getContext('2d');
  let w, h, blobs = [], on = true;
  const size = () => {
    w = cv.width = cv.offsetWidth;
    h = cv.height = cv.offsetHeight;
    blobs = [
      { x: w * 0.22, y: h * 0.35, r: Math.min(w, h) * 0.28, vx: 0.25, vy: 0.18, c: 'rgba(44, 110, 73, 0.11)' },
      { x: w * 0.75, y: h * 0.42, r: Math.min(w, h) * 0.32, vx: -0.22, vy: 0.2, c: 'rgba(214, 104, 59, 0.10)' },
      { x: w * 0.5, y: h * 0.72, r: Math.min(w, h) * 0.25, vx: 0.18, vy: -0.22, c: 'rgba(232, 168, 86, 0.09)' }
    ];
  };
  size();
  addEventListener('resize', size);
  new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(cv);

  (function loop() {
    if (on) {
      ctx.clearRect(0, 0, w, h);
      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < b.r * 0.3 || b.x > w - b.r * 0.3) b.vx *= -1;
        if (b.y < b.r * 0.3 || b.y > h - b.r * 0.3) b.vy *= -1;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    requestAnimationFrame(loop);
  })();
}

// Timeline fills as you scroll
document.querySelectorAll('.timeline').forEach((t) => {
  const fill = t.querySelector('.fill');
  if (!fill) return;
  const f = () => {
    const r = t.getBoundingClientRect();
    fill.style.height = Math.max(0, Math.min(r.height, innerHeight * 0.65 - r.top)) + 'px';
  };
  f();
  addEventListener('scroll', f, { passive: true });
});
