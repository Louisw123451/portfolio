/* =============================================
   LOUIS WANG PORTFOLIO — script.js
   ============================================= */

/* ===================================================
   1. PARTICLE NETWORK BACKGROUND
   =================================================== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const D_SQ = 130 * 130; // compare squared distance — avoids Math.sqrt per pair
  let W, H, particles = [], resizeTimer;

  function isMobile() { return window.innerWidth < 700; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Dot {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.45 + 0.08;
      this.col = Math.random() > 0.55 ? '0,212,255' : '124,58,237';
    }
    move() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.col},${this.a})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = isMobile() ? 35 : 70;
    particles = Array.from({length: count}, () => new Dot());
  }

  // Batch all lines into a single path + single stroke() call — much faster than
  // calling stroke() once per pair inside the O(n²) loop.
  function drawLines() {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,212,255,0.07)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        if (dx * dx + dy * dy < D_SQ) {
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
        }
      }
    }
    ctx.stroke();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.move(); p.draw(); });
    drawLines();
    requestAnimationFrame(frame);
  }

  // Debounce resize so particle array isn't rebuilt on every pixel of drag
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); buildParticles(); }, 150);
  });

  resize();
  buildParticles();
  frame();
})();

/* ===================================================
   2. TYPING ANIMATION
   =================================================== */
(function () {
  const phrases = [
    'cyber_security_graduate',
    'digital_forensics_analyst',
    'ethical_hacker_in_training',
    'incident_responder',
    'bilingual_en_cn',
    'continuous_learner',
  ];
  const el = document.getElementById('typing-text');
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const word = phrases[pi];
    el.textContent = deleting ? word.slice(0, ci - 1) : word.slice(0, ci + 1);
    deleting ? ci-- : ci++;
    let delay = deleting ? 45 : 75;
    if (!deleting && ci === word.length) { delay = 2200; deleting = true; }
    else if (deleting && ci === 0)       { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 1600);
})();

/* ===================================================
   3. NAVBAR SCROLL + ACTIVE LINK
   =================================================== */
(function () {
  const nav   = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-links a');
  const sects = document.querySelectorAll('section[id]');

  // Cache section offsets so scroll handler never triggers layout reflow
  let offsets = [];
  function cacheOffsets() {
    offsets = Array.from(sects).map(s => ({ id: s.id, top: s.offsetTop, h: s.offsetHeight }));
  }
  cacheOffsets();
  window.addEventListener('resize', cacheOffsets, { passive: true });

  // rAF throttle — only one DOM update per animation frame while scrolling
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
      const scrollY = window.scrollY + 120;
      offsets.forEach(s => {
        if (scrollY >= s.top && scrollY < s.top + s.h) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
        }
      });
      ticking = false;
    });
  }, { passive: true });
})();

/* ===================================================
   4. MOBILE HAMBURGER
   =================================================== */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
    menu.setAttribute('aria-hidden', true);
  }));
})();

/* ===================================================
   5. SMOOTH SCROLL FOR ANCHOR LINKS
   =================================================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = window.scrollY + target.getBoundingClientRect().top - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ===================================================
   6. SCROLL REVEAL (IntersectionObserver)
   =================================================== */
(function () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 75);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ===================================================
   7. STAT COUNTER ANIMATION
   =================================================== */
(function () {
  const counters = document.querySelectorAll('.stat-value[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || (target >= 10 ? '+' : '');
      let current  = 0;
      const step   = Math.ceil(target / 30);
      const timer  = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + (current === target ? suffix : '');
        if (current >= target) clearInterval(timer);
      }, 45);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => obs.observe(c));
})();

/* ===================================================
   8. VISITOR QUESTIONNAIRE MODAL
   Form submissions go to Formspree when configured.
   To enable: sign up at formspree.io, create a form,
   then replace YOUR_FORM_ID in index.html.
   =================================================== */
(function () {
  const overlay = document.getElementById('visitor-modal');
  const form    = document.getElementById('visitor-form');
  const skipBtn = document.getElementById('skip-btn');

  const STORAGE_KEY = 'lw_visitor_seen';

  /* Humorous responses per visitor type */
  const RESPONSES = {
    'Employer/Recruiter':
      "🎉 Excellent taste! I'm very much available. Check my contact section — let's talk!",
    'Fellow Tech Person':
      "🤜🤛 Respect! Hit me up on LinkedIn — always down to connect with good people.",
    'Cyber Researcher / Stalker':
      "🕵️ I see you. In all seriousness though — hi! (I might have your IP... just kidding. Maybe.)",
    'Just Cruising the Internet':
      "🌊 Welcome aboard! Make yourself at home. There's no door fee.",
    'Genuinely Lost':
      "😂 Don't panic. You landed on a portfolio site — you might accidentally learn something cool.",
    'AI Bot':
      "🤖 Beep boop. Greetings, fellow information-processing entity. Tell your humans I said hi.",
  };

  function open() {
    overlay.classList.add('active');
    overlay.removeAttribute('aria-hidden');
    skipBtn.focus();
  }

  function close() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    localStorage.setItem(STORAGE_KEY, '1');
  }

  /* Show only once per browser (localStorage) */
  if (!localStorage.getItem(STORAGE_KEY)) {
    setTimeout(open, 1300);
  }

  /* Skip button */
  skipBtn.addEventListener('click', close);

  /* Close on overlay backdrop click */
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  /* Close on Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) close();
  });

  /* Form submit */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data      = new FormData(form);
    const type      = data.get('visitor_type') || 'mystery human';
    const submitBtn = form.querySelector('.btn-primary');

    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
    submitBtn.disabled  = true;

    /* Optional Formspree submission */
    const action = form.getAttribute('action') || '';
    if (action && !action.includes('YOUR_FORM_ID')) {
      try {
        await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
      } catch (_) {
        /* Silently fail — local response still shown */
      }
    }

    const msg = RESPONSES[type] || "👋 Thanks for stopping by! You legend.";

    form.innerHTML = `
      <div style="text-align:center;padding:1.5rem 0;">
        <div style="font-size:3rem;margin-bottom:1rem;animation:float 3s ease infinite">✅</div>
        <h3 style="font-family:var(--ff-head);color:var(--cyan);margin-bottom:.65rem;font-size:1.15rem;">Response logged!</h3>
        <p style="color:var(--txt2);margin-bottom:1.75rem;font-size:.9rem;line-height:1.7;">${msg}</p>
        <button onclick="window.__closeModal()" class="btn-primary">
          <i class="fas fa-arrow-right"></i> Explore Portfolio
        </button>
      </div>`;

    localStorage.setItem(STORAGE_KEY, '1');
  });

  /* Expose close for the inline onclick in the thank-you HTML */
  window.__closeModal = close;
})();
