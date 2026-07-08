(() => {
  const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Loader ---------------------------------------------------------
  // Runs immediately (outside DOMContentLoaded) so the loader hides as
  // soon as the page is interactive, not waiting for partials to load.
  const initLoader = () => {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    const hide = () => loader.classList.add('loader-out');

    if (prefersReduced) { hide(); return; }

    // Hide once the page is fully loaded, with a brief minimum display time
    const MIN_MS = 1200;
    const startedAt = Date.now();

    const scheduleHide = () => {
      const elapsed = Date.now() - startedAt;
      const delay = Math.max(0, MIN_MS - elapsed);
      setTimeout(hide, delay);
    };

    if (document.readyState === 'complete') {
      scheduleHide();
    } else {
      window.addEventListener('load', scheduleHide, { once: true });
    }

    // Hard fallback: never block the user beyond 2.5s
    setTimeout(hide, 2500);
  };
  initLoader();

  const initMobileMenu = () => {
    const menuBtn = document.getElementById('menuBtn');
    const menuClose = document.getElementById('menuClose');
    const mobilePanel = document.getElementById('mobilePanel');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (!menuBtn || !mobilePanel) return;

    const toggleMenu = (show) => {
      mobilePanel.classList.toggle('hidden', !show);
      document.body.classList.toggle('overflow-hidden', show);
    };

    menuBtn.addEventListener('click', () => toggleMenu(true));
    menuClose?.addEventListener('click', () => toggleMenu(false));
    mobileOverlay?.addEventListener('click', () => toggleMenu(false));
  };

  const initPageTransitions = () => {
    if (prefersReduced) return;
    const isModifiedClick = (event) =>
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    let isNavigating = false;

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (link.target === '_blank') return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (/^https?:\/\//i.test(href)) return;

      link.addEventListener('click', (event) => {
        if (isModifiedClick(event) || isNavigating) return;
        event.preventDefault();
        isNavigating = true;
        document.body.classList.add('page-exit');
        setTimeout(() => {
          window.location.href = href;
        }, 220);
      });
    });
  };

  const initScrollReveal = () => {
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if (!revealTargets.length) return;

    if (prefersReduced) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const revealInView = () => {
      const viewport = window.innerHeight || 0;
      revealTargets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < viewport * 0.9) el.classList.add('is-visible');
      });
    };

    revealInView();

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));
  };

  const loadPartials = async () => {
    const targets = Array.from(document.querySelectorAll('[data-include]'));
    if (!targets.length) return;

    await Promise.all(
      targets.map(async (target) => {
        const url = target.getAttribute('data-include');
        if (!url) return;
        const response = await fetch(url);
        if (!response.ok) return;
        // Insertar el HTML como hermano del div y eliminar el div,
        // para que <header> y <footer> sean hijos directos de su padre
        // real (body / page-body-wrap) — necesario para que position:sticky
        // no quede confinado a la altura del div envoltorio.
        target.insertAdjacentHTML('afterend', await response.text());
        target.remove();
      })
    );
  };

  const initTemporadaSection = async () => {
    const headers = { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } };
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.temporada_visible&select=value`, headers);
      const data = await res.json();
      const visible = Array.isArray(data) && data.length > 0 ? data[0].value !== false : true;
      if (!visible) {
        document.querySelectorAll('[data-temporada-link]').forEach((el) => { el.style.display = 'none'; });
      }
    } catch {
      // fail silently
    }
  };

  // --- Tilt card (cajitas) ----------------------------------------
  const initTiltCard = () => {
    if (prefersReduced) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    const card = document.getElementById('tilt-card');
    if (!card) return;

    const MAX_DEG = 9;

    card.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      const rotateY =  (x - 0.5) * MAX_DEG * 2;
      const rotateX = -(y - 0.5) * MAX_DEG * 2;
      const shadowX = -(x - 0.5) * 24;
      const shadowY = -(y - 0.5) * 24;
      card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.boxShadow = `${shadowX}px ${shadowY}px 60px -12px rgba(80,43,28,0.45)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.boxShadow = '';
    });
  };

  // --- Navbar scroll transform ----------------------------------------
  const initNavScroll = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const THRESHOLD = 70;
    let raf;

    const update = () => {
      header.classList.toggle('nav-scrolled', window.scrollY > THRESHOLD);
    };

    window.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });

    update(); // estado correcto si la página carga con scroll previo
  };

  // --- Indicador de sección activa ------------------------------------
  const initActiveSection = () => {
    const map = [
      { id: 'nosotros', href: '/#nosotros' },
      { id: 'contacto', href: '/#contacto' },
    ];

    const pairs = map.map(({ id, href }) => ({
      section: document.getElementById(id),
      link: document.querySelector(`.nav-link[href="${href}"]`),
    })).filter(({ section, link }) => section && link);

    if (!pairs.length) return;

    const setActive = (activeLink) => {
      pairs.forEach(({ link }) => link.classList.remove('nav-link--active'));
      if (activeLink) activeLink.classList.add('nav-link--active');
    };

    // rootMargin: dispara cuando la sección entra en la franja central del viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const pair = pairs.find(({ section }) => section === entry.target);
        if (!pair) return;
        if (entry.isIntersecting) {
          setActive(pair.link);
        } else if (pair.link.classList.contains('nav-link--active')) {
          setActive(null);
        }
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });

    pairs.forEach(({ section }) => observer.observe(section));
  };

  // --- Badge de estado abierto/cerrado (horario Costa Rica) -----------
  const initOpenStatus = () => {
    const badge = document.getElementById('open-status-badge');
    if (!badge) return;

    // Hora actual en Costa Rica (UTC-6, sin DST)
    const now = new Date();
    const cr  = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
    const day = cr.getDay();                          // 0=dom … 6=sáb
    const min = cr.getHours() * 60 + cr.getMinutes();

    const WD_OPEN  = 7  * 60;       // 7:00
    const WD_CLOSE = 18 * 60;       // 18:00
    const SA_OPEN  = 8  * 60 + 30;  // 8:30
    const SA_CLOSE = 17 * 60 + 30;  // 17:30

    let isOpen = false;
    let text   = '';

    if (day === 0) {
      text = 'Cerrado hoy · Abre mañana a las 7:00 a.m.';
    } else if (day === 6) {
      if (min < SA_OPEN)        { text = 'Cerrado · Abre a las 8:30 a.m.'; }
      else if (min < SA_CLOSE)  { isOpen = true; text = 'Abierto ahora · Cierra a las 5:30 p.m.'; }
      else                      { text = 'Cerrado · Abre el lunes a las 7:00 a.m.'; }
    } else {
      if (min < WD_OPEN)        { text = 'Cerrado · Abre a las 7:00 a.m.'; }
      else if (min < WD_CLOSE)  { isOpen = true; text = 'Abierto ahora · Cierra a las 6:00 p.m.'; }
      else                      { text = 'Cerrado · Abre mañana a las 7:00 a.m.'; }
    }

    const dot = isOpen ? '<span class="open-status-dot" aria-hidden="true"></span>' : '';
    badge.innerHTML = `<span class="open-status-badge${isOpen ? ' open-status-badge--open' : ''}">${dot}${text}</span>`;
  };

  // --- Copiar número de teléfono al portapapeles ----------------------
  const initCopyPhone = () => {
    const btn = document.getElementById('copy-phone-btn');
    if (!btn) return;

    const PHONE = '+506 8337-6864';

    const showFeedback = () => {
      btn.classList.add('copy-btn--success');
      setTimeout(() => btn.classList.remove('copy-btn--success'), 1200);
    };

    const copyPhone = () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(PHONE).then(showFeedback).catch(() => {});
        return;
      }
      // Fallback para HTTP o navegadores sin Clipboard API
      const ta = document.createElement('textarea');
      ta.value = PHONE;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, 999999); // fix para iOS Safari
      try {
        const successful = document.execCommand('copy');
        if (successful) showFeedback();
      } catch (_) {}
      document.body.removeChild(ta);
    };

    btn.addEventListener('click', copyPhone);
  };

  const initContactActions = () => {
    const whatsappNumber = '50683376864';
    document.querySelectorAll('.wa-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const msg = btn.dataset.waMsg || '';
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener');
      });
    });
  };

  const initImageSkeletons = () => {
    document.querySelectorAll('img').forEach((img) => {
      const parent = img.parentElement;
      if (!parent) return;
      if (img.complete && img.naturalWidth > 0) return;
      parent.classList.add('skeleton');
      const remove = () => parent.classList.remove('skeleton');
      if (img.complete) { remove(); return; }
      img.addEventListener('load', remove, { once: true });
      img.addEventListener('error', remove, { once: true });
    });
  };

  const initLightbox = () => {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 opacity-0 pointer-events-none transition-opacity duration-300';
    overlay.innerHTML = `
      <button id="lightbox-close" aria-label="Cerrar" class="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white text-2xl leading-none transition-colors">&times;</button>
      <p class="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs select-none hidden" id="lightbox-hint">Desliza hacia abajo para cerrar</p>
      <img id="lightbox-img" src="" alt="" class="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl select-none" draggable="false">
    `;
    document.body.appendChild(overlay);

    const img = overlay.querySelector('#lightbox-img');
    const hint = overlay.querySelector('#lightbox-hint');

    const open = (src, alt) => {
      img.src = src;
      img.alt = alt || '';
      if ('ontouchstart' in window) hint.classList.remove('hidden');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      overlay.classList.add('opacity-0', 'pointer-events-none');
      overlay.classList.remove('opacity-100');
      document.body.style.overflow = '';
      img.style.transform = '';
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox]');
      if (trigger) open(trigger.dataset.lightbox, trigger.dataset.lightboxAlt);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.id === 'lightbox-close') close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Swipe down to close
    let touchStartY = 0;
    overlay.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    overlay.addEventListener('touchmove', (e) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy > 0) img.style.transform = `translateY(${dy * 0.4}px)`;
    }, { passive: true });
    overlay.addEventListener('touchend', (e) => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy > 80) close();
      else img.style.transform = '';
    }, { passive: true });
  };

  // --- Sello de casa badge (stroke-draw on scroll) --------------------
  const initSelloBadge = () => {
    const wrap = document.querySelector('.sello-badge-wrap');
    if (!wrap) return;

    if (prefersReduced) {
      wrap.classList.add('sello-is-drawn');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        wrap.classList.add('sello-is-drawn');
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(wrap);
  };

  // --- Parallax (hero image) ------------------------------------------
  const initParallax = () => {
    if (prefersReduced) return;
    const track = document.getElementById('hero-parallax-track');
    if (!track) return;
    const section = track.closest('section');
    if (!section) return;

    let raf;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY > section.offsetHeight * 1.3) return;
        track.style.transform = `translateY(${scrollY * 0.3}px)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartials();
    initNavScroll();
    initActiveSection();
    initTemporadaSection();
    initMobileMenu();
    initPageTransitions();
    initScrollReveal();
    initOpenStatus();
    initCopyPhone();
    initContactActions();
    initLightbox();
    initImageSkeletons();
    initSelloBadge();
    initTiltCard();
    initParallax();
  });
})();
