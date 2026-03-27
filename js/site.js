(() => {
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

  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const status = document.getElementById('contactStatus');
    const whatsappNumber = '50683376864';

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const nombre = String(formData.get('nombre') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const mensaje = String(formData.get('mensaje') || '').trim();

      if (!nombre || !email || !mensaje) {
        if (status) status.textContent = 'Completa todos los campos antes de continuar.';
        return;
      }

      const text = [
        'Hola, Pan d’ Casa.',
        '',
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        'Mensaje:',
        mensaje
      ].join('\n');

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
      window.location.href = '/gracias.html';
    });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartials();
    initMobileMenu();
    initPageTransitions();
    initScrollReveal();
    initContactForm();
  });
})();
