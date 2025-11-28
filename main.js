// Add this at the very top of main.js
if (!localStorage.getItem("zm_admin_pass")) {
  localStorage.setItem("zm_admin_pass", "asad123"); // Change this anytime
}

// Currency = PKR
const currency = "₨";

// WhatsApp number – Apna number daal do
const whatsappNumber = "923001234567"; // ←←←← YAHAN APNA NUMBER DAALO

// Updated WhatsApp Message Function
function sendWhatsAppOrder(msg) {
  const encoded = encodeURIComponent(msg);
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encoded}`;
}

// Updated placeOrder function (checkout.html mein bhi yehi use karo)
function placeOrder(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  if (!name || !phone || !address) return alert("Sab fields bharain!");

  const total = cart.reduce((s, i) => s + products.find(p => p.id === i.id).price * i.qty, 0);
  let msg = `*New Order - ZentroMall*%0A%0A`;
  msg += `*Name:* ${name}%0A*Phone:* ${phone}%0A*Address:* ${address}%0A%0A*Order Details:*%0A`;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    msg += `• ${p.name} × ${item.qty} = ₨${(p.price * item.qty).toLocaleString()}%0A`;
  });
  msg += `%0A*Total Amount:* ₨${total.toLocaleString()}%0A%0AThank you!`;

  orders.push({date:new Date().toLocaleString(), items:[...cart], total, customer:{name,phone,address}});
  saveData();
  cart = []; localStorage.setItem("zm_cart", "[]");
  sendWhatsAppOrder(msg);
}

// Price display mein ₨ laga do (har jagah)
function formatPrice(price) {
  return `₨${price.toLocaleString()}`;
}
