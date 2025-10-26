// ============================================
// INITIALIZATION
// ============================================

function initializeWarehouse() {
    // Load all data
    loadAlertSection();
    loadInventoryTable();
    loadImportOrdersTable();
    loadTransactionsTable();
    loadMarginsSection();
    
    // Set default date to today
    document.getElementById('importDate').valueAsDate = new Date();
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to selected tab
    event.target.classList.add('active');
}

// ============================================
// ALERT SECTION
// ============================================

function loadAlertSection() {
    const alertSection = document.getElementById('alertSection');
    const lowStockItems = getLowStockItems();
    
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

// ============================================
// INVENTORY TAB
// ============================================

function loadInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    const filteredData = getFilteredInventory();
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px;">No products found</td></tr>';
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
                <td>${item.minStock}</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td>${formatCurrency(item.cost)}</td>
                <td>${formatCurrency(item.price)}</td>
                <td><strong>${profitMargin}%</strong></td>
                <td>${formatDate(item.lastUpdated)}</td>
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
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    return inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                             item.category.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
}

// ============================================
// IMPORT ORDERS TAB
// ============================================

function loadImportOrdersTable() {
    const tbody = document.getElementById('importTableBody');
    
    // Update stats
    const completedCount = importOrdersData.filter(o => o.status === 'completed').length;
    const pendingCount = importOrdersData.filter(o => o.status === 'pending').length;
    const totalValue = importOrdersData.reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('completedOrders').textContent = completedCount;
    document.getElementById('pendingOrders').textContent = pendingCount;
    document.getElementById('totalImportValue').textContent = formatCurrency(totalValue);
    
    // Load table
    if (importOrdersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No import orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = importOrdersData.map(order => {
        const itemsSummary = order.items.map(item => 
            `${item.productName} (${item.quantity})`
        ).join(', ');
        
        return `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${formatDate(order.date)}</td>
                <td>${itemsSummary}</td>
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
                        <span style="color: rgba(255,255,255,0.5);">Completed</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// TRANSACTIONS TAB
// ============================================

function loadTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
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
            <td><strong>${trans.quantity}</strong></td>
            <td>${trans.notes}</td>
        </tr>
    `).join('');
}

function filterTransactions() {
    loadTransactionsTable();
}

function getFilteredTransactions() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    return transactionsData.filter(trans => {
        if (dateFrom && trans.date < dateFrom) return false;
        if (dateTo && trans.date > dateTo) return false;
        return true;
    });
}

function resetDateFilter() {
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    filterTransactions();
}

// ============================================
// MARGINS TAB
// ============================================

function loadMarginsSection() {
    // Load category margins
    const categoryGrid = document.getElementById('categoryMarginsGrid');
    categoryGrid.innerHTML = categoryMarginsData.map(cat => `
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
    
    // Load product margins
    const tbody = document.getElementById('productMarginsTableBody');
    tbody.innerHTML = inventoryData.map(item => {
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

function saveCategoryMargin(category) {
    const inputId = 'margin-' + category.replace(/\s+/g, '-');
    const newMargin = document.getElementById(inputId).value;
    
    if (confirm(`Apply ${newMargin}% profit margin to all products in "${category}" category?`)) {
        updateCategoryMargin(category, newMargin);
        loadMarginsSection();
        loadInventoryTable();
        alert('Category margin updated successfully!');
    }
}

// ============================================
// IMPORT ORDER MODAL
// ============================================

function openImportModal() {
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importModalTitle').textContent = 'New Import Order';
    document.getElementById('importForm').reset();
    document.getElementById('importOrderId').value = '';
    document.getElementById('importDate').valueAsDate = new Date();
    
    // Reset product list to one item
    document.getElementById('importProductsList').innerHTML = getProductLineHTML();
    populateProductSelects();
    calculateTotalImportValue();
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

function editImportOrder(orderId) {
    const order = importOrdersData.find(o => o.id === orderId);
    if (!order || order.status === 'completed') return;
    
    document.getElementById('importModal').classList.add('active');
    document.getElementById('importModalTitle').textContent = 'Edit Import Order #' + orderId;
    document.getElementById('importOrderId').value = orderId;
    document.getElementById('importDate').value = order.date;
    
    // Load products
    const productsList = document.getElementById('importProductsList');
    productsList.innerHTML = order.items.map(item => getProductLineHTML(item)).join('');
    populateProductSelects();
    calculateTotalImportValue();
}

function getProductLineHTML(item = null) {
    return `
        <div class="import-product-item">
            <select class="product-select" required onchange="calculateTotalImportValue()">
                <option value="">Select Product</option>
            </select>
            <input type="number" placeholder="Quantity" min="1" value="${item ? item.quantity : ''}" 
                   required onchange="calculateTotalImportValue()">
            <input type="number" placeholder="Cost Price" step="0.01" min="0" value="${item ? item.cost : ''}" 
                   required onchange="calculateTotalImportValue()">
            <button type="button" class="btn-icon btn-remove" onclick="removeProductLine(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function populateProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    const options = inventoryData.map(p => 
        `<option value="${p.id}">${p.name}</option>`
    ).join('');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Product</option>' + options;
        select.value = currentValue;
    });
}

function addProductLine() {
    const productsList = document.getElementById('importProductsList');
    productsList.insertAdjacentHTML('beforeend', getProductLineHTML());
    populateProductSelects();
}

function removeProductLine(button) {
    const items = document.querySelectorAll('.import-product-item');
    if (items.length > 1) {
        button.closest('.import-product-item').remove();
        calculateTotalImportValue();
    } else {
        alert('At least one product is required');
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
    
    document.getElementById('totalImportValueDisplay').textContent = formatCurrency(total);
}

function saveImportOrder(complete = false) {
    const orderId = document.getElementById('importOrderId').value;
    const date = document.getElementById('importDate').value;
    const items = [];
    let total = 0;
    
    document.querySelectorAll('.import-product-item').forEach(item => {
        const productId = parseInt(item.querySelector('.product-select').value);
        const quantity = parseInt(item.querySelectorAll('input')[0].value);
        const cost = parseFloat(item.querySelectorAll('input')[1].value);
        
        if (productId && quantity && cost) {
            const product = getProductById(productId);
            items.push({
                productId,
                productName: product.name,
                quantity,
                cost
            });
            total += quantity * cost;
        }
    });
    
    if (items.length === 0) {
        alert('Please add at least one product');
        return;
    }
    
    const orderData = {
        date,
        status: complete ? 'completed' : 'pending',
        items,
        total
    };
    
    if (orderId) {
        // Update existing order
        updateImportOrder(parseInt(orderId), orderData);
        if (complete) {
            completeImportOrder(parseInt(orderId));
        }
    } else {
        // Create new order
        const newOrder = addImportOrder(orderData);
        if (complete) {
            completeImportOrder(newOrder.id);
        }
    }
    
    closeImportModal();
    loadImportOrdersTable();
    loadInventoryTable();
    loadTransactionsTable();
    loadAlertSection();
    
    alert(complete ? 'Import order completed successfully!' : 'Import order saved as draft!');
}

document.getElementById('importForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveImportOrder(true);
});

function completeOrder(orderId) {
    if (confirm('Complete this import order? This will update the inventory.')) {
        if (completeImportOrder(orderId)) {
            loadImportOrdersTable();
            loadInventoryTable();
            loadTransactionsTable();
            loadAlertSection();
            alert('Import order completed successfully!');
        } else {
            alert('Failed to complete order');
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Delete this import order? This action cannot be undone.')) {
        if (deleteImportOrder(orderId)) {
            loadImportOrdersTable();
            alert('Import order deleted successfully!');
        } else {
            alert('Cannot delete completed orders');
        }
    }
}

// ============================================
// MARGIN MODAL
// ============================================

function openMarginModal(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    document.getElementById('marginModal').classList.add('active');
    document.getElementById('marginProductId').value = productId;
    document.getElementById('marginProductName').textContent = product.name;
    document.getElementById('marginCost').value = product.cost;
    document.getElementById('marginPrice').value = product.price;
    calculateMargin();
}

function closeMarginModal() {
    document.getElementById('marginModal').classList.remove('active');
}

function calculateMargin() {
    const cost = parseFloat(document.getElementById('marginCost').value) || 0;
    const price = parseFloat(document.getElementById('marginPrice').value) || 0;
    const margin = calculateProfitMargin(cost, price);
    document.getElementById('calculatedMargin').textContent = margin + '%';
}

document.getElementById('marginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('marginProductId').value);
    const newCost = document.getElementById('marginCost').value;
    const newPrice = document.getElementById('marginPrice').value;
    
    if (updateProductMargin(productId, newCost, newPrice)) {
        closeMarginModal();
        loadInventoryTable();
        loadMarginsSection();
        alert('Product margin updated successfully!');
    } else {
        alert('Failed to update margin');
    }
});

// ============================================
// CLOSE MODALS ON OUTSIDE CLICK
// ============================================

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

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        closeImportModal();
        closeMarginModal();
    }
    
    // Ctrl/Cmd + N for new import order
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openImportModal();
    }
});