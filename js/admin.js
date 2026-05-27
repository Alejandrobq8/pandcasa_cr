const SUPABASE_URL = 'https://hcvzztldkjwhopkbydyo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjdnp6dGxka2p3aG9wa2J5ZHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODc0NTYsImV4cCI6MjA4NDg2MzQ1Nn0.CvCrkjtf_an4u6dH-W_dsmVag5nvHq5yApiLKMz6bCk';

const isConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes('YOUR_SUPABASE_URL') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

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
const saveOrderBtn = document.getElementById('saveOrderBtn');
const formHeading = document.getElementById('formHeading');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveAndAddAnotherBtn = document.getElementById('saveAndAddAnotherBtn');
const ACCESS_DENIED_MESSAGE = 'Tu cuenta no tiene permisos de administrador.';

let editingId = null;
let allProducts = [];
let displayedProducts = [];
let hasAdminAccess = false;
let saveMode = 'default'; // 'default' | 'addAnother'

// Temporada state
let editingTemporadaId = null;
let temporadaProducts = [];
let temporadaVisible = true;

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

const clearAdminData = () => {
  allProducts = [];
  editingId = null;
  if (productsCount) productsCount.textContent = '0';
  if (availableCount) availableCount.textContent = '0';
  if (unavailableCount) unavailableCount.textContent = '0';
  if (syncStatus) syncStatus.textContent = 'Sin acceso';
  if (productsTable) {
    productsTable.innerHTML = '<p class="text-sm text-brand-cocoa/70">Inicia sesión con un usuario administrador para ver los productos.</p>';
  }
  resetForm();
};

const requireAdminAccess = () => {
  if (hasAdminAccess) return true;
  showStatus(loginStatus, ACCESS_DENIED_MESSAGE, 'error');
  return false;
};

const addExtraRow = (extra = {}) => {
  const row = document.createElement('div');
  row.className = 'grid md:grid-cols-[1fr_120px_32px] gap-2 items-center';
  row.dataset.extraRow = 'true';
  row.innerHTML = `
    <input type="text" placeholder="Extra / acompañamiento" value="${extra.name || ''}" class="rounded-xl border border-brand-caramel/30 bg-white/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40" />
    <input type="number" placeholder="Precio" value="${extra.price || ''}" class="rounded-xl border border-brand-caramel/30 bg-white/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40" />
    <button type="button" class="w-8 h-8 rounded-full border border-brand-caramel/30 text-brand-caramel hover:border-brand-gold">×</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  extrasList.appendChild(row);
};

const resetForm = (keepContext = false) => {
  if (keepContext) {
    // Only clear name and description — keep category, price, availability, extras
    productForm.nombre.value = '';
    productForm.descripcion.value = '';
  } else {
    productForm.reset();
    extrasList.innerHTML = '';
  }
  editingId = null;
  saveMode = 'default';
  // Restore edit-mode UI
  if (formHeading) formHeading.textContent = 'Producto';
  const submitBtn = document.getElementById('productSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Guardar';
  cancelEditBtn?.classList.add('hidden');
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

const updateStatsCounters = () => {
  if (productsCount) productsCount.textContent = String(allProducts.length);
  if (availableCount) availableCount.textContent = String(allProducts.filter((p) => p.available).length);
  if (unavailableCount) unavailableCount.textContent = String(allProducts.filter((p) => !p.available).length);
};

const renderProducts = (products, keepOrderBtn = false) => {
  displayedProducts = [...products];
  if (!keepOrderBtn) saveOrderBtn?.classList.add('hidden');

  if (!products || products.length === 0) {
    productsTable.innerHTML = '<p class="text-sm text-brand-cocoa/70">Aún no hay productos registrados.</p>';
    return;
  }

  const rows = products.map((product, idx) => `
    <div class="grid md:grid-cols-[16px_1.5fr_0.6fr_0.7fr_0.5fr_0.5fr_0.5fr] gap-3 items-center border-b border-brand-caramel/10 py-3 transition-opacity" draggable="true" data-drag-idx="${idx}">
      <span class="text-brand-caramel/40 cursor-grab select-none text-base leading-none" title="Arrastrar para reordenar">&#8942;&#8942;</span>
      <div>
        <p class="font-medium">${product.name}</p>
        <p class="text-xs text-brand-cocoa/70">${product.category} · ${product.available ? 'Disponible' : 'Agotado'}</p>
      </div>
      <p class="text-sm text-brand-cocoa/80">${formatCRC(product.price)}</p>
      <button data-toggle="${product.id}" class="text-xs ${product.available ? 'text-brand-caramel' : 'text-brand-gold'}">
        ${product.available ? 'Marcar agotado' : 'Marcar disponible'}
      </button>
      <button data-edit="${product.id}" class="text-xs text-brand-caramel hover:text-brand-gold">Editar</button>
      <button data-duplicate="${product.id}" class="text-xs text-brand-caramel/60 hover:text-brand-gold">Duplicar</button>
      <button data-delete="${product.id}" class="text-xs text-red-600">Eliminar</button>
    </div>
  `).join('');

  productsTable.innerHTML = rows;

  let dragSrcIdx = null;
  productsTable.querySelectorAll('[data-drag-idx]').forEach((row) => {
    row.addEventListener('dragstart', (e) => {
      dragSrcIdx = Number(row.dataset.dragIdx);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => row.classList.add('opacity-40'), 0);
    });
    row.addEventListener('dragend', () => row.classList.remove('opacity-40'));
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const destIdx = Number(row.dataset.dragIdx);
      if (dragSrcIdx === null || dragSrcIdx === destIdx) return;
      const moved = displayedProducts.splice(dragSrcIdx, 1)[0];
      displayedProducts.splice(destIdx, 0, moved);
      renderProducts(displayedProducts, true);
      saveOrderBtn?.classList.remove('hidden');
    });
  });

  productsTable.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => handleEdit(btn.dataset.edit, allProducts));
  });

  productsTable.querySelectorAll('[data-duplicate]').forEach((btn) => {
    btn.addEventListener('click', () => handleDuplicate(btn.dataset.duplicate));
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

const saveProductOrder = async () => {
  if (!requireAdminAccess()) return;
  saveOrderBtn.disabled = true;
  saveOrderBtn.textContent = 'Guardando...';
  try {
    await Promise.all(
      displayedProducts.map((p, i) =>
        supabaseClient.from('products').update({ sort_order: i + 1 }).eq('id', p.id)
      )
    );
    showToast('Orden guardado.');
    saveOrderBtn?.classList.add('hidden');
    await fetchProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (saveOrderBtn) {
      saveOrderBtn.disabled = false;
      saveOrderBtn.textContent = 'Guardar orden';
    }
  }
};

const fetchProducts = async () => {
  if (!supabaseClient || !hasAdminAccess) return;
  if (syncStatus) syncStatus.textContent = 'Sincronizando';
  const { data, error } = await supabaseClient.from('products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
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
  if (!requireAdminAccess()) return;
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

  // Edit-mode UI
  if (formHeading) formHeading.textContent = `Editando: ${product.name}`;
  const submitBtn = document.getElementById('productSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Actualizar';
  cancelEditBtn?.classList.remove('hidden');

  // Scroll to form
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const handleDuplicate = (id) => {
  if (!requireAdminAccess()) return;
  const product = allProducts.find((item) => item.id === id);
  if (!product) return;

  // Fill the form like edit but don't set editingId (creates new)
  editingId = null;
  productForm.nombre.value = `Copia de ${product.name}`;
  productForm.descripcion.value = product.description || '';
  productForm.precio.value = product.price || '';
  productForm.categoria.value = product.category || 'panaderia';
  productForm.disponible.checked = Boolean(product.available);

  extrasList.innerHTML = '';
  (product.extras || []).forEach(addExtraRow);

  // Reset to "new" mode UI
  if (formHeading) formHeading.textContent = 'Producto';
  const submitBtn = document.getElementById('productSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Guardar';
  cancelEditBtn?.classList.add('hidden');

  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  productForm.nombre.focus();
};

const handleDelete = async (id) => {
  if (!requireAdminAccess()) return;
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
  if (!requireAdminAccess()) return;
  const product = allProducts.find((item) => item.id === id);
  if (!product) return;

  // Optimistic update
  const prevValue = product.available;
  product.available = !product.available;
  updateStatsCounters();
  applyFilters();

  const { error } = await supabaseClient
    .from('products')
    .update({ available: product.available })
    .eq('id', id);
  if (error) {
    // Revert on failure
    product.available = prevValue;
    updateStatsCounters();
    applyFilters();
    showToast(error.message, 'error');
  }
};


const checkAdminAccess = async () => {
  const { data, error } = await supabaseClient.rpc('is_admin');
  if (error) {
    throw new Error('No se pudo validar el rol admin en Supabase. Ejecuta el SQL de admin_access.sql.');
  }
  return Boolean(data);
};

const syncAdminSession = async (session) => {
  if (!session) {
    hasAdminAccess = false;
    clearAdminData();
    toggleUI(false);
    return;
  }

  try {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) {
      hasAdminAccess = false;
      clearAdminData();
      toggleUI(false);
      showStatus(loginStatus, ACCESS_DENIED_MESSAGE, 'error');
      await supabaseClient.auth.signOut();
      return;
    }

    hasAdminAccess = true;
    showStatus(loginStatus, '');
    toggleUI(true);
    await fetchProducts();
  } catch (error) {
    hasAdminAccess = false;
    clearAdminData();
    toggleUI(false);
    showStatus(loginStatus, error.message, 'error');
  }
};

const initAuth = async () => {
  if (!isConfigured) {
    configMessage.classList.remove('hidden');
    showStatus(loginStatus, 'Configura Supabase en admin.js para habilitar el login.');
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();
  await syncAdminSession(session);

  supabaseClient.auth.onAuthStateChange(async (_event, nextSession) => {
    await syncAdminSession(nextSession);
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
    showStatus(loginStatus, 'Validando permisos...');
    loginForm.reset();
  }
});

logoutBtn.addEventListener('click', async () => {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  showStatus(adminStatus, 'Sesión cerrada.');
});

saveOrderBtn?.addEventListener('click', saveProductOrder);

saveAndAddAnotherBtn?.addEventListener('click', () => {
  saveMode = 'addAnother';
  productForm.requestSubmit();
});

cancelEditBtn?.addEventListener('click', () => {
  resetForm();
  showStatus(adminStatus, '');
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
  if (!isConfigured || !requireAdminAccess()) return;

  const submitBtn = document.getElementById('productSubmitBtn');
  const currentSaveMode = saveMode;
  submitBtn.disabled = true;
  if (saveAndAddAnotherBtn) saveAndAddAnotherBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const name = productForm.nombre.value.trim();
    const description = productForm.descripcion.value.trim();
    const price = Number(productForm.precio.value);
    const category = productForm.categoria.value;
    const available = productForm.disponible.checked;
    const extras = collectExtras();

    const payload = { name, description, price, category, available, extras };

    if (editingId) {
      // UPDATE — optimistic local mutation
      const idx = allProducts.findIndex((p) => p.id === editingId);
      const prev = idx !== -1 ? { ...allProducts[idx] } : null;
      if (idx !== -1) Object.assign(allProducts[idx], payload);
      updateStatsCounters();
      applyFilters();

      const { error } = await supabaseClient.from('products').update(payload).eq('id', editingId);
      if (error) {
        // Revert
        if (idx !== -1 && prev) allProducts[idx] = prev;
        updateStatsCounters();
        applyFilters();
        throw error;
      }
      showToast('Producto actualizado.');
      showStatus(adminStatus, 'Producto actualizado.');
    } else {
      // INSERT — optimistic with temp id, replace on success
      const tempId = `__temp_${Date.now()}`;
      const tempProduct = { id: tempId, sort_order: null, created_at: new Date().toISOString(), ...payload };
      allProducts.unshift(tempProduct);
      updateStatsCounters();
      applyFilters();

      const { data, error } = await supabaseClient.from('products').insert(payload).select().single();
      if (error) {
        // Remove temp entry
        allProducts = allProducts.filter((p) => p.id !== tempId);
        updateStatsCounters();
        applyFilters();
        throw error;
      }
      // Replace temp with real row
      const tempIdx = allProducts.findIndex((p) => p.id === tempId);
      if (tempIdx !== -1) allProducts[tempIdx] = data;
      updateStatsCounters();
      applyFilters();
      showToast('Producto creado.');
      showStatus(adminStatus, 'Producto creado.');
    }

    if (currentSaveMode === 'addAnother') {
      resetForm(true); // keep category/price/availability/extras
      productForm.nombre.focus();
    } else {
      resetForm();
    }
  } catch (err) {
    showStatus(adminStatus, err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    if (saveAndAddAnotherBtn) saveAndAddAnotherBtn.disabled = false;
    // Restore button label based on current editing state
    submitBtn.textContent = editingId ? 'Actualizar' : 'Guardar';
  }
});

// ============================================================
// Tabs
// ============================================================
const tabInventarioBtn = document.getElementById('tabInventarioBtn');
const tabTemporadaBtn = document.getElementById('tabTemporadaBtn');
const tabCarruselBtn = document.getElementById('tabCarruselBtn');
const panelInventario = document.getElementById('panelInventario');
const panelTemporada = document.getElementById('panelTemporada');
const panelCarrusel = document.getElementById('panelCarrusel');

const TAB_ACTIVE = 'px-5 py-2 text-sm rounded-t-xl border border-b-0 border-brand-caramel/30 bg-brand-cream font-medium -mb-px';
const TAB_INACTIVE = 'px-5 py-2 text-sm rounded-t-xl text-brand-caramel hover:text-brand-cocoa transition';

const switchTab = (tab) => {
  panelInventario?.classList.toggle('hidden', tab !== 'inventario');
  panelTemporada?.classList.toggle('hidden', tab !== 'temporada');
  panelCarrusel?.classList.toggle('hidden', tab !== 'carrusel');

  if (tabInventarioBtn) tabInventarioBtn.className = tab === 'inventario' ? TAB_ACTIVE : TAB_INACTIVE;
  if (tabTemporadaBtn) tabTemporadaBtn.className = tab === 'temporada' ? TAB_ACTIVE : TAB_INACTIVE;
  if (tabCarruselBtn) tabCarruselBtn.className = tab === 'carrusel' ? TAB_ACTIVE : TAB_INACTIVE;

  if (tab === 'temporada') fetchTemporadaData();
  if (tab === 'carrusel') fetchCarruselProducts();
};

tabInventarioBtn?.addEventListener('click', () => switchTab('inventario'));
tabTemporadaBtn?.addEventListener('click', () => switchTab('temporada'));
tabCarruselBtn?.addEventListener('click', () => switchTab('carrusel'));

// ============================================================
// Temporada: Visibilidad
// ============================================================
const temporadaToggleBtn = document.getElementById('temporadaToggleBtn');
const temporadaVisibilityBadge = document.getElementById('temporadaVisibilityBadge');

const updateTemporadaVisibilityUI = () => {
  if (temporadaVisibilityBadge) {
    temporadaVisibilityBadge.textContent = temporadaVisible ? 'Visible' : 'Oculto';
    temporadaVisibilityBadge.className = temporadaVisible
      ? 'px-3 py-1 rounded-full text-xs bg-brand-gold/15 text-brand-cocoa'
      : 'px-3 py-1 rounded-full text-xs bg-brand-caramel/15 text-brand-cocoa';
  }
  if (temporadaToggleBtn) {
    temporadaToggleBtn.textContent = temporadaVisible ? 'Ocultar para usuarios' : 'Mostrar para usuarios';
  }
};

const fetchTemporadaVisibility = async () => {
  if (!supabaseClient || !hasAdminAccess) return;
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', 'temporada_visible')
    .single();
  if (!error && data) {
    temporadaVisible = data.value === true;
    updateTemporadaVisibilityUI();
  }
};

const handleTemporadaVisibilityToggle = async () => {
  if (!requireAdminAccess()) return;
  const newValue = !temporadaVisible;
  const { error } = await supabaseClient
    .from('site_settings')
    .update({ value: newValue })
    .eq('key', 'temporada_visible');
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  temporadaVisible = newValue;
  updateTemporadaVisibilityUI();
  showToast(newValue ? 'Temporada visible para usuarios.' : 'Temporada oculta para usuarios.');
};

temporadaToggleBtn?.addEventListener('click', handleTemporadaVisibilityToggle);

// ============================================================
// Temporada: CRUD
// ============================================================
const temporadaExtrasList = document.getElementById('temporadaExtrasList');
const temporadaProductsTable = document.getElementById('temporadaProductsTable');
const temporadaForm = document.getElementById('temporadaForm');
const newTemporadaBtn = document.getElementById('newTemporadaBtn');
const addTemporadaExtraBtn = document.getElementById('addTemporadaExtraBtn');
const temporadaSearch = document.getElementById('temporadaSearch');
const temporadaAvailabilityFilter = document.getElementById('temporadaAvailabilityFilter');
const temporadaFormStatus = document.getElementById('temporadaFormStatus');
const temporadaImageFile = document.getElementById('temporadaImageFile');
const temporadaImagePreview = document.getElementById('temporadaImagePreview');
const temporadaImagePreviewImg = document.getElementById('temporadaImagePreviewImg');
const temporadaImageFileName = document.getElementById('temporadaImageFileName');

let temporadaCurrentImageUrl = null;

const showTemporadaImagePreview = (src) => {
  if (!temporadaImagePreview || !temporadaImagePreviewImg) return;
  temporadaImagePreviewImg.src = src;
  temporadaImagePreview.classList.remove('hidden');
};

const hideTemporadaImagePreview = () => {
  if (!temporadaImagePreview) return;
  temporadaImagePreview.classList.add('hidden');
  if (temporadaImagePreviewImg) temporadaImagePreviewImg.src = '';
};

temporadaImageFile?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (temporadaImageFileName) temporadaImageFileName.textContent = file.name;
  showTemporadaImagePreview(URL.createObjectURL(file));
});

const uploadTemporadaImage = async (file) => {
  const compressed = await compressImage(file);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabaseClient.storage
    .from('temporada-images')
    .upload(path, compressed, { upsert: false, contentType: 'image/jpeg' });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('temporada-images').getPublicUrl(path);
  return data.publicUrl;
};

const addTemporadaExtraRow = (extra = {}) => {
  const row = document.createElement('div');
  row.className = 'grid md:grid-cols-[1fr_120px_32px] gap-2 items-center';
  row.dataset.extraRow = 'true';
  row.innerHTML = `
    <input type="text" placeholder="Extra / acompañamiento" value="${extra.name || ''}" class="rounded-xl border border-brand-caramel/30 bg-white/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40" />
    <input type="number" placeholder="Precio" value="${extra.price || ''}" class="rounded-xl border border-brand-caramel/30 bg-white/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40" />
    <button type="button" class="w-8 h-8 rounded-full border border-brand-caramel/30 text-brand-caramel hover:border-brand-gold">×</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  temporadaExtrasList?.appendChild(row);
};

const resetTemporadaForm = () => {
  temporadaForm?.reset();
  editingTemporadaId = null;
  temporadaCurrentImageUrl = null;
  if (temporadaExtrasList) temporadaExtrasList.innerHTML = '';
  hideTemporadaImagePreview();
  if (temporadaImageFileName) temporadaImageFileName.textContent = 'Seleccionar imagen...';
  if (temporadaImageFile) temporadaImageFile.value = '';
};

const collectTemporadaExtras = () => {
  return Array.from(temporadaExtrasList?.querySelectorAll('[data-extra-row]') || []).map((row) => {
    const inputs = row.querySelectorAll('input');
    return {
      name: inputs[0].value.trim(),
      price: inputs[1].value ? Number(inputs[1].value) : null
    };
  }).filter((extra) => extra.name);
};

const renderTemporadaProducts = (products) => {
  if (!temporadaProductsTable) return;
  if (!products || products.length === 0) {
    temporadaProductsTable.innerHTML = '<p class="text-sm text-brand-cocoa/70">No hay productos de temporada.</p>';
    return;
  }

  const rows = products.map((product) => `
    <div class="grid md:grid-cols-[1.6fr_0.7fr_0.7fr_0.5fr_0.5fr] gap-3 items-center border-b border-brand-caramel/10 py-3">
      <div>
        <p class="font-medium">${product.name}</p>
        <p class="text-xs text-brand-cocoa/70">${product.available ? 'Disponible' : 'Agotado'}</p>
      </div>
      <p class="text-sm text-brand-cocoa/80">${formatCRC(product.price)}</p>
      <button data-t-toggle="${product.id}" class="text-xs ${product.available ? 'text-brand-caramel' : 'text-brand-gold'}">
        ${product.available ? 'Marcar agotado' : 'Marcar disponible'}
      </button>
      <button data-t-edit="${product.id}" class="text-xs text-brand-caramel hover:text-brand-gold">Editar</button>
      <button data-t-delete="${product.id}" class="text-xs text-red-600">Eliminar</button>
    </div>
  `).join('');

  temporadaProductsTable.innerHTML = rows;

  temporadaProductsTable.querySelectorAll('[data-t-edit]').forEach((btn) => {
    btn.addEventListener('click', () => handleTemporadaEdit(btn.dataset.tEdit));
  });
  temporadaProductsTable.querySelectorAll('[data-t-delete]').forEach((btn) => {
    btn.addEventListener('click', () => handleTemporadaDelete(btn.dataset.tDelete));
  });
  temporadaProductsTable.querySelectorAll('[data-t-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => handleTemporadaToggleAvailability(btn.dataset.tToggle));
  });
};

const applyTemporadaFilters = () => {
  const query = (temporadaSearch?.value || '').trim().toLowerCase();
  const availability = temporadaAvailabilityFilter?.value || 'all';

  const filtered = temporadaProducts.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query);
    const matchesAvailability =
      availability === 'all' ||
      (availability === 'available' && p.available) ||
      (availability === 'unavailable' && !p.available);
    return matchesQuery && matchesAvailability;
  });

  renderTemporadaProducts(filtered);
};

const fetchTemporadaProducts = async () => {
  if (!supabaseClient || !hasAdminAccess) return;
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('category', 'temporada')
    .order('created_at', { ascending: false });
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  temporadaProducts = data || [];
  applyTemporadaFilters();
};

const fetchTemporadaData = async () => {
  await Promise.all([fetchTemporadaVisibility(), fetchTemporadaProducts()]);
};

const handleTemporadaEdit = (id) => {
  if (!requireAdminAccess()) return;
  const product = temporadaProducts.find((p) => p.id === id);
  if (!product) return;

  editingTemporadaId = id;
  temporadaCurrentImageUrl = product.image_url || null;
  if (temporadaForm) {
    temporadaForm.nombre.value = product.name || '';
    temporadaForm.descripcion.value = product.description || '';
    temporadaForm.precio.value = product.price || '';
    temporadaForm.disponible.checked = Boolean(product.available);
  }
  if (product.image_url) {
    showTemporadaImagePreview(product.image_url);
  } else {
    hideTemporadaImagePreview();
  }
  if (temporadaImageFileName) temporadaImageFileName.textContent = 'Seleccionar imagen...';
  if (temporadaImageFile) temporadaImageFile.value = '';
  if (temporadaExtrasList) temporadaExtrasList.innerHTML = '';
  (product.extras || []).forEach(addTemporadaExtraRow);
  temporadaForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const handleTemporadaDelete = async (id) => {
  if (!requireAdminAccess()) return;
  if (!confirm('¿Eliminar este producto de temporada?')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  showToast('Producto eliminado.');
  fetchTemporadaProducts();
};

const handleTemporadaToggleAvailability = async (id) => {
  if (!requireAdminAccess()) return;
  const product = temporadaProducts.find((p) => p.id === id);
  if (!product) return;
  const { error } = await supabaseClient
    .from('products')
    .update({ available: !product.available })
    .eq('id', id);
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  fetchTemporadaProducts();
};

addTemporadaExtraBtn?.addEventListener('click', () => addTemporadaExtraRow());
newTemporadaBtn?.addEventListener('click', () => {
  resetTemporadaForm();
  temporadaForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

temporadaSearch?.addEventListener('input', applyTemporadaFilters);
temporadaAvailabilityFilter?.addEventListener('change', applyTemporadaFilters);

temporadaForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isConfigured || !requireAdminAccess()) return;

  const submitBtn = document.getElementById('temporadaSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const name = temporadaForm.nombre.value.trim();
    const description = temporadaForm.descripcion.value.trim();
    const price = Number(temporadaForm.precio.value);
    const available = temporadaForm.disponible.checked;
    const extras = collectTemporadaExtras();

    let image_url = temporadaCurrentImageUrl;
    const fileToUpload = temporadaImageFile?.files?.[0];
    if (fileToUpload) {
      showStatus(temporadaFormStatus, 'Subiendo imagen...');
      submitBtn.textContent = 'Subiendo imagen...';
      image_url = await uploadTemporadaImage(fileToUpload);
    }

    const payload = { name, description, price, category: 'temporada', available, extras, image_url };

    const successMessage = editingTemporadaId ? 'Producto actualizado.' : 'Producto creado.';
    const { error } = editingTemporadaId
      ? await supabaseClient.from('products').update(payload).eq('id', editingTemporadaId)
      : await supabaseClient.from('products').insert(payload);

    if (error) throw error;

    showToast(successMessage);
    resetTemporadaForm();
    await fetchTemporadaProducts();
    showStatus(temporadaFormStatus, successMessage);
  } catch (error) {
    showStatus(temporadaFormStatus, error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

// ============================================================
// Carrusel bocadillos: CRUD
// ============================================================
let editingCarruselId = null;
let carruselProducts = [];
let carruselCurrentImageUrl = null;

const carruselForm = document.getElementById('carruselForm');
const newCarruselBtn = document.getElementById('newCarruselBtn');
const carruselSearch = document.getElementById('carruselSearch');
const carruselFormStatus = document.getElementById('carruselFormStatus');
const carruselImageFile = document.getElementById('carruselImageFile');
const carruselImagePreview = document.getElementById('carruselImagePreview');
const carruselImagePreviewImg = document.getElementById('carruselImagePreviewImg');
const carruselImageFileName = document.getElementById('carruselImageFileName');
const carruselProductsTable = document.getElementById('carruselProductsTable');
const carruselDescripcion = document.getElementById('carruselDescripcion');

const showCarruselImagePreview = (src) => {
  if (!carruselImagePreview || !carruselImagePreviewImg) return;
  carruselImagePreviewImg.src = src;
  carruselImagePreview.classList.remove('hidden');
};

const hideCarruselImagePreview = () => {
  if (!carruselImagePreview) return;
  carruselImagePreview.classList.add('hidden');
  if (carruselImagePreviewImg) carruselImagePreviewImg.src = '';
};

carruselImageFile?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (carruselImageFileName) carruselImageFileName.textContent = file.name;
  showCarruselImagePreview(URL.createObjectURL(file));
});

const uploadCarruselImage = async (file) => {
  const compressed = await compressImage(file);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabaseClient.storage
    .from('bocadillos-carousel')
    .upload(path, compressed, { upsert: false, contentType: 'image/jpeg' });
  if (error) throw error;
  const { data } = supabaseClient.storage.from('bocadillos-carousel').getPublicUrl(path);
  return data.publicUrl;
};

const resetCarruselForm = () => {
  carruselForm?.reset();
  editingCarruselId = null;
  carruselCurrentImageUrl = null;
  hideCarruselImagePreview();
  if (carruselImageFileName) carruselImageFileName.textContent = 'Seleccionar imagen...';
  if (carruselImageFile) carruselImageFile.value = '';
};

const renderCarruselProducts = (products) => {
  if (!carruselProductsTable) return;
  if (!products || products.length === 0) {
    carruselProductsTable.innerHTML = '<p class="text-sm text-brand-cocoa/70">No hay fotos en el carrusel.</p>';
    return;
  }

  carruselProductsTable.innerHTML = products.map((p) => `
    <div class="grid md:grid-cols-[1fr_0.5fr_0.5fr_0.5fr] gap-3 items-center border-b border-brand-caramel/10 py-3">
      <div class="flex items-center gap-3">
        ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" class="h-10 w-10 rounded-lg object-cover border border-brand-caramel/15 shrink-0" />` : '<div class="h-10 w-10 rounded-lg bg-brand-beige/60 border border-brand-caramel/15 shrink-0"></div>'}
        <div>
          <p class="font-medium text-sm">${p.name}</p>
          <p class="text-xs text-brand-cocoa/60">${p.available ? 'Visible' : 'Oculto'}</p>
        </div>
      </div>
      <button data-c-toggle="${p.id}" class="text-xs ${p.available ? 'text-brand-caramel' : 'text-brand-gold'}">
        ${p.available ? 'Ocultar' : 'Mostrar'}
      </button>
      <button data-c-edit="${p.id}" class="text-xs text-brand-caramel hover:text-brand-gold">Editar</button>
      <button data-c-delete="${p.id}" class="text-xs text-red-600">Eliminar</button>
    </div>
  `).join('');

  carruselProductsTable.querySelectorAll('[data-c-edit]').forEach((btn) => {
    btn.addEventListener('click', () => handleCarruselEdit(btn.dataset.cEdit));
  });
  carruselProductsTable.querySelectorAll('[data-c-delete]').forEach((btn) => {
    btn.addEventListener('click', () => handleCarruselDelete(btn.dataset.cDelete));
  });
  carruselProductsTable.querySelectorAll('[data-c-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => handleCarruselToggle(btn.dataset.cToggle));
  });
};

const applyCarruselFilters = () => {
  const query = (carruselSearch?.value || '').trim().toLowerCase();
  const filtered = carruselProducts.filter((p) =>
    p.name.toLowerCase().includes(query)
  );
  renderCarruselProducts(filtered);
};

const fetchCarruselProducts = async () => {
  if (!supabaseClient || !hasAdminAccess) return;
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('category', 'bocadillos_carousel')
    .order('created_at', { ascending: false });
  if (error) { showToast(error.message, 'error'); return; }
  carruselProducts = data || [];
  applyCarruselFilters();
};

const handleCarruselEdit = (id) => {
  if (!requireAdminAccess()) return;
  const product = carruselProducts.find((p) => p.id === id);
  if (!product) return;

  editingCarruselId = id;
  carruselCurrentImageUrl = product.image_url || null;
  if (carruselForm) {
    carruselForm.nombre.value = product.name || '';
    carruselForm.precio.value = product.price || 0;
    carruselForm.disponible.checked = Boolean(product.available);
    if (carruselDescripcion) carruselDescripcion.value = product.description || '';
  }
  if (product.image_url) showCarruselImagePreview(product.image_url);
  else hideCarruselImagePreview();
  if (carruselImageFileName) carruselImageFileName.textContent = 'Seleccionar imagen...';
  if (carruselImageFile) carruselImageFile.value = '';
  carruselForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const handleCarruselDelete = async (id) => {
  if (!requireAdminAccess()) return;
  if (!confirm('Eliminar esta foto del carrusel?')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Foto eliminada.');
  fetchCarruselProducts();
};

const handleCarruselToggle = async (id) => {
  if (!requireAdminAccess()) return;
  const product = carruselProducts.find((p) => p.id === id);
  if (!product) return;
  const { error } = await supabaseClient
    .from('products')
    .update({ available: !product.available })
    .eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  fetchCarruselProducts();
};

newCarruselBtn?.addEventListener('click', () => {
  resetCarruselForm();
  carruselForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

carruselSearch?.addEventListener('input', applyCarruselFilters);

carruselForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isConfigured || !requireAdminAccess()) return;

  const submitBtn = document.getElementById('carruselSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  try {
    const name = carruselForm.nombre.value.trim();
    const description = (carruselDescripcion?.value || '').trim();
    const price = Number(carruselForm.precio.value) || 0;
    const available = carruselForm.disponible.checked;

    let image_url = carruselCurrentImageUrl;
    const fileToUpload = carruselImageFile?.files?.[0];
    if (fileToUpload) {
      showStatus(carruselFormStatus, 'Subiendo imagen...');
      submitBtn.textContent = 'Subiendo imagen...';
      image_url = await uploadCarruselImage(fileToUpload);
    }

    const payload = { name, description, price, category: 'bocadillos_carousel', available, extras: [], image_url };
    const successMessage = editingCarruselId ? 'Foto actualizada.' : 'Foto agregada al carrusel.';

    const { error } = editingCarruselId
      ? await supabaseClient.from('products').update(payload).eq('id', editingCarruselId)
      : await supabaseClient.from('products').insert(payload);

    if (error) throw error;

    showToast(successMessage);
    resetCarruselForm();
    await fetchCarruselProducts();
    showStatus(carruselFormStatus, successMessage);
  } catch (error) {
    showStatus(carruselFormStatus, error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar';
  }
});

resetForm();
initAuth();
