// ==================== SYNCHRONIZED WAREHOUSE MODULE ====================
// Sử dụng DataManager làm single source of truth

// ==================== INITIALIZATION ====================

function initializeWarehouse() {
    // Wait for DataManager
    if (!window.dataManager || !window.dataManager.initialized) {
        setTimeout(initializeWarehouse, 100);
        return;
    }

    console.log('✅ Warehouse module connected to DataManager');
    
    // Load all sections
    loadAlertSection();
    loadInventoryTable();
    loadImportOrdersTable();
    loadTransactionsTable();
    loadMarginsSection();
    
    // Set default date to today
    const importDateInput = document.getElementById('importDate');
    if (importDateInput) {
        importDateInput.valueAsDate = new Date();
    }

    // Listen for DataManager updates
    window.dataManager.on('products', () => {
        loadInventoryTable();
        loadAlertSection();
    });

    window.dataManager.on('warehouse', () => {
        loadImportOrdersTable();
        loadTransactionsTable();
        loadMarginsSection();
        loadInventoryTable();
        loadAlertSection();
    });
}

// ==================== UTILITY FUNCTIONS ====================

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

function calculateProfitMargin(cost, price) {
    if (cost === 0) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
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

// ==================== TAB SWITCHING ====================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    event.target.closest('.tab').classList.add('active');
}

// ==================== ALERT SECTION ====================

function loadAlertSection() {
    const alertSection = document.getElementById('alertSection');
    if (!alertSection) return;

    const lowStockItems = window.dataManager.getLowStockItems();
    
    if (lowStockItems.length === 0) {
        alertSection.innerHTML = '';
        return;
    }
    
    alertSection.innerHTML = `
        <div class="alert-card">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <h3><i class="fas fa-bell"></i> Low Stock Alert</h3>
                <p>${lowStockItems.length} product(s) need restocking</p>
                <div class="alert-items">
                    ${lowStockItems.map(item => `
                        <div class="alert-item">
                            ${item.name}: <strong>${item.stock}</strong> left (Min: ${item.minStock})
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ==================== INVENTORY TAB ====================

function loadInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    const filteredData = getFilteredInventory();
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredData.map(item => {
        const profitMargin = calculateProfitMargin(item.cost, item.price);
        const status = getStockStatus(item.stock, item.minStock);
        
        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td><strong>${item.stock}</strong></td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td>${formatCurrency(item.cost)}</td>
                <td>${formatCurrency(item.price)}</td>
                <td><strong>${profitMargin}%</strong></td>
                <td>
                    <button class="action-btn action-btn-edit" onclick="openMarginModal(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    loadInventoryTable();
}

function getFilteredInventory() {
    const searchInput = document.getElementById('searchInventory');
    const categoryFilter = document.getElementById('categoryFilter');
    
    const inventory = window.dataManager.getWarehouseInventory();
    if (!searchInput || !categoryFilter) return inventory;

    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    return inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.category.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || item.category === category;
        return matchesSearch && matchesCategory;
    });
}

// ==================== IMPORT ORDERS TAB ====================

function loadImportOrdersTable() {
    const tbody = document.getElementById('importTableBody');
    if (!tbody) return;

    const importOrders = window.dataManager.getImportOrders();

    // Update stats
    const completedCount = importOrders.filter(o => o.status === 'completed').length;
    const pendingCount = importOrders.filter(o => o.status === 'pending').length;
    const totalValue = importOrders.reduce((sum, o) => sum + o.total, 0);
    
    const completedEl = document.getElementById('completedOrders');
    const pendingEl = document.getElementById('pendingOrders');
    const totalEl = document.getElementById('totalImportValue');
    
    if (completedEl) completedEl.textContent = completedCount;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (totalEl) totalEl.textContent = formatCurrency(totalValue);
    
    // Load table
    if (importOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No import orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = importOrders.map(order => {
        const itemsSummary = order.items.map(item => 
            `${item.productName} (×${item.quantity})`
        ).join(', ');
        
        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td style="max-width: 300px;">${itemsSummary}</td>
                <td><strong>${formatCurrency(order.total)}</strong></td>
                <td><span class="badge badge-${order.status}">${order.status}</span></td>
                <td>
                    ${order.status === 'pending' ? `
                        <button class="action-btn action-btn-edit" onclick="editImportOrder(${order.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn action-btn-complete" onclick="completeOrder(${order.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="action-btn action-btn-delete" onclick="deleteOrder(${order.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : `
                        <span style="color: rgba(255,255,255,0.5);"><i class="fas fa-check-circle"></i> Completed</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== TRANSACTIONS TAB ====================

function loadTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    const filteredData = getFilteredTransactions();
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredData.map(trans => `
        <tr>
            <td>${formatDate(trans.date)}</td>
            <td><strong>${trans.productName}</strong></td>
            <td><span class="badge badge-${trans.type}">${trans.type}</span></td>
            <td><strong>${trans.quantity > 0 ? '+' : ''}${trans.quantity}</strong></td>
            <td>${trans.notes}</td>
        </tr>
    `).join('');
}

function filterTransactions() {
    loadTransactionsTable();
}

function getFilteredTransactions() {
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    
    const transactions = window.dataManager.getTransactions();
    if (!dateFromInput || !dateToInput) return transactions;

    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;
    
    return transactions.filter(trans => {
        const transDate = trans.date.split('T')[0];
        if (dateFrom && transDate < dateFrom) return false;
        if (dateTo && transDate > dateTo) return false;
        return true;
    });
}

function resetDateFilter() {
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';
    
    filterTransactions();
}

// ==================== MARGINS TAB ====================

function loadMarginsSection() {
    const categoryMargins = window.dataManager.getCategoryMargins();
    const inventory = window.dataManager.getWarehouseInventory();

    // Load category margins
    const categoryGrid = document.getElementById('categoryMarginsGrid');
    if (categoryGrid) {
        categoryGrid.innerHTML = categoryMargins.map(cat => `
            <div class="margin-card">
                <h3>${cat.category}</h3>
                <div class="margin-value">
                    <span>${cat.margin}</span>
                    <small>%</small>
                </div>
                <div class="margin-input">
                    <input type="number" id="margin-${cat.category.replace(/\s+/g, '-')}" 
                           value="${cat.margin}" step="0.1" min="0">
                    <button class="btn btn-primary" onclick="saveCategoryMargin('${cat.category}')">
                        <i class="fas fa-save"></i> Save
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Load product margins
    const tbody = document.getElementById('productMarginsTableBody');
    if (tbody) {
        tbody.innerHTML = inventory.map(item => {
            const profitMargin = calculateProfitMargin(item.cost, item.price);
            return `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.category}</td>
                    <td>${formatCurrency(item.cost)}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td><strong>${profitMargin}%</strong></td>
                    <td>
                        <button class="action-btn action-btn-edit" onclick="openMarginModal(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

function saveCategoryMargin(category) {
    const inputId = 'margin-' + category.replace(/\s+/g, '-');
    const input = document.getElementById(inputId);
    if (!input) return;

    const newMargin = parseFloat(input.value);
    
    if (isNaN(newMargin) || newMargin < 0) {
        alert('Please enter a valid margin percentage');
        return;
    }
    
    if (confirm(`Apply ${newMargin}% profit margin to all products in "${category}" category?`)) {
        window.dataManager.updateCategoryMargin(category, newMargin);
        alert('✅ Category margin updated successfully!');
    }
}

// ==================== IMPORT ORDER MODAL ====================

function openImportModal() {
    const modal = document.getElementById('importModal');
    if (!modal) return;

    modal.classList.add('active');
    
    const titleEl = document.getElementById('importModalTitle');
    const formEl = document.getElementById('importForm');
    const orderIdEl = document.getElementById('importOrderId');
    const dateEl = document.getElementById('importDate');
    
    if (titleEl) titleEl.textContent = 'New Import Order';
    if (formEl) formEl.reset();
    if (orderIdEl) orderIdEl.value = '';
    if (dateEl) dateEl.valueAsDate = new Date();
    
    const productsList = document.getElementById('importProductsList');
    if (productsList) {
        productsList.innerHTML = getProductLineHTML();
        populateProductSelects();
        calculateTotalImportValue();
    }
}

function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function editImportOrder(orderId) {
    const order = window.dataManager.getImportOrders().find(o => o.id === orderId);
    if (!order || order.status === 'completed') return;
    
    const modal = document.getElementById('importModal');
    if (!modal) return;

    modal.classList.add('active');
    
    const titleEl = document.getElementById('importModalTitle');
    const orderIdEl = document.getElementById('importOrderId');
    const dateEl = document.getElementById('importDate');
    
    if (titleEl) titleEl.textContent = 'Edit Import Order #' + orderId;
    if (orderIdEl) orderIdEl.value = orderId;
    if (dateEl) dateEl.value = order.date;
    
    const productsList = document.getElementById('importProductsList');
    if (productsList) {
        productsList.innerHTML = order.items.map(item => getProductLineHTML(item)).join('');
        populateProductSelects();
        calculateTotalImportValue();
    }
}

function getProductLineHTML(item = null) {
    return `
        <div class="import-product-item">
            <select class="product-select" required onchange="calculateTotalImportValue()">
                <option value="">Select Product</option>
            </select>
            <input type="number" placeholder="Quantity" min="1" value="${item ? item.quantity : ''}" 
                   required onchange="calculateTotalImportValue()">
            <input type="number" placeholder="Cost Price ($)" step="0.01" min="0" value="${item ? item.cost : ''}" 
                   required onchange="calculateTotalImportValue()">
            <button type="button" class="btn-icon btn-remove" onclick="removeProductLine(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function populateProductSelects() {
    const products = window.dataManager.getProducts();
    const selects = document.querySelectorAll('.product-select');
    const options = products.map(p => 
        `<option value="${p.id}" data-name="${p.name}" data-cost="${p.cost}">${p.name}</option>`
    ).join('');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Product</option>' + options;
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

function addProductLine() {
    const productsList = document.getElementById('importProductsList');
    if (productsList) {
        productsList.insertAdjacentHTML('beforeend', getProductLineHTML());
        populateProductSelects();
    }
}

function removeProductLine(button) {
    const items = document.querySelectorAll('.import-product-item');
    if (items.length > 1) {
        button.closest('.import-product-item').remove();
        calculateTotalImportValue();
    } else {
        alert('❌ At least one product is required');
    }
}

function calculateTotalImportValue() {
    const items = document.querySelectorAll('.import-product-item');
    let total = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelectorAll('input')[0].value) || 0;
        const cost = parseFloat(item.querySelectorAll('input')[1].value) || 0;
        total += quantity * cost;
    });
    
    const displayEl = document.getElementById('totalImportValueDisplay');
    if (displayEl) {
        displayEl.textContent = formatCurrency(total);
    }
}

function saveImportOrder(complete = false) {
    const orderIdEl = document.getElementById('importOrderId');
    const dateEl = document.getElementById('importDate');
    
    if (!dateEl || !dateEl.value) {
        alert('❌ Please select import date');
        return;
    }

    const orderId = orderIdEl ? parseInt(orderIdEl.value) : null;
    const date = dateEl.value;
    const items = [];
    let total = 0;
    
    document.querySelectorAll('.import-product-item').forEach(item => {
        const select = item.querySelector('.product-select');
        const productId = parseInt(select.value);
        const quantity = parseInt(item.querySelectorAll('input')[0].value);
        const cost = parseFloat(item.querySelectorAll('input')[1].value);
        
        if (productId && quantity && cost) {
            const productName = select.options[select.selectedIndex].dataset.name;
            items.push({
                productId,
                productName,
                quantity,
                cost
            });
            total += quantity * cost;
        }
    });
    
    if (items.length === 0) {
        alert('❌ Please add at least one product');
        return;
    }
    
    const orderData = {
        date,
        status: complete ? 'completed' : 'pending',
        items,
        total
    };
    
    if (orderId) {
        window.dataManager.updateImportOrder(orderId, orderData);
        if (complete) {
            window.dataManager.completeImportOrder(orderId);
        }
    } else {
        const newOrder = window.dataManager.addImportOrder(orderData);
        if (complete && newOrder) {
            window.dataManager.completeImportOrder(newOrder.id);
        }
    }
    
    closeImportModal();
    alert(complete ? '✅ Import order completed successfully!' : '✅ Import order saved as draft!');
}

function completeOrder(orderId) {
    if (confirm('⚠️ Complete this import order? This will update the inventory and cannot be undone.')) {
        if (window.dataManager.completeImportOrder(orderId)) {
            alert('✅ Import order completed successfully! Inventory updated.');
        } else {
            alert('❌ Failed to complete order');
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('⚠️ Delete this import order? This action cannot be undone.')) {
        if (window.dataManager.deleteImportOrder(orderId)) {
            alert('✅ Import order deleted successfully!');
        } else {
            alert('❌ Cannot delete completed orders');
        }
    }
}

// ==================== MARGIN MODAL ====================

function openMarginModal(productId) {
    const product = window.dataManager.getProduct(productId);
    if (!product) return;
    
    const modal = document.getElementById('marginModal');
    if (!modal) return;

    modal.classList.add('active');
    
    const productIdEl = document.getElementById('marginProductId');
    const productNameEl = document.getElementById('marginProductName');
    const costEl = document.getElementById('marginCost');
    const priceEl = document.getElementById('marginPrice');
    
    if (productIdEl) productIdEl.value = productId;
    if (productNameEl) productNameEl.textContent = product.name;
    if (costEl) costEl.value = product.cost.toFixed(2);
    if (priceEl) priceEl.value = product.price.toFixed(2);
    
    calculateMargin();
}

function closeMarginModal() {
    const modal = document.getElementById('marginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function calculateMargin() {
    const costEl = document.getElementById('marginCost');
    const priceEl = document.getElementById('marginPrice');
    const marginEl = document.getElementById('calculatedMargin');
    
    if (!costEl || !priceEl || !marginEl) return;

    const cost = parseFloat(costEl.value) || 0;
    const price = parseFloat(priceEl.value) || 0;
    const margin = calculateProfitMargin(cost, price);
    
    marginEl.textContent = margin + '%';
}

// ==================== FORM HANDLERS ====================

// Import form submit
const importForm = document.getElementById('importForm');
if (importForm) {
    importForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveImportOrder(true);
    });
}

// Save draft button
const saveDraftBtn = document.getElementById('saveDraftBtn');
if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', function() {
        saveImportOrder(false);
    });
}

// Margin form submit
const marginForm = document.getElementById('marginForm');
if (marginForm) {
    marginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productIdEl = document.getElementById('marginProductId');
        const costEl = document.getElementById('marginCost');
        const priceEl = document.getElementById('marginPrice');
        
        if (!productIdEl || !costEl || !priceEl) return;

        const productId = parseInt(productIdEl.value);
        const newCost = parseFloat(costEl.value);
        const newPrice = parseFloat(priceEl.value);
        
        window.dataManager.updateProduct(productId, {
            cost: newCost,
            price: newPrice
        });
        
        closeMarginModal();
        alert('✅ Product margin updated successfully!');
    });
}

// ==================== MODAL CLOSE ON OUTSIDE CLICK ====================

window.onclick = function(event) {
    const importModal = document.getElementById('importModal');
    const marginModal = document.getElementById('marginModal');
    
    if (event.target === importModal) {
        closeImportModal();
    }
    if (event.target === marginModal) {
        closeMarginModal();
    }
}

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImportModal();
        closeMarginModal();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openImportModal();
    }
});

// ==================== AUTO INITIALIZE ====================

const warehouseObserver = new MutationObserver(() => {
    const warehouseSection = document.querySelector('.warehouse-wrapper');
    
    if (warehouseSection) {
        initializeWarehouse();
        warehouseObserver.disconnect();
    }
});

if (document.body) {
    warehouseObserver.observe(document.body, { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', () => 
        warehouseObserver.observe(document.body, { childList: true, subtree: true }));
}

console.log('✅ Synchronized Warehouse module loaded!');