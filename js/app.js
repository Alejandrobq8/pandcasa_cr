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

const renderWhatsAppBtn = (name, pageUrl) => {
  const text = pageUrl
    ? `Hola, quisiera información sobre ${name}.\nVer más en: ${pageUrl}`
    : `Hola, quisiera información sobre ${name}.`;
  const msg = encodeURIComponent(text);
  return `<a href="https://wa.me/50683376864?text=${msg}" target="_blank" rel="noopener" title="Consultar por WhatsApp" class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-brand-caramel flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>`;
};

const renderCard = (product) => {
  if (product.category === 'bocadillos_carousel') {
    return `
      <article class="card-reveal group relative overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <div class="h-[340px] w-full overflow-hidden cursor-zoom-in relative" data-lightbox="${product.image_url}" data-lightbox-alt="${product.name}">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-cocoa/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Zm-3-3v6m-3-3h6"/></svg></div>
        </div>
        <div class="px-5 pt-5 pb-14">
          <h3 class="font-serif text-lg leading-snug">${product.name}</h3>
          <span class="mt-1 block text-sm font-medium text-brand-caramel">${formatCRC(product.price)}</span>
          ${renderDescription(product.description)}
          <div class="mt-3 h-px w-full bg-brand-caramel/15"></div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExtras(product.extras)}
          </div>
        </div>
        ${renderWhatsAppBtn(product.name, `https://pandcasa.com/cajitas?q=${encodeURIComponent(product.name)}`)}
      </article>
    `;
  }
  if (product.image_url) {
    return `
      <article class="card-reveal group relative overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <div class="h-[340px] w-full overflow-hidden cursor-zoom-in relative" data-lightbox="${product.image_url}" data-lightbox-alt="${product.name}">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-cocoa/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Zm-3-3v6m-3-3h6"/></svg></div>
        </div>
        <div class="px-5 pt-5 pb-14">
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
        ${renderWhatsAppBtn(product.name, 'https://pandcasa.com/temporada')}
      </article>
    `;
  }
  return `
    <article class="card-reveal group relative rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300 overflow-hidden flex">
      <div class="w-1.5 shrink-0 bg-brand-caramel"></div>
      <div class="px-5 pt-6 pb-14 flex-1 min-w-0">
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
      ${renderWhatsAppBtn(product.name)}
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
      <button onclick="location.reload()" class="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-caramel text-brand-cream text-sm font-medium">Reintentar</button>
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

  const activeLabel = items.find(i => i.value === activeFilter)?.label || 'Todos';

  const menuItems = items.map(({ label, value }) => {
    const isActive = activeFilter === value;
    return `<button data-filter="${value}" class="w-full flex items-center justify-between px-4 py-2.5 text-sm text-brand-cocoa hover:bg-brand-beige/60 transition-colors duration-150 ${isActive ? 'font-medium' : ''}">
      <span>${label}</span>
      ${isActive ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-caramel" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>' : '<span class="w-4 h-4"></span>'}
    </button>`;
  }).join('');

  container.innerHTML = `
    <div class="relative inline-block">
      <button data-dropdown-toggle class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-caramel/30 bg-brand-cream text-sm text-brand-cocoa hover:border-brand-caramel/60 transition-colors duration-150">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-brand-caramel/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/></svg>
        <span data-filter-label>${activeLabel}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-brand-caramel/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7"/></svg>
      </button>
      <div data-dropdown-menu class="absolute top-full left-0 mt-2 w-52 bg-brand-cream rounded-xl border border-brand-caramel/20 shadow-lift z-20 overflow-hidden hidden">
        ${menuItems}
      </div>
    </div>`;
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
  if (!window.supabase) {
    renderError(grid, 'No se pudo cargar la conexión. Verifica tu red e intenta de nuevo.');
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

    const urlQ = new URLSearchParams(location.search).get('q');
    if (urlQ && searchInput) searchInput.value = urlQ;
    applyAndRender();

    filtersEl?.addEventListener('click', (e) => {
      if (e.target.closest('[data-dropdown-toggle]')) {
        filtersEl.querySelector('[data-dropdown-menu]')?.classList.toggle('hidden');
        return;
      }
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      applyAndRender();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#productFilters')) {
        filtersEl?.querySelector('[data-dropdown-menu]')?.classList.add('hidden');
      }
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
  initMenu().catch((err) => {
    const grid = document.getElementById('productGrid');
    if (grid) renderError(grid, err.message || 'Error inesperado. Intenta recargar la página.');
  });
});
