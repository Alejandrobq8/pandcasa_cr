const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

const isConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes('YOUR_SUPABASE_URL') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

const formatCRC = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  return `₡${Number(value).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const renderExtras = (extras) => {
  if (!Array.isArray(extras) || extras.length === 0) return '';
  const items = extras
    .filter((extra) => extra && extra.name)
    .map((extra) => {
      const price = extra.price ? ` · ${formatCRC(extra.price)}` : '';
      return `<span class="px-3 py-1 rounded-full bg-brand-beige text-xs text-brand-cocoa">${extra.name}${price}</span>`;
    })
    .join('');
  return `<div class="mt-4 flex flex-wrap gap-2">${items}</div>`;
};

const renderAvailability = (available) => {
  return available
    ? '<span class="inline-flex items-center gap-1.5 text-xs text-brand-cocoa/60"><span class="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block"></span>Disponible</span>'
    : '<span class="inline-flex items-center gap-1.5 text-xs text-brand-cocoa/40"><span class="w-1.5 h-1.5 rounded-full bg-brand-caramel/30 inline-block"></span>Agotado</span>';
};

const renderDescription = (description) => {
  if (!description) return '<p class="mt-3 text-sm text-brand-cocoa/70">Consulta por los sabores disponibles hoy.</p>';
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return `<p class="mt-3 text-sm text-brand-cocoa/70 leading-relaxed">${description}</p>`;
  }
  const items = lines.map((l) => `<li>${l}</li>`).join('');
  return `<ul class="product-desc-list mt-3 text-sm text-brand-cocoa/70">${items}</ul>`;
};

const renderCard = (product) => {
  if (product.category === 'bocadillos_carousel') {
    return `
      <article class="card-reveal group overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <div class="w-full overflow-hidden relative">
          <img src="${product.image_url}" alt="${product.name}" class="w-full block transition-transform duration-700 group-hover:scale-105" loading="eager" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-cocoa/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div class="px-5 py-5">
          <h3 class="font-serif text-lg leading-snug">${product.name}</h3>
          <span class="mt-1 block text-sm font-medium text-brand-caramel">${formatCRC(product.price)}</span>
          ${renderDescription(product.description)}
          <div class="mt-3 h-px w-full bg-brand-caramel/15"></div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExtras(product.extras)}
          </div>
        </div>
      </article>
    `;
  }
  if (product.image_url) {
    return `
      <article class="card-reveal group overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <div class="h-56 w-full overflow-hidden relative">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-cocoa/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div class="px-5 py-5">
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-serif text-xl leading-snug">${product.name}</h3>
            <span class="shrink-0 text-base font-medium text-brand-caramel">${formatCRC(product.price)}</span>
          </div>
          <p class="mt-2 text-sm text-brand-cocoa/65 leading-relaxed line-clamp-2">${product.description || 'Consulta por los sabores disponibles hoy.'}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            ${renderAvailability(product.available)}
            ${renderExtras(product.extras)}
          </div>
        </div>
      </article>
    `;
  }
  return `
    <article class="card-reveal group overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
      <div class="relative h-32 bg-gradient-to-br from-brand-beige/70 via-brand-beige/30 to-brand-cream overflow-hidden flex items-center justify-center">
        <span class="font-serif text-9xl text-brand-cocoa/10 select-none leading-none pointer-events-none">${product.name.charAt(0)}</span>
        <div class="absolute bottom-3 left-5 h-px w-8 bg-brand-gold/60"></div>
      </div>
      <div class="px-5 py-5">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-serif text-xl leading-snug text-brand-cocoa">${product.name}</h3>
          <span class="shrink-0 text-base font-medium text-brand-caramel">${formatCRC(product.price)}</span>
        </div>
        <p class="mt-2 text-sm text-brand-cocoa/65 leading-relaxed line-clamp-3">${product.description || 'Consulta por los sabores disponibles hoy.'}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          ${renderAvailability(product.available)}
          ${renderExtras(product.extras)}
        </div>
      </div>
    </article>
  `;
};

const renderEmpty = (grid) => {
  grid.innerHTML = `
    <div class="col-span-full rounded-3xl border border-brand-caramel/20 bg-brand-cream p-8 text-center">
      <p class="font-serif text-2xl">No hay productos disponibles</p>
      <p class="mt-3 text-sm text-brand-cocoa/70">Consulta por novedades o pregúntanos por WhatsApp.</p>
    </div>
  `;
};

const renderError = (grid, message) => {
  grid.innerHTML = `
    <div class="col-span-full rounded-3xl border border-brand-caramel/20 bg-brand-cream p-8 text-center">
      <p class="font-serif text-2xl">No se pudo cargar el menú</p>
      <p class="mt-3 text-sm text-brand-cocoa/70">${message}</p>
    </div>
  `;
};

const initMobileMenu = () => {
  const menuBtn = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const mobilePanel = document.getElementById('mobilePanel');
  const mobileOverlay = document.getElementById('mobileOverlay');

  const toggleMenu = (show) => {
    if (!mobilePanel) return;
    mobilePanel.classList.toggle('hidden', !show);
    document.body.classList.toggle('overflow-hidden', show);
  };

  menuBtn?.addEventListener('click', () => toggleMenu(true));
  menuClose?.addEventListener('click', () => toggleMenu(false));
  mobileOverlay?.addEventListener('click', () => toggleMenu(false));
};


const NUMS_ES = { uno:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9, diez:10 };

const getBoxQuantity = (product) => {
  const text = `${product.name} ${product.description || ''}`.toLowerCase();
  for (const [word, num] of Object.entries(NUMS_ES)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return num;
  }
  const match = text.match(/\b(\d+)\b/);
  return match ? parseInt(match[1]) : null;
};

const hasRefresco = (product) =>
  `${product.name} ${product.description || ''}`.toLowerCase().includes('refresco');

const hasFrutas = (product) =>
  `${product.name} ${product.description || ''}`.toLowerCase().includes('fruta');

const renderFilterButtons = (container, products, activeFilter) => {
  if (!container) return;
  const quantities = [...new Set(products.map(getBoxQuantity).filter(Boolean))].sort((a, b) => a - b);
  const anyRefresco = products.some(hasRefresco);
  const anyFrutas = products.some(hasFrutas);

  const items = [
    { label: 'Todos', value: 'all' },
    ...quantities.map(q => ({ label: `${q} bocadillos`, value: `qty-${q}` })),
    ...(anyRefresco ? [{ label: 'Con refresco', value: 'refresco' }] : []),
    ...(anyFrutas ? [{ label: 'Con frutas', value: 'frutas' }] : []),
  ];

  const sep = `<span class="text-brand-caramel/40 select-none">·</span>`;
  const btns = items.map(({ label, value }) => {
    const active = activeFilter === value;
    const cls = active
      ? 'px-4 py-1 rounded-2xl text-xs font-medium bg-brand-gold text-brand-cocoa btn-lift'
      : 'px-4 py-1 rounded-2xl text-xs bg-brand-beige text-brand-cocoa btn-lift';
    return `<button data-filter="${value}" class="${cls}">${label}</button>`;
  });

  container.innerHTML =
    `<span class="shrink-0 text-xs uppercase tracking-wide text-brand-caramel">Filtrar</span>` +
    sep +
    btns.join(sep);
};

const filterProducts = (products, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) => {
    return (
      (product.name || '').toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q)
    );
  });
};

const applyCardStagger = (grid) => {
  const cards = Array.from(grid.querySelectorAll('.card-reveal'));
  if (!cards.length) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index * 60, 420)}ms`;
  });

  void grid.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cards.forEach((card) => card.classList.add('is-visible'));
    });
  });
};

const renderTemporadaOculta = (grid) => {
  grid.innerHTML = `
    <div class="col-span-full rounded-3xl border border-brand-caramel/20 bg-brand-cream p-8 text-center">
      <p class="font-serif text-2xl">Menú de temporada no disponible</p>
      <p class="mt-3 text-sm text-brand-cocoa/70">Estamos preparando nuevas ediciones limitadas. ¡Vuelve pronto!</p>
    </div>
  `;
};

const initMenu = async () => {
  const grid = document.getElementById('productGrid');
  const searchInput = document.getElementById('productSearch');
  if (!grid) return;

  const category = grid.dataset.category;
  if (!isConfigured) {
    renderError(grid, 'Configura Supabase en app.js para ver los productos.');
    return;
  }

  if (category === 'temporada') {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?key=eq.temporada_visible&select=value`,
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      const visible = Array.isArray(data) && data.length > 0 ? data[0].value !== false : true;
      if (!visible) {
        renderTemporadaOculta(grid);
        return;
      }
    } catch {
      // si falla la verificación, muestra los productos normalmente
    }
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const selectFields = category === 'temporada' || category === 'bocadillos_carousel'
    ? 'id,name,description,price,category,extras,available,image_url'
    : 'id,name,description,price,category,extras,available';

  const { data, error } = await supabaseClient
    .from('products')
    .select(selectFields)
    .eq('category', category)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    renderError(grid, error.message);
    return;
  }

  if (!data || data.length === 0) {
    renderEmpty(grid);
    return;
  }

  if (category === 'bocadillos_carousel') {
    const filtersEl = document.getElementById('productFilters');
    let activeFilter = 'all';

    const applyAndRender = () => {
      let result = filterProducts(data, searchInput?.value || '');
      if (activeFilter.startsWith('qty-')) {
        const qty = parseInt(activeFilter.replace('qty-', ''));
        result = result.filter(p => getBoxQuantity(p) === qty);
      } else if (activeFilter === 'refresco') {
        result = result.filter(hasRefresco);
      } else if (activeFilter === 'frutas') {
        result = result.filter(hasFrutas);
      }

      renderFilterButtons(filtersEl, data, activeFilter);
      grid.innerHTML = result.length ? result.map(renderCard).join('') : '';
      grid.closest('[data-reveal]')?.classList.add('is-visible');
      if (result.length) applyCardStagger(grid);
      else renderEmpty(grid);
    };

    applyAndRender();

    filtersEl?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      applyAndRender();
    });

    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(applyAndRender, 200);
      });
    }
    return;
  }

  const initial = filterProducts(data, searchInput?.value || '');
  grid.innerHTML = initial.map(renderCard).join('');
  grid.closest('[data-reveal]')?.classList.add('is-visible');
  applyCardStagger(grid);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const filtered = filterProducts(data, searchInput.value);
      grid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : '';
      if (filtered.length) {
        grid.closest('[data-reveal]')?.classList.add('is-visible');
        applyCardStagger(grid);
      }
      if (!filtered.length) renderEmpty(grid);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initMenu();
});
