function saveCategoryMargins() {
    localStorage.setItem('categoryMargins', JSON.stringify(categoryMarginsData));
}

function generateSampleImportOrders() {
    const today = new Date();
    const orders = [];
    
    // 3 pending orders
    for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const randomProducts = [];
        const productCount = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < productCount; j++) {
            const product = inventoryData[Math.floor(Math.random() * inventoryData.length)];
            randomProducts.push({
                productId: product.id,
                productName: product.name,
                quantity: Math.floor(Math.random() * 50) + 10,
                cost: product.cost
            });
        }
        
        const total = randomProducts.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        
        orders.push({
            id: Date.now() + i,
            date: date.toISOString().split('T')[0],
            status: 'pending',
            items: randomProducts,
            total: total,
            createdAt: date.toISOString()
        });
    }
    
    // 5 completed orders
    for (let i = 3; i < 8; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 3);
        
        const randomProducts = [];
        const productCount = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < productCount; j++) {
            const product = inventoryData[Math.floor(Math.random() * inventoryData.length)];
            randomProducts.push({
                productId: product.id,
                productName: product.name,
                quantity: Math.floor(Math.random() * 80) + 20,
                cost: product.cost
            });
        }
        
        const total = randomProducts.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        
        orders.push({
            id: Date.now() + i * 1000,
            date: date.toISOString().split('T')[0],
            status: 'completed',
            items: randomProducts,
            total: total,
            createdAt: date.toISOString(),
            completedAt: date.toISOString()
        });
    }
    
    return orders;
}

// ============================================
// WAREHOUSE DATA MANAGEMENT
// ============================================

// Sample inventory data structure
let inventoryData = [];
let importOrdersData = [];
let transactionsData = [];

// Initialize warehouse data from DataManager
function initializeWarehouseData() {
    if (!window.dataManager || !window.dataManager.initialized) {
        setTimeout(initializeWarehouseData, 100);
        return;
    }

    const products = window.dataManager.getProducts();
    
    // Load saved warehouse data or initialize
    const savedWarehouse = localStorage.getItem('warehouseInventory');
    if (savedWarehouse) {
        inventoryData = JSON.parse(savedWarehouse);
    } else {
        // Initialize inventory from products
        inventoryData = products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            stock: product.stock || 0,
            minStock: 20,
            cost: product.price * 0.6, // 60% of selling price as cost
            price: product.price,
            lastUpdated: new Date().toISOString()
        }));
        saveWarehouseData();
    }

    // Load import orders
    const savedOrders = localStorage.getItem('warehouseImportOrders');
    if (savedOrders) {
        importOrdersData = JSON.parse(savedOrders);
    } else {
        importOrdersData = generateSampleImportOrders();
        saveImportOrders();
    }

    // Load category margins
    const savedMargins = localStorage.getItem('categoryMargins');
    if (savedMargins) {
        categoryMarginsData = JSON.parse(savedMargins);
    } else {
        saveCategoryMargins();
    }

    // Load transactions
    const savedTransactions = localStorage.getItem('warehouseTransactions');
    if (savedTransactions) {
        transactionsData = JSON.parse(savedTransactions);
    } else {
        transactionsData = [];
        saveTransactions();
    }

    console.log('✅ Warehouse data initialized');
}

// ============================================
// DATA OPERATIONS
// ============================================

function getProductById(id) {
    return inventoryData.find(p => p.id === id);
}

function getLowStockItems() {
    return inventoryData.filter(item => item.stock < item.minStock);
}

function updateProductStock(productId, quantity, type = 'import') {
    const product = getProductById(productId);
    if (!product) return false;

    const oldStock = product.stock;
    product.stock += quantity;
    product.lastUpdated = new Date().toISOString();

    // Update DataManager
    window.dataManager.updateProduct(productId, { stock: product.stock });

    // Add transaction record
    transactionsData.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        productId: productId,
        productName: product.name,
        type: type,
        quantity: quantity,
        oldStock: oldStock,
        newStock: product.stock,
        notes: `${type === 'import' ? 'Import' : 'Export'} order`
    });

    saveWarehouseData();
    saveTransactions();
    return true;
}

function updateProductMargin(productId, newCost, newPrice) {
    const product = getProductById(productId);
    if (!product) return false;

    product.cost = parseFloat(newCost);
    product.price = parseFloat(newPrice);
    product.lastUpdated = new Date().toISOString();

    // Update DataManager
    window.dataManager.updateProduct(productId, { price: product.price });

    saveWarehouseData();
    return true;
}

// ============================================
// IMPORT ORDERS
// ============================================

function addImportOrder(orderData) {
    const newOrder = {
        id: Date.now(),
        date: orderData.date,
        status: orderData.status || 'pending',
        items: orderData.items,
        total: orderData.total,
        createdAt: new Date().toISOString()
    };

    importOrdersData.unshift(newOrder);
    saveImportOrders();
    return newOrder;
}

function updateImportOrder(orderId, orderData) {
    const index = importOrdersData.findIndex(o => o.id === orderId);
    if (index === -1) return false;

    const order = importOrdersData[index];
    if (order.status === 'completed') return false; // Cannot edit completed orders

    order.date = orderData.date;
    order.items = orderData.items;
    order.total = orderData.total;
    order.status = orderData.status;

    saveImportOrders();
    return true;
}

function completeImportOrder(orderId) {
    const order = importOrdersData.find(o => o.id === orderId);
    if (!order || order.status === 'completed') return false;

    // Update inventory for each product
    order.items.forEach(item => {
        const product = getProductById(item.productId);
        if (product) {
            // Update cost price
            product.cost = item.cost;
            
            // Update stock
            updateProductStock(item.productId, item.quantity, 'import');
        }
    });

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    
    saveImportOrders();
    saveWarehouseData();
    return true;
}

function deleteImportOrder(orderId) {
    const order = importOrdersData.find(o => o.id === orderId);
    if (!order || order.status === 'completed') return false;

    importOrdersData = importOrdersData.filter(o => o.id !== orderId);
    saveImportOrders();
    return true;
}

// ============================================
// CATEGORY MARGINS
// ============================================

let categoryMarginsData = [
    { category: 'Attack on Titan', margin: 25 },
    { category: 'The Lord of the Rings', margin: 30 },
    { category: 'One Piece', margin: 22 },
    { category: 'Yu-Gi-Oh!', margin: 28 }
];

function updateCategoryMargin(category, marginPercent) {
    const margin = parseFloat(marginPercent);
    
    // Update category margin
    const categoryData = categoryMarginsData.find(c => c.category === category);
    if (categoryData) {
        categoryData.margin = margin;
    }

    // Update all products in this category
    inventoryData.forEach(product => {
        if (product.category === category) {
            const newPrice = product.cost * (1 + margin / 100);
            product.price = parseFloat(newPrice.toFixed(2));
            
            // Update DataManager
            window.dataManager.updateProduct(product.id, { price: product.price });
        }
    });

    saveWarehouseData();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateProfitMargin(cost, price) {
    if (cost === 0) return 0;
    const margin = ((price - cost) / cost) * 100;
    return margin.toFixed(1);
}

function getStockStatus(stock, minStock) {
    if (stock === 0) {
        return { text: 'Out of Stock', class: 'badge-low' };
    } else if (stock < minStock) {
        return { text: 'Low Stock', class: 'badge-ok' };
    } else {
        return { text: 'In Stock', class: 'badge-good' };
    }
}

function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ============================================
// SAVE TO LOCALSTORAGE
// ============================================

function saveWarehouseData() {
    localStorage.setItem('warehouseInventory', JSON.stringify(inventoryData));
}

function saveImportOrders() {
    localStorage.setItem('warehouseImportOrders', JSON.stringify(importOrdersData));
}

function saveTransactions() {
    localStorage.setItem('warehouseTransactions', JSON.stringify(transactionsData));
}

// ============================================
// INITIALIZE ON LOAD
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWarehouseData);
} else {
    initializeWarehouseData();
}