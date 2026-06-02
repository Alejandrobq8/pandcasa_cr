const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

const formatCRC = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  return `₡${Number(value).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const productId = new URLSearchParams(location.search).get('id') ||
  location.pathname.split('/').filter(Boolean).pop();

const showError = (msg) => {
  const el = document.getElementById('cajita-content');
  if (!el) return;
  el.innerHTML = `
    <div class="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <p class="font-serif text-2xl text-brand-cocoa">${msg}</p>
      <a href="/cajitas" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-caramel/40 text-sm text-brand-caramel hover:border-brand-caramel transition-colors">← Ver todas las cajitas</a>
    </div>`;
};

const render = (product) => {
  const el = document.getElementById('cajita-content');
  if (!el) return;

  document.title = `Pan d' Casa | ${product.name}`;

  const extras = Array.isArray(product.extras) && product.extras.length
    ? `<div class="mt-6 flex flex-wrap gap-2">
        ${product.extras.filter(e => e?.name).map(e => {
          const price = e.price ? ` · ${formatCRC(e.price)}` : '';
          return `<span class="px-3 py-1.5 rounded-full bg-brand-beige text-xs text-brand-cocoa">${e.name}${price}</span>`;
        }).join('')}
       </div>`
    : '';

  const availability = product.available
    ? '<span class="inline-flex items-center gap-1.5 text-xs text-brand-cocoa/60"><span class="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block"></span>Disponible</span>'
    : '<span class="inline-flex items-center gap-1.5 text-xs text-brand-cocoa/40"><span class="w-1.5 h-1.5 rounded-full bg-brand-caramel/30 inline-block"></span>Agotado</span>';

  const waMsg = encodeURIComponent(`Hola, quisiera pedir la ${product.name}. pandcasa.com/cajita/${product.id}`);

  el.innerHTML = `
    <!-- Layout: imagen izquierda + info derecha -->
    <div class="max-w-6xl mx-auto px-6 lg:px-10 py-10 md:py-16">
      <a href="/cajitas" class="inline-flex items-center gap-1.5 text-sm text-brand-caramel hover:text-brand-cocoa transition-colors mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
        Todas las cajitas
      </a>

      <div class="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <!-- Imagen -->
        <div class="overflow-hidden rounded-3xl shadow-soft">
          <img src="${product.image_url}" alt="${product.name}" class="w-full block object-cover" loading="eager" decoding="async" />
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <p class="text-xs uppercase tracking-[0.35em] text-brand-caramel">Pan d' Casa</p>
          <h1 class="mt-2 font-serif text-3xl md:text-4xl leading-tight text-brand-cocoa">${product.name}</h1>
          <p class="mt-3 text-xl font-medium text-brand-caramel">${formatCRC(product.price)}</p>
          <div class="mt-3">${availability}</div>

          ${product.description ? `<p class="mt-6 text-brand-cocoa/70 leading-relaxed">${product.description.replace(/\n/g, '<br>')}</p>` : ''}

          ${extras}

          <div class="mt-8 border-t border-brand-caramel/15 pt-8">
            <a href="https://wa.me/50683376864?text=${waMsg}" target="_blank" rel="noopener"
               class="flex w-full items-center justify-center gap-3 rounded-full bg-brand-gold text-brand-cocoa font-medium py-4 text-base btn-lift">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>`;
};

const init = async () => {
  if (!productId || productId.length < 10) {
    location.replace('/cajitas');
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from('products')
    .select('id,name,description,price,extras,available,image_url')
    .eq('id', productId)
    .eq('category', 'bocadillos_carousel')
    .single();

  if (error || !data) {
    showError('Cajita no encontrada.');
    return;
  }

  render(data);
};

document.addEventListener('DOMContentLoaded', init);
