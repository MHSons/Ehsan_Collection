// main.js — products, cart, checkout & WhatsApp order flow
// Make sure product images are in assets/ (assets/product1.jpg etc.) and logo.png sits in project root

const WHATSAPP_NUMBER = "923018067880"; // +92 301 8067880 (without +)
const CART_KEY = "ehsan_cart_v1";
const ORDERS_KEY = "ehsan_orders_v1";

// Sample product list — you can edit/add from admin in the future (for now edit this array or add admin UI)
const PRODUCTS = [
  { id: "p1", title: "Classic Cotton Shirt", price: 2499, currency: "PKR", image: "assets/product1.jpg", desc: "Comfortable cotton shirt — perfect for daily wear." },
  { id: "p2", title: "Formal Men Watch", price: 4999, currency: "PKR", image: "assets/product2.jpg", desc: "Elegant design with leather strap." },
  { id: "p3", title: "Wireless Earbuds", price: 3999, currency: "PKR", image: "assets/product3.jpg", desc: "Long battery life and great sound." },
  { id: "p4", title: "Running Sneakers", price: 3599, currency: "PKR", image: "assets/product4.jpg", desc: "Breathable material, comfortable sole." },
  { id: "p5", title: "Stylish Backpack", price: 2799, currency: "PKR", image: "assets/product5.jpg", desc: "Water-resistant and roomy." },
  { id: "p6", title: "Sunglasses", price: 1299, currency: "PKR", image: "assets/product6.jpg", desc: "UV protected lens with modern frame." }
];

function formatPrice(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch(e){ return {}; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartBadge(); }
function addToCart(id, qty=1){ const c=getCart(); c[id]= (c[id]||0)+qty; saveCart(c); showToast("Added to cart"); }
function updateQty(id, qty){ const c=getCart(); if(qty<=0) delete c[id]; else c[id]=qty; saveCart(c); }
function removeFromCart(id){ const c=getCart(); delete c[id]; saveCart(c); }

// Render products
function renderProducts(){
  const container = document.getElementById("products");
  if(!container) return;
  container.innerHTML = "";
  PRODUCTS.forEach(p=>{
    const div = document.createElement("div");
    div.className = "product-card p-4";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}" class="rounded-md mb-3" onerror="this.src='assets/product-placeholder.png'"/>
      <h3 class="text-lg font-semibold mb-1">${p.title}</h3>
      <p class="text-sm text-gray-500 mb-3">${p.desc}</p>
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold">${p.currency} ${formatPrice(p.price)}</div>
        <button data-id="${p.id}" class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded">Add to Cart</button>
      </div>
    `;
    container.appendChild(div);
  });
  document.querySelectorAll(".add-to-cart").forEach(b=> b.addEventListener("click", ()=> addToCart(b.getAttribute("data-id"),1)));
}

// Toast
function showToast(msg){
  let t=document.getElementById("site-toast");
  if(!t){ t=document.createElement("div"); t.id="site-toast"; t.className="fixed bottom-32 right-6 bg-black text-white px-4 py-2 rounded shadow-lg"; document.body.appendChild(t); }
  t.textContent=msg; t.style.opacity=1; setTimeout(()=> t.style.opacity=0,1600);
}

// Cart UI (slide-over)
function buildCartUI(){
  if(document.getElementById("cart-panel")) return;
  const panel = document.createElement("div");
  panel.id="cart-panel";
  panel.className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform translate-x-full";
  panel.style.zIndex=80;
  panel.innerHTML = `
    <div class="p-4 flex items-center justify-between border-b">
      <h3 class="text-lg font-bold">Your Cart</h3>
      <button id="close-cart" class="text-gray-500">Close</button>
    </div>
    <div id="cart-items" class="p-4 space-y-3 overflow-auto" style="height: calc(100% - 160px);"></div>
    <div class="p-4 border-t">
      <div class="flex items-center justify-between mb-3">
        <div class="font-semibold">Total</div>
        <div id="cart-total" class="font-bold">PKR 0</div>
      </div>
      <div class="flex gap-3">
        <button id="checkout-start" class="flex-1 bg-green-600 text-white py-2 rounded">Checkout</button>
        <button id="clear-cart" class="flex-0 px-4 py-2 border rounded">Clear</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  document.getElementById("close-cart").addEventListener("click", ()=> panel.style.transform = "translateX(100%)");
  document.getElementById("checkout-start").addEventListener("click", ()=> openCheckoutModal());
  document.getElementById("clear-cart").addEventListener("click", ()=> { localStorage.removeItem(CART_KEY); renderCartItems(); updateCartBadge(); });
}

function openCart(){ const panel=document.getElementById("cart-panel"); if(panel) { panel.style.transform="translateX(0)"; renderCartItems(); } }

function renderCartItems(){
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if(!container) return;
  const cart = getCart();
  container.innerHTML = "";
  let total = 0;
  const keys = Object.keys(cart);
  if(keys.length==0){ container.innerHTML = "<div class='text-gray-500'>Your cart is empty.</div>"; totalEl.textContent = "PKR 0"; return; }
  keys.forEach(id=>{
    const qty = cart[id];
    const product = PRODUCTS.find(p=>p.id===id) || {title:"Unknown",price:0,image:"assets/product-placeholder.png"};
    total += product.price * qty;
    const row = document.createElement("div");
    row.className = "flex items-center gap-3";
    row.innerHTML = `
      <img src="${product.image}" class="w-16 h-16 object-cover rounded" onerror="this.src='assets/product-placeholder.png'"/>
      <div class="flex-1">
        <div class="font-semibold">${product.title}</div>
        <div class="text-sm text-gray-500">PKR ${formatPrice(product.price)}</div>
        <div class="mt-2 flex items-center gap-2">
          <button data-id="${id}" class="dec inline-block px-2 py-1 border rounded">-</button>
          <span class="px-2">${qty}</span>
          <button data-id="${id}" class="inc inline-block px-2 py-1 border rounded">+</button>
          <button data-id="${id}" class="remove text-sm text-red-500 ml-4">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
  totalEl.textContent = "PKR " + formatPrice(total);

  container.querySelectorAll(".inc").forEach(btn=> btn.addEventListener("click", ()=> { const id=btn.getAttribute("data-id"); updateQty(id, getCart()[id]+1); renderCartItems(); }));
  container.querySelectorAll(".dec").forEach(btn=> btn.addEventListener("click", ()=> { const id=btn.getAttribute("data-id"); const cur=getCart()[id]; updateQty(id, Math.max(0, cur-1)); renderCartItems(); }));
  container.querySelectorAll(".remove").forEach(btn=> btn.addEventListener("click", ()=> { removeFromCart(btn.getAttribute("data-id")); renderCartItems(); }));
}

// cart badge
function updateCartBadge(){
  const badge = document.getElementById("cart-badge");
  if(!badge) return;
  const c = getCart();
  const count = Object.values(c).reduce((s,n)=>s+n,0);
  badge.textContent = count;
}

// Checkout modal handling
function openCheckoutModal(){
  const cart = getCart();
  if(Object.keys(cart).length===0){ showToast("Cart is empty"); return; }
  document.getElementById("checkout-modal").classList.remove("hidden");
}
function closeCheckoutModal(){ document.getElementById("checkout-modal").classList.add("hidden"); }

function buildCheckoutFlow(){
  document.getElementById("checkout-cancel").addEventListener("click", ()=> closeCheckoutModal());
  document.getElementById("checkout-confirm").addEventListener("click", ()=>{
    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    const tx = document.getElementById("cust-transaction").value.trim();

    if(!name || !phone || !address){ alert("Please fill name, phone and address"); return; }

    // Build order summary
    const cart = getCart();
    const items = Object.keys(cart).map(id => {
      const p = PRODUCTS.find(x=>x.id===id) || {title:"Unknown", price:0};
      return { id, title: p.title, qty: cart[id], price: p.price };
    });

    const total = items.reduce((s,i) => s + (i.price * i.qty), 0);

    const order = {
      id: "ORD" + Date.now(),
      date: new Date().toISOString(),
      customer: { name, phone, address },
      items,
      total,
      transaction_id: tx || "",
      status: "New"
    };

    // Save order locally (admin dashboard will read orders from this key)
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // Compose WhatsApp message
    let msg = `New Order: ${order.id}\\nName: ${name}\\nPhone: ${phone}\\nAddress: ${address}\\n`;
    if(tx) msg += `Transaction ID: ${tx}\\n`;
    msg += "Items:\\n";
    items.forEach(it => { msg += `- ${it.title} x${it.qty} @ PKR ${formatPrice(it.price)}\\n`; });
    msg += `Total: PKR ${formatPrice(total)}`;

    // URL-encode and open whatsapp
    const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");

    // clear cart after checkout
    localStorage.removeItem(CART_KEY);
    renderCartItems();
    updateCartBadge();
    closeCheckoutModal();
    showToast("Order sent via WhatsApp (and saved).");
  });
}

// Initialization
window.addEventListener("DOMContentLoaded", ()=>{
  renderProducts();
  buildCartUI();
  updateCartBadge();
  document.getElementById("cart-button").addEventListener("click", ()=> openCart());
  buildCheckoutFlow();
});
