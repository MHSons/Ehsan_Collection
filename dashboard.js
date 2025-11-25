/* dashboard.js - products, banks, orders, admins management (localStorage) */

const KEY_PRODUCTS = 'ehsan_products_v1';
const KEY_BANKS = 'ehsan_banks_v1';
const KEY_ORDERS = 'ehsan_orders_v1';
const KEY_ADMINS = 'ehsan_admins_v1';
const KEY_ADMIN_LOGGED = 'ehsan_admin_logged';

function $id(id){ return document.getElementById(id); }

// Auth check
const logged = JSON.parse(localStorage.getItem(KEY_ADMIN_LOGGED) || 'null');
if(!logged){ window.location.href = 'admin.html'; }

// Navigation
['menu-products','menu-banks','menu-orders','menu-admins'].forEach(id=>{
  const el = $id(id);
  if(el) el.addEventListener('click', (e)=>{ e.preventDefault(); showView(id.replace('menu-','view-')); });
});
function showView(v){
  document.querySelectorAll('.view').forEach(x=> x.classList.add('hidden'));
  const target = $id('view-' + v.replace('view-',''));
  if(target) target.classList.remove('hidden');
  // refresh lists
  renderProductsList(); renderBanksList(); renderOrders(); renderAdmins();
}
showView('products');

// PRODUCTS management (with image upload -> dataURL)
function loadProducts(){ return JSON.parse(localStorage.getItem(KEY_PRODUCTS) || '[]'); }
function saveProducts(list){ localStorage.setItem(KEY_PRODUCTS, JSON.stringify(list)); }

$id('save-product').addEventListener('click', async ()=>{
  const id = $id('prod-id').value || ('p' + Date.now());
  const title = $id('prod-title').value.trim();
  const price = parseFloat($id('prod-price').value) || 0;
  const desc = $id('prod-desc').value.trim();
  const qty = parseInt($id('prod-qty').value) || 0;
  // handle file
  const fileInput = $id('prod-image');
  let imageUrl = '';
  if(fileInput.files && fileInput.files[0]){
    const f = fileInput.files[0];
    imageUrl = await toDataURL(f);
  }
  const products = loadProducts();
  const idx = products.findIndex(p => p.id === id);
  const entry = { id, title, price, desc, qty, image: imageUrl || (products[idx] && products[idx].image) || 'assets/product-placeholder.png' };
  if(idx >= 0) products[idx] = entry; else products.push(entry);
  saveProducts(products);
  resetProductForm();
  renderProductsList();
  alert('Product saved.');
});

$id('reset-product').addEventListener('click', resetProductForm);
function resetProductForm(){
  $id('prod-id').value=''; $id('prod-title').value=''; $id('prod-price').value=''; $id('prod-desc').value=''; $id('prod-qty').value=''; $id('prod-image').value='';
}

// Render list
function renderProductsList(){
  const wrap = $id('product-list'); wrap.innerHTML = '';
  const products = loadProducts();
  if(products.length===0) { wrap.innerHTML = '<div>No products</div>'; return; }
  products.forEach(p=>{
    const row = document.createElement('div'); row.className='list-row';
    row.innerHTML = `<div style="display:flex; align-items:center;">
      <img src="${p.image}" onerror="this.src='assets/product-placeholder.png'"/>
      <div>
        <div class="font-semibold">${p.title}</div>
        <div class="text-sm text-gray-500">PKR ${p.price} • Stock: ${p.qty}</div>
      </div>
    </div>
    <div>
      <button class="small-btn" data-id="${p.id}" data-act="edit">Edit</button>
      <button class="small-btn" data-id="${p.id}" data-act="del">Delete</button>
    </div>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('button').forEach(b=> b.addEventListener('click', (e)=>{
    const act = b.dataset.act; const id = b.dataset.id;
    if(act==='edit'){ editProduct(id); } else if(act==='del'){ if(confirm('Delete product?')) deleteProduct(id); }
  }));
}
function editProduct(id){
  const products = loadProducts();
  const p = products.find(x=>x.id===id); if(!p) return;
  $id('prod-id').value = p.id; $id('prod-title').value = p.title; $id('prod-price').value = p.price; $id('prod-desc').value = p.desc; $id('prod-qty').value = p.qty;
}
function deleteProduct(id){
  const products = loadProducts().filter(x=>x.id!==id); saveProducts(products); renderProductsList(); alert('Deleted');
}
function toDataURL(file){ return new Promise((res,rej)=>{
  const r = new FileReader();
  r.onload = ()=> res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
}); }

// BANKS management
function loadBanks(){ return JSON.parse(localStorage.getItem(KEY_BANKS) || '[]'); }
function saveBanks(list){ localStorage.setItem(KEY_BANKS, JSON.stringify(list)); }

$id('save-bank').addEventListener('click', ()=>{
  const id = $id('bank-id').value || ('b' + Date.now());
  const name = $id('bank-name').value.trim();
  const acc = $id('bank-account').value.trim();
  const iban = $id('bank-iban').value.trim();
  if(!name || !acc){ alert('Provide bank name and account'); return; }
  const list = loadBanks(); const idx = list.findIndex(x=>x.id===id);
  const entry = { id, name, acc, iban };
  if(idx>=0) list[idx]=entry; else list.push(entry);
  saveBanks(list); resetBankForm(); renderBanksList(); alert('Bank saved');
});
$id('reset-bank').addEventListener('click', resetBankForm);
function resetBankForm(){ $id('bank-id').value=''; $id('bank-name').value=''; $id('bank-account').value=''; $id('bank-iban').value=''; }
function renderBanksList(){
  const wrap = $id('bank-list'); wrap.innerHTML='';
  const banks = loadBanks();
  if(banks.length===0){ wrap.innerHTML='<div>No banks saved</div>'; return; }
  banks.forEach(b=>{
    const row = document.createElement('div'); row.className='list-row';
    row.innerHTML = `<div><div class="font-semibold">${b.name}</div><div class="text-sm">${b.acc} ${b.iban?(' • IBAN: '+b.iban):''}</div></div>
      <div><button class="small-btn" data-id="${b.id}" data-act="edit">Edit</button><button class="small-btn" data-id="${b.id}" data-act="del">Del</button></div>`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{
    const act=b.dataset.act, id=b.dataset.id;
    if(act==='edit'){ const banks=loadBanks(); const item = banks.find(x=>x.id===id); if(item){ $id('bank-id').value=item.id; $id('bank-name').value=item.name; $id('bank-account').value=item.acc; $id('bank-iban').value=item.iban; } }
    if(act==='del'){ if(confirm('Delete bank?')){ saveBanks(loadBanks().filter(x=>x.id!==id)); renderBanksList(); } }
  }));
}

// ORDERS
function loadOrders(){ return JSON.parse(localStorage.getItem(KEY_ORDERS) || '[]'); }
function renderOrders(){
  const wrap = $id('orders-list'); wrap.innerHTML='';
  const orders = loadOrders().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  if(orders.length===0){ wrap.innerHTML = '<div>No orders yet</div>'; return; }
  orders.forEach(o=>{
    const div = document.createElement('div'); div.className='card mb-3';
    div.innerHTML = `<div class="flex items-start justify-between"><div>
      <div class="font-semibold">Order ${o.id} (${o.status})</div>
      <div class="text-sm text-gray-600">${new Date(o.createdAt).toLocaleString()}</div>
      <div class="mt-2">Name: ${o.name} • Phone: ${o.phone}</div>
      <div>Address: ${o.address}</div>
      <div>Transaction: ${o.transaction || 'N/A'}</div>
      <div class="mt-2 font-semibold">Items:</div>
      <ul>${o.items.map(it=>`<li>${it.title} x${it.qty} = PKR ${ (it.price||0)*it.qty }</li>`).join('')}</ul>
      <div class="mt-2 font-bold">Total: PKR ${o.total}</div>
    </div>
    <div>
      <button class="small-btn" data-id="${o.id}" data-act="mark">Mark Complete</button>
      <button class="small-btn" data-id="${o.id}" data-act="del">Delete</button>
    </div></div>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{
    const act=b.dataset.act, id=b.dataset.id;
    if(act==='mark'){
      const orders=loadOrders(); const idx = orders.findIndex(x=>x.id===id); if(idx>=0){ orders[idx].status='completed'; localStorage.setItem(KEY_ORDERS, JSON.stringify(orders)); renderOrders(); }
    } else if(act==='del'){ if(confirm('Delete order?')){ const orders=loadOrders().filter(x=>x.id!==id); localStorage.setItem(KEY_ORDERS, JSON.stringify(orders)); renderOrders(); } }
  }));
}

$id('download-orders').addEventListener('click', ()=>{
  const orders = loadOrders();
  if(orders.length===0){ alert('No orders'); return; }
  // create CSV
  const rows = [['OrderID','Name','Phone','Address','Transaction','Total','Items','Date','Status']];
  orders.forEach(o=>{
    const itemsText = o.items.map(i=> `${i.title} x${i.qty}`).join('; ');
    rows.push([o.id, o.name, o.phone, o.address, (o.transaction||''), o.total, itemsText, o.createdAt, o.status]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
});

// ADMINS
function loadAdmins(){ return JSON.parse(localStorage.getItem(KEY_ADMINS) || '[]'); }
function saveAdmins(list){ localStorage.setItem(KEY_ADMINS, JSON.stringify(list)); }
function renderAdmins(){
  const wrap = $id('admin-list'); wrap.innerHTML='';
  const list = loadAdmins();
  if(list.length===0){ wrap.innerHTML = '<div>No admins</div>'; return; }
  list.forEach((a, idx)=>{
    const div = document.createElement('div'); div.className='list-row';
    div.innerHTML = `<div>${a.username} • ${a.role}</div><div><button class="small-btn" data-i="${idx}" data-act="del">Delete</button></div>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{
    const idx = parseInt(b.dataset.i);
    if(confirm('Delete admin?')){ const l = loadAdmins(); l.splice(idx,1); saveAdmins(l); renderAdmins(); }
  }));
}

$id('add-admin').addEventListener('click', ()=>{
  const u = $id('new-admin-username').value.trim();
  const p = $id('new-admin-password').value.trim();
  const r = $id('new-admin-role').value;
  if(!u || !p){ alert('Provide username and password'); return; }
  const list = loadAdmins();
  if(list.find(x=>x.username===u)){ alert('Username exists'); return; }
  list.push({ username:u, password:p, role:r });
  saveAdmins(list); $id('new-admin-username').value=''; $id('new-admin-password').value=''; renderAdmins();
});

// logout
$id('logout-btn').addEventListener('click', ()=>{
  localStorage.removeItem(KEY_ADMIN_LOGGED);
  window.location.href = 'admin.html';
});

// initial render
renderProductsList(); renderBanksList(); renderOrders(); renderAdmins();
function renderBanksList(){ /* same function as defined earlier, but to keep module simple call it above */ const wrap = $id('bank-list'); wrap.innerHTML=''; const banks = JSON.parse(localStorage.getItem(KEY_BANKS) || '[]'); if(banks.length===0){ wrap.innerHTML='<div>No banks</div>'; return; } banks.forEach((b, idx)=>{ const div = document.createElement('div'); div.className='list-row'; div.innerHTML = `<div><div class="font-semibold">${b.name}</div><div class="text-sm">${b.acc} ${b.iban?(' • IBAN: '+b.iban):''}</div></div><div><button class="small-btn" data-i="${idx}" data-act="del">Del</button></div>`; wrap.appendChild(div); }); wrap.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{ if(confirm('Delete bank?')){ const arr = JSON.parse(localStorage.getItem(KEY_BANKS)||'[]'); arr.splice(parseInt(b.dataset.i),1); localStorage.setItem(KEY_BANKS, JSON.stringify(arr)); renderBanksList(); } })); }
