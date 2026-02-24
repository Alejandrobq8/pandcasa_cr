const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

const isConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes('YOUR_SUPABASE_URL') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

const formatCRC = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
  return `₡${Number(value).toLocaleString('es-CR')}`;
};

const supabaseClient = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const productsTable = document.getElementById('productsTable');
const productsCount = document.getElementById('productsCount');
const availableCount = document.getElementById('availableCount');
const unavailableCount = document.getElementById('unavailableCount');
const syncStatus = document.getElementById('syncStatus');
const adminSearch = document.getElementById('adminSearch');
const adminCategoryFilter = document.getElementById('adminCategoryFilter');
const adminAvailabilityFilter = document.getElementById('adminAvailabilityFilter');
const productForm = document.getElementById('productForm');
const newProductBtn = document.getElementById('newProductBtn');
const extrasList = document.getElementById('extrasList');
const addExtraBtn = document.getElementById('addExtraBtn');
const loginStatus = document.getElementById('loginStatus');
const adminStatus = document.getElementById('adminStatus');
const configMessage = document.getElementById('configMessage');
const toast = document.getElementById('toast');

let editingId = null;
let allProducts = [];

const showStatus = (target, text, type = 'info') => {
  if (!target) return;
  target.textContent = text;
  target.className = `text-sm mt-2 ${type === 'error' ? 'text-red-600' : 'text-brand-caramel'}`;
};

const showToast = (text, type = 'info') => {
  if (!toast) return;
  const isError = type === 'error';
  const toastEl = document.createElement('div');
  toastEl.className = [
    'toast-item',
    'flex',
    'items-start',
    'gap-3',
    'rounded-2xl',
    'border',
    'border-brand-caramel/20',
    'bg-brand-cream/95',
    'backdrop-blur-sm',
    'shadow-soft',
    'px-4',
    'py-3',
    'transition',
    'duration-300',
    'opacity-0',
    'translate-y-2'
  ].join(' ');

  const accent = isError ? 'bg-brand-caramel/40' : 'bg-brand-gold/60';
  const badge = isError ? 'bg-brand-caramel/15' : 'bg-brand-gold/15';
  const title = isError ? 'Error' : 'Listo';
  const icon = isError ? '!' : '✓';

  toastEl.innerHTML = `
    <span style="width:3px;" class="rounded-full ${accent} self-stretch"></span>
    <div class="flex-1">
      <p class="text-xs uppercase tracking-[0.25em] text-brand-caramel">${title}</p>
      <p class="mt-1 text-sm text-brand-cocoa/80">${text}</p>
    </div>
    <div class="flex flex-col items-end gap-2">
      <span class="h-9 w-9 rounded-full ${badge} text-brand-cocoa flex items-center justify-center text-sm font-medium">${icon}</span>
      <button type="button" class="text-xs text-brand-caramel/70 hover:text-brand-cocoa">Cerrar</button>
    </div>
  `;

  const closeBtn = toastEl.querySelector('button');
  closeBtn?.addEventListener('click', () => {
    toastEl.classList.add('opacity-0', 'translate-y-2');
    toastEl.addEventListener('transitionend', () => toastEl.remove(), { once: true });
  });

  toast.appendChild(toastEl);
  requestAnimationFrame(() => {
    toastEl.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    if (!toastEl.isConnected) return;
    toastEl.classList.add('opacity-0', 'translate-y-2');
    toastEl.addEventListener('transitionend', () => toastEl.remove(), { once: true });
  }, 3200);
};

const toggleUI = (isLoggedIn) => {
  loginSection.classList.toggle('hidden', isLoggedIn);
  adminSection.classList.toggle('hidden', !isLoggedIn);
};

const addExtraRow = (extra = {}) => {
  const row = document.createElement('div');
  row.className = 'grid md:grid-cols-[1fr_140px_40px] gap-3 items-center';
  row.dataset.extraRow = 'true';
  row.innerHTML = `
    <input type="text" placeholder="Extra / acompañamiento" value="${extra.name || ''}" class="rounded-2xl border border-brand-caramel/30 bg-brand-cream px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50" />
    <input type="number" placeholder="Precio" value="${extra.price || ''}" class="rounded-2xl border border-brand-caramel/30 bg-brand-cream px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50" />
    <button type="button" class="w-9 h-9 rounded-full border border-brand-caramel/30 text-brand-caramel hover:border-brand-gold">×</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  extrasList.appendChild(row);
};

const resetForm = () => {
  productForm.reset();
  editingId = null;
  extrasList.innerHTML = '';
};

const collectExtras = () => {
  return Array.from(extrasList.querySelectorAll('[data-extra-row]')).map((row) => {
    const inputs = row.querySelectorAll('input');
    return {
      name: inputs[0].value.trim(),
      price: inputs[1].value ? Number(inputs[1].value) : null
    };
  }).filter((extra) => extra.name);
};

const renderProducts = (products) => {
  if (!products || products.length === 0) {
    productsTable.innerHTML = '<p class="text-sm text-brand-cocoa/70">Aún no hay productos registrados.</p>';
    return;
  }

  const rows = products.map((product) => `
    <div class="grid md:grid-cols-[1.5fr_0.8fr_0.6fr_0.6fr_0.6fr_0.6fr] gap-3 items-center border-b border-brand-caramel/10 py-4">
      <div>
        <p class="font-medium">${product.name}</p>
        <p class="text-xs text-brand-cocoa/70">${product.category} · ${product.available ? 'Disponible' : 'Agotado'}</p>
      </div>
      <p class="text-sm text-brand-cocoa/80">${formatCRC(product.price)}</p>
      <button data-toggle="${product.id}" class="text-sm ${product.available ? 'text-brand-caramel' : 'text-brand-gold'}">
        ${product.available ? 'Marcar agotado' : 'Marcar disponible'}
      </button>
      <button data-edit="${product.id}" class="text-sm text-brand-caramel hover:text-brand-gold">Editar</button>
      <button data-delete="${product.id}" class="text-sm text-red-600">Eliminar</button>
    </div>
  `).join('');

  productsTable.innerHTML = rows;

  productsTable.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => handleEdit(btn.dataset.edit, products));
  });

  productsTable.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.delete));
  });

  productsTable.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => handleToggleAvailability(btn.dataset.toggle));
  });
};

const applyFilters = () => {
  const query = adminSearch.value.trim().toLowerCase();
  const category = adminCategoryFilter.value;
  const availability = adminAvailabilityFilter.value;

  const filtered = allProducts.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesAvailability =
      availability === 'all' ||
      (availability === 'available' && product.available) ||
      (availability === 'unavailable' && !product.available);

    return matchesQuery && matchesCategory && matchesAvailability;
  });

  renderProducts(filtered);
};

const fetchProducts = async () => {
  if (syncStatus) syncStatus.textContent = 'Sincronizando';
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    showStatus(adminStatus, error.message, 'error');
    if (syncStatus) syncStatus.textContent = 'Error';
    return;
  }
  allProducts = data || [];
  if (productsCount) productsCount.textContent = String(allProducts.length);
  if (availableCount) availableCount.textContent = String(allProducts.filter((p) => p.available).length);
  if (unavailableCount) unavailableCount.textContent = String(allProducts.filter((p) => !p.available).length);
  if (syncStatus) syncStatus.textContent = 'Actualizado';
  applyFilters();
};

const handleEdit = (id, products) => {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  editingId = id;
  productForm.nombre.value = product.name || '';
  productForm.descripcion.value = product.description || '';
  productForm.precio.value = product.price || '';
  productForm.categoria.value = product.category || 'panaderia';
  productForm.disponible.checked = Boolean(product.available);

  extrasList.innerHTML = '';
  (product.extras || []).forEach(addExtraRow);

};

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar este producto?')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) {
    showStatus(adminStatus, error.message, 'error');
    return;
  }
  showStatus(adminStatus, 'Producto eliminado.');
  fetchProducts();
};

const handleToggleAvailability = async (id) => {
  const product = allProducts.find((item) => item.id === id);
  if (!product) return;
  const { error } = await supabaseClient
    .from('products')
    .update({ available: !product.available })
    .eq('id', id);
  if (error) {
    showStatus(adminStatus, error.message, 'error');
    return;
  }
  fetchProducts();
};


const initAuth = async () => {
  if (!isConfigured) {
    configMessage.classList.remove('hidden');
    showStatus(loginStatus, 'Configura Supabase en admin.js para habilitar el login.');
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  toggleUI(Boolean(session));

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    toggleUI(Boolean(session));
    if (session) fetchProducts();
  });
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isConfigured || !supabaseClient) {
    showStatus(loginStatus, 'Configura Supabase en admin.js antes de iniciar sesión.', 'error');
    return;
  }

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showStatus(loginStatus, error.message, 'error');
  } else {
    showStatus(loginStatus, 'Sesión iniciada.');
    loginForm.reset();
  }
});

logoutBtn.addEventListener('click', async () => {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  showStatus(adminStatus, 'Sesión cerrada.');
});

addExtraBtn.addEventListener('click', () => addExtraRow());
newProductBtn?.addEventListener('click', () => {
  resetForm();
  productForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

adminSearch.addEventListener('input', applyFilters);
adminCategoryFilter.addEventListener('change', applyFilters);
adminAvailabilityFilter.addEventListener('change', applyFilters);


productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isConfigured) return;

  try {
    const name = productForm.nombre.value.trim();
    const description = productForm.descripcion.value.trim();
    const price = Number(productForm.precio.value);
    const category = productForm.categoria.value;
    const available = productForm.disponible.checked;
    const extras = collectExtras();

    const payload = {
      name,
      description,
      price,
      category,
      available,
      extras
    };

    const successMessage = editingId ? 'Producto actualizado.' : 'Producto creado.';
    const { error } = editingId
      ? await supabaseClient.from('products').update(payload).eq('id', editingId)
      : await supabaseClient.from('products').insert(payload);

    if (error) throw error;

    showStatus(adminStatus, successMessage);
    showToast(successMessage);
    resetForm();
    fetchProducts();
  } catch (error) {
    showStatus(adminStatus, error.message, 'error');
  }
});

resetForm();
initAuth();
