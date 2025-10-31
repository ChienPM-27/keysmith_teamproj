// ==================== SYNCHRONIZED ANALYTICS MODULE ====================
// Sử dụng cached data từ DataManager

// ==================== INITIALIZATION ====================

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
                
                if (targetTab === 'sales-report') {
                    loadSalesReport();
                } else if (targetTab === 'customer-stats') {
                    loadCustomerStats();
                }
            }
        });
    });

    console.log('✅ Analytics module initialized');
}

// ==================== SALES REPORT ====================

function loadSalesReport(forceRefresh = false) {
    if (!window.dataManager || !window.dataManager.initialized) {
        setTimeout(() => loadSalesReport(forceRefresh), 100);
        return;
    }

    const dateFrom = document.getElementById('salesDateFrom')?.value;
    const dateTo = document.getElementById('salesDateTo')?.value;

    // Get analytics (sử dụng cache nếu không có filter)
    const analytics = window.dataManager.getSalesAnalytics(dateFrom, dateTo, forceRefresh);

    updateStatsCards(analytics);
    updateTopProducts(analytics.topProducts);
    updateOrderStatus(analytics.statusBreakdown);
    
    console.log('📊 Sales report loaded', {
        revenue: analytics.totalRevenue,
        orders: analytics.totalOrders,
        profit: analytics.profit,
        margin: analytics.profitMargin + '%'
    });
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

    // Profit (Real profit từ cost)
    const profitCard = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (profitCard) {
        profitCard.textContent = formatCurrency(analytics.profit);
    }

    // Update profit margin display nếu có
    const profitMarginEl = document.querySelector('.profit-margin-display');
    if (profitMarginEl && analytics.profitMargin) {
        profitMarginEl.textContent = `Margin: ${analytics.profitMargin}%`;
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
            <img src="${product.image}" alt="${product.name}" onerror="this.src='../../img/placeholder.jpg'">
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

function loadCustomerStats(forceRefresh = false) {
    if (!window.dataManager || !window.dataManager.initialized) {
        setTimeout(() => loadCustomerStats(forceRefresh), 100);
        return;
    }

    // Get analytics (sử dụng cache)
    const analytics = window.dataManager.getCustomerAnalytics(forceRefresh);

    updateTopCustomers(analytics.topCustomers);
    updateCustomerGrowth(analytics.growth);
    updateCustomerRetention(analytics.retention);
    
    console.log('👥 Customer stats loaded', {
        topCustomers: analytics.topCustomers.length,
        newThisMonth: analytics.growth.thisMonth,
        loyalCustomers: analytics.retention.loyal.count
    });
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

function setupFilters() {
    const searchBtn = document.querySelector('.analytics-filters .btn-primary');
    const dateFrom = document.getElementById('salesDateFrom');
    const dateTo = document.getElementById('salesDateTo');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            loadSalesReport(true); // Force refresh when filtering
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

function setupDataListeners() {
    if (window.dataManager) {
        // Listen for order changes
        window.dataManager.on('orders', () => {
            window.dataManager.updateAnalyticsCache();
            if (document.getElementById('sales-report')?.classList.contains('active')) {
                loadSalesReport(true);
            }
        });

        // Listen for customer changes
        window.dataManager.on('customers', () => {
            window.dataManager.updateAnalyticsCache();
            if (document.getElementById('customer-stats')?.classList.contains('active')) {
                loadCustomerStats(true);
            }
        });

        // Listen for product/warehouse changes (affects profit calculation)
        window.dataManager.on('products', () => {
            window.dataManager.updateAnalyticsCache();
            if (document.getElementById('sales-report')?.classList.contains('active')) {
                loadSalesReport(true);
            }
        });

        window.dataManager.on('warehouse', () => {
            window.dataManager.updateAnalyticsCache();
            if (document.getElementById('sales-report')?.classList.contains('active')) {
                loadSalesReport(true);
            }
        });

        console.log('✅ Analytics listeners registered');
    }
}

// ==================== REFRESH BUTTON ====================

function addRefreshButton() {
    const filterGroup = document.querySelector('.analytics-filters');
    if (!filterGroup || document.getElementById('analytics-refresh-btn')) return;

    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'analytics-refresh-btn';
    refreshBtn.className = 'btn-secondary';
    refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Làm mới dữ liệu';
    refreshBtn.onclick = () => {
        const activeTab = document.querySelector('.analytics-tab-content.active');
        if (activeTab?.id === 'sales-report') {
            loadSalesReport(true);
        } else if (activeTab?.id === 'customer-stats') {
            loadCustomerStats(true);
        }
        alert('✅ Dữ liệu đã được làm mới!');
    };

    filterGroup.appendChild(refreshBtn);
}

// ==================== EXPORT FUNCTIONS ====================

function exportSalesReport() {
    const analytics = window.dataManager.getSalesAnalytics();
    const csvContent = generateSalesCSV(analytics);
    downloadCSV(csvContent, 'sales-report.csv');
}

function generateSalesCSV(analytics) {
    let csv = 'Sales Report\n\n';
    csv += 'Metric,Value\n';
    csv += `Total Revenue,${analytics.totalRevenue}\n`;
    csv += `Total Orders,${analytics.totalOrders}\n`;
    csv += `Average Order Value,${analytics.avgOrderValue}\n`;
    csv += `Total Profit,${analytics.profit}\n`;
    csv += `Profit Margin,${analytics.profitMargin}%\n\n`;
    
    csv += 'Top Products\n';
    csv += 'Rank,Product Name,Quantity Sold,Revenue\n';
    analytics.topProducts.forEach((product, index) => {
        csv += `${index + 1},${product.name},${product.soldQuantity},${product.revenue}\n`;
    });
    
    return csv;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== INITIALIZATION ====================

const analyticsObserver = new MutationObserver(() => {
    const analyticsSection = document.querySelector('.analytics-tab-btn');
    
    if (analyticsSection) {
        initializeAnalyticsTabs();
        setupFilters();
        setupDataListeners();
        addRefreshButton();
        
        // Load initial data when DataManager is ready
        if (window.dataManager?.initialized) {
            loadSalesReport();
        } else {
            window.dataManager?.on('initialized', () => {
                loadSalesReport();
            });
        }
        
        analyticsObserver.disconnect();
    }
});

if (document.body) {
    analyticsObserver.observe(document.body, { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', () => 
        analyticsObserver.observe(document.body, { childList: true, subtree: true }));
}

console.log('✅ Synchronized Analytics module loaded!');