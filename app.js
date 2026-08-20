// Atap Baja - app.js v2 (render gambar + teks dinamis)
const state = { data: null, category: null, subcategory: null, product: null, variant: 0 };
const $ = (s) => document.querySelector(s);
const titleCase = (value) => value;

function loadData() {
  if (window.__PREVIEW_DATA__) {
    state.data = window.__PREVIEW_DATA__;
    applySiteText();
    renderCategories();
    return;
  }
  fetch('data.json').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { state.data = data; applySiteText(); renderCategories(); }).catch(() => { $('#category-cards').innerHTML = '<p>Data katalog belum dapat dimuat. Silakan muat ulang halaman.</p>'; });
}

function applySiteText() {
  if (!state.data || !state.data._site) return;
  const s = state.data._site;

  const eyebrow = document.querySelector('.hero .eyebrow');
  if (eyebrow && s.hero_eyebrow) eyebrow.textContent = s.hero_eyebrow;

  const h1 = document.querySelector('.hero h1');
  if (h1 && s.hero_h1) h1.innerHTML = s.hero_h1.replace(/(proyek Anda\.?)/, '<em>$1</em>');

  const lead = document.querySelector('.hero .lead');
  if (lead && s.hero_lead) lead.textContent = s.hero_lead;

  const heroActions = document.querySelectorAll('.hero-actions .button');
  if (heroActions[0] && s.hero_cta1) heroActions[0].innerHTML = s.hero_cta1 + ' <span>→</span>';
  if (heroActions[1] && s.hero_cta2) heroActions[1].textContent = s.hero_cta2;

  const valueStrip = document.querySelectorAll('.value-strip > div');
  if (valueStrip[0]) {
    if (s.v1_title) valueStrip[0].querySelector('strong').textContent = s.v1_title;
    if (s.v1_desc) valueStrip[0].querySelector('span').innerHTML = `<strong>${s.v1_title || ''}</strong>${s.v1_desc}`;
  }
  if (valueStrip[1]) {
    if (s.v2_title || s.v2_desc) valueStrip[1].querySelector('span').innerHTML = `<strong>${s.v2_title || ''}</strong>${s.v2_desc || ''}`;
  }
  if (valueStrip[2]) {
    if (s.v3_title || s.v3_desc) valueStrip[2].querySelector('span').innerHTML = `<strong>${s.v3_title || ''}</strong>${s.v3_desc || ''}`;
  }

  const contactSection = document.querySelector('.project-cta');
  if (contactSection) {
    if (s.contact_eyebrow) contactSection.querySelector('.eyebrow').textContent = s.contact_eyebrow;
    if (s.contact_title) contactSection.querySelector('h2').textContent = s.contact_title;
    if (s.contact_desc) contactSection.querySelectorAll('p')[1].textContent = s.contact_desc;
  }

  const footer = document.querySelector('footer');
  if (footer) {
    if (s.footer_tagline) footer.querySelector('p').textContent = s.footer_tagline;
    if (s.footer_phone) footer.querySelector('a[href="tel:+6282230008555"]').textContent = s.footer_phone;
  }
}

function renderProductImage(p, className) {
  if (!p.image) return '';
  return `<img src="${p.image}" alt="${p.name}" class="${className || 'product-thumb'}" onerror="this.style.display='none'">`;
}

function renderCategories() {
  $('#category-cards').innerHTML = state.data.categories.map(c => {
    const firstProduct = c.subcategories.flatMap(s => s.products)[0];
    const imgHtml = firstProduct ? renderProductImage(firstProduct, 'category-thumb') : '';
    return `<article class="category-card">${imgHtml}<span class="tag">${c.label.toUpperCase()}</span><h3>${c.name}</h3><p>${c.description}</p><button data-category="${c.slug}">${c.cta} →</button></article>`;
  }).join('');
  document.querySelectorAll('[data-category]').forEach(b => b.onclick = () => showCategory(b.dataset.category));
}

function showDetail() { $('#catalog-detail').hidden = false; $('#catalog-detail').scrollIntoView({behavior:'smooth', block:'start'}); }

function showCategory(slug) {
  state.category = state.data.categories.find(c => c.slug === slug);
  state.subcategory = state.product = null;
  showDetail();
  $('#breadcrumbs').textContent = `Katalog / ${state.category.name}`;
  $('#detail-content').innerHTML = `<p class="eyebrow">${state.category.label.toUpperCase()}</p><h2>${state.category.name}</h2><p>${state.category.description}</p><div class="subcategory-list">${state.category.subcategories.map(s => {
    const firstProduct = s.products[0];
    const imgHtml = firstProduct ? renderProductImage(firstProduct, 'sub-thumb') : '';
    return `<button class="subcategory" data-sub="${s.slug}">${imgHtml}<b>${s.name}</b><span>${s.products.length} pilihan produk tersedia →</span></button>`;
  }).join('')}</div>`;
  document.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => showSubcategory(b.dataset.sub));
}

function showSubcategory(slug) {
  state.subcategory = state.category.subcategories.find(s => s.slug === slug);
  state.product = null;
  $('#breadcrumbs').textContent = `Katalog / ${state.category.name} / ${state.subcategory.name}`;
  $('#detail-content').innerHTML = `<p class="eyebrow">${state.category.name}</p><h2>${state.subcategory.name}</h2><p>${state.subcategory.description}</p><div class="product-grid">${state.subcategory.products.map(p => {
    const imgHtml = renderProductImage(p, 'product-thumb');
    return `<button class="product-card" data-product="${p.slug}">${imgHtml}<span class="product-code">${p.brand || 'MATERIAL PROYEK'}</span><h3>${p.name}</h3><p>${p.variants.length} varian tersedia · ${p.application}</p></button>`;
  }).join('')}</div>`;
  document.querySelectorAll('[data-product]').forEach(b => b.onclick = () => showProduct(b.dataset.product));
}

function showProduct(slug) { state.product = state.subcategory.products.find(p => p.slug === slug); state.variant = 0; renderProduct(); }

function renderProduct() {
  const p = state.product, v = p.variants[state.variant];
  $('#breadcrumbs').textContent = `Katalog / ${state.category.name} / ${state.subcategory.name} / ${p.name}`;
  const imgHtml = renderProductImage(p, 'product-detail-img');
  $('#detail-content').innerHTML = `<div class="product-layout"><div>${imgHtml}<p class="eyebrow">${p.brand || state.category.name.toUpperCase()}</p><h2>${p.name}</h2><p>${p.description}</p><h3>Pilih varian</h3><div class="variant-list">${p.variants.map((x,i) => `<button class="variant ${i === state.variant ? 'active':''}" data-variant="${i}">${x.name}</button>`).join('')}</div></div><div><div class="spec-box"><h3>Spesifikasi teknis</h3><dl class="spec-grid">${Object.entries(v.specifications).map(([key,val]) => `<div><dt>${key}</dt><dd>${val}</dd></div>`).join('')}</dl></div><form class="wa-form" id="wa-form"><h3>${state.category.waCta}</h3><div class="wa-fields"><input name="quantity" required placeholder="Jumlah / Qty"><input name="location" required placeholder="Lokasi proyek"></div><button class="button primary" type="submit">${p.cta || 'Tanya Harga'} via WhatsApp <span>↗</span></button></form></div></div>`;
  document.querySelectorAll('[data-variant]').forEach(b => b.onclick = () => {state.variant = +b.dataset.variant; renderProduct();});
  $('#wa-form').onsubmit = sendWhatsApp;
}

function sendWhatsApp(e) {
  e.preventDefault();
  const f = new FormData(e.currentTarget), p = state.product, v = p.variants[state.variant];
  const text = `Halo Jagoan Bangunan,\n\nSaya ingin menanyakan:\n\nCategory: ${state.category.name}\nSubcategory: ${state.subcategory.name}\nProduk: ${p.name}\nVariant: ${v.name}\nQty: ${f.get('quantity')}\nLokasi Proyek: ${f.get('location')}\n\nMohon informasi harga dan ketersediaannya.`;
  window.open(`https://wa.me/6282230008555?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

$('#back-button').onclick = () => state.subcategory ? showCategory(state.category.slug) : ($('#catalog-detail').hidden = true);

$('#search').oninput = e => {
  const q = e.target.value.trim().toLowerCase(), out = $('#search-results');
  if (!q || !state.data) { out.hidden = true; return; }
  const matches = [];
  state.data.categories.forEach(c => c.subcategories.forEach(s => s.products.forEach(p => {
    const text = [c.name,s.name,p.name,p.brand,p.application,...p.aliases,...p.variants.flatMap(v => [v.name,...Object.values(v.specifications)])].join(' ').toLowerCase();
    if (text.includes(q)) matches.push({c,s,p});
  })));
  out.innerHTML = matches.length ? matches.slice(0,6).map((m,i) => `<button class="result" data-result="${i}">${m.p.name}<small>${m.c.name} · ${m.s.name} · ${m.p.brand || 'Material proyek'}</small></button>`).join('') : '<div class="result">Produk tidak ditemukan. Hubungi kami untuk kebutuhan khusus.</div>';
  out.hidden = false;
  document.querySelectorAll('[data-result]').forEach(b => b.onclick = () => {
    const m = matches[+b.dataset.result];
    state.category=m.c; state.subcategory=m.s; state.product=m.p; state.variant=0;
    showDetail(); renderProduct(); out.hidden=true; $('#search').value='';
  });
};

$('.menu-toggle').onclick = e => { const nav=$('.main-nav'); nav.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open')); };
$('#year').textContent = new Date().getFullYear();

loadData();
