// Bag functionality
class ShoppingBag {
    constructor() {
        this.bag = JSON.parse(localStorage.getItem('shoppingBag')) || [];
        this.init();
    }

    init() {
        this.displayBagItems();
        this.setupEventListeners();
        this.updateBagCount();
    }

    displayBagItems() {
        const bagItemsContainer = document.getElementById('bag-items');
        const emptyBag = document.getElementById('empty-bag');
        const orderSummary = document.getElementById('order-summary');

        if (this.bag.length === 0) {
            emptyBag.style.display = 'block';
            orderSummary.style.display = 'none';
            return;
        }

        emptyBag.style.display = 'none';
        orderSummary.style.display = 'block';

        let html = '';
        this.bag.forEach((item, index) => {
            html += `
                <div class="bag-item" data-index="${index}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="item-price">${item.price}</div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease" data-index="${index}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        });

        bagItemsContainer.innerHTML = html;
        this.updateOrderSummary();
    }

    setupEventListeners() {
        const bagItemsContainer = document.getElementById('bag-items');
        
        // Event delegation for quantity buttons
        bagItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('decrease') || e.target.parentElement.classList.contains('decrease')) {
                const button = e.target.classList.contains('decrease') ? e.target : e.target.parentElement;
                const index = parseInt(button.getAttribute('data-index'));
                this.updateQuantity(index, -1);
            } else if (e.target.classList.contains('increase') || e.target.parentElement.classList.contains('increase')) {
                const button = e.target.classList.contains('increase') ? e.target : e.target.parentElement;
                const index = parseInt(button.getAttribute('data-index'));
                this.updateQuantity(index, 1);
            } else if (e.target.classList.contains('remove-btn') || e.target.parentElement.classList.contains('remove-btn')) {
                const button = e.target.classList.contains('remove-btn') ? e.target : e.target.parentElement;
                const index = parseInt(button.getAttribute('data-index'));
                this.removeItem(index);
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.bag.length === 0) {
                    this.showToast('Your bag is empty!', 'warning');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }
    }

    updateQuantity(index, change) {
        const newQuantity = this.bag[index].quantity + change;
        
        if (newQuantity < 1) {
            this.removeItem(index);
            return;
        }

        this.bag[index].quantity = newQuantity;
        this.saveBag();
        this.displayBagItems();
        this.updateBagCount();
        
        // Show quantity update feedback
        this.showQuantityUpdateFeedback(this.bag[index].name, newQuantity);
    }

    removeItem(index) {
        const itemName = this.bag[index].name;
        this.bag.splice(index, 1);
        this.saveBag();
        this.displayBagItems();
        this.updateBagCount();
        
        // Show removal feedback
        this.showRemoveFeedback(itemName);
    }

    updateOrderSummary() {
        let subtotal = 0;
        
        this.bag.forEach(item => {
            const price = parseInt(item.price.replace('₹', '').replace(',', ''));
            subtotal += price * item.quantity;
        });

        const delivery = subtotal > 5000 ? 0 : 100;
        const total = subtotal + delivery;

        document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.getElementById('delivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
        document.getElementById('total').textContent = `₹${total.toLocaleString()}`;
    }

    saveBag() {
        localStorage.setItem('shoppingBag', JSON.stringify(this.bag));
    }

    updateBagCount() {
        const bagCountElements = document.querySelectorAll('#bag-count');
        const totalItems = this.bag.reduce((total, item) => total + item.quantity, 0);
        
        bagCountElements.forEach(bagCount => {
            bagCount.textContent = totalItems;
            bagCount.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    }

    showQuantityUpdateFeedback(itemName, newQuantity) {
        this.showToast(`${itemName} quantity updated to ${newQuantity}`, 'success');
    }

    showRemoveFeedback(itemName) {
        this.showToast(`${itemName} removed from bag`, 'warning');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize shopping bag when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingBag = new ShoppingBag();
});