(() => {
  'use strict';

  const PASSWORD_HASH = '2e14654ee27349ebaa119ecfc3a75cb3ffc636688b99a34815d3812c31486563';
  const REPO_OWNER = 'antokatapbaja-77';
  const REPO_NAME = 'atapbaja';
  const BRANCH = 'main';

  let siteData = null;
  let editedData = null;
  let imageFiles = {};
  let currentEditPath = [];

  // ========== UTILITIES ==========
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function showStatus(msg, type = '') {
    const el = $('#status-msg');
    el.textContent = msg;
    el.className = 'status-msg' + (type ? ' ' + type : '');
    if (type === 'success' || type === 'error') {
      setTimeout(() => { el.textContent = 'Siap'; el.className = 'status-msg'; }, 4000);
    }
  }

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function getNestedValue(obj, path) {
    return path.reduce((o, k) => o && o[k], obj);
  }

  function setNestedValue(obj, path, value) {
    const last = path.pop();
    const parent = path.reduce((o, k) => o[k], obj);
    if (value === undefined || value === null || value === '') {
      delete parent[last];
    } else {
      parent[last] = value;
    }
  }

  // ========== AUTHENTICATION ==========
  async function initAuth() {
    const savedAuth = localStorage.getItem('abahantok_auth');
    if (savedAuth === 'true') {
      showDashboard();
      return;
    }

    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = $('#login-password').value;
      const hash = await sha256(password);

      if (hash === PASSWORD_HASH) {
        localStorage.setItem('abahantok_auth', 'true');
        $('#login-error').classList.remove('show');
        showDashboard();
      } else {
        $('#login-error').classList.add('show');
        $('#login-password').value = '';
      }
    });
  }

  function showDashboard() {
    $('#login-screen').style.display = 'none';
    $('#admin-dashboard').classList.add('active');
    loadData();
  }

  // ========== DATA LOADING ==========
  async function loadData() {
    showStatus('Memuat data...');
    try {
      const saved = localStorage.getItem('abahantok_data');
      if (saved) {
        siteData = JSON.parse(saved);
        editedData = deepClone(siteData);
        showStatus('Data dimuat dari local storage', 'success');
        renderAllEditors();
        return;
      }

      const resp = await fetch('data.json');
      if (!resp.ok) throw new Error('Gagal memuat data.json');
      siteData = await resp.json();
      editedData = deepClone(siteData);
      localStorage.setItem('abahantok_data', JSON.stringify(siteData));
      showStatus('Data dimuat dari data.json', 'success');
      renderAllEditors();
    } catch (err) {
      showStatus('Gagal memuat data: ' + err.message, 'error');
    }
  }

  // ========== EDITOR RENDERING ==========
  function renderAllEditors() {
    renderTextEdit();
    renderProductTree();
    renderImageEditor();
    renderJsonEditor();
  }

  // --- TEXT EDITOR ---
  function renderTextEdit() {
    const container = $('#text-editor-content');
    container.innerHTML = '';

    const sections = [
      {
        title: 'Hero Section',
        fields: [
          { label: 'Eyebrow Text', key: 'eyebrow', value: 'MATERIAL KONSTRUKSI TERPERCAYA', path: ['_site', 'hero_eyebrow'] },
          { label: 'Judul Utama', key: 'h1', value: 'Temukan material tepat untuk proyek Anda.', path: ['_site', 'hero_h1'] },
          { label: 'Deskripsi', key: 'lead', value: 'Katalog atap, besi, dan chemical building...', path: ['_site', 'hero_lead'] },
          { label: 'CTA Utama', key: 'cta1', value: 'Jelajahi Katalog', path: ['_site', 'hero_cta1'] },
          { label: 'CTA Kedua', key: 'cta2', value: 'Konsultasi Proyek', path: ['_site', 'hero_cta2'] },
        ]
      },
      {
        title: 'Section Keunggulan',
        fields: [
          { label: 'Poin 1 - Judul', key: 'v1_title', value: 'Spesifikasi transparan', path: ['_site', 'v1_title'] },
          { label: 'Poin 1 - Deskripsi', key: 'v1_desc', value: 'Data produk dan ukuran yang mudah dipahami.', path: ['_site', 'v1_desc'] },
          { label: 'Poin 2 - Judul', key: 'v2_title', value: 'Siap untuk proyek', path: ['_site', 'v2_title'] },
          { label: 'Poin 2 - Deskripsi', key: 'v2_desc', value: 'Konsultasi material sesuai kebutuhan aplikasi.', path: ['_site', 'v2_desc'] },
          { label: 'Poin 3 - Judul', key: 'v3_title', value: 'Respon cepat', path: ['_site', 'v3_title'] },
          { label: 'Poin 3 - Deskripsi', key: 'v3_desc', value: 'Harga dan ketersediaan melalui WhatsApp.', path: ['_site', 'v3_desc'] },
        ]
      },
      {
        title: 'Section Kontak',
        fields: [
          { label: 'Eyebrow', key: 'contact_eyebrow', value: 'BUTUH BANTUAN MEMILIH?', path: ['_site', 'contact_eyebrow'] },
          { label: 'Judul', key: 'contact_title', value: 'Ceritakan kebutuhan proyek Anda.', path: ['_site', 'contact_title'] },
          { label: 'Deskripsi', key: 'contact_desc', value: 'Tim kami siap membantu...', path: ['_site', 'contact_desc'] },
        ]
      },
      {
        title: 'Footer',
        fields: [
          { label: 'Tagline', key: 'footer_tagline', value: 'Material konstruksi untuk pekerjaan yang kokoh.', path: ['_site', 'footer_tagline'] },
          { label: 'Nomor Telepon', key: 'footer_phone', value: '0822-3000-8555', path: ['_site', 'footer_phone'] },
        ]
      }
    ];

    if (!editedData._site) {
      editedData._site = {};
    }

    sections.forEach(section => {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.innerHTML = `<h2>${section.title}</h2>`;

      section.fields.forEach(field => {
        if (!editedData._site[field.key]) {
          editedData._site[field.key] = field.value;
        }

        const group = document.createElement('div');
        group.className = 'form-group';

        const input = field.key.includes('desc') || field.key.includes('lead')
          ? `<textarea data-field="${field.key}">${editedData._site[field.key] || field.value}</textarea>`
          : `<input type="text" data-field="${field.key}" value="${(editedData._site[field.key] || field.value).replace(/"/g, '&quot;')}">`;

        group.innerHTML = `<label>${field.label}</label>${input}`;
        card.appendChild(group);
      });

      container.appendChild(card);
    });

    container.addEventListener('input', (e) => {
      const field = e.target.dataset.field;
      if (field) {
        editedData._site[field] = e.target.value;
        saveLocal();
      }
    });
  }

  // --- PRODUCT TREE ---
  function renderProductTree() {
    const container = $('#product-tree');
    container.innerHTML = '';

    if (!editedData.categories) return;

    editedData.categories.forEach((cat, ci) => {
      const catEl = createTreeItem(cat.name, 'cat', [
        { label: 'Edit', action: () => openCategoryEditor(ci) },
        { label: 'Hapus', action: () => deleteItem('category', ci), className: 'btn-delete' }
      ]);

      const catChildren = document.createElement('div');
      catChildren.className = 'tree-children';

      (cat.subcategories || []).forEach((sub, si) => {
        const subEl = createTreeItem(sub.name, 'sub', [
          { label: 'Edit', action: () => openSubcategoryEditor(ci, si) },
          { label: 'Hapus', action: () => deleteItem('subcategory', ci, si), className: 'btn-delete' }
        ]);

        const subChildren = document.createElement('div');
        subChildren.className = 'tree-children';

        (sub.products || []).forEach((prod, pi) => {
          const prodEl = createTreeItem(prod.name, 'prod', [
            { label: 'Edit', action: () => openProductEditor(ci, si, pi) },
            { label: 'Hapus', action: () => deleteItem('product', ci, si, pi), className: 'btn-delete' }
          ]);

          const prodChildren = document.createElement('div');
          prodChildren.className = 'tree-children';

          (prod.variants || []).forEach((v, vi) => {
            const vEl = createTreeItem(v.name, 'prod', [
              { label: 'Edit', action: () => openVariantEditor(ci, si, pi, vi) },
              { label: 'Hapus', action: () => deleteItem('variant', ci, si, pi, vi), className: 'btn-delete' }
            ]);
            prodChildren.appendChild(vEl);
          });

          const addVariantBtn = document.createElement('button');
          addVariantBtn.className = 'btn btn-sm';
          addVariantBtn.style.cssText = 'margin: 8px; width: calc(100% - 16px);';
          addVariantBtn.textContent = '+ Tambah Varian';
          addVariantBtn.onclick = () => addVariant(ci, si, pi);
          prodChildren.appendChild(addVariantBtn);

          prodEl.querySelector('.tree-header').addEventListener('click', () => {
            prodChildren.classList.toggle('open');
          });

          subChildren.appendChild(prodEl);
          subChildren.appendChild(prodChildren);
        });

        const addProdBtn = document.createElement('button');
        addProdBtn.className = 'btn btn-sm';
        addProdBtn.style.cssText = 'margin: 8px; width: calc(100% - 16px);';
        addProdBtn.textContent = '+ Tambah Produk';
        addProdBtn.onclick = () => addProduct(ci, si);
        subChildren.appendChild(addProdBtn);

        subEl.querySelector('.tree-header').addEventListener('click', () => {
          subChildren.classList.toggle('open');
        });

        catChildren.appendChild(subEl);
        catChildren.appendChild(subChildren);
      });

      const addSubBtn = document.createElement('button');
      addSubBtn.className = 'btn btn-sm';
      addSubBtn.style.cssText = 'margin: 8px; width: calc(100% - 16px);';
      addSubBtn.textContent = '+ Tambah Subkategori';
      addSubBtn.onclick = () => addSubcategory(ci);
      catChildren.appendChild(addSubBtn);

      catEl.querySelector('.tree-header').addEventListener('click', () => {
        catChildren.classList.toggle('open');
      });

      container.appendChild(catEl);
      container.appendChild(catChildren);
    });

    const addCatBtn = document.createElement('button');
    addCatBtn.className = 'btn btn-primary';
    addCatBtn.style.cssText = 'margin-top: 16px;';
    addCatBtn.textContent = '+ Tambah Kategori Baru';
    addCatBtn.onclick = addCategory;
    container.appendChild(addCatBtn);
  }

  function createTreeItem(name, type, actions) {
    const el = document.createElement('div');
    el.className = 'tree-item';

    const actionsHtml = actions.map(a =>
      `<button class="${a.className || ''}">${a.label}</button>`
    ).join('');

    el.innerHTML = `
      <div class="tree-header">
        <div class="tree-label">
          <span class="tree-badge ${type}">${type.toUpperCase()}</span>
          <strong>${name}</strong>
        </div>
        <div class="tree-actions">${actionsHtml}</div>
      </div>
    `;

    el.querySelectorAll('.tree-actions button').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        actions[i].action();
      });
    });

    return el;
  }

  // --- EDITORS (MODALS) ---
  function openModal(title) {
    $('#modal-title').textContent = title;
    $('#modal-overlay').classList.add('open');
  }

  function closeModal() {
    $('#modal-overlay').classList.remove('open');
    $('#modal-body').innerHTML = '';
  }

  function openCategoryEditor(ci) {
    const cat = editedData.categories[ci];
    openModal('Edit Kategori: ' + cat.name);

    $('#modal-body').innerHTML = `
      <div class="form-group"><label>Nama Kategori</label><input id="ed-cat-name" value="${cat.name}"></div>
      <div class="form-group"><label>Slug</label><input id="ed-cat-slug" value="${cat.slug}"></div>
      <div class="form-group"><label>Label</label><input id="ed-cat-label" value="${cat.label || ''}"></div>
      <div class="form-group"><label>Deskripsi</label><textarea id="ed-cat-desc">${cat.description || ''}</textarea></div>
      <div class="form-group"><label>CTA Text</label><input id="ed-cat-cta" value="${cat.cta || ''}"></div>
      <div class="form-group"><label>WhatsApp CTA</label><input id="ed-cat-wacta" value="${cat.waCta || ''}"></div>
    `;

    $('#modal-save').onclick = () => {
      cat.name = $('#ed-cat-name').value;
      cat.slug = $('#ed-cat-slug').value;
      cat.label = $('#ed-cat-label').value;
      cat.description = $('#ed-cat-desc').value;
      cat.cta = $('#ed-cat-cta').value;
      cat.waCta = $('#ed-cat-wacta').value;
      saveLocal();
      renderProductTree();
      closeModal();
      showStatus('Kategori diperbarui', 'success');
    };
  }

  function openSubcategoryEditor(ci, si) {
    const sub = editedData.categories[ci].subcategories[si];
    openModal('Edit Subkategori: ' + sub.name);

    $('#modal-body').innerHTML = `
      <div class="form-group"><label>Nama Subkategori</label><input id="ed-sub-name" value="${sub.name}"></div>
      <div class="form-group"><label>Slug</label><input id="ed-sub-slug" value="${sub.slug}"></div>
      <div class="form-group"><label>Deskripsi</label><textarea id="ed-sub-desc">${sub.description || ''}</textarea></div>
    `;

    $('#modal-save').onclick = () => {
      sub.name = $('#ed-sub-name').value;
      sub.slug = $('#ed-sub-slug').value;
      sub.description = $('#ed-sub-desc').value;
      saveLocal();
      renderProductTree();
      closeModal();
      showStatus('Subkategori diperbarui', 'success');
    };
  }

  function openProductEditor(ci, si, pi) {
    const prod = editedData.categories[ci].subcategories[si].products[pi];
    openModal('Edit Produk: ' + prod.name);

    $('#modal-body').innerHTML = `
      <div class="form-group"><label>Nama Produk</label><input id="ed-prod-name" value="${prod.name}"></div>
      <div class="form-group"><label>Slug</label><input id="ed-prod-slug" value="${prod.slug}"></div>
      <div class="form-group"><label>Brand</label><input id="ed-prod-brand" value="${prod.brand || ''}"></div>
      <div class="form-group"><label>Deskripsi</label><textarea id="ed-prod-desc">${prod.description || ''}</textarea></div>
      <div class="form-group"><label>Aplikasi</label><input id="ed-prod-app" value="${prod.application || ''}"></div>
      <div class="form-group"><label>Aliases (pisahkan koma)</label><input id="ed-prod-aliases" value="${(prod.aliases || []).join(', ')}"></div>
      <div class="form-group"><label>CTA</label><input id="ed-prod-cta" value="${prod.cta || ''}"></div>
      <div class="form-group">
        <label>Gambar Produk</label>
        <input type="file" id="ed-prod-image" accept="image/*">
        ${prod.image ? `<div style="margin-top:8px"><img src="${prod.image}" style="max-width:200px;border-radius:8px;border:1px solid var(--line)"></div>` : ''}
      </div>
    `;

    const imageInput = $('#ed-prod-image');
    let newImageData = prod.image || null;

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        newImageData = reader.result;
        const preview = document.createElement('div');
        preview.style.cssText = 'margin-top:8px';
        preview.innerHTML = `<img src="${newImageData}" style="max-width:200px;border-radius:8px;border:1px solid var(--line)">`;
        imageInput.parentElement.appendChild(preview);
      };
      reader.readAsDataURL(file);
    });

    $('#modal-save').onclick = () => {
      prod.name = $('#ed-prod-name').value;
      prod.slug = $('#ed-prod-slug').value;
      prod.brand = $('#ed-prod-brand').value;
      prod.description = $('#ed-prod-desc').value;
      prod.application = $('#ed-prod-app').value;
      prod.aliases = $('#ed-prod-aliases').value.split(',').map(a => a.trim()).filter(Boolean);
      prod.cta = $('#ed-prod-cta').value;
      if (newImageData) prod.image = newImageData;
      saveLocal();
      renderProductTree();
      closeModal();
      showStatus('Produk diperbarui', 'success');
    };
  }

  function openVariantEditor(ci, si, pi, vi) {
    const variant = editedData.categories[ci].subcategories[si].products[pi].variants[vi];
    openModal('Edit Varian: ' + variant.name);

    const specs = Object.entries(variant.specifications || {});
    let specsHtml = specs.map(([k, v]) => `
      <div class="spec-row">
        <input class="spec-key" value="${k}" placeholder="Nama">
        <input class="spec-val" value="${v}" placeholder="Nilai">
        <button class="btn-remove-spec" onclick="this.parentElement.remove()">x</button>
      </div>
    `).join('');

    $('#modal-body').innerHTML = `
      <div class="form-group"><label>Nama Varian</label><input id="ed-var-name" value="${variant.name}"></div>
      <div class="form-group">
        <label>Spesifikasi</label>
        <div id="specs-container">${specsHtml}</div>
        <button class="btn btn-sm" style="margin-top:8px" id="add-spec-btn">+ Tambah Spesifikasi</button>
      </div>
    `;

    $('#add-spec-btn').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'spec-row';
      row.innerHTML = `
        <input class="spec-key" placeholder="Nama">
        <input class="spec-val" placeholder="Nilai">
        <button class="btn-remove-spec" onclick="this.parentElement.remove()">x</button>
      `;
      $('#specs-container').appendChild(row);
    });

    $('#modal-save').onclick = () => {
      variant.name = $('#ed-var-name').value;
      variant.specifications = {};
      $$('#specs-container .spec-row').forEach(row => {
        const key = row.querySelector('.spec-key').value.trim();
        const val = row.querySelector('.spec-val').value.trim();
        if (key) variant.specifications[key] = val;
      });
      saveLocal();
      renderProductTree();
      closeModal();
      showStatus('Varian diperbarui', 'success');
    };
  }

  // --- ADD / DELETE ---
  function addCategory() {
    const name = prompt('Nama kategori baru:');
    if (!name) return;
    editedData.categories.push({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      label: 'Kategori ' + (editedData.categories.length + 1).toString().padStart(2, '0'),
      name: name,
      waCta: 'Tanya Harga ' + name,
      description: 'Deskripsi ' + name,
      cta: 'Lihat Produk ' + name,
      subcategories: []
    });
    saveLocal();
    renderProductTree();
    showStatus('Kategori ditambahkan', 'success');
  }

  function addSubcategory(ci) {
    const name = prompt('Nama subkategori baru:');
    if (!name) return;
    editedData.categories[ci].subcategories.push({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      description: 'Deskripsi ' + name,
      products: []
    });
    saveLocal();
    renderProductTree();
    showStatus('Subkategori ditambahkan', 'success');
  }

  function addProduct(ci, si) {
    const name = prompt('Nama produk baru:');
    if (!name) return;
    editedData.categories[ci].subcategories[si].products.push({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      brand: '',
      description: 'Deskripsi ' + name,
      application: '',
      aliases: [],
      variants: []
    });
    saveLocal();
    renderProductTree();
    showStatus('Produk ditambahkan', 'success');
  }

  function addVariant(ci, si, pi) {
    const name = prompt('Nama varian baru:');
    if (!name) return;
    editedData.categories[ci].subcategories[si].products[pi].variants.push({
      name: name,
      specifications: {}
    });
    saveLocal();
    renderProductTree();
    showStatus('Varian ditambahkan', 'success');
  }

  function deleteItem(type, ci, si, pi, vi) {
    const labels = { category: 'kategori', subcategory: 'subkategori', product: 'produk', variant: 'varian' };
    if (!confirm(`Hapus ${labels[type]} ini?`)) return;

    if (type === 'category') editedData.categories.splice(ci, 1);
    else if (type === 'subcategory') editedData.categories[ci].subcategories.splice(si, 1);
    else if (type === 'product') editedData.categories[ci].subcategories[si].products.splice(pi, 1);
    else if (type === 'variant') editedData.categories[ci].subcategories[si].products[pi].variants.splice(vi, 1);

    saveLocal();
    renderProductTree();
    showStatus(labels[type].charAt(0).toUpperCase() + labels[type].slice(1) + ' dihapus', 'success');
  }

  // --- IMAGE EDITOR ---
  function renderImageEditor() {
    const container = $('#image-editor-content');
    container.innerHTML = '';

    const allProducts = [];
    editedData.categories.forEach((cat, ci) => {
      (cat.subcategories || []).forEach((sub, si) => {
        (sub.products || []).forEach((prod, pi) => {
          allProducts.push({ cat, sub, prod, ci, si, pi });
        });
      });
    });

    if (allProducts.length === 0) {
      container.innerHTML = '<p style="color:var(--muted)">Belum ada produk. Tambahkan produk di tab Produk terlebih dahulu.</p>';
      return;
    }

    allProducts.forEach(({ cat, sub, prod, ci, si, pi }) => {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.innerHTML = `
        <h2>${cat.name} / ${sub.name} / ${prod.name}</h2>
        <div class="image-upload-area" data-ci="${ci}" data-si="${si}" data-pi="${pi}">
          <span class="upload-icon">📁</span>
          <p>Klik atau seret gambar ke sini</p>
          <input type="file" accept="image/*" style="display:none">
        </div>
        ${prod.image ? `
          <div class="image-preview-grid">
            <div class="image-preview-item">
              <img src="${prod.image}" alt="${prod.name}">
              <button class="remove-image" data-ci="${ci}" data-si="${si}" data-pi="${pi}">x</button>
            </div>
          </div>
        ` : '<p style="color:var(--muted);font-size:13px">Belum ada gambar</p>'}
      `;
      container.appendChild(card);
    });

    container.querySelectorAll('.image-upload-area').forEach(area => {
      const input = area.querySelector('input[type="file"]');
      area.addEventListener('click', () => input.click());
      area.addEventListener('dragover', (e) => { e.preventDefault(); area.style.borderColor = 'var(--orange)'; });
      area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.borderColor = '';
        handleImageUpload(e.dataTransfer.files[0], area.dataset);
      });
      input.addEventListener('change', (e) => {
        if (e.target.files[0]) handleImageUpload(e.target.files[0], area.dataset);
      });
    });

    container.querySelectorAll('.remove-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { ci, si, pi } = btn.dataset;
        delete editedData.categories[ci].subcategories[si].products[pi].image;
        saveLocal();
        renderImageEditor();
        showStatus('Gambar dihapus', 'success');
      });
    });
  }

  function handleImageUpload(file, { ci, si, pi }) {
    if (!file.type.startsWith('image/')) {
      showStatus('File harus berupa gambar', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus('Ukuran gambar maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const ext = file.name.split('.').pop();
      const slug = editedData.categories[ci].subcategories[si].products[pi].slug;
      const filename = `assets/images/${slug}.${ext}`;

      imageFiles[filename] = reader.result;

      editedData.categories[ci].subcategories[si].products[pi].image = filename;
      saveLocal();
      renderImageEditor();
      showStatus(`Gambar ${file.name} ditambahkan`, 'success');
    };
    reader.readAsDataURL(file);
  }

  // --- JSON EDITOR ---
  function renderJsonEditor() {
    const editor = $('#json-editor');
    editor.value = JSON.stringify(editedData, null, 2);
  }

  // ========== SAVE / LOAD LOCAL ==========
  function saveLocal() {
    localStorage.setItem('abahantok_data', JSON.stringify(editedData));
  }

  // ========== PREVIEW ==========
  function previewLocal() {
    showStatus('Membuat preview...');

    fetch('index.html').then(r => r.text()).then(html => {
      fetch('app.js').then(r => r.text()).then(appJs => {
        fetch('style.css').then(r => r.text()).then(css => {
          const dataStr = JSON.stringify(editedData);

          let modifiedHtml = html;

          modifiedHtml = modifiedHtml.replace(
            '<link rel="stylesheet" href="style.css">',
            `<style>${css}</style>`
          );

          // Inject preview data BEFORE app.js loads; loadData() checks window.__PREVIEW_DATA__
          modifiedHtml = modifiedHtml.replace(
            '<script src="app.js"></script>',
            `<script>window.__PREVIEW_DATA__ = ${dataStr};</script>\n<script>${appJs}</script>`
          );

          // Replace image paths with data URLs for preview
          Object.entries(imageFiles).forEach(([filename, dataUrl]) => {
            modifiedHtml = modifiedHtml.split(`src="${filename}"`).join(`src="${dataUrl}"`);
          });

          const blob = new Blob([modifiedHtml], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          showStatus('Preview dibuka di tab baru', 'success');
        });
      });
    }).catch(err => {
      showStatus('Gagal membuat preview: ' + err.message, 'error');
    });
  }

  // ========== GITHUB PUSH ==========
  async function pushToGitHub() {
    const token = localStorage.getItem('abahantok_token');
    if (!token) {
      alert('GitHub token belum diatur. Silakan login ulang dan masukkan token.');
      return;
    }

    if (!confirm('Push perubahan ke GitHub? Website akan otomatis update.')) return;

    showStatus('Pushing ke GitHub...');

    try {
      const filesToPush = [];

      // Static files yang perlu di-update agar website live selalu sinkron
      const staticFiles = ['index.html', 'app.js', 'style.css', 'abahantok.html', 'admin-auth.js', 'admin-style.css'];
      for (const f of staticFiles) {
        try {
          const content = await fetch(f).then(r => { if (!r.ok) throw new Error(); return r.text(); });
          filesToPush.push({
            path: f,
            content: btoa(unescape(encodeURIComponent(content))),
            sha: await getFileSha(f, token)
          });
        } catch (err) {
          console.warn('Lewati file (tidak ada lokal):', f);
        }
      }

      // data.json
      const dataContent = JSON.stringify(editedData, null, 2);
      const dataSha = await getFileSha('data.json', token);
      filesToPush.push({
        path: 'data.json',
        content: btoa(unescape(encodeURIComponent(dataContent))),
        sha: dataSha
      });

      // images
      for (const [filename, dataUrl] of Object.entries(imageFiles)) {
        const base64 = dataUrl.split(',')[1];
        const imgSha = await getFileSha(filename, token);
        filesToPush.push({
          path: filename,
          content: base64,
          sha: imgSha
        });
      }

      // commit
      const commitMsg = `Update via admin: ${new Date().toLocaleString('id-ID')}`;
      const resp = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filesToPush[0].path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: commitMsg,
            branch: BRANCH,
            content: filesToPush[0].content,
            sha: filesToPush[0].sha
          })
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || 'Push gagal');
      }

      // push additional files one by one
      for (let i = 1; i < filesToPush.length; i++) {
        const f = filesToPush[i];
        const r2 = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${f.path}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: commitMsg,
              branch: BRANCH,
              content: f.content,
              sha: f.sha
            })
          }
        );
        if (!r2.ok) {
          const err2 = await r2.json();
          console.error('Gagal push', f.path, err2);
        }
      }

      // update local base
      siteData = deepClone(editedData);
      localStorage.setItem('abahantok_data', JSON.stringify(siteData));
      imageFiles = {};

      showStatus('Berhasil di-push ke GitHub! Website akan update dalam 1-2 menit.', 'success');
    } catch (err) {
      showStatus('Gagal push: ' + err.message, 'error');
      console.error(err);
    }
  }

  async function getFileSha(path, token) {
    try {
      const resp = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`,
        { headers: { 'Authorization': `token ${token}` } }
      );
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.sha || null;
    } catch {
      return null;
    }
  }

  // ========== TOKEN MANAGEMENT ==========
  function initToken() {
    const saved = localStorage.getItem('abahantok_token');
    if (saved) {
      $('#token-status').textContent = 'Token tersimpan';
      $('#token-status').style.color = 'var(--success)';
    }

    $('#save-token-btn').addEventListener('click', () => {
      const token = $('#github-token-input').value.trim();
      if (!token) {
        alert('Masukkan token GitHub');
        return;
      }
      localStorage.setItem('abahantok_token', token);
      $('#token-status').textContent = 'Token tersimpan!';
      $('#token-status').style.color = 'var(--success)';
      $('#github-token-input').value = '';
      showStatus('GitHub token disimpan', 'success');
    });
  }

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initToken();

    // Tab switching
    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        $(`#${btn.dataset.tab}`).classList.add('active');

        if (btn.dataset.tab === 'tab-json') renderJsonEditor();
      });
    });

    // Modal
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Action buttons
    $('#btn-preview').addEventListener('click', previewLocal);
    $('#btn-push').addEventListener('click', pushToGitHub);
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('Reset semua perubahan ke data.json asli?')) {
        localStorage.removeItem('abahantok_data');
        imageFiles = {};
        loadData();
        showStatus('Data di-reset', 'success');
      }
    });

    // JSON editor save
    $('#json-save-btn')?.addEventListener('click', () => {
      try {
        editedData = JSON.parse($('#json-editor').value);
        saveLocal();
        renderAllEditors();
        showStatus('JSON disimpan', 'success');
      } catch (err) {
        showStatus('JSON tidak valid: ' + err.message, 'error');
      }
    });

    // Export data.json
    $('#btn-export')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(editedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.json';
      a.click();
      URL.revokeObjectURL(url);
      showStatus('data.json di-export', 'success');
    });

    // Import data.json
    $('#btn-import')?.addEventListener('click', () => {
      $('#import-file').click();
    });

    $('#import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          editedData = JSON.parse(reader.result);
          saveLocal();
          renderAllEditors();
          showStatus('data.json di-import', 'success');
        } catch (err) {
          showStatus('File JSON tidak valid', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Logout
    $('#btn-logout')?.addEventListener('click', () => {
      if (confirm('Keluar dari admin?')) {
        localStorage.removeItem('abahantok_auth');
        location.reload();
      }
    });
  });

})();
