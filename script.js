document.getElementById('year').textContent = new Date().getFullYear();

const products = [
  { id: 'p1', name: 'Ehsan Shirt', price: 1200, img: 'images/product1.jpg' },
  { id: 'p2', name: 'Ehsan Shawl', price: 850, img: 'images/product2.jpg' },
  { id: 'p3', name: 'Poster', price: 600, img: 'images/poster1.jpg' },
];

const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const cartClose = document.getElementById("cartClose");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const whatsappCheckout = document.getElementById("whatsappCheckout");

let cart = {};

function renderProducts() {
  productsGrid.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.img}">
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.price} PKR</p>
      </div>
      <button class="btn add" data-id="${p.id}">Add</button>
    `;
    productsGrid.appendChild(div);
  });
}
renderProducts();

productsGrid.addEventListener("click", e => {
  if (e.target.classList.contains("add")) {
    const id = e.target.dataset.id;
    const prod = products.find(p => p.id === id);
    addToCart(prod);
  }
});

function addToCart(p) {
  if (!cart[p.id]) cart[p.id] = { ...p, qty: 0 };
  cart[p.id].qty++;
  updateCart();
}

function updateCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  let count = 0;

  Object.values(cart).forEach(item => {
    total += item.qty * item.price;
    count += item.qty;
    cartItemsEl.innerHTML += `${item.name} × ${item.qty} — ${item.qty * item.price} PKR<br>`;
  });

  cartTotalEl.textContent = total;
  cartCountEl.textContent = count;

  const watext = encodeURIComponent(
    `New Order:\n${Object.values(cart)
      .map(i => `${i.name} x${i.qty} = ${i.qty * i.price}`)
      .join("\n")}\n\nTotal: ${total} PKR`
  );

  whatsappCheckout.href = `https://wa.me/923018067880?text=${watext}`;
}

cartBtn.onclick = () => cartModal.classList.remove("hidden");
cartClose.onclick = () => cartModal.classList.add("hidden");
