class ECommerce {
    constructor() {
        this.products = [
            { 
                id: 1, 
                name: "Wireless Headphones", 
                price: 99.99, 
                image: "🎧", 
                category: "electronics",
                description: "High-quality wireless headphones with noise cancellation"
            },
            { 
                id: 2, 
                name: "Smart Watch", 
                price: 199.99, 
                image: "⌚", 
                category: "electronics",
                description: "Feature-rich smartwatch with health monitoring"
            },
            { 
                id: 3, 
                name: "Laptop Stand", 
                price: 49.99, 
                image: "💻", 
                category: "home",
                description: "Adjustable stand for better ergonomics"
            },
            { 
                id: 4, 
                name: "USB-C Cable", 
                price: 19.99, 
                image: "🔌", 
                category: "accessories",
                description: "Durable 6ft USB-C charging cable"
            },
            { 
                id: 5, 
                name: "Phone Case", 
                price: 29.99, 
                image: "📱", 
                category: "accessories",
                description: "Protective case with stylish design"
            },
            { 
                id: 6, 
                name: "Bluetooth Speaker", 
                price: 79.99, 
                image: "🔊", 
                category: "electronics",
                description: "Portable speaker with crisp sound"
            },
            { 
                id: 7, 
                name: "Desk Lamp", 
                price: 39.99, 
                image: "💡", 
                category: "home",
                description: "LED desk lamp with adjustable brightness"
            },
            { 
                id: 8, 
                name: "Wireless Mouse", 
                price: 34.99, 
                image: "🖱️", 
                category: "accessories",
                description: "Ergonomic wireless mouse with long battery life"
            }
        ];
        
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentCategory = 'all';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Save products to localStorage for other pages
        localStorage.setItem('products', JSON.stringify(this.products));
        
        this.init();
    }

    init() {
        this.renderProducts();
        this.renderCart();
        this.setupEventListeners();
        this.displayUserInfo();
    }

    displayUserInfo() {
        if (this.currentUser && document.getElementById('username')) {
            document.getElementById('username').textContent = this.currentUser.username;
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const filteredProducts = this.currentCategory === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === this.currentCategory);
        
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <div class="product-image">${product.image}</div>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `).join('');
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');

        // Update cart count
        cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => {
            const product = this.products.find(p => p.id === item.id);
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-id="${product.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${product.id}" data-action="increase">+</button>
                        <button class="remove-btn" data-id="${product.id}">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        // Update total
        const total = this.cart.reduce((sum, item) => {
            const product = this.products.find(p => p.id === item.id);
            return sum + (product.price * item.quantity);
        }, 0);
        cartTotal.textContent = total.toFixed(2);
    }

    setupEventListeners() {
        // Add to cart buttons
        document.getElementById('products-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = parseInt(e.target.dataset.id);
                this.addToCart(productId);
                this.showNotification('Product added to cart!');
            }
        });

        // Cart quantity and remove buttons
        document.getElementById('cart-items').addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            
            if (e.target.classList.contains('quantity-btn')) {
                const action = e.target.dataset.action;
                this.updateQuantity(productId, action);
            } else if (e.target.classList.contains('remove-btn')) {
                this.removeFromCart(productId);
            }
        });

        // Checkout button
        document.getElementById('checkout-btn').addEventListener('click', () => {
            if (this.cart.length === 0) {
                this.showNotification('Your cart is empty!', 'error');
                return;
            }
            window.location.href = 'address.html';
        });

        // Continue shopping button
        document.getElementById('continue-shopping').addEventListener('click', () => {
            document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderProducts();
            });
        });
    }

    addToCart(productId) {
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ id: productId, quantity: 1 });
        }
        
        this.saveCart();
        this.renderCart();
    }

    updateQuantity(productId, action) {
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }
            
            this.saveCart();
            this.renderCart();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
        this.showNotification('Product removed from cart');
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        
        // Set background color based on type
        if (type === 'error') {
            notification.style.background = '#dc3545';
        } else if (type === 'success') {
            notification.style.background = '#28a745';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
}

// Initialize the e-commerce app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser && window.location.pathname.includes('shop.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    new ECommerce();
});