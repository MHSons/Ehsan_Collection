import React, { useEffect, useState } from 'react'

const SAMPLE_PRODUCTS = [
  { id:'p1', name:'Classic Shirt', price:1299, img:'/products/p1.svg', category:'Shirts', stock:20 },
  { id:'p2', name:'Embroidered Shawl', price:850, img:'/products/p2.svg', category:'Shawls', stock:15 },
  { id:'p3', name:'Decor Poster', price:599, img:'/products/p3.svg', category:'Decor', stock:50 },
  { id:'p4', name:'Elegant Kurta', price:2499, img:'/products/p4.svg', category:'Kurta', stock:10 },
  { id:'p5', name:'Handmade Bag', price:1799, img:'/products/p5.svg', category:'Bags', stock:8 },
  { id:'p6', name:'Winter Scarf', price:699, img:'/products/p6.svg', category:'Scarves', stock:30 }
];

export default function App(){
  const [products] = useState(SAMPLE_PRODUCTS);
  const [query,setQuery] = useState('');
  const [cart,setCart]=useState({});
  const [selected,setSelected]=useState(null);
  const [drawer,setDrawer]=useState(false);

  useEffect(()=>{
    const c = localStorage.getItem('ec_cart');
    if(c) setCart(JSON.parse(c));
  },[]);
  useEffect(()=> localStorage.setItem('ec_cart', JSON.stringify(cart)), [cart]);

  function addToCart(p, qty=1){
    setCart(prev=>{
      const next = {...prev};
      next[p.id] = next[p.id] || {...p, qty:0};
      next[p.id].qty += qty;
      return next;
    });
  }
  function removeFromCart(id){
    setCart(prev=>{ const n={...prev}; delete n[id]; return n; });
  }
  function updateQty(id, qty){ setCart(prev=>{ const n={...prev}; if(n[id]) n[id].qty = Math.max(1, qty); return n; }); }

  const filtered = products.filter(p=> p.name.toLowerCase().includes(query.toLowerCase()) );

  const totalQty = Object.values(cart).reduce((s,i)=>s+i.qty,0);
  const totalPrice = Object.values(cart).reduce((s,i)=>s + i.qty*i.price, 0);

  async function startStripeCheckout(){
    if(totalQty === 0) { alert('Cart is empty'); return; }
    const line_items = Object.values(cart).map(i=>({
      price_data: {
        currency: 'usd',
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100)
      },
      quantity: i.qty
    }));
    try {
      const res = await fetch('/api/create-checkout-session', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          line_items,
          success_url: window.location.origin + '/success.html',
          cancel_url: window.location.href
        })
      });
      const data = await res.json();
      if(data.url) window.location = data.url;
      else alert('Unable to start checkout. See console for details.');
    } catch (err){
      console.error(err);
      alert('Checkout failed. Ensure serverless is deployed and STRIPE_SECRET_KEY is set.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Ehsan Collection" className="h-10"/>
              <span className="font-bold text-lg">Ehsan Collection</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <input value={query} onChange={e=>setQuery(e.target.value)} className="border px-3 py-2 rounded" placeholder="Search products..." />
            <button onClick={()=>setDrawer(true)} className="relative bg-indigo-600 text-white px-3 py-2 rounded">
              Cart
              {totalQty>0 && <span className="ml-2 inline-block bg-red-600 text-white rounded-full px-2 text-xs">{totalQty}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Shop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p=>(
              <article key={p.id} className="bg-white rounded shadow overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-56 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-lg font-bold">{p.price} PKR</div>
                    <div className="flex gap-2">
                      <button onClick={()=>setSelected(p)} className="border px-3 py-1 rounded">View</button>
                      <button onClick={()=>addToCart(p)} className="bg-indigo-600 text-white px-3 py-1 rounded">Add</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white max-w-3xl w-full rounded p-6 relative">
            <button onClick={()=>setSelected(null)} className="absolute right-4 top-4 text-2xl">×</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img src={selected.img} className="w-full h-80 object-cover rounded"/>
              <div>
                <h3 className="text-2xl font-bold">{selected.name}</h3>
                <p className="mt-3 text-lg font-semibold">{selected.price} PKR</p>
                <p className="mt-4">Stock: {selected.stock}</p>
                <div className="mt-6 flex gap-3">
                  <button onClick={()=>{ addToCart(selected); setSelected(null); }} className="bg-indigo-600 text-white px-3 py-2 rounded">Add to Cart</button>
                  <button onClick={()=>alert('Buy now — integrate Stripe flow')} className="border px-3 py-2 rounded">Buy Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={()=>setDrawer(false)} />
          <aside className="w-full max-w-md bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">آپ کی Cart</h3>
              <button onClick={()=>setDrawer(false)}>×</button>
            </div>

            <div className="mt-4 space-y-3">
              {Object.values(cart).length === 0 && <div>Cart خالی ہے</div>}
              {Object.values(cart).map(i=>(
                <div key={i.id} className="flex items-center gap-3">
                  <img src={i.img} className="w-16 h-16 object-cover rounded"/>
                  <div className="flex-1">
                    <div className="font-medium">{i.name}</div>
                    <div className="text-sm text-gray-600">{i.price} PKR</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={()=>updateQty(i.id, i.qty-1)} className="px-2 py-1 border rounded">-</button>
                      <div className="px-3">{i.qty}</div>
                      <button onClick={()=>updateQty(i.id, i.qty+1)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>
                  <div>
                    <button onClick={()=>removeFromCart(i.id)} className="text-red-600">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between font-bold">Total: <span>{totalPrice} PKR</span></div>
              <div className="mt-4 flex gap-3">
                <button onClick={startStripeCheckout} className="bg-indigo-600 text-white px-3 py-2 rounded flex-1">Pay with Card</button>
                <button onClick={()=>{
                  const bank = `Bank: Naya pay\nAccount / Phone: 03018067880\nPlease send payment proof to WhatsApp: 03018067880`;
                  alert(bank + '\n\nOrder details will be sent via WhatsApp.');
                }} className="border px-3 py-2 rounded">Bank</button>
              </div>
              <a className="mt-3 inline-block bg-green-500 text-white px-3 py-2 rounded" href={`https://wa.me/923018067880?text=${encodeURIComponent(Object.values(cart).map(i=>i.name+' x'+i.qty+' = '+(i.qty*i.price)).join('\n') + '\nTotal: '+ totalPrice + ' PKR\nName:')}`} target="_blank">Pay via WhatsApp</a>
              <div className="mt-4 text-sm text-gray-600">Contact: WhatsApp 03018067880 • Email: ehsancollection@gmail.com</div>
            </div>
          </aside>
        </div>
      )}

      <footer className="mt-12 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ehsan Collection — International Standard Store
      </footer>
    </div>
  )
}
