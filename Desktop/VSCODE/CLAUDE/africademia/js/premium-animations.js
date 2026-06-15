/*!
 * Africademia · Premium Animations
 * Mix: GSAP 3.12 + ScrollTrigger + Lenis smooth scroll
 * Effects: page loader cinématique, parallax profond, magnétisme, scroll fluide
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     STYLES INJECTÉS
  ══════════════════════════════════════════════════════════ */
  const S = document.createElement('style');
  S.textContent = `
/* override scroll-behavior natif pour Lenis */
html { scroll-behavior: auto !important; }

/* ── PAGE LOADER ── */
#afc-loader {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  pointer-events: all; overflow: hidden;
}
#afc-ct, #afc-cb {
  position: absolute; left: 0; right: 0; height: 50.5%;
  background: #060D0A; will-change: transform;
}
#afc-ct { top: 0; transform-origin: top center; }
#afc-cb { bottom: 0; transform-origin: bottom center; }

.afc-logo-wrap {
  position: relative; z-index: 2; text-align: center;
}
.afc-logo {
  font-family: 'Space Grotesk','Bricolage Grotesque','Hanken Grotesk',system-ui,sans-serif;
  font-size: 30px; font-weight: 700; color: #F4EFE4;
  letter-spacing: -.03em; display: block;
  opacity: 0; transform: translateY(18px);
  animation: afc-logo-in .6s .18s cubic-bezier(.22,1,.36,1) both;
}
.afc-logo b { color: #E8B96A; }
.afc-logo-tag {
  font-size: 9.5px; font-weight: 600; letter-spacing: .28em;
  text-transform: uppercase; color: rgba(244,239,228,.3);
  display: block; margin-top: 10px;
  opacity: 0;
  animation: afc-logo-in .6s .38s cubic-bezier(.22,1,.36,1) both;
}
.afc-loader-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, transparent 0%, #E8B96A 40%, #3D9A6E 70%, transparent 100%);
  animation: afc-line-grow 1.1s .05s cubic-bezier(.4,0,.2,1) both;
}
#afc-cb .afc-loader-line { bottom: auto; top: 0; }
.afc-loader-dot {
  display: inline-block; width: 5px; height: 5px; border-radius: 50%;
  background: #E8B96A; margin: 0 3px; vertical-align: middle;
  animation: afc-dot-pulse 1.2s ease-in-out infinite;
}
.afc-loader-dot:nth-child(2) { animation-delay: .15s; }
.afc-loader-dot:nth-child(3) { animation-delay: .3s; }

@keyframes afc-logo-in {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes afc-line-grow {
  from { transform: scaleX(0); transform-origin: left; }
  to   { transform: scaleX(1); }
}
@keyframes afc-dot-pulse {
  0%,100% { opacity: .25; transform: scale(.85); }
  50%     { opacity: 1;   transform: scale(1.15); }
}

/* ── SCROLL PROGRESS ── */
#afc-progress {
  position: fixed; top: 0; left: 0; height: 2.5px; width: 0%;
  background: linear-gradient(90deg, #E8B96A 0%, #3D9A6E 60%, #E8B96A 100%);
  background-size: 200% 100%;
  z-index: 9997; pointer-events: none;
  animation: afc-shimmer 3s linear infinite;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px rgba(232,185,106,.5);
  transition: width 60ms linear;
}
@keyframes afc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── REVEAL EN CLIP ── */
.afc-reveal-wrap { overflow: hidden; }
.afc-reveal-inner { display: block; }

/* ── MAGNETIC BUTTONS ── */
.afc-mag { will-change: transform; }

/* ── SERVICE CARDS ENHANCED HOVER ── */
/* GSAP gère les transforms — on neutralise les CSS hover pour éviter conflits */
.svc, .wcard:not(.big), .res, .del, .tes {
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
  --mx: 50%; --my: 50%;
}
.svc:hover, .res:hover, .del:hover, .tes:hover {
  transform: none !important;
}
/* Effet lumière qui suit la souris */
.svc::before,
.wcard:not(.big)::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(circle 180px at var(--mx) var(--my), rgba(255,255,255,.07) 0%, transparent 70%);
  opacity: 0; transition: opacity .4s; pointer-events: none; z-index: 1; border-radius: inherit;
}
.svc:hover::before, .wcard:not(.big):hover::before { opacity: 1; }

/* Shimmer border sur hover */
.svc, .wcard:not(.big) {
  background-clip: padding-box;
  position: relative;
}
.svc::after, .wcard:not(.big)::after {
  content: ""; position: absolute; inset: -1px; border-radius: inherit;
  background: linear-gradient(135deg, rgba(45,122,86,.0), rgba(232,185,106,.0));
  opacity: 0; transition: opacity .5s; pointer-events: none; z-index: 0;
}
.svc:hover::after, .wcard:not(.big):hover::after {
  opacity: 1;
  background: linear-gradient(135deg, rgba(45,122,86,.28), rgba(232,185,106,.18));
}

/* Icône service : scale + glow */
.svc:hover .svc-icon, .wcard:hover .wcard-icon {
  transform: scale(1.1) rotate(-5deg) !important;
  filter: drop-shadow(0 4px 12px rgba(45,122,86,.4));
}

/* ── HERO CARD DEPTH ── */
.hero-card { transform-style: preserve-3d; will-change: transform; }

/* ── HORIZONTAL MARQUEE (stats strip / logos) ── */
.afc-marquee-track {
  display: flex; gap: 0; width: max-content;
  animation: afc-marquee 28s linear infinite;
}
.afc-marquee-track:hover { animation-play-state: paused; }
@keyframes afc-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.afc-marquee-wrap {
  overflow: hidden; cursor: default;
  -webkit-mask: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

/* ── FLOATING DOTS DÉCOR ── */
.afc-particle {
  position: absolute; border-radius: 50%;
  background: rgba(232,185,106,.45);
  pointer-events: none; will-change: transform;
}
  `;
  document.head.appendChild(S);

  /* ══════════════════════════════════════════════════════════
     LOADER HTML
  ══════════════════════════════════════════════════════════ */
  const loaderEl = document.getElementById('afc-loader');
  if (loaderEl) {
    loaderEl.innerHTML = `
      <div id="afc-ct"><div class="afc-loader-line"></div></div>
      <div id="afc-cb"><div class="afc-loader-line"></div></div>
      <div class="afc-logo-wrap">
        <span class="afc-logo">Afric<b>ademia</b></span>
        <span class="afc-logo-tag">
          <span class="afc-loader-dot"></span>
          <span class="afc-loader-dot"></span>
          <span class="afc-loader-dot"></span>
        </span>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════
     SCROLL PROGRESS BAR
  ══════════════════════════════════════════════════════════ */
  const prog = document.createElement('div');
  prog.id = 'afc-progress';
  document.body.insertBefore(prog, document.body.firstChild);

  /* ══════════════════════════════════════════════════════════
     INIT PRINCIPAL
  ══════════════════════════════════════════════════════════ */
  function init() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── DISMISS LOADER ───────────────────────────────────── */
    function dismissLoader() {
      if (!loaderEl) return;
      if (typeof gsap === 'undefined' || reduce) {
        loaderEl.style.cssText += ';opacity:0;transition:opacity .5s;pointer-events:none';
        setTimeout(() => loaderEl.remove(), 600);
        return;
      }
      const top  = document.getElementById('afc-ct');
      const bot  = document.getElementById('afc-cb');
      const logo = loaderEl.querySelector('.afc-logo-wrap');
      gsap.timeline({
        defaults: { ease: 'expo.inOut' },
        onComplete: () => loaderEl.remove()
      })
        .to(logo, { opacity: 0, y: -14, duration: .35, ease: 'power2.in' })
        .to(top,  { y: '-101%', duration: 1.05 }, '-=.05')
        .to(bot,  { y:  '101%', duration: 1.05 }, '<');
    }
    setTimeout(dismissLoader, reduce ? 50 : 880);

    if (reduce) return;

    /* ── SCROLL PROGRESS ─────────────────────────────────── */
    function updateProg() {
      const max = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = max > 0 ? (scrollY / max * 100) + '%' : '0';
    }
    addEventListener('scroll', updateProg, { passive: true });

    /* ── LENIS SMOOTH SCROLL ─────────────────────────────── */
    let lenis;
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.45,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.9,
        infinite: false,
      });

      if (typeof gsap !== 'undefined') {
        lenis.on('scroll', () => {
          updateProg();
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
        });
        gsap.ticker.add(time => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }

      /* Override anchor scroll via capture — écrase les handlers natifs */
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            e.stopImmediatePropagation();
            lenis.scrollTo(target, { offset: -88, duration: 1.4 });
          }
        }
      }, { capture: true });
    }

    if (typeof gsap === 'undefined') return;

    /* ── PARALLAX PROFOND ────────────────────────────────── */

    // Hero glow secondaire : opposite drift (per-page gère le glow primaire)
    // On vérifie que l'élément n'a PAS d'animation ScrollTrigger déjà active
    document.querySelectorAll('.hero-glow-2').forEach(el => {
      const hero = el.closest('.hero') || document.querySelector('.hero');
      if (!hero) return;
      gsap.to(el, {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.9 }
      });
    });

    // Glows sur pages service (pas de per-page parallax sur ces pages)
    // On cible les glows sans id héroïque spécifique
    document.querySelectorAll('.hero-glow:not(#heroGlow):not(#hGlow)').forEach(el => {
      const hero = el.closest('.hero') || document.querySelector('.hero');
      if (!hero) return;
      gsap.to(el, {
        y: 140, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 2.2 }
      });
    });

    // Fluid blobs (page momentum)
    document.querySelectorAll('.fluid-blob').forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? 80 : -60,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 + i * .4 }
      });
    });

    // Hero inner text : dérive légère vers le haut
    const hIn = document.querySelector('.hero-inner, .hero-body, .hero-content');
    if (hIn) {
      gsap.to(hIn, {
        y: 85, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.55 }
      });
    }

    // Grille de points .hero::before (pseudo ne peut pas être animée directement,
    // donc on anime un overlay dédié si présent)
    const heroOverlay = document.querySelector('.hero-dot-grid, .hero-grid-overlay');
    if (heroOverlay) {
      gsap.to(heroOverlay, {
        y: 50, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    /* ── PARALLAX SECTIONS ───────────────────────────────── */
    // Sections colorées : décalage vertical subtil
    document.querySelectorAll('.incub, .strip, .cta-block').forEach(sec => {
      gsap.fromTo(sec,
        { backgroundPositionY: '0%' },
        {
          backgroundPositionY: '12%', ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 2 }
        }
      );
    });

    /* ── MOUSE PARALLAX HERO CARD ────────────────────────── */
    const hCard = document.querySelector('.hero-card');
    if (hCard) {
      const handleMove = e => {
        const mx = (e.clientX / innerWidth  - .5) * 22;
        const my = (e.clientY / innerHeight - .5) * 12;
        gsap.to(hCard, {
          x: mx, y: my,
          rotateY: mx * .25, rotateX: -my * .25,
          duration: 1.35, ease: 'power2.out', transformPerspective: 1000
        });
      };
      const handleLeave = () =>
        gsap.to(hCard, { x:0, y:0, rotateY:0, rotateX:0, duration: 1.1, ease: 'elastic.out(1,.45)' });

      document.addEventListener('mousemove', handleMove, { passive: true });
      document.addEventListener('mouseleave', handleLeave);
    }

    /* ── REVEALS SECTION HEADS ───────────────────────────── */
    document.querySelectorAll('.sec-head .eyebrow').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: .75, ease: 'power3.out',
          scrollTrigger: { trigger: el.closest('.sec-head') || el, start: 'top 88%', once: true }
        }
      );
    });

    /* ── MAGNETIC BOUTONS ────────────────────────────────── */
    document.querySelectorAll([
      '.btn', '.btn-gold', '.btn-out', '.nav-cta', '.nav-wa',
      '.card-cta', '.btn-incub-wa', '.wa-btn', '.cta-btn'
    ].join(',')).forEach(btn => {
      btn.classList.add('afc-mag');
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width  / 2) * .2;
        const my = (e.clientY - r.top  - r.height / 2) * .2;
        gsap.to(btn, { x: mx, y: my, duration: .42, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('mouseleave', () =>
        gsap.to(btn, { x: 0, y: 0, duration: .75, ease: 'elastic.out(1,.5)', overwrite: 'auto' })
      );
    });

    /* ── CARTES SERVICE : tilt 3D + lumière curseur ─────── */
    document.querySelectorAll('.svc, .wcard:not(.big), .res, .del, .tes').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = (e.clientX - r.left - r.width  / 2) / r.width  * 7;
        const ry = (e.clientY - r.top  - r.height / 2) / r.height * 7;
        // Position en % pour l'effet lumière CSS
        const px = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
        const py = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
        card.style.setProperty('--mx', px + '%');
        card.style.setProperty('--my', py + '%');
        // Tilt GSAP (inclut le lift vertical)
        gsap.to(card, {
          rotateY: rx, rotateX: -ry, y: -8,
          duration: .42, ease: 'power2.out',
          transformPerspective: 900, overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0, y: 0,
          duration: .75, ease: 'elastic.out(1,.42)', overwrite: 'auto'
        });
      });
    });

    /* ── LOGO / NAV ENTRANCE ─────────────────────────────── */
    const navLogo = document.querySelector('.logo');
    if (navLogo) {
      gsap.from(navLogo, { opacity: 0, x: -16, duration: .7, ease: 'power3.out', delay: 1.6 });
    }
    // .nav-login exclu : bouton critique, toujours visible (pas de opacity:0)
    const navLinks = [...document.querySelectorAll('.nav-links a, .nav-cta, .nav-burger')];
    if (navLinks.length) {
      gsap.from(navLinks, { opacity: 0, y: -10, duration: .55, ease: 'power3.out', stagger: .07, delay: 1.7 });
    }

    /* ── DÉCO PARTICULES HERO ────────────────────────────── */
    const hero = document.querySelector('.hero');
    if (hero) {
      const count = 6;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'afc-particle';
        const size = 3 + Math.random() * 5;
        p.style.cssText = `
          width:${size}px; height:${size}px;
          left:${10 + Math.random() * 80}%;
          top:${10 + Math.random() * 80}%;
          opacity:${.2 + Math.random() * .4};
        `;
        hero.appendChild(p);
        gsap.to(p, {
          y: `${-60 - Math.random() * 80}`,
          x: `${(Math.random() - .5) * 40}`,
          opacity: 0,
          duration: 4 + Math.random() * 4,
          repeat: -1,
          delay: Math.random() * 3,
          ease: 'none',
          repeatDelay: Math.random() * 2
        });
      }
    }

    /* ── CIRCUIT FILL ANIMATION ──────────────────────────── */
    const wires = [...document.querySelectorAll('.cwire, .cwire-h, .cwire-pulse, .cr-pulse')];
    if (wires.length) {
      gsap.fromTo(wires,
        { scaleX: 0 },
        {
          scaleX: 1, duration: .8, ease: 'power2.out', stagger: .06,
          scrollTrigger: { trigger: '.circuit-wrap', start: 'top 80%', once: true }
        }
      );
    }

    /* ── COMPTEURS ANIMÉS ────────────────────────────────── */
    document.querySelectorAll('[data-count]').forEach(el => {
      const target  = parseFloat(el.dataset.count);
      const suffix  = el.dataset.suffix || '';
      const prefix  = el.dataset.prefix || '';
      const obj     = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2.2, ease: 'power2.out',
        onUpdate: () => { el.textContent = prefix + Math.round(obj.val) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ── LIGNES DE SÉPARATION REVEAL ─────────────────────── */
    document.querySelectorAll('.sec-sep, hr.afc-line').forEach(el => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        }
      );
    });

    /* ── REFRESH SCROLL TRIGGER ──────────────────────────── */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    setTimeout(() => ScrollTrigger.refresh(), 900);
  }

  /* Lancement */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
