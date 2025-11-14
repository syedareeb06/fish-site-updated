// Checkout functionality
class Checkout {
    constructor() {
        this.bag = JSON.parse(localStorage.getItem('shoppingBag')) || [];
        this.init();
    }

    init() {
        this.displayOrderSummary();
        this.setupEventListeners();
        this.setupPaymentMethods();
        this.updateBagCount();
    }

    displayOrderSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        
        if (this.bag.length === 0) {
            checkoutItems.innerHTML = '<p>Your bag is empty</p>';
            return;
        }

        let html = '';
        let subtotal = 0;

        this.bag.forEach(item => {
            const price = parseInt(item.price.replace('₹', '').replace(',', ''));
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            html += `
                <div class="checkout-item">
                    <div class="checkout-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="checkout-item-details">
                        <h4>${item.name}</h4>
                        <div class="checkout-item-price">${item.price} x ${item.quantity}</div>
                    </div>
                    <div class="checkout-item-total">₹${itemTotal}</div>
                </div>
            `;
        });

        checkoutItems.innerHTML = html;

        const delivery = subtotal > 5000 ? 0 : 100;
        const total = subtotal + delivery;

        document.getElementById('checkout-subtotal').textContent = `₹${subtotal.toLocaleString()}`;
        document.getElementById('checkout-delivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
        document.getElementById('checkout-total').textContent = `₹${total.toLocaleString()}`;
    }

    setupEventListeners() {
        const form = document.getElementById('checkout-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });
    }

    setupPaymentMethods() {
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        const cardDetails = document.getElementById('card-details');

        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                if (e.target.value === 'card') {
                    cardDetails.style.display = 'block';
                } else {
                    cardDetails.style.display = 'none';
                }
            });
        });
    }

    processPayment() {
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        const orderData = {
            customer: {
                firstName: formData.get('first-name'),
                lastName: formData.get('last-name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                pincode: formData.get('pincode')
            },
            paymentMethod: formData.get('payment-method'),
            order: this.bag,
            total: document.getElementById('checkout-total').textContent,
            orderDate: new Date().toLocaleString()
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        // Simulate payment processing
        setTimeout(() => {
            this.completeOrder(orderData);
        }, 2000);
    }

    async completeOrder(orderData) {
        try {
            // Send order data to form submission service (same as contact form)
            const response = await fetch('https://submit-form.com/St98Poetu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...orderData,
                    subject: `New Order - ${orderData.customer.firstName} ${orderData.customer.lastName}`,
                    message: this.generateOrderEmail(orderData)
                })
            });

            if (response.ok) {
                // Clear the bag
                localStorage.removeItem('shoppingBag');
                
                // Show success message
                this.showSuccessMessage();
            } else {
                throw new Error('Failed to submit order');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showErrorMessage();
        }
    }

    generateOrderEmail(orderData) {
        let emailContent = `NEW ORDER RECEIVED\n\n`;
        emailContent += `Customer: ${orderData.customer.firstName} ${orderData.customer.lastName}\n`;
        emailContent += `Email: ${orderData.customer.email}\n`;
        emailContent += `Phone: ${orderData.customer.phone}\n`;
        emailContent += `Address: ${orderData.customer.address}, ${orderData.customer.city} - ${orderData.customer.pincode}\n\n`;
        emailContent += `Order Details:\n`;
        
        orderData.order.forEach(item => {
            emailContent += `- ${item.name} (Qty: ${item.quantity}) - ${item.price}\n`;
        });
        
        emailContent += `\nTotal Amount: ${orderData.total}\n`;
        emailContent += `Payment Method: ${orderData.paymentMethod}\n`;
        emailContent += `Order Date: ${orderData.orderDate}`;

        return emailContent;
    }

    showSuccessMessage() {
        const successHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Order Successful!</h3>
                <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
                <p>Order ID: #${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                <a href="index.html" class="btn">Return to Home</a>
            </div>
        `;
        
        document.querySelector('.checkout-container').innerHTML = successHTML;
    }

    showErrorMessage() {
        alert('There was an error processing your order. Please try again.');
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        submitBtn.disabled = false;
    }

    updateBagCount() {
        const bagCount = document.getElementById('bag-count');
        const totalItems = this.bag.reduce((total, item) => total + item.quantity, 0);
        if (bagCount) {
            bagCount.textContent = totalItems;
            bagCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }
}

// Initialize checkout
const checkout = new Checkout();