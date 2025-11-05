let ordersLoaded = false;

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

async function initializeOrders() {
    // Đợi DataManager được khởi tạo
    if (!window.dataManager) {
        console.log('DataManager chưa sẵn sàng, đang đợi...');
        return;
    }
    
    await window.dataManager.loadOrders();
    ordersLoaded = true;
    showOrders();
}

function showOrders(searchTerm = '', status = '', startDate = '', endDate = '') {
    if (!ordersLoaded) {
        console.log('Orders chưa được tải, đang đợi...');
        return;
    }

    const orders = window.dataManager.getOrders();
    const orderContainer = document.getElementById('show-order-container');
    
    if (!orderContainer) return;

    const searchInput = document.getElementById('form-search-order');
    const statusSelect = document.getElementById('filter-order-status');
    const startDateInput = document.getElementById('time-start-order');
    const endDateInput = document.getElementById('time-end-order');
    
    const search = searchTerm || (searchInput ? searchInput.value.toLowerCase() : '');
    const selectedStatus = status || (statusSelect ? statusSelect.value : '');
    const filterStartDate = startDate || (startDateInput ? startDateInput.value : '');
    const filterEndDate = endDate || (endDateInput ? endDateInput.value : '');

    // Lọc đơn hàng
    let filteredOrders = orders.filter(order => {
        // Tìm kiếm theo mã đơn hoặc tên khách hàng
        const matchesSearch = order.id.toString().includes(search) || 
                            (order.customerUsername && order.customerUsername.toLowerCase().includes(search));
        
        // Lọc theo trạng thái
        const matchesStatus = !selectedStatus || order.status === selectedStatus;
        
        // Lọc theo ngày
        let matchesDate = true;
        if (filterStartDate || filterEndDate) {
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            
            if (filterStartDate) {
                const startDate = new Date(filterStartDate);
                startDate.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && orderDate >= startDate;
            }
            
            if (filterEndDate) {
                const endDate = new Date(filterEndDate);
                endDate.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && orderDate <= endDate;
            }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    if (filteredOrders.length === 0) {
        orderContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Không tìm thấy đơn hàng</p>';
        return;
    }

    // Hiển thị tất cả đơn hàng (không phân trang)
    orderContainer.innerHTML = filteredOrders.map(order => {
        const orderDate = order.date ? new Date(order.date).toLocaleDateString('vi-VN') : 'N/A';
        const statusText = getStatusText(order.status);
        const statusClass = order.status || 'new';
        
        return `
        <div class="list" data-order-id="${order.id}">
            <div class="list-left">
                <div class="list-info">
                    <h4 class="order-id">#${order.id}</h4>
                    <p class="order-customer"><i class="fa-solid fa-user"></i> ${order.customerUsername || 'Khách hàng'}</p>
                    <p class="order-date"><i class="fa-solid fa-calendar"></i> ${orderDate}</p>
                </div>
            </div>
            <div class="list-right">
                <div class="order-total">
                    <span class="list-current-price">${formatCurrency(order.total || 0)}</span>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-detail" onclick="viewOrderDetail(${order.id})"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn-delete" onclick="deleteOrder(${order.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getStatusText(status) {
    const statusMap = {
        'new': 'Đơn mới',
        'processing': 'Đang xử lý',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || 'Không xác định';
}

function viewOrderDetail(orderId) {
    const order = window.dataManager.getOrders().find(o => o.id === orderId);
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    const modal = document.querySelector('.modal.order-detail');
    if (!modal) {
        createOrderDetailModal();
        setTimeout(() => viewOrderDetail(orderId), 100);
        return;
    }

    // Hiển thị thông tin đơn hàng
    const modalBody = modal.querySelector('.modal-body');
    const orderDate = new Date(order.date).toLocaleDateString('vi-VN');
    const statusText = getStatusText(order.status);
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
        itemsHTML = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');
    } else {
        itemsHTML = '<tr><td colspan="4" style="text-align: center;">Không có sản phẩm</td></tr>';
    }

    modalBody.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px; color: var(--color-primary);">Thông tin đơn hàng</h3>
            <p><strong>Mã đơn:</strong> #${order.id}</p>
            <p><strong>Khách hàng:</strong> ${order.customerUsername || 'N/A'}</p>
            <p><strong>Ngày đặt:</strong> ${orderDate}</p>
            <p><strong>Trạng thái:</strong> ${statusText}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || 'N/A'}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px; color: var(--color-primary);">Sản phẩm</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #f0f0f0;">
                    <tr>
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Số lượng</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Đơn giá</th>
                        <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f9f9f9;">
                        <td colspan="3" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Tổng cộng:</strong></td>
                        <td style="padding: 10px; text-align: right; border: 1px solid #ddd; color: var(--color-primary);"><strong>${formatCurrency(order.total || 0)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeOrderDetailModal() {
    const modal = document.querySelector('.modal.order-detail');
    if (modal) modal.style.display = 'none';
}

function deleteOrder(orderId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId}?`)) return;
    
    const orders = window.dataManager.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    
    localStorage.setItem('orders', JSON.stringify(filtered));
    window.dataManager.data.orders = filtered;
    
    alert('Đã xóa đơn hàng thành công!');
    showOrders();
}

async function refreshOrders() {
    await window.dataManager.loadOrders();
    
    // Reset filters
    const searchInput = document.getElementById('form-search-order');
    const statusSelect = document.getElementById('filter-order-status');
    const startDateInput = document.getElementById('time-start-order');
    const endDateInput = document.getElementById('time-end-order');
    
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = '';
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
    showOrders();
    alert('Đã tải lại danh sách đơn hàng!');
}

function createOrderDetailModal() {
    const modalHTML = `
        <div class="modal order-detail" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Chi tiết đơn hàng</h3>
                    <button class="modal-close" onclick="closeOrderDetailModal()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.querySelector('.modal.order-detail');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeOrderDetailModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Đợi DataManager được khởi tạo
    const checkDataManager = setInterval(() => {
        if (window.dataManager && window.dataManager.initialized) {
            clearInterval(checkDataManager);
            
            initializeOrders();
            
            // Setup event listeners
            const refreshBtn = document.getElementById('btn-refresh-order');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', refreshOrders);
            }

            const searchInput = document.getElementById('form-search-order');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    showOrders();
                });
            }

            const statusSelect = document.getElementById('filter-order-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', () => {
                    showOrders();
                });
            }
            
            const startDateInput = document.getElementById('time-start-order');
            if (startDateInput) {
                startDateInput.addEventListener('change', () => {
                    showOrders();
                });
            }
            
            const endDateInput = document.getElementById('time-end-order');
            if (endDateInput) {
                endDateInput.addEventListener('change', () => {
                    showOrders();
                });
            }
        }
    }, 100);
    
    setTimeout(() => {
        clearInterval(checkDataManager);
        if (!window.dataManager || !window.dataManager.initialized) {
            console.error('DataManager không được khởi tạo sau 10 giây');
        }
    }, 10000);
});

// Export functions to window
window.showOrders = showOrders;
window.viewOrderDetail = viewOrderDetail;
window.deleteOrder = deleteOrder;
window.closeOrderDetailModal = closeOrderDetailModal;
window.refreshOrders = refreshOrders;
