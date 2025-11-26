/* products.js
   - Stores products under StorageService key 'products'
   - Admin CRUD: Add/Edit/Delete product (images stored as base64)
   - Search, filter, paginate
*/

(() => {
  const STORE = window.App.StorageService;
  const PRODUCTS_KEY = 'products';
  const VERSION = 'v1';

  const defaultProducts = [
    {
      id: 'p_' + Date.now(),
      title: 'Classic Leather Wallet',
      slug: 'classic-leather-wallet',
      description: 'Premium genuine leather wallet, multiple card slots.',
      price: 1499,
      category: 'Accessories',
      images: [],
      stock: 25,
      createdAt: new Date().toISOString()
    }
  ];

  function ensureSeed() {
    const existing = STORE.get(PRODUCTS_KEY, VERSION);
    if (!existing) {
      STORE.set(PRODUCTS_KEY, defaultProducts, VERSION);
    }
  }

  function readProducts() {
    return STORE.get(PRODUCTS_KEY, VERSION) || [];
  }

  function writeProducts(list) {
    STORE.set(PRODUCTS_KEY, list, VERSION);
  }

  function addProduct(obj) {
    const list = readProducts();
    obj.id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    obj.slug = obj.slug || window.App.slugify(obj.title);
    obj.createdAt = new Date().toISOString();
    list.unshift(obj);
    writeProducts(list);
  }

  function updateProduct(id, patch) {
    const list = readProducts();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Not found');
    list[idx] = Object.assign({}, list[idx], patch);
    writeProducts(list);
  }

  function deleteProduct(id) {
    const list = readProducts().filter(p => p.id !== id);
    writeProducts(list);
  }

  // UI
  const elList = document.getElementById('product-list');
  const elSearch = document.getElementById('search');
  const elCategory = document.getElementById('category-filter');
  const elPagination = document.getElementById('pagination');
  const btnNew = document.getElementById('btn-new-product');
  const btnImport = document.getElementById('btn-import');
  const btnExport = document.getElementById('btn-export');

  let state = { q:'', category:'', page:1, perPage:12 };

  function buildCategoryOptions() {
    const cats = new Set(readProducts().map(p => p.category).filter(Boolean));
    elCategory.innerHTML = '<option value="">All categories</option>' + [...cats].map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function render() {
    const all = readProducts();
    buildCategoryOptions();
    let filtered = all.slice();

    if (state.q) {
      const q = state.q.toLowerCase();
      filtered = filtered.filter(p => (p.title+p.description+(p.category||'')).toLowerCase().includes(q));
    }
    if (state.category) filtered = filtered.filter(p => p.category === state.category);

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > pages) state.page = pages;

    const start = (state.page-1)*state.perPage;
    const paged = filtered.slice(start, start + state.perPage);

    elList.innerHTML = paged.map(p => {
      const img = p.images && p.images[0] ? p.images[0] : 'data:image/svg+xml;base64,' + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#efefef'/><text x='50%' y='50%' alignment-baseline='middle' text-anchor='middle' fill='#999' font-size='20'>No Image</text></svg>`);
      return `
      <div class="card">
        <img src="${img}" alt="${p.title}" loading="lazy"/>
        <h4>${p.title}</h4>
        <div>${p.category || ''}</div>
        <div class="price">${window.App.currency(p.price)}</div>
        <div class="actions">
          <button class="btn" data-action="view" data-id="${p.id}">View</button>
          <button class="btn secondary" data-action="add" data-id="${p.id}">Add to cart</button>
          <button class="btn secondary" data-action="edit" data-id="${p.id}">Edit</button>
        </div>
      </div>`;
    }).join('');

    // pagination
    let pagHtml = '';
    for (let i=1;i<=pages;i++){
      pagHtml += `<button class="btn ${i===state.page?'active':''}" data-page="${i}">${i}</button>`;
    }
    elPagination.innerHTML = pagHtml || '';
    updateCartCount();
  }

  function updateCartCount() {
    const c = STORE.get('cart', 'v1') || [];
    const el = document.getElementById('cart-count');
    if (el) el.textContent = c.reduce((s,i)=>s+i.qty,0);
  }

  // events
  elList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const products = readProducts();
    const prod = products.find(p=>p.id===id);
    if (action === 'add') {
      const cart = STORE.get('cart', 'v1') || [];
      const existing = cart.find(i=>i.product===id);
      if (existing) existing.qty += 1;
      else cart.push({ product: id, title: prod.title, price: prod.price, qty: 1, image: prod.images?.[0] || null });
      STORE.set('cart', cart, 'v1');
      updateCartCount();
      alert('Added to cart');
    } else if (action === 'view') {
      window.location.href = `product.html?id=${id}`;
    } else if (action === 'edit') {
      openModal(prod);
    }
  });

  elPagination.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    state.page = Number(btn.dataset.page);
    render();
  });

  elSearch.addEventListener('input', debounce((ev) => {
    state.q = ev.target.value.trim();
    state.page = 1;
    render();
  }, 300));

  elCategory.addEventListener('change', (ev) => {
    state.category = ev.target.value;
    state.page = 1;
    render();
  });

  btnNew.addEventListener('click', ()=> openModal());

  btnExport.addEventListener('click', ()=> {
    const data = readProducts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products_export.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  btnImport.addEventListener('click', ()=> {
    const input = document.createElement('input'); input.type='file'; input.accept='application/json';
    input.onchange = async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const txt = await file.text();
      try {
        const arr = JSON.parse(txt);
        if (!Array.isArray(arr)) throw new Error('Invalid file');
        // simple merge (prepend)
        const existing = readProducts();
        writeProducts(arr.concat(existing));
        alert('Imported ' + arr.length + ' products');
        render();
      } catch (err) { alert('Import failed: '+err.message); }
    };
    input.click();
  });

  // Modal form logic
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const form = document.getElementById('product-form');
  const deleteBtn = document.getElementById('delete-product');
  let editingId = null;

  function openModal(product = null) {
    modal.classList.remove('hidden');
    editingId = product ? product.id : null;
    document.getElementById('modal-title').textContent = product ? 'Edit product' : 'Add product';
    form.title.value = product?.title || '';
    form.price.value = product?.price || '';
    form.category.value = product?.category || '';
    form.stock.value = product?.stock || 0;
    form.description.value = product?.description || '';
    deleteBtn.classList.toggle('hidden', !product);
  }
  function closeModal() {
    modal.classList.add('hidden');
    editingId = null;
    form.reset();
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if (e.target === modal) closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const obj = {
      title: fd.get('title').trim(),
      price: Number(fd.get('price')),
      category: fd.get('category').trim(),
      stock: Number(fd.get('stock')),
      description: fd.get('description').trim(),
      images: []
    };
    const file = fd.get('image');
    if (file && file.size) {
      const base64 = await toBase64(file);
      obj.images = [base64];
    }
    if (editingId) {
      updateProduct(editingId, obj);
      alert('Updated');
    } else {
      addProduct(obj);
      alert('Created');
    }
    closeModal();
    render();
  });

  deleteBtn.addEventListener('click', ()=> {
    if (!editingId) return;
    if (!confirm('Delete this product?')) return;
    deleteProduct(editingId);
    closeModal();
    render();
  });

  function toBase64(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // init
  ensureSeed();
  render();

  // watch product storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.indexOf('ecom_products_v1_changed') !== -1) {
      render();
    }
    if (e.key && e.key.indexOf('ecom_cart_v1_changed') !== -1) updateCartCount();
  });
})();
