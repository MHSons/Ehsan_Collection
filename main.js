let products = JSON.parse(localStorage.getItem("zm_products") || "[]");
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("zm_orders") || "[]");

if (!localStorage.getItem("zm_admin_pass")) localStorage.setItem("zm_admin_pass", "asad123");
const whatsappNumber = "923018067780"; // اپنا نمبر ڈالو

if (products.length === 0) {
  products = [
    {id:1, name:"iPhone 15 Pro", price:359999, image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80", desc:"PTA Approved"},
    {id:2, name:"Samsung S24 Ultra", price:389999, image:"https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-sm-s928bztqins-539574-sm-s928bztqins-571363123?$650_519_PNG$", desc:"Official"}
  ];
  localStorage.setItem("zm_products", JSON.stringify(products));
}

function saveData() {
  localStorage.setItem("zm_products", JSON.stringify(products));
  localStorage.setItem("zm_cart", JSON.stringify(cart));
  localStorage.setItem("zm_orders", JSON.stringify(orders));
}

function formatPrice(p) { return "₨" + Number(p).toLocaleString("en-PK"); }

function openWhatsApp(msg) {
  const e = encodeURIComponent(msg);
  window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${e}`;
  setTimeout(() => window.open(`https://wa.me/${whatsappNumber}?text=${e}`, '_blank'), 1000);
}

function addToCart(id) {
  const i = cart.find(x => x.id === id);
  if(i) i.qty++; else cart.push({id, qty:1});
  saveData(); updateCartCount(); alert("Added to Cart!");
}

function updateCartCount() {
  const t = cart.reduce((s,i) => s+i.qty, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = t);
}

function placeOrder(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  if(!name || !phone || !address) return alert("Fill all fields!");

  let total = 0, msg = `*New Order - ZentroMall*\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n`;
  cart.forEach(it => {
    const p = products.find(x => x.id === it.id);
    total += p.price * it.qty;
    msg += `• ${p.name} × ${it.qty} = ${formatPrice(p.price*it.qty)}\n`;
  });
  msg += `\nTotal: ${formatPrice(total)}\nThank You!`;

  orders.push({date: new Date().toLocaleString("en-PK"), items: cart.map(c=>({...c, name:products.find(p=>p.id===c.id)?.name})), total, customer:{name,phone,address}, status:"pending", tracking_id:""});
  saveData(); cart=[]; localStorage.setItem("zm_cart","[]"); updateCartCount();
  openWhatsApp(msg);
}

function handleImageUpload(e, cb) {
  const f = e.target.files[0];
  if(f){ const r = new FileReader(); r.onload = ev => cb(ev.target.result); r.readAsDataURL(f); }
}

document.addEventListener("DOMContentLoaded", updateCartCount);
