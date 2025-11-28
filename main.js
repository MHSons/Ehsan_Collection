// ZentroMall Pakistan – FINAL main.js (28 Nov 2025)

let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart     = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders   = JSON.parse(localStorage.getItem("zm_orders") || "[]");
let currentUser = JSON.parse(localStorage.getItem("zm_user") || "null");
let wishlist = JSON.parse(localStorage.getItem("zm_wishlist") || "[]");

if (!localStorage.getItem("zm_admin_pass")) {
  localStorage.setItem("zm_admin_pass", "asad123");
}

const whatsappNumber = "923001234567"; // ←←← اپنا نمبر ڈالو

if (products.length === 0) {
  products = [
    {id:1, name:"iPhone 15 Pro", price:359999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80", desc:"PTA Approved", category:"mobile"},
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
  localStorage.setItem("zm_user", JSON.stringify(currentUser));
}

function formatPrice(price) {
  return "₨" + Number(price).toLocaleString("en-PK");
}

function openWhatsAppWithMessage(message) {
  const encoded = encodeURIComponent(message);
  const mobile = `whatsapp://send?phone=${whatsappNumber}&text=${encoded}`;
  const web    = `https://wa.me/${whatsappNumber}?text=${encoded}`;
  window.location.href = mobile;
  setTimeout(() => window.open(web, '_blank'), 1000);
}

function addToCart(id) {
  const item = cart.find(x => x.id === id);
  if (item) item.qty++; else cart.push({id, qty:1});
  saveData();
  updateCartCount();
  alert("کارٹ میں شامل ہو گیا!");
}

function updateCartCount() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = total);
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) wishlist = wishlist.filter(x => x !== id);
  else wishlist.push(id);
  saveData();
}

// =======================
// سب سے اہم: placeOrder فنکشن
// =======================
function placeOrder(e) {
  e.preventDefault();

  const name    = document.getElementById("name")?.value.trim();
  const phone   = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();

  if (!name || !phone || !address) {
    alert("تمام فیلڈز بھریں!");
    return;
  }

  let total = 0;
  let msg = `*نیا آرڈر - ZentroMall*\n\n`;
  msg += `نام: ${name}\nفون: ${phone}\nایڈریس: ${address}\n\n*آرڈر کی تفصیل:*\n`;

  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) {
      const itemTotal = p.price * item.qty;
      total += itemTotal;
      msg += `• ${p.name} × ${item.qty} = ${formatPrice(itemTotal)}\n`;
    }
  });

  msg += `\n*کل بل:* ${formatPrice(total)}\n\nشکریہ! ہم جلد رابطہ کریں گے`;

  // آرڈر سیو کرو (status + tracking)
  orders.push({
    date: new Date().toLocaleString("en-PK"),
    items: cart.map(it => ({id: it.id, qty: it.qty, name: products.find(p=>p.id===it.id)?.name || "Unknown"})),
    total,
    customer: {name, phone, address},
    status: "pending",
    tracking_id: ""
  });

  saveData();

  // کارٹ خالی کرو
  cart = [];
  localStorage.setItem("zm_cart", "[]");
  updateCartCount();

  // WhatsApp پر بھیجو
  openWhatsAppWithMessage(msg);
}

function handleImageUpload(event, callback) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result);
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
