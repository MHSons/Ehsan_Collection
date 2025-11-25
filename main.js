const API_BASE = 'http://localhost:4000/api';

// fetch products from backend
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

function formatPrice(p){ return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

// Render products
async function render() {
  const products = await fetchProducts();
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card p-4 rounded-xl shadow';
    card.innerHTML = `
      <img src="${p.image || 'assets/product-placeholder.png'}" class="rounded-lg mb-3 h-40 w-full object-cover" />
      <h3 class="text-lg font-semibold mb-1">${p.title}</h3>
      <p class="text-sm text-gray-500 mb-3">${p.description || ''}</p>
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">${p.currency} ${formatPrice(p.price)}</div>
        <button data-id="${p.id}" class="buy-now bg-green-600 text-white px-4 py-2 rounded-lg">Buy</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.buy-now').forEach(b=> b.addEventListener('click', buyNow));
}

async function buyNow(e) {
  const id = e.currentTarget.getAttribute('data-id');
  const qty = 1;
  // ask for customer info (simple prompt for demo)
  const name = prompt('Enter your name (for delivery):');
  const phone = prompt('Enter phone number:');
  const address = prompt('Enter address:');
  if(!name || !phone) return alert('Name & phone required');

  const body = {
    items: [{ productId: Number(id), qty }],
    customer_info: { name, phone, address }
  };

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if(data.order_uuid){
    alert(`Order placed. Order ID: ${data.order_uuid}\nTotal: ${data.total} ${data.currency}\nYou can track: ${location.origin}/track.html?uuid=${data.order_uuid}`);
    // For demo: redirect to mock payment link to mark paid
    if(confirm('Open mock payment to mark paid?')) {
      window.open(`${API_BASE}/orders/${data.order_uuid}/pay-mock`, '_blank');
    }
  } else {
    alert('Error placing order');
  }
}

// Admin modal handling
document.getElementById('admin-login-toggle').addEventListener('click', ()=>{
  document.getElementById('admin-modal').classList.remove('hidden');
});
document.getElementById('al-close').addEventListener('click', ()=> document.getElementById('admin-modal').classList.add('hidden'));

document.getElementById('al-submit').addEventListener('click', async ()=>{
  const u = document.getElementById('al-username').value;
  const p = document.getElementById('al-password').value;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username: u, password: p })
  });
  if (res.status === 200) {
    const data = await res.json();
    localStorage.setItem('ehsan_admin_token', data.token);
    localStorage.setItem('ehsan_admin_username', data.username);
    document.getElementById('admin-status').textContent = `Logged in: ${data.username} (${data.role})`;
    document.getElementById('admin-modal').classList.add('hidden');
  } else {
    document.getElementById('al-error').classList.remove('hidden');
  }
});

// On load
window.addEventListener('DOMContentLoaded', async ()=>{
  const token = localStorage.getItem('ehsan_admin_token');
  if(token){
    const user = localStorage.getItem('ehsan_admin_username') || 'admin';
    document.getElementById('admin-status').textContent = `Logged in: ${user}`;
  }
  await render();
});
