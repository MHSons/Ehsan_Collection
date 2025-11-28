// ZentroMall Pakistan Edition - 28 Nov 2025
let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");
let wishlist = JSON.parse(localStorage.getItem("zm_wishlist") || "[]");
let viewed = JSON.parse(localStorage.getItem("zm_viewed") || "[]");

// Admin password setup (change kar do apna strong password)
if (!localStorage.getItem("zm_admin_pass")) {
  localStorage.setItem("admin", "admin123"); // ←←←← YAHAN APNA PASSWORD RAKHO
}

// Apna WhatsApp number (92 ke saath)
const whatsappNumber = "923018067880"; // ←←←← YAHAN APNA NUMBER DAALO

// Default Pakistani products
if (products.length === 0) {
  products = [
    {id:1, name:"iPhone 15 Pro", price:359999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80", desc:"PTA Approved • 1 Year Warranty", category:"mobile"},
    {id:2, name:"Samsung S24 Ultra", price:389999, image:"https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$", desc:"Official Warranty", category:"mobile"},
    {id:3, name:"AirPods Pro 2", price:67999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90", desc:"Noise Cancellation", category:"accessory"},
    {id:4, name:"Ray-Ban Sunglasses", price:14999, image:"https://via.placeholder.com/600x600/000/fff?text=Ray-Ban", desc:"UV Protection", category:"fashion"}
  ];
  localStorage.setItem("zm_products", JSON.stringify(products));
}

function saveData() {
  localStorage.setItem("zm_products", JSON.stringify(products));
  localStorage.setItem("zm_cart", JSON.stringify(cart));
  localStorage.setItem("zm_orders", JSON.stringify(orders));
  localStorage.setItem("zm_wishlist", JSON.stringify(wishlist));
  localStorage.setItem("zm_viewed", JSON.stringify(viewed));
  localStorage.setItem("zm_user", JSON.stringify(currentUser));
}

function formatPrice(price) {
  return `₨${price.toLocaleString()}`;
}

// 100% Working WhatsApp Function
function openWhatsAppWithMessage(message) {
  const encoded = encodeURIComponent(message);
  const mobileURL = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
  const webURL = `https://wa.me/${whatsappNumber}?text=${encoded}`;

  // Try mobile first
  window.location.href = mobileURL;

  // Fallback to web after 1 second
  setTimeout(() => {
    window.open(webURL, '_blank');
  }, 800);
}

function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++; else cart.push({id, qty:1});
  saveData();
  updateCartCount();
  alert("کارٹ میں شامل ہو گیا!");
}

function updateCartCount() {
  const total = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = total);
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter(x => x !== id);
  else wishlist.push(id);
  saveData();
  alert(wishlist.includes(id) ? "Wishlist میں شامل" : "Wishlist سے ہٹا دیا");
}

function buyNow(id) {
  if (!confirm("COD آرڈر کنفرم کریں؟")) return;
  const p = products.find(x => x.id === id);
  const msg = `*Instant Order - ZentroMall*\n\nProduct: ${p.name}\nPrice: ${formatPrice(p.price)}\n\nJaldi call karain!`;
  openWhatsAppWithMessage(msg);
}

function loadFeatured() {
  const div = document.getElementById("featured");
  if (!div) return;
  div.innerHTML = products.slice(0,8).map(p => `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition">
      <img src="${p.image}" alt="${p.name}" class="w-full h-64 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-bold">${p.name}</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">${p.desc}</p>
        <p class="text-3xl font-bold text-green-600 my-4">${formatPrice(p.price)}</p>
        <div class="flex gap-2">
          <button onclick="addToCart(${p.id})" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg">Add to Cart</button>
          <button onclick="toggleWishlist(${p.id})" class="bg-red-500 text-white px-4 py-3 rounded-lg">❤️</button>
        </div>
      </div>
    </div>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
