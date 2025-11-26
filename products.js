/* File: products.js */

// Re-use DUMMY_PRODUCTS from cart_checkout.js (or fetch from an API in a real app)
const DUMMY_PRODUCTS_DB = [
    { id: 'P101', name: 'Ultra HD Gaming Laptop', price: 250000, category: 'electronics', rating: 4.8, img: 'placeholder-prod1.jpg' },
    { id: 'P102', name: 'Classic Leather Watch', price: 15000, category: 'fashion', rating: 4.5, img: 'placeholder-prod2.jpg' },
    { id: 'P103', name: 'Noise-Cancelling Headphones', price: 8500, category: 'electronics', rating: 4.9, img: 'placeholder-prod3.jpg' },
    { id: 'P104', name: 'Designer Sofa Set', price: 180000, category: 'home', rating: 4.2, img: 'placeholder-prod4.jpg' },
    { id: 'P105', name: 'Smart Home Hub', price: 5000, category: 'electronics', rating: 4.0, img: 'placeholder-prod5.jpg' },
    { id: 'P106', name: 'Summer Dress Collection', price: 7500, category: 'fashion', rating: 4.6, img: 'placeholder-prod6.jpg' },
];

document.addEventListener('DOMContentLoaded', () => {
    
    const productGrid = document.getElementById('product-grid');
    const sortSelect = document.getElementById('sort-by');
    const categoryLinks = document.querySelectorAll('#categories-list a');
    const maxPriceSlider = document.getElementById('price-range-slider');
    const maxPriceDisplay = document.getElementById('max-price-display');
    const productCountDisplay = document.getElementById('product-count');

    let currentFilters = {
        category: 'all',
        maxPrice: DUMMY_PRODUCTS_DB.reduce((max, prod) => Math.max(max, prod.price), 0),
        sortBy: 'default'
    };
    
    // --- 1. Initial Setup ---
    maxPriceSlider.max = currentFilters.maxPrice;
    maxPriceSlider.value = currentFilters.maxPrice;
    maxPriceDisplay.textContent = `${currentFilters.maxPrice.toLocaleString()} PKR`;
    
    // --- 2. Event Listeners ---
    
    // Price Slider
    maxPriceSlider.addEventListener('input', () => {
        currentFilters.maxPrice = parseInt(maxPriceSlider.value);
        maxPriceDisplay.textContent = `${currentFilters.maxPrice.toLocaleString()} PKR`;
        filterAndRenderProducts();
    });

    // Category Links
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active-category'));
            link.classList.add('active-category');
            currentFilters.category = link.dataset.category;
            filterAndRenderProducts();
        });
    });
    
    // Sort Select
    sortSelect.addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        filterAndRenderProducts();
    });

    // --- 3. Core Logic ---
    function filterAndRenderProducts() {
        let filteredProducts = [...DUMMY_PRODUCTS_DB];

        // 3a. Filtering by Category
        if (currentFilters.category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === currentFilters.category);
        }

        // 3b. Filtering by Price
        filteredProducts = filteredProducts.filter(p => p.price <= currentFilters.maxPrice);

        // 3c. Sorting
        switch (currentFilters.sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
                break;
            // Default: Keep order from the DB
        }
        
        // 3d. Rendering
        let html = '';
        if (filteredProducts.length === 0) {
            html = '<p class="loading-message">اس فلٹر کے تحت کوئی مصنوعہ نہیں ملا۔</p>';
        } else {
            filteredProducts.forEach(product => {
                 // Re-use the product-card structure from index.html
                html += `
                    <div class="product-card">
                        <img src="${product.img}" alt="${product.name}">
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p class="price">
                                <span class="currency">PKR</span> 
                                <span class="amount">${product.price.toLocaleString()}</span>
                            </p>
                            <span class="rating">⭐ ${product.rating}</span>
                            <button class="add-to-cart-btn" data-product-id="${product.id}">کارٹ میں ڈالیں</button>
                        </div>
                    </div>
                `;
            });
        }
        
        productGrid.innerHTML = html;
        productCountDisplay.textContent = filteredProducts.length;

        // Re-attach the Add to Cart event listeners (from main.js)
        attachAddToCartListeners();
    }
    
    // Helper function to re-attach 'Add to Cart' listeners on dynamic content
    function attachAddToCartListeners() {
        // Assume the addToCart function is defined in main.js and available globally
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            // Remove previous listeners to prevent duplicates (important for dynamic content)
            button.removeEventListener('click', window.addToCartHandler); 

            // Add new listener (You need to ensure your main.js exposes a global addToCart function)
            button.addEventListener('click', () => {
                const productId = button.dataset.productId;
                if (productId) {
                    window.addToCart(productId); // Assuming addToCart is defined globally in main.js
                }
            });
        });
    }


    // --- 4. Initialize ---
    filterAndRenderProducts();
});


// Note: For this to work seamlessly, ensure your main.js has an exposed global function like:
/*
window.addToCart = function(productId) {
    // ... logic to add item to local storage cart ...
}
*/
