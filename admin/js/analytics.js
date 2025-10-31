// ==================== ANALYTICS WITH REAL DATA ==================== 

function initializeAnalyticsTabs() {
    const btns = document.querySelectorAll('.analytics-tab-btn');
    const contents = document.querySelectorAll('.analytics-tab-content');

    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Load data when tab is opened
                if (targetTab === 'sales-report') {
                    loadSalesReport();
                } else if (targetTab === 'customer-stats') {
                    loadCustomerStats();
                }
            }
        });
    });
}

// ==================== SALES REPORT ====================

function loadSalesReport() {
    if (!window.dataManager || !window.dataManager.initialized) {
        console.log('Waiting for DataManager...');
        setTimeout(loadSalesReport, 100);
        return;
    }

    // Get date filters
    const dateFrom = document.getElementById('salesDateFrom')?.value;
    const dateTo = document.getElementById('salesDateTo')?.value;

    // Get analytics data
    const analytics = window.dataManager.getSalesAnalytics(dateFrom, dateTo);

    // Update stats cards
    updateStatsCards(analytics);
    
    // Update top products
    updateTopProducts(analytics.topProducts);
    
    // Update order status
    updateOrderStatus(analytics.statusBreakdown);
}

function updateStatsCards(analytics) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    // Total Revenue
    const revenueCard = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (revenueCard) {
        revenueCard.textContent = formatCurrency(analytics.totalRevenue);
    }

    // Total Orders
    const ordersCard = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (ordersCard) {
        ordersCard.textContent = analytics.totalOrders;
    }

    // Average Order Value
    const avgCard = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (avgCard) {
        avgCard.textContent = formatCurrency(analytics.avgOrderValue);
    }

    // Profit
    const profitCard = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (profitCard) {
        profitCard.textContent = formatCurrency(analytics.profit);
    }
}

function updateTopProducts(topProducts) {
    const productList = document.querySelector('.top-products .product-list');
    if (!productList || !topProducts.length) return;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    productList.innerHTML = topProducts.map((product, index) => `
        <div class="product-item">
            <div class="product-rank">${index + 1}</div>
            <img src="${product.image}" alt="${product.name}">
            <div class="product-details">
                <h4>${product.name}</h4>
                <p>Đã bán: <strong>${product.soldQuantity} sản phẩm</strong></p>
            </div>
            <div class="product-revenue">${formatCurrency(product.revenue)}</div>
        </div>
    `).join('');
}

function updateOrderStatus(statusBreakdown) {
    const statusCards = {
        new: document.querySelector('.status-card.new .status-count'),
        processing: document.querySelector('.status-card.processing .status-count'),
        delivered: document.querySelector('.status-card.delivered .status-count'),
        cancelled: document.querySelector('.status-card.cancelled .status-count')
    };

    if (statusCards.new) statusCards.new.textContent = statusBreakdown.new;
    if (statusCards.processing) statusCards.processing.textContent = statusBreakdown.processing;
    if (statusCards.delivered) statusCards.delivered.textContent = statusBreakdown.delivered;
    if (statusCards.cancelled) statusCards.cancelled.textContent = statusBreakdown.cancelled;
}

// ==================== CUSTOMER STATS ====================

function loadCustomerStats() {
    if (!window.dataManager || !window.dataManager.initialized) {
        console.log('Waiting for DataManager...');
        setTimeout(loadCustomerStats, 100);
        return;
    }

    const analytics = window.dataManager.getCustomerAnalytics();

    // Update top customers
    updateTopCustomers(analytics.topCustomers);
    
    // Update customer growth
    updateCustomerGrowth(analytics.growth);
    
    // Update retention
    updateCustomerRetention(analytics.retention);
}

function updateTopCustomers(topCustomers) {
    const customerList = document.querySelector('.top-customer-list');
    if (!customerList || !topCustomers.length) return;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const rankEmojis = ['🥇', '🥈', '🥉'];
    const rankClasses = ['rank-1', 'rank-2', 'rank-3'];

    customerList.innerHTML = topCustomers.map((customer, index) => `
        <div class="customer-rank-item ${rankClasses[index] || ''}">
            <div class="rank-badge">${index < 3 ? rankEmojis[index] : index + 1}</div>
            <div class="customer-info">
                <h4>${customer.username}</h4>
                <p>${customer.orderCount} đơn hàng</p>
            </div>
            <div class="customer-spending">${formatCurrency(customer.totalSpent)}</div>
        </div>
    `).join('');
}

function updateCustomerGrowth(growth) {
    const growthItems = document.querySelectorAll('.growth-item .growth-number');
    
    if (growthItems[0]) {
        growthItems[0].innerHTML = `${growth.today} <span>khách hàng</span>`;
    }
    if (growthItems[1]) {
        growthItems[1].innerHTML = `${growth.thisWeek} <span>khách hàng</span>`;
    }
    if (growthItems[2]) {
        growthItems[2].innerHTML = `${growth.thisMonth} <span>khách hàng</span>`;
    }
}

function updateCustomerRetention(retention) {
    const retentionCards = document.querySelectorAll('.retention-card');
    
    if (retentionCards[0]) {
        const loyalValue = retentionCards[0].querySelector('.retention-value');
        const loyalPercent = retentionCards[0].querySelector('.retention-percent');
        if (loyalValue) loyalValue.textContent = `${retention.loyal.count} khách hàng`;
        if (loyalPercent) loyalPercent.textContent = `${retention.loyal.percentage}%`;
    }
    
    if (retentionCards[1]) {
        const returningValue = retentionCards[1].querySelector('.retention-value');
        const returningPercent = retentionCards[1].querySelector('.retention-percent');
        if (returningValue) returningValue.textContent = `${retention.returning.count} khách hàng`;
        if (returningPercent) returningPercent.textContent = `${retention.returning.percentage}%`;
    }
    
    if (retentionCards[2]) {
        const newValue = retentionCards[2].querySelector('.retention-value');
        const newPercent = retentionCards[2].querySelector('.retention-percent');
        if (newValue) newValue.textContent = `${retention.new.count} khách hàng`;
        if (newPercent) newPercent.textContent = `${retention.new.percentage}%`;
    }
}

// ==================== EVENT LISTENERS ====================

// Listen for date filter changes
function setupFilters() {
    const searchBtn = document.querySelector('.analytics-filters .btn-primary');
    const dateFrom = document.getElementById('salesDateFrom');
    const dateTo = document.getElementById('salesDateTo');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            loadSalesReport();
        });
    }

    if (dateFrom) {
        dateFrom.addEventListener('change', () => {
            if (dateTo.value && dateFrom.value > dateTo.value) {
                alert('Ngày bắt đầu không thể sau ngày kết thúc!');
                dateFrom.value = '';
            }
        });
    }

    if (dateTo) {
        dateTo.addEventListener('change', () => {
            if (dateFrom.value && dateTo.value < dateFrom.value) {
                alert('Ngày kết thúc không thể trước ngày bắt đầu!');
                dateTo.value = '';
            }
        });
    }
}

// Listen for DataManager updates
function setupDataListeners() {
    if (window.dataManager) {
        window.dataManager.on('orders', () => {
            // Reload sales report if currently viewing
            if (document.getElementById('sales-report')?.classList.contains('active')) {
                loadSalesReport();
            }
        });

        window.dataManager.on('customers', () => {
            // Reload customer stats if currently viewing
            if (document.getElementById('customer-stats')?.classList.contains('active')) {
                loadCustomerStats();
            }
        });
    }
}

// ==================== INITIALIZATION ====================

// Quan sát và tự động khởi tạo
const obs = new MutationObserver(() => {
    const analyticsSection = document.querySelector('.analytics-tab-btn');
    
    if (analyticsSection) {
        initializeAnalyticsTabs();
        setupFilters();
        setupDataListeners();
        
        // Load initial data
        if (window.dataManager?.initialized) {
            loadSalesReport();
        } else {
            window.dataManager?.on('initialized', () => {
                loadSalesReport();
            });
        }
        
        obs.disconnect();
    }
});

if (document.body) {
    obs.observe(document.body, { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', () => 
        obs.observe(document.body, { childList: true, subtree: true }));
}