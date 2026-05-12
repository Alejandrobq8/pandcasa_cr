(() => {
  const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (link.target === '_blank') return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (/^https?:\/\//i.test(href)) return;

      link.addEventListener('click', (event) => {
        if (isModifiedClick(event)) return;
        event.preventDefault();
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
        target.innerHTML = await response.text();
      })
    );
  };

  const initTemporadaSection = async () => {
    const headers = { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } };
    try {
      const [visRes, prodRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.temporada_visible&select=value`, headers),
        fetch(`${SUPABASE_URL}/rest/v1/products?category=eq.bocadillos_carousel&image_url=not.is.null&available=eq.true&select=id,name,image_url&order=created_at.desc`, headers)
      ]);
      const [visData, products] = await Promise.all([visRes.json(), prodRes.json()]);

      // Controla solo los links de navegacion — el carrusel siempre esta activo
      const visible = Array.isArray(visData) && visData.length > 0 ? visData[0].value !== false : true;
      if (!visible) {
        document.querySelectorAll('[data-temporada-link]').forEach((el) => { el.style.display = 'none'; });
      }

      // Carga las fotos del carrusel de bocadillos independientemente de la visibilidad
      const slider = document.querySelector('.seasonal-slider');
      const list = document.querySelector('.seasonal-list');
      if (slider && list && Array.isArray(products) && products.length > 0) {
        slider.style.setProperty('--quantity', String(products.length));
        list.innerHTML = products.map((p, i) => `
          <div class="seasonal-item" style="--position: ${i + 1}">
            <div class="block rounded-2xl overflow-hidden border border-brand-caramel/20 bg-brand-beige/40 shadow-soft h-full w-full">
              <img src="${p.image_url}" alt="${p.name}" class="h-full w-full object-cover" loading="eager" decoding="async" />
            </div>
          </div>
        `).join('');
      }
    } catch {
      // falla silenciosamente — mantiene el carrusel estatico
    }
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

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartials();
    initTemporadaSection();
    initMobileMenu();
    initPageTransitions();
    initScrollReveal();
    initContactActions();
  });
})();
