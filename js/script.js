/* ═══════════════════════════════════════════════════════════
   SeyerkAI — script.js v2.0
   GSAP · ScrollTrigger · Neural Canvas · Lerp Cursor
   Dark/Light Mode · 3D Tilt · Magnetic Buttons
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ── Dark / Light Mode ──────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('seyerk-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const curr = document.documentElement.getAttribute('data-theme');
      const next = curr === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('seyerk-theme', next);
      updateThemeIcon(next);
    });
  });
}
function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

/* ── Neural Network Canvas ──────────────────────────────── */
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animFrame;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = Math.min(70, Math.floor(window.innerWidth / 20));
  const MAX_DIST = 160;

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2
    });
  }

  // Assign node type: 0=orange, 1=navy
  nodes.forEach((n, i) => { n.type = i % 2; });

  const NODE_COLORS_DARK  = ['rgba(251,146,60,', 'rgba(59,111,212,'];
  const NODE_COLORS_LIGHT = ['rgba(249,115,22,', 'rgba(30,58,138,'];
  const EDGE_COLORS_DARK  = [[251,146,60],[59,111,212]];
  const EDGE_COLORS_LIGHT = [[249,115,22],[30,58,138]];

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const nodeColors = isDark ? NODE_COLORS_DARK : NODE_COLORS_LIGHT;
    const edgeColors = isDark ? EDGE_COLORS_DARK : EDGE_COLORS_LIGHT;

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      // Draw node
      const alpha = 0.45 + Math.sin(n.pulse) * 0.25;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse) * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = nodeColors[n.type] + alpha + ')';
      ctx.fill();
    });

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.15;
          // Mix edge color between the two node types
          const ec = edgeColors[nodes[i].type];
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${ec[0]},${ec[1]},${ec[2]},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

/* ── Lerp Cursor ────────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll('a, button, .glass-card, .service-card, .tech-item, .stat-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}

/* ── Navbar ─────────────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => { nav.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlight
  const links = nav.querySelectorAll('.nav-link');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    const href = l.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) l.classList.add('active');
  });
}

/* ── Mobile Menu ─────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

/* ── Page Transitions ────────────────────────────────────── */
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;
  gsap.to(overlay, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => overlay.style.pointerEvents = 'none' });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.pointerEvents = 'all';
      gsap.to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.in', onComplete: () => window.location.href = href });
    });
  });
}

/* ── 3D Card Tilt ────────────────────────────────────────── */
function init3DTilt() {
  document.querySelectorAll('.glass-card, .service-card, .stat-card, .process-step-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      gsap.to(card, {
        rotateX: -dy * 8,
        rotateY:  dx * 8,
        transformPerspective: 1000,
        ease: 'power1.out',
        duration: 0.35
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}

/* ── Magnetic Buttons ────────────────────────────────────── */
function initMagneticButtons() {
  document.querySelectorAll('.btn-primary, .btn-primary-large, .btn-ghost, .btn-ghost-large').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}

/* ── Text Reveal (word-by-word) ──────────────────────────── */
function initTextReveal() {
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(w => `<span class="reveal-word" style="display:inline-block;opacity:0;transform:translateY(24px)">${w}</span>`).join(' ');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(el.querySelectorAll('.reveal-word'), {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out'
        });
      }
    });
  });
}

/* ── Counters ────────────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isFloat = el.dataset.target.includes('.');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            el.textContent = isFloat ? this.targets()[0].val.toFixed(1) : Math.round(this.targets()[0].val).toLocaleString();
          }
        });
      }
    });
  });
}

/* ── Chatbot ─────────────────────────────────────────────── */
const BOT_RESPONSES = {
  hello: "Hi there! 👋 I'm SeyerkAI's assistant. How can I help you today?",
  hi: "Hello! 😊 Welcome to SeyerkAI. What can I do for you?",
  services: "We offer AI Development, Cloud Architecture, Web & Mobile Apps, Cybersecurity, Data Analytics, and Digital Strategy. Which interests you?",
  pricing: "Our packages start at $2,500/month for startups. We custom-tailor every solution. Want to schedule a free consultation?",
  contact: "You can reach us at hello@seyerkai.com or fill out our contact form. We respond within 24 hours!",
  ai: "SeyerkAI specializes in LLM integrations, computer vision, predictive analytics, and AI-powered automation. What's your use case?",
  help: "I can help you with: services we offer, pricing, how to get started, or connecting you with our team!",
  default: "Great question! Our team would love to discuss that in detail. Want me to connect you with a specialist? 🚀"
};

function appendChatMessage(role, text) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="chat-bubble ${role === 'bot' ? 'bot-bubble' : 'user-bubble'}">${text}</div>
    <div class="chat-time">${time}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.id = 'typing';
  div.className = 'chat-msg bot';
  div.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
function removeTypingIndicator() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(BOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return reply;
  }
  return BOT_RESPONSES.default;
}

function sendChatMessage(text) {
  if (!text.trim()) return;
  appendChatMessage('user', text);
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    appendChatMessage('bot', getBotReply(text));
  }, 900 + Math.random() * 500);
}

function initChatbot() {
  const btn   = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('chatbot-panel');
  const close = document.getElementById('chatbot-close');
  const input = document.getElementById('chat-input');
  const send  = document.getElementById('chat-send');
  if (!btn || !panel) return;

  gsap.set(panel, { scale: 0.85, opacity: 0, y: 20, pointerEvents: 'none' });

  btn.addEventListener('click', () => {
    const isHidden = panel.style.pointerEvents === 'none' || !panel.style.pointerEvents;
    if (isHidden) {
      panel.style.pointerEvents = 'all';
      gsap.to(panel, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' });
    } else {
      gsap.to(panel, { scale: 0.85, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: () => panel.style.pointerEvents = 'none' });
    }
  });

  close && close.addEventListener('click', () => {
    gsap.to(panel, { scale: 0.85, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: () => panel.style.pointerEvents = 'none' });
  });

  send && send.addEventListener('click', () => { sendChatMessage(input.value); input.value = ''; });
  input && input.addEventListener('keydown', e => { if (e.key === 'Enter') { sendChatMessage(input.value); input.value = ''; } });

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => sendChatMessage(btn.textContent));
  });
}

/* ── FAQ ─────────────────────────────────────────────────── */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const icon   = btn.querySelector('.faq-icon');
  const open   = !answer.classList.contains('hidden');
  if (open) {
    gsap.to(answer, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => answer.classList.add('hidden') });
    icon && icon.classList.remove('open');
  } else {
    answer.classList.remove('hidden');
    answer.style.height = 'auto';
    const h = answer.scrollHeight;
    gsap.fromTo(answer, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.4, ease: 'power2.out' });
    icon && icon.classList.add('open');
  }
}

/* ── Scroll Animations (sections) ───────────────────────── */
function initScrollAnimations() {
  // Generic fade-up for sections
  gsap.utils.toArray('[data-animate]').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  // Stagger children
  gsap.utils.toArray('[data-stagger]').forEach(container => {
    const children = container.children;
    gsap.fromTo(children, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: container, start: 'top 82%', once: true }
    });
  });

  // Milestones
  document.querySelectorAll('.milestone').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      onEnter: () => { setTimeout(() => el.classList.add('visible'), i * 150); }
    });
  });
}

/* ── Parallax Scroll (Homepage) ──────────────────────────── */
function initParallaxScroll() {
  const hero = document.getElementById('scene-hero');
  if (!hero) return;

  // Hero orbs parallax
  gsap.utils.toArray('.glow-orb').forEach((orb, i) => {
    const speed = i % 2 === 0 ? -60 : -40;
    gsap.to(orb, {
      y: speed + '%',
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.5 }
    });
  });

  // Data badges float
  gsap.utils.toArray('.data-badge').forEach((badge, i) => {
    gsap.to(badge, {
      y: (i % 2 === 0 ? -80 : -60),
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  });

  // Hero content
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    gsap.to(heroContent, {
      y: -80,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: 1.2 }
    });
  }
}

/* ── Hero Entrance Animations ────────────────────────────── */
function initHeroAnimations() {
  const tl = gsap.timeline({ delay: 0.3 });
  tl.from('.hero-badge', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.out' })
    .from('.hero-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.2')
    .from('.hero-sub',   { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .from('.hero-cta',   { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .from('.hero-stats',  { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    .from('.data-badge',  { opacity: 0, scale: 0.8, stagger: 0.15, duration: 0.5, ease: 'back.out(1.4)' }, '-=0.3');
}

/* ── Form Validation ─────────────────────────────────────── */
function validateField(input) {
  const err = input.parentElement.querySelector('.form-error');
  let msg = '';
  if (input.required && !input.value.trim()) msg = 'This field is required';
  else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) msg = 'Please enter a valid email';
  else if (input.type === 'checkbox' && !input.checked) msg = 'You must accept the terms';

  input.classList.toggle('error', !!msg);
  if (err) err.textContent = msg;
  return !msg;
}

function handleFormSubmit(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) return;

    const btn = form.querySelector('[type="submit"]');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4" stroke-dashoffset="10"/></svg>Sending…</span>`;

    setTimeout(() => {
      btn.innerHTML = `<span>✓ Message Sent!</span>`;
      form.reset();
      setTimeout(() => { btn.disabled = false; btn.innerHTML = origText; }, 3000);
    }, 1500);
  });

  form.querySelectorAll('input, textarea, select').forEach(f => {
    f.addEventListener('blur', () => validateField(f));
  });
}

/* ── Smooth Scroll ───────────────────────────────────────── */
function smoothScrollTo(target, duration) {
  const start = window.scrollY;
  const dest = typeof target === 'number' ? target : document.querySelector(target)?.offsetTop || 0;
  const dist = dest - start;
  let startTime = null;
  function ease(t) { return t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }
  function step(ts) {
    if (!startTime) startTime = ts;
    const prog = Math.min((ts - startTime) / duration, 1);
    window.scrollTo(0, start + dist * ease(prog));
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── Page-Specific Init ──────────────────────────────────── */
function initHomePage() {
  initHeroAnimations();
  initParallaxScroll();
  initCounters();
  initTextReveal();

  // Scroll indicator
  const scrollBtn = document.querySelector('.scroll-down-btn');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => smoothScrollTo(window.innerHeight, 900));
  }

  // Process steps animation
  gsap.utils.toArray('.process-step').forEach((step, i) => {
    gsap.fromTo(step,
      { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 82%', once: true } }
    );
  });

  // Tech items stagger
  const techGrid = document.querySelector('.tech-grid-items');
  if (techGrid) {
    gsap.fromTo(techGrid.children, { opacity: 0, y: 30, scale: 0.9 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: techGrid, start: 'top 82%', once: true }
    });
  }
}

function initAboutPage() {
  initTextReveal();
  initScrollAnimations();

  gsap.utils.toArray('.team-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 85%', once: true }
    });
  });
}

function initServicesPage() {
  initTextReveal();
  initScrollAnimations();

  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 40, scale: 0.96 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 86%', once: true }
    });
  });
}

function initContactPage() {
  handleFormSubmit('contact-form');
  initScrollAnimations();

  document.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => toggleFaq(btn));
  });
}

/* ── Coder Matrix Rain Canvas ────────────────────────────── */
function initTechCanvas() {
  const canvas = document.getElementById('techCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cols, drops, chars;

  // Code-themed characters: symbols, digits, brackets, operators
  const CODE_CHARS = '{}[]()<>/\\|=+*&%$#@!?;:.,~^_0123456789ABCDEFabcdef'.split('');
  const CODE_WORDS = ['fn','if','AI','ML','->','&&','||','=>','++','--','AI','py','js','go','db','{}','[]'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    const fontSize = 14;
    cols = Math.floor(W / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -H / fontSize);
    chars = Array.from({ length: cols }, () => pickChar());
  }

  function pickChar() {
    return Math.random() > 0.7
      ? CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)]
      : CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }

  resize();
  window.addEventListener('resize', resize);

  const FONT_SIZE = 14;
  const TRAIL = 18; // how many chars in each column trail

  // Per-column trail arrays
  let trails = Array.from({ length: cols }, () =>
    Array.from({ length: TRAIL }, () => ({ ch: pickChar(), alpha: 0 }))
  );

  function draw() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Fade background (creates trail effect)
    ctx.fillStyle = isDark ? 'rgba(6,13,26,0.18)' : 'rgba(244,248,255,0.18)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

    for (let i = 0; i < cols; i++) {
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      // Lead character — bright orange
      if (y >= 0 && y <= H) {
        ctx.fillStyle = isDark ? 'rgba(251,146,60,0.95)' : 'rgba(234,88,12,0.9)';
        chars[i] = pickChar();
        ctx.fillText(chars[i], x, y);
      }

      // Trail characters — fading navy to transparent
      for (let t = 1; t <= TRAIL; t++) {
        const ty = y - t * FONT_SIZE;
        if (ty < 0 || ty > H) continue;
        const ratio = 1 - t / TRAIL;
        if (isDark) {
          // Orange near head, navy further down
          if (t < 4) {
            ctx.fillStyle = `rgba(251,146,60,${ratio * 0.5})`;
          } else {
            ctx.fillStyle = `rgba(59,111,212,${ratio * 0.35})`;
          }
        } else {
          ctx.fillStyle = t < 4
            ? `rgba(234,88,12,${ratio * 0.4})`
            : `rgba(30,58,138,${ratio * 0.25})`;
        }
        const trailChar = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        ctx.fillText(trailChar, x, ty);
      }

      // Reset column when it goes off screen
      drops[i] += 0.5;
      if (drops[i] * FONT_SIZE > H + TRAIL * FONT_SIZE) {
        drops[i] = Math.random() * -20;
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

/* ── Parallax Scroll ─────────────────────────────────────── */
function initParallax() {
  const els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    els.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
}

/* ── Bootstrap ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNeuralCanvas();
  initTechCanvas();
  initParallax();
  initCursor();
  initNavbar();
  initMobileMenu();
  initPageTransitions();
  init3DTilt();
  initMagneticButtons();
  initScrollAnimations();
  initChatbot();

  // Detect current page
  const path = window.location.pathname;
  if (path.includes('about'))    initAboutPage();
  else if (path.includes('services')) initServicesPage();
  else if (path.includes('contact'))  initContactPage();
  else initHomePage();
});
