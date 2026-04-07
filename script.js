/* ── PARTICLE CANVAS ─────────────────────────────── */
(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: null, y: null };
  const COUNT = 90;
  const COLORS = ['rgba(124,58,237,', 'rgba(168,85,247,', 'rgba(236,72,153,', 'rgba(59,130,246,', 'rgba(6,182,212,'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 2.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = Math.random() * 200 + 100;
      this.age = initial ? Math.random() * this.life : 0;
    }
    update() {
      this.age++;
      if (this.age > this.life) { this.reset(false); return; }

      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.015;
          this.vx -= (dx / dist) * force;
          this.vy -= (dy / dist) * force;
        }
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x += this.vx;
      this.y += this.vy;
      const progress = this.age / this.life;
      const fade = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
      this.currentAlpha = this.alpha * fade;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.currentAlpha + ')';
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist/100) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  document.getElementById('hero').addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.getElementById('hero').addEventListener('mouseleave', () => {
    mouse.x = null; mouse.y = null;
  });

  resize();
  init();
  loop();
})();

/* ── TYPEWRITER + GLITCH ─────────────────────────── */
(function() {
  const el = document.getElementById('typewriter');
  const words = ['Front-End Developer', 'Data Analyst', 'Co-Founder @ Pixora'];
  let wi = 0, ci = 0, deleting = false, wait = 0;

  function type() {
    if (wait > 0) { wait--; setTimeout(type, 60); return; }

    const word = words[wi];

    if (!deleting) {
      if (ci < word.length) {
        const span = document.createElement('span');
        span.className = 'glitch-char';
        span.textContent = word[ci];
        el.appendChild(span);
        ci++;
        setTimeout(type, 55 + Math.random() * 40);
      } else {
        wait = 28;
        deleting = true;
        setTimeout(type, 60);
      }
    } else {
      if (el.lastChild) {
        el.removeChild(el.lastChild);
        ci--;
        setTimeout(type, 28);
      } else {
        wi = (wi + 1) % words.length;
        ci = 0;
        deleting = false;
        wait = 8;
        setTimeout(type, 60);
      }
    }
  }
  setTimeout(type, 800);
})();

/* ── NAVBAR HIDE/SHOW ON SCROLL ──────────────────── */
(function() {
  const nav = document.getElementById('navbar');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 80) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

/* ── HAMBURGER MENU ──────────────────────────────── */
(function() {
  const btn = document.getElementById('hamburger');
  const drawer = document.getElementById('nav-drawer');
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();

/* ── SCROLL REVEAL ───────────────────────────────── */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── SKILL PILLS STAGGER ─────────────────────────── */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.pill').forEach((pill, i) => {
          setTimeout(() => pill.classList.add('visible'), i * 60);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skills-section').forEach(el => observer.observe(el));
})();

/* ── LIGHTBOX ────────────────────────────────────── */
(function() {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const close = document.getElementById('lightbox-close');

  document.querySelectorAll('.study-card[data-diploma]').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.diploma;
      img.src = src;
      img.alt = card.querySelector('.study-title').textContent + ' diploma';
      lb.classList.add('open');
      lb.focus();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

  close.addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lb.classList.remove('open');
  });
})();

/* ── SCROLL TO TOP ───────────────────────────────── */
(function() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── CONTACT FORM ────────────────────────────────── */
function handleFormSubmit() {
  const btn = document.querySelector('.form-submit');
  btn.textContent = '✓ Message sent!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
  }, 3000);
}

/* ── SMOOTH SCROLL ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
