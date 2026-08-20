const state = { data: null, category: 'all', query: '' };
const $ = (selector) => document.querySelector(selector);

async function init() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Data katalog gagal dimuat');
    state.data = await response.json();
    renderCategories();
    renderFilters();
    renderProducts();
    bindEvents();
  } catch (error) {
    $('#productGrid').innerHTML = '<p class="empty-state">Katalog sedang tidak tersedia. Silakan hubungi kami via WhatsApp.</p>';
    console.error(error);
  }
}

function renderCategories() {
  $('#categoryCards').innerHTML = state.data.categories.map((category) => `
    <article class="category-card ${category.accent}">
      <div><div class="card-icon">${category.icon}</div><p class="kicker" style="color:inherit;margin:12px 0 5px"><span style="background:currentColor"></span>${category.eyebrow}</p><h3>${category.name}</h3><p>${category.description}</p></div>
      <button type="button" data-category="${category.id}" aria-label="Lihat produk ${category.name}">↗</button>
    </article>`).join('');
}

function renderFilters() {
  $('#categoryFilters').innerHTML = [{ id: 'all', name: 'Semua produk' }, ...state.data.categories].map((category) => `<button class="${state.category === category.id ? 'active' : ''}" data-filter="${category.id}" role="tab">${category.name}</button>`).join('');
}

function renderProducts() {
  const query = state.query.toLowerCase().trim();
  const products = state.data.products.filter((product) => {
    const matchesCategory = state.category === 'all' || product.category === state.category;
    const searchable = [product.name, product.brand, product.subcategory, product.application, ...(product.aliases || []), ...product.variants.flatMap((variant) => [variant.name, ...Object.values(variant.specs)])].join(' ').toLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });
  $('#productGrid').innerHTML = products.map((product) => `
    <article class="product-card" data-product="${product.id}">
      <div class="product-meta"><span>${product.subcategory}</span><span>${product.brand}</span></div>
      <h3>${product.name}</h3><p>${product.description}</p>
      <footer><span>${product.variants.length} pilihan varian</span><b>→</b></footer>
    </article>`).join('');
  $('#emptyState').hidden = products.length > 0;
}

function openProduct(product) {
  const variant = product.variants[0];
  $('#modalContent').innerHTML = `<p class="modal-sub">${product.subcategory} · ${product.brand}</p><h2>${product.name}</h2><p class="hero-text">${product.description}</p><div class="variant-select"><label for="variantSelect">Pilih varian</label><select id="variantSelect">${product.variants.map((item, index) => `<option value="${index}">${item.name}</option>`).join('')}</select></div><table class="spec-table" id="specTable">${specRows(variant.specs)}</table><a id="modalWhatsapp" class="button wa-button" target="_blank" rel="noreferrer">Tanya via WhatsApp <span>↗</span></a>`;
  $('#variantSelect').addEventListener('change', (event) => { $('#specTable').innerHTML = specRows(product.variants[event.target.value].specs); });
  $('#modalWhatsapp').href = whatsappUrl(product, variant);
  $('#variantSelect').addEventListener('change', (event) => { $('#modalWhatsapp').href = whatsappUrl(product, product.variants[event.target.value]); });
  $('#productModal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function specRows(specs) { return Object.entries(specs).map(([label, value]) => `<tr><td>${label}</td><td><strong>${value}</strong></td></tr>`).join(''); }
function whatsappUrl(product, variant) { const message = `Halo Jagoan Bangunan,\n\nSaya ingin menanyakan:\n\nCategory: ${categoryName(product.category)}\nSubcategory: ${product.subcategory}\nProduk: ${product.name}\nVariant: ${variant.name}\nQty: \nLokasi Proyek: \n\nMohon informasi harga dan ketersediaannya.`; return `https://wa.me/${state.data.business.phone}?text=${encodeURIComponent(message)}`; }
function categoryName(id) { return state.data.categories.find((category) => category.id === id)?.name || id; }
function closeModal() { $('#productModal').hidden = true; document.body.style.overflow = ''; }
function bindEvents() { $('#searchInput').addEventListener('input', (event) => { state.query = event.target.value; renderProducts(); }); document.addEventListener('click', (event) => { const filter = event.target.closest('[data-filter]'); const category = event.target.closest('[data-category]'); const product = event.target.closest('[data-product]'); if (filter) { state.category = filter.dataset.filter; renderFilters(); renderProducts(); } if (category) { state.category = category.dataset.category; renderFilters(); renderProducts(); $('#catalog').scrollIntoView({ behavior: 'smooth' }); } if (product) openProduct(state.data.products.find((item) => item.id === product.dataset.product)); if (event.target.closest('[data-close-modal]')) closeModal(); }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#searchInput').focus(); } }); }

init();
