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

const renderCard = (product) => {
  return `
    <article class="card-reveal relative min-h-[16rem] overflow-hidden rounded-3xl border border-brand-caramel/20 bg-brand-cream shadow-soft px-7 py-8">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-cream via-brand-beige/30 to-brand-cream"></div>
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-serif text-2xl leading-tight">${product.name}</h3>
          <span class="text-lg font-medium">${formatCRC(product.price)}</span>
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

const cacheKey = (category) => `pandcasa_products_${category}`;
const cacheTTL = 5 * 60 * 1000;

const getCachedProducts = (category) => {
  try {
    const raw = sessionStorage.getItem(cacheKey(category));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > cacheTTL) return null;
    return parsed.data;
  } catch (error) {
    return null;
  }
};

const setCachedProducts = (category, data) => {
  try {
    sessionStorage.setItem(cacheKey(category), JSON.stringify({ timestamp: Date.now(), data }));
  } catch (error) {
    // ignore cache errors
  }
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

const initMenu = async () => {
  const grid = document.getElementById('productGrid');
  const searchInput = document.getElementById('productSearch');
  if (!grid) return;

  const category = grid.dataset.category;
  if (!isConfigured) {
    renderError(grid, 'Configura Supabase en app.js para ver los productos.');
    return;
  }

  const cached = getCachedProducts(category);
  if (cached) {
    const initial = filterProducts(cached, searchInput?.value || '');
    grid.innerHTML = initial.map(renderCard).join('');
    applyCardStagger(grid);
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const filtered = filterProducts(cached, searchInput.value);
        grid.innerHTML = filtered.length ? filtered.map(renderCard).join('') : '';
        if (filtered.length) applyCardStagger(grid);
        if (!filtered.length) renderEmpty(grid);
      });
    }
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabaseClient
    .from('products')
    .select('id,name,description,price,category,extras,available')
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
  setCachedProducts(category, data);

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
