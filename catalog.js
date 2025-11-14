// Catalog functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const priceFilter = document.getElementById('price-filter');
  const sortBy = document.getElementById('sort-by');
  const fishGrid = document.querySelector('.fish-grid');
  const fishCards = Array.from(document.querySelectorAll('.fish-card'));
  
  function filterFish() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const price = priceFilter.value;
    
    fishCards.forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      const cardCategory = card.dataset.category;
      const cardPrice = card.dataset.price;
      
      const matchesSearch = name.includes(searchTerm);
      const matchesCategory = category === 'all' || cardCategory === category;
      const matchesPrice = price === 'all' || cardPrice === price;
      
      if(matchesSearch && matchesCategory && matchesPrice) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
    
    sortFish();
  }
  
  function sortFish() {
    const sortValue = sortBy.value;
    const visibleCards = fishCards.filter(card => card.style.display !== 'none');
    
    visibleCards.sort((a, b) => {
      const aPrice = parseInt(a.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
      const bPrice = parseInt(b.querySelector('.price').textContent.replace('₹', '').replace(',', ''));
      const aName = a.querySelector('h3').textContent.toLowerCase();
      const bName = b.querySelector('h3').textContent.toLowerCase();
      
      switch(sortValue) {
        case 'low-high':
          return aPrice - bPrice;
        case 'high-low':
          return bPrice - aPrice;
        case 'name':
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });
    
    fishGrid.innerHTML = '';
    visibleCards.forEach(card => fishGrid.appendChild(card));
    
    // Reattach event listeners after sorting
    attachAddToBagListeners();
  }
  
  function attachAddToBagListeners() {
    document.querySelectorAll('.add-to-bag').forEach(button => {
      button.addEventListener('click', function() {
        const fishCard = this.closest('.fish-card');
        const fishName = fishCard.querySelector('h3').textContent;
        const fishPrice = fishCard.querySelector('.price').textContent;
        const fishImage = fishCard.querySelector('img').src;
        const fishDescription = fishCard.querySelector('p').textContent;

        const item = {
          name: fishName,
          price: fishPrice,
          image: fishImage,
          description: fishDescription,
          quantity: 1
        };

        // Add to bag
        addToBag(item);

        // Visual feedback
        this.textContent = 'Added ✓';
        this.disabled = true;
        this.style.backgroundColor = '#52b69a';

        setTimeout(() => {
          this.textContent = 'Add to Bag';
          this.disabled = false;
          this.style.backgroundColor = '';
        }, 2000);
      });
    });
  }
  
  // Function to add item to bag
  function addToBag(item) {
    let bag = JSON.parse(localStorage.getItem('shoppingBag')) || [];
    
    // Check if item already exists in bag
    const existingItemIndex = bag.findIndex(bagItem => 
        bagItem.name === item.name && bagItem.price === item.price
    );

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        bag[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        bag.push({
            ...item,
            quantity: 1
        });
    }

    localStorage.setItem('shoppingBag', JSON.stringify(bag));
    
    // Update bag count in navigation
    updateBagCount();
    
    // Show confirmation
    showAddToBagConfirmation(item.name);
  }

  function showAddToBagConfirmation(itemName) {
    // Create and show a confirmation toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-teal);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${itemName} added to bag!
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
  }

  function updateBagCount() {
    const bag = JSON.parse(localStorage.getItem('shoppingBag')) || [];
    const bagCount = document.getElementById('bag-count');
    const totalItems = bag.reduce((total, item) => total + item.quantity, 0);
    if (bagCount) {
        bagCount.textContent = totalItems;
        bagCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
  }

  // Initial setup
  attachAddToBagListeners();
  updateBagCount();
  
  searchInput.addEventListener('input', filterFish);
  categoryFilter.addEventListener('change', filterFish);
  priceFilter.addEventListener('change', filterFish);
  sortBy.addEventListener('change', sortFish);
});