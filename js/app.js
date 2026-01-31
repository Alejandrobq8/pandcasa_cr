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

const fallbackImage =
  'https://www.colbake.com/wp-content/uploads/2019/04/maquinaria-panaderia-colbake.jpg';

const renderCard = (product) => {
  const imageSrc = product.image_url || fallbackImage;
  const image = `<img src="${imageSrc}" alt="${product.name}" class="w-full h-full object-cover object-center" loading="lazy" decoding="async" />`;

  return `
    <article class="rounded-3xl border border-brand-caramel/20 bg-brand-cream p-6 shadow-soft">
      <div class="mb-6 w-full aspect-[5/3] rounded-2xl border border-brand-caramel/20 bg-brand-beige/40 overflow-hidden flex items-center justify-center">${image}</div>
      <div class="flex items-start justify-between gap-4 pt-6">
        <div>
          <h3 class="font-serif text-xl">${product.name}</h3>
          <p class="mt-4 text-sm text-brand-cocoa/70">${product.description || ''}</p>
        </div>
        <span class="text-lg font-medium">${formatCRC(product.price)}</span>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        ${renderAvailability(product.available)}
      </div>
      ${renderExtras(product.extras)}
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

const initMenu = async () => {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const category = grid.dataset.category;
  if (!isConfigured) {
    renderError(grid, 'Configura Supabase en app.js para ver los productos.');
    return;
  }

  const cached = getCachedProducts(category);
  if (cached) {
    grid.innerHTML = cached.map(renderCard).join('');
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabaseClient
    .from('products')
    .select('id,name,description,price,category,extras,image_url,available')
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

  grid.innerHTML = data.map(renderCard).join('');
  setCachedProducts(category, data);
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initMenu();
});
