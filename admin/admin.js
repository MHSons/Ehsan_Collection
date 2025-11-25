/* admin/admin.js */
document.addEventListener('DOMContentLoaded', ()=>{
  const list = document.getElementById('list');
  const pId = document.getElementById('pId');
  const pName = document.getElementById('pName');
  const pPrice = document.getElementById('pPrice');
  const pCategory = document.getElementById('pCategory');
  const pImages = document.getElementById('pImages');
  const pDesc = document.getElementById('pDesc');
  const saveBtn = document.getElementById('saveBtn');

  let products = JSON.parse(localStorage.getItem('ec_products') || '[]');

  function render(){
    list.innerHTML = '';
    products.forEach(p=>{
      const row = document.createElement('div');
      row.style.padding='8px 0';
      row.innerHTML = `<strong>${p.name}</strong> — ${p.price} PKR — <button data-id="${p.id}" class="edit">Edit</button> <button data-id="${p.id}" class="del">Delete</button>`;
      list.appendChild(row);
    });
  }
  render();

  saveBtn.addEventListener('click', ()=>{
    const id = pId.value.trim() || ('p' + Date.now());
    const obj = {
      id,
      name: pName.value.trim(),
      price: Number(pPrice.value || 0),
      category: pCategory.value.trim(),
      images: (pImages.value||'').split(',').map(s=>s.trim()).filter(Boolean),
      description: pDesc.value.trim()
    };
    const idx = products.findIndex(x=>x.id===id);
    if(idx>=0) products[idx]=obj; else products.push(obj);
    localStorage.setItem('ec_products', JSON.stringify(products));
    alert('Saved');
    render();
  });

  list.addEventListener('click', (e)=>{
    if(e.target.classList.contains('edit')){
      const id = e.target.dataset.id;
      const p = products.find(x=>x.id===id);
      if(p){
        pId.value = p.id; pName.value = p.name; pPrice.value = p.price;
        pCategory.value = p.category; pImages.value = (p.images||[]).join(',');
        pDesc.value = p.description;
      }
    } else if(e.target.classList.contains('del')){
      const id = e.target.dataset.id;
      products = products.filter(x=>x.id!==id);
      localStorage.setItem('ec_products', JSON.stringify(products));
      render();
    }
  });

  // NOTE: To switch to Airtable:
  // - Create Airtable base with a table "Products" and fields: id, name, price, images (comma), category, description
  // - Use server-side functions to read/write (do NOT put your API key in client code)
});
