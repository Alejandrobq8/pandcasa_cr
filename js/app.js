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

const CATEGORY_ICONS = {
  desayunos: {
    viewBox: '-2 0 20 20',
    content: '<g fill="currentColor" fill-rule="evenodd"><path d="M94,7697 C90.692,7697 88,7694.308 88,7691 C88,7686.268 91.39,7681 93.688,7681 C96.539,7681 100,7687.241 100,7691 C100,7694.308 97.308,7697 94,7697 M93.688,7679 C89.27,7679 86,7686.582 86,7691 C86,7695.418 89.582,7699 94,7699 C98.418,7699 102,7695.418 102,7691 C102,7686.582 98.106,7679 93.688,7679" transform="translate(-142, -7839) translate(56, 160)"/></g>'
  },
  almuerzos: {
    viewBox: '0 -3.84 122.88 122.88',
    content: '<path fill="currentColor" d="M29.03,100.46l20.79-25.21l9.51,12.13L41,110.69C33.98,119.61,20.99,110.21,29.03,100.46L29.03,100.46z M53.31,43.05 c1.98-6.46,1.07-11.98-6.37-20.18L28.76,1c-2.58-3.03-8.66,1.42-6.12,5.09L37.18,24c2.75,3.34-2.36,7.76-5.2,4.32L16.94,9.8 c-2.8-3.21-8.59,1.03-5.66,4.7c4.24,5.1,10.8,13.43,15.04,18.53c2.94,2.99-1.53,7.42-4.43,3.69L6.96,18.32 c-2.19-2.38-5.77-0.9-6.72,1.88c-1.02,2.97,1.49,5.14,3.2,7.34L20.1,49.06c5.17,5.99,10.95,9.54,17.67,7.53 c1.03-0.31,2.29-0.94,3.64-1.77l44.76,57.78c2.41,3.11,7.06,3.44,10.08,0.93l0.69-0.57c3.4-2.83,3.95-8,1.04-11.34L50.58,47.16 C51.96,45.62,52.97,44.16,53.31,43.05L53.31,43.05z M65.98,55.65l7.37-8.94C63.87,23.21,99-8.11,116.03,6.29 C136.72,23.8,105.97,66,84.36,55.57l-8.73,11.09L65.98,55.65L65.98,55.65z"/>'
  },
  panaderia: {
    viewBox: '0 0 160 160',
    content: '<path fill="currentColor" d="M41,80c0,14.654,8.128,27.441,20.109,34.104C61.043,114.393,61,114.691,61,115v20c0,2.209,1.791,4,4,4 s4-1.791,4-4v-17.59c2.257,0.665,4.595,1.14,7,1.386V145c0,2.209,1.791,4,4,4s4-1.791,4-4v-26.204c2.404-0.246,4.743-0.721,7-1.386 V135c0,2.209,1.791,4,4,4s4-1.791,4-4v-20c0-0.309-0.043-0.607-0.109-0.896C110.872,107.441,119,94.654,119,80c0-2.209-1.791-4-4-4 c-2.203,0-4.359,0.193-6.465,0.545C115.021,69.578,119,60.247,119,50c0-2.209-1.791-4-4-4c-8.766,0-16.863,2.908-23.384,7.809 c5.372-13.957,2.45-30.4-8.788-41.637c-1.563-1.562-4.094-1.562-5.657,0c-7.366,7.367-11.423,17.161-11.423,27.578 c0,4.88,0.901,9.619,2.605,14.04C61.839,48.902,53.753,46,45,46c-2.209,0-4,1.791-4,4c0,10.248,3.979,19.579,10.465,26.546 C49.36,76.193,47.203,76,45,76C42.791,76,41,77.791,41,80z M80,89c0.007,0,0.013,0,0.02,0c0.002,0,0.004,0,0.007,0 c2.194-0.002,4.342-0.193,6.438-0.545c-2.584,2.773-4.768,5.922-6.462,9.355c-1.693-3.435-3.88-6.58-6.462-9.355 C75.643,88.809,77.799,89,80,89z M84.297,110.703c1.902-13.663,12.743-24.504,26.406-26.406 C108.801,97.96,97.96,108.801,84.297,110.703z M110.703,54.297C108.801,67.96,97.96,78.801,84.297,80.703 C86.199,67.04,97.04,56.199,110.703,54.297z M79.998,21.074c8.318,11.007,8.318,26.342,0,37.35 c-4.055-5.351-6.25-11.844-6.25-18.674C73.749,32.919,75.943,26.425,79.998,21.074z M75.703,80.703 C62.04,78.801,51.199,67.96,49.297,54.297C62.96,56.199,73.801,67.04,75.703,80.703z M75.703,110.703 C62.04,108.801,51.199,97.96,49.297,84.297C62.96,86.199,73.801,97.04,75.703,110.703z"/>'
  },
  postres: {
    viewBox: '0 0 1024 1024',
    content: '<path fill="currentColor" d="M128 416v-48a144 144 0 0 1 168.64-141.888 224.128 224.128 0 0 1 430.72 0A144 144 0 0 1 896 368v48a384 384 0 0 1-352 382.72V896h-64v-97.28A384 384 0 0 1 128 416zm287.104-32.064h193.792a143.808 143.808 0 0 1 58.88-132.736 160.064 160.064 0 0 0-311.552 0 143.808 143.808 0 0 1 58.88 132.8zm-72.896 0a72 72 0 1 0-140.48 0h140.48zm339.584 0h140.416a72 72 0 1 0-140.48 0zM512 736a320 320 0 0 0 318.4-288.064H193.6A320 320 0 0 0 512 736zM384 896.064h256a32 32 0 1 1 0 64H384a32 32 0 1 1 0-64z"/>'
  },
  queques: {
    viewBox: '0 0 14 14',
    content: '<path fill="currentColor" d="m 11.219592,3.3235446 -1.5624491,0.55347 c 0.066122,0.18123 0.1053061,0.37225 0.1053061,0.57062 0,0.90367 -0.7322449,1.64816 -1.6481633,1.64816 -0.7248979,0 -1.3420408,-0.4751 -1.562449,-1.12408 L 1,6.9137546 l 12,0 c 0,-1.3151 -0.646531,-2.54204 -1.780408,-3.59021 z m -3.5804083,0.0563 c -0.3991837,0.18122 -0.6857143,0.5902 -0.6857143,1.05796 0,0.63918 0.5240816,1.16082 1.1608163,1.16082 0.6367347,0 1.1608163,-0.52409 1.1608163,-1.16082 0,-0.63674 -0.5142857,-1.16082 -1.1608163,-1.16082 -0.3036735,-0.91347 -1.2391837,-1.70449 -1.2857143,-1.74367 -0.1053061,-0.0857 -0.2571428,-0.0759 -0.3428571,0.0294 -0.085714,0.1053 -0.075918,0.25714 0.029388,0.34285 0.2669388,0.21796 0.8938776,0.84735 1.1240817,1.47429 z M 1,10.200285 l 12,0 0,2.32408 -12,0 z m 0,-2.8016304 12,0 0,2.32408 -12,0 z"/>'
  },
  temporada: {
    viewBox: '0 0 24 24',
    stroke: true,
    content: '<path d="M12 3 13.3 10.7 20 12 13.3 13.3 12 21 10.7 13.3 4 12 10.7 10.7Z"/>'
  }
};

const renderCategoryIcon = (category) => {
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.temporada;
  if (icon.stroke) {
    return `<svg class="card-icon w-5 h-5 text-brand-caramel group-hover:text-white" viewBox="${icon.viewBox}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${icon.content}</svg>`;
  }
  return `<svg class="card-icon w-5 h-5 text-brand-caramel group-hover:text-white" viewBox="${icon.viewBox}" xmlns="http://www.w3.org/2000/svg">${icon.content}</svg>`;
};

const renderWhatsAppBtn = (name, pageUrl) => {
  const text = pageUrl
    ? `Hola, quisiera información sobre ${name}.\nVer más en: ${pageUrl}`
    : `Hola, quisiera información sobre ${name}.`;
  const msg = encodeURIComponent(text);
  return `<a href="https://wa.me/50683376864?text=${msg}" target="_blank" rel="noopener" title="Consultar por WhatsApp" class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-brand-caramel flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>`;
};

window.handleProductImgError = (img) => {
  const attempts = Number(img.dataset.retryCount || 0);
  if (attempts < 2) {
    img.dataset.retryCount = String(attempts + 1);
    const url = new URL(img.src, location.href);
    url.searchParams.set('retry', Date.now());
    setTimeout(() => { img.src = url.toString(); }, 600 * (attempts + 1));
    return;
  }
  img.onerror = null;
  img.src = '/assets/Logo Pandcasa.png';
  img.className = 'h-full w-full object-contain p-12 opacity-40';
};

const renderCard = (product) => {
  if (product.category === 'bocadillos_carousel') {
    return `
      <article class="card-reveal group relative overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <a href="/cajita/${product.id}" class="block h-[260px] sm:h-[320px] md:h-[340px] w-full overflow-hidden relative bg-brand-beige/40">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" onerror="handleProductImgError(this)"/>
          <div class="absolute inset-0 bg-gradient-to-t from-brand-cocoa/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-3 left-4 text-brand-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs tracking-wide">Ver detalle →</div>
        </a>
        <div class="px-5 pt-5 pb-14">
          <h3 class="font-serif text-lg leading-snug">${product.name}</h3>
          <span class="mt-1 block text-sm font-medium text-brand-caramel">${formatCRC(product.price)}</span>
          ${renderDescription(product.description)}
          <div class="mt-3 h-px w-full bg-brand-caramel/15"></div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExtras(product.extras)}
          </div>
        </div>
        ${renderWhatsAppBtn(product.name, `https://pandcasa.com/cajita/${product.id}`, product.id)}
      </article>
    `;
  }
  if (product.image_url) {
    return `
      <article class="card-reveal group relative overflow-hidden rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300">
        <div class="h-[260px] sm:h-[320px] md:h-[340px] w-full overflow-hidden cursor-zoom-in relative bg-brand-beige/40" data-lightbox="${product.image_url}" data-lightbox-alt="${product.name}">
          <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" onerror="handleProductImgError(this)"/>
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
    <article class="card-reveal product-card-lift group relative rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft hover:shadow-lift transition-shadow duration-300 overflow-hidden flex">
      <div class="flex items-center pl-5 shrink-0">
        <div class="card-icon-circle w-10 h-10 rounded-full bg-brand-beige/70 flex items-center justify-center group-hover:bg-brand-caramel">
          ${renderCategoryIcon(product.category)}
        </div>
      </div>
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

const renderSkeletons = (grid, count = 4) => {
  const withImage = ['bocadillos_carousel', 'temporada'].includes(grid.dataset.category);
  grid.innerHTML = Array.from({ length: count }, () =>
    withImage
      ? `<article class="rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft overflow-hidden">
          <div class="skeleton h-[340px] w-full bg-brand-beige/40"></div>
          <div class="px-5 pt-5 pb-8 space-y-3">
            <div class="skeleton h-5 w-3/4 rounded bg-brand-beige/60"></div>
            <div class="skeleton h-4 w-1/3 rounded bg-brand-beige/40"></div>
            <div class="skeleton h-3 w-full rounded bg-brand-beige/30 mt-2"></div>
            <div class="skeleton h-3 w-5/6 rounded bg-brand-beige/30"></div>
          </div>
        </article>`
      : `<article class="rounded-2xl border border-brand-caramel/20 bg-brand-cream shadow-soft overflow-hidden flex">
          <div class="flex items-center pl-5 shrink-0">
            <div class="skeleton w-10 h-10 rounded-full bg-brand-beige/60"></div>
          </div>
          <div class="px-5 pt-6 pb-10 flex-1 space-y-3">
            <div class="skeleton h-5 w-3/4 rounded bg-brand-beige/60"></div>
            <div class="skeleton h-4 w-1/3 rounded bg-brand-beige/40"></div>
            <div class="skeleton h-3 w-full rounded bg-brand-beige/30 mt-2"></div>
            <div class="skeleton h-3 w-5/6 rounded bg-brand-beige/30"></div>
          </div>
        </article>`
  ).join('');
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

const PRICE_RANGES = [
  { label: 'Hasta ₡2.000', min: 0, max: 2000 },
  { label: '₡2.000 - ₡3.000', min: 2000, max: 3000 },
  { label: '₡3.000 - ₡4.000', min: 3000, max: 4000 },
  { label: '₡4.000 - ₡5.000', min: 4000, max: 5000 },
  { label: 'Más de ₡5.000', min: 5000, max: Infinity },
];

const renderFilterButtons = (container, products, activeFilter) => {
  if (!container) return;
  const quantities = [...new Set(products.map(getBoxQuantity).filter(Boolean))].sort((a, b) => a - b);
  const anyRefresco = products.some(hasRefresco);
  const anyFrutas = products.some(hasFrutas);
  const priceRanges = PRICE_RANGES.filter(r => products.some(p => p.price >= r.min && p.price < r.max));

  const items = [
    { label: 'Todos', value: 'all' },
    ...quantities.map(q => ({ label: `${q} bocadillos`, value: `qty-${q}` })),
    ...(anyRefresco ? [{ label: 'Con refresco', value: 'refresco' }] : []),
    ...(anyFrutas ? [{ label: 'Con frutas', value: 'frutas' }] : []),
    ...priceRanges.map(r => ({ label: r.label, value: `price-${r.min}-${r.max}` })),
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
    <div data-filter-wrapper class="relative inline-block">
      <button data-dropdown-toggle class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-caramel/30 bg-brand-cream text-sm text-brand-cocoa hover:border-brand-caramel/60 transition-colors duration-150">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-brand-caramel/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/></svg>
        <span data-filter-label>${activeLabel}</span>
        <svg data-filter-chevron xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-brand-caramel/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7"/></svg>
      </button>
      <div data-dropdown-menu class="absolute top-full left-0 mt-2 w-52 bg-brand-cream rounded-xl border border-brand-caramel/20 shadow-lift z-20 overflow-hidden">
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

const applyCardStagger = (grid, startIndex = 0) => {
  const cards = Array.from(grid.querySelectorAll('.card-reveal')).slice(startIndex);
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
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    } catch {
      renderError(grid, 'No se pudo cargar la conexión. Verifica tu red e intenta de nuevo.');
      return;
    }
  }

  renderSkeletons(grid);

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

    const PAGE_SIZE = 12;
    let pageResult = [];
    let renderedCount = 0;

    const sentinel = document.createElement('div');
    sentinel.className = 'col-span-full h-px';
    grid.after(sentinel);

    const renderNextPage = () => {
      const next = pageResult.slice(renderedCount, renderedCount + PAGE_SIZE);
      if (!next.length) return;
      const startIndex = renderedCount;
      grid.insertAdjacentHTML('beforeend', next.map(renderCard).join(''));
      renderedCount += next.length;
      applyCardStagger(grid, startIndex);
      if (renderedCount >= pageResult.length) pageObserver.disconnect();
    };

    const pageObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) renderNextPage();
    }, { rootMargin: '400px' });

    const applyAndRender = () => {
      let result = filterProducts(data, searchInput?.value || '');
      if (activeFilter.startsWith('qty-')) {
        const qty = parseInt(activeFilter.replace('qty-', ''));
        result = result.filter(p => getBoxQuantity(p) === qty);
      } else if (activeFilter === 'refresco') {
        result = result.filter(hasRefresco);
      } else if (activeFilter === 'frutas') {
        result = result.filter(hasFrutas);
      } else if (activeFilter.startsWith('price-')) {
        const [min, max] = activeFilter.replace('price-', '').split('-').map(Number);
        result = result.filter(p => p.price >= min && p.price < max);
      }

      renderFilterButtons(filtersEl, data, activeFilter);

      pageObserver.disconnect();
      pageResult = result;
      renderedCount = 0;
      grid.innerHTML = '';

      if (!result.length) {
        renderEmpty(grid);
        return;
      }

      grid.closest('[data-reveal]')?.classList.add('is-visible');
      renderNextPage();
      if (renderedCount < pageResult.length) pageObserver.observe(sentinel);
    };

    const urlQ = new URLSearchParams(location.search).get('q');
    if (urlQ && searchInput) searchInput.value = urlQ;
    applyAndRender();

    filtersEl?.addEventListener('click', (e) => {
      if (e.target.closest('[data-dropdown-toggle]')) {
        filtersEl.querySelector('[data-filter-wrapper]')?.classList.toggle('open');
        return;
      }
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      applyAndRender();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#productFilters')) {
        filtersEl?.querySelector('[data-filter-wrapper]')?.classList.remove('open');
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
