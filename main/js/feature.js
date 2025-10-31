// ==================== FEATURE SECTION SCROLL & PRICE UPDATE ====================

// Scroll to Feature section when clicking Feature link
document.addEventListener('DOMContentLoaded', () => {
    const featureLink = document.querySelector('#navbar li a[href="#"]');
    const featureLinks = document.querySelectorAll('#navbar li a');
    
    featureLinks.forEach(link => {
        if (link.textContent.trim() === 'Feature') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Scroll to first pro-container (Attack on Titan collection)
                const proContainer = document.querySelector('#product1 .pro-container');
                if (proContainer) {
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const targetPosition = proContainer.offsetTop - headerHeight - 170; 
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                const nav = document.getElementById('navbar');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                }
            });
        }
    });
    
    // Update product prices from DataManager
    updateProductPrices();
});

// Function to update product prices
async function updateProductPrices() {
    try {
        // Wait a bit for DataManager to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get products from DataManager
        let products = [];
        
        // Try to get from static method first
        if (typeof DataManager !== 'undefined' && DataManager.getProducts) {
            products = DataManager.getProducts();
        } 
        // Try window.dataManager instance
        else if (window.dataManager && window.dataManager.getProducts) {
            products = window.dataManager.getProducts();
        }
        // Fallback to localStorage
        else {
            const stored = localStorage.getItem('products');
            if (stored) {
                products = JSON.parse(stored);
            }
        }
        
        if (!products || products.length === 0) {
            console.warn('No products found in DataManager');
            return;
        }
        
        // Update Attack on Titan Collection
        updateCollectionPrices('Attack on Titan', products);
        
        // Update Lord of the Rings Collection
        updateCollectionPrices('The Lord of the Rings', products);
        
        console.log('✅ Product prices updated from DataManager');
        
    } catch (error) {
        console.error('Error updating product prices:', error);
    }
}

// Function to update prices for a specific collection
function updateCollectionPrices(category, products) {
    // Find all product cards
    const productCards = document.querySelectorAll('#product1 .pro');
    
    productCards.forEach(card => {
        const categorySpan = card.querySelector('.des span');
        const productName = card.querySelector('.des h4');
        const priceElement = card.querySelector('.des h5');
        
        if (!categorySpan || !productName || !priceElement) return;
        
        // Check if this card belongs to the target category
        if (categorySpan.textContent.trim() === category) {
            // Try to find matching product by name
            const cardProductName = productName.textContent.trim();
            
            // Find product in data
            const matchedProduct = products.find(p => {
                if (p.category !== category) return false;
                
                // Try exact match
                if (p.name === cardProductName) return true;
                
                // Try partial match (for products with line breaks)
                const cleanCardName = cardProductName.replace(/\s+/g, ' ').toLowerCase();
                const cleanProductName = p.name.replace(/\s+/g, ' ').toLowerCase();
                
                return cleanProductName.includes(cleanCardName.split('\n')[0].trim().toLowerCase());
            });
            
            if (matchedProduct) {
                // Update price
                priceElement.textContent = `$${matchedProduct.price}`;
                priceElement.style.color = '#ff8519';
                priceElement.style.fontWeight = '600';
                
                // Store product ID in card for future use
                card.setAttribute('data-product-id', matchedProduct.id);
                
                console.log(`Updated: ${matchedProduct.name} - $${matchedProduct.price}`);
            }
        }
    });
}

// Optional: Refresh prices when DataManager updates
if (window.dataManager) {
    window.dataManager.on('products', () => {
        console.log('Products updated in DataManager, refreshing prices...');
        updateProductPrices();
    });
}

// Expose function globally for manual refresh if needed
window.refreshProductPrices = updateProductPrices;

console.log('🚀 Feature scroll & price update script loaded!');