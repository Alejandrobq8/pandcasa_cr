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
    ? '<span class="px-3 py-1 rounded-full bg-brand-gold/15 text-xs text-brand-cocoa">Disponible</span>'
    : '<span class="px-3 py-1 rounded-full bg-brand-caramel/15 text-xs text-brand-cocoa">Agotado</span>';
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
      <article class="card-reveal relative overflow-hidden rounded-3xl border border-brand-caramel/20 bg-brand-cream shadow-soft">
        <div class="w-full">
          <img src="${product.image_url}" alt="${product.name}" class="w-full block" loading="eager" decoding="async" />
        </div>
        <div class="relative z-10 px-5 py-4">
          <h3 class="font-serif text-xl leading-snug">${product.name}</h3>
          <span class="mt-1 block text-base font-medium text-brand-caramel">${formatCRC(product.price)}</span>
          ${renderDescription(product.description)}
          <div class="mt-4 h-px w-full bg-brand-caramel/15"></div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExtras(product.extras)}
          </div>
        </div>
      </article>
    `;
  }
  if (product.image_url) {
    return `
      <article class="card-reveal relative overflow-hidden rounded-3xl border border-brand-caramel/20 bg-brand-cream shadow-soft">
        <div class="h-52 w-full overflow-hidden">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" decoding="async" />
        </div>
        <div class="relative z-10 px-7 py-6">
          <div class="flex items-start justify-between gap-4">
            <h3 class="font-serif text-2xl leading-tight">${product.name}</h3>
            <span class="text-lg font-medium shrink-0">${formatCRC(product.price)}</span>
          </div>
          <p class="mt-4 text-sm text-brand-cocoa/70">${product.description || 'Consulta por los sabores disponibles hoy.'}</p>
          <div class="mt-5 h-px w-full bg-brand-caramel/15"></div>
          <div class="mt-4 flex flex-wrap gap-2">
            ${renderAvailability(product.available)}
            ${renderExtras(product.extras)}
          </div>
        </div>
      </article>
    `;
  }
  return `
    <article class="card-reveal relative overflow-hidden rounded-3xl border border-brand-caramel/20 bg-brand-cream shadow-soft px-7 py-8">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-cream via-brand-beige/30 to-brand-cream"></div>
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-serif text-2xl leading-tight">${product.name}</h3>
          <span class="text-lg font-medium shrink-0">${formatCRC(product.price)}</span>
        </div>
        <p class="mt-4 text-sm text-brand-cocoa/70">${product.description || 'Consulta por los sabores disponibles hoy.'}</p>
        <div class="mt-5 h-px w-full bg-brand-caramel/15"></div>
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

  requestAnimationFrame(() => {
    cards.forEach((card) => card.classList.add('is-visible'));
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
    .order('created_at', { ascending: false });

  if (error) {
    renderError(grid, error.message);
    return;
  }

  if (!data || data.length === 0) {
    renderEmpty(grid);
    return;
  }

  const initial = filterProducts(data, searchInput?.value || '');
  grid.innerHTML = initial.map(renderCard).join('');
  applyCardStagger(grid);

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const filtered = filterProducts(data, searchInput.value);
      grid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : '';
      if (filtered.length) applyCardStagger(grid);
      if (!filtered.length) renderEmpty(grid);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initMenu();
});
