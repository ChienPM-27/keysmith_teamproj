let currentEditingUsername = null;
let customersLoaded = false;

async function initializeCustomers() {
    // Đợi DataManager được khởi tạo
    if (!window.dataManager) {
        console.log('DataManager chưa sẵn sàng, đang đợi...');
        return;
    }
    
    await window.dataManager.loadCustomers();
    customersLoaded = true;
    showCustomers();
}

function showCustomers(searchTerm = '', status = '') {
    if (!customersLoaded) {
        console.log('Customers chưa được tải, đang đợi...');
        return;
    }

    const customers = window.dataManager.getCustomers();
    const customerContainer = document.getElementById('show-customer-container');
    
    if (!customerContainer) return;

    const searchInput = document.getElementById('form-search-user');
    const statusSelect = document.getElementById('filter-user-status');
    
    const search = searchTerm || (searchInput ? searchInput.value.toLowerCase() : '');
    const selectedStatus = status || (statusSelect ? statusSelect.value : '');

    // Lọc khách hàng
    let filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.username.toLowerCase().includes(search) || 
                            (customer.email && customer.email.toLowerCase().includes(search)) ||
                            (customer.phone && customer.phone.includes(search));
        
        // Filter theo status nếu cần
        const matchesStatus = !selectedStatus || customer.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (filteredCustomers.length === 0) {
        customerContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Không tìm thấy khách hàng</p>';
        return;
    }

    // Hiển thị tất cả khách hàng (không phân trang)
    customerContainer.innerHTML = filteredCustomers.map(customer => {
        const joinDate = customer.joinDate ? new Date(customer.joinDate).toLocaleDateString('vi-VN') : 'N/A';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.username)}&background=random&size=110`;
        const statusText = customer.status === 'active' ? 'Đang hoạt động' : customer.status === 'locked' ? 'Bị khóa' : 'Không xác định';
        
        return `
        <div class="list" data-username="${customer.username}">
            <div class="list-left">
                <img src="${avatarUrl}" alt="${customer.username}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=cccccc&size=110'">
                <div class="list-info">
                    <h4>${customer.username}</h4>
                    <p class="list-note"><i class="fa-solid fa-envelope"></i> ${customer.email || 'Chưa có email'}</p>
                    ${customer.phone ? `<p class="list-note"><i class="fa-solid fa-phone"></i> ${customer.phone}</p>` : ''}
                    <span class="list-category">${statusText}</span>
                </div>
            </div>
            <div class="list-right">
                <div class="list-price">
                    <span class="list-current-price"><i class="fa-solid fa-calendar"></i> ${joinDate}</span>
                </div>
                <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-edit" onclick="editCustomer('${customer.username}')"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-delete" onclick="deleteCustomer('${customer.username}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}


function openAddCustomerModal() {
    const modal = document.querySelector('.modal.add-customer');
    if (!modal) {
        createCustomerModal();
        return;
    }

    currentEditingUsername = null;
    
    document.getElementById('customer-username').value = '';
    document.getElementById('customer-username').disabled = false;
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    
    const addBtn = document.getElementById('add-customer-button');
    const updateBtn = document.getElementById('update-customer-button');
    if (addBtn) addBtn.style.display = 'inline-block';
    if (updateBtn) updateBtn.style.display = 'none';
    
    modal.style.display = 'flex';
}

function closeCustomerModal() {
    const modal = document.querySelector('.modal.add-customer');
    if (modal) modal.style.display = 'none';
    currentEditingUsername = null;
}

function editCustomer(username) {
    const customer = window.dataManager.getCustomer(username);
    if (!customer) return;

    const modal = document.querySelector('.modal.add-customer');
    if (!modal) {
        createCustomerModal();
        setTimeout(() => editCustomer(username), 100);
        return;
    }

    currentEditingUsername = username;
    
    document.getElementById('customer-username').value = customer.username;
    document.getElementById('customer-username').disabled = true;
    document.getElementById('customer-email').value = customer.email || '';
    document.getElementById('customer-phone').value = customer.phone || '';
    document.getElementById('customer-address').value = customer.address || '';
    
    const addBtn = document.getElementById('add-customer-button');
    const updateBtn = document.getElementById('update-customer-button');
    if (addBtn) addBtn.style.display = 'none';
    if (updateBtn) updateBtn.style.display = 'inline-block';
    
    modal.style.display = 'flex';
}

function deleteCustomer(username) {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${username}"?`)) return;
    
    const customers = window.dataManager.getCustomers();
    const filtered = customers.filter(c => c.username !== username);
    
    localStorage.setItem('customers', JSON.stringify(filtered));
    window.dataManager.data.customers = filtered;
    
    alert('Đã xóa khách hàng thành công!');
    showCustomers();
}

function handleAddCustomer(e) {
    e.preventDefault();
    
    const username = document.getElementById('customer-username').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    
    if (!username || !email) {
        alert('Vui lòng nhập tên người dùng và email!');
        return;
    }

    const existingCustomer = window.dataManager.getCustomer(username);
    if (existingCustomer) {
        alert('Tên người dùng đã tồn tại!');
        return;
    }

    const newCustomer = {
        username,
        email,
        phone,
        address,
        joinDate: new Date().toISOString(),
        status: 'active'
    };

    window.dataManager.addCustomer(newCustomer);
    alert('Đã thêm khách hàng thành công!');
    closeCustomerModal();
    showCustomers();
}

function handleUpdateCustomer(e) {
    e.preventDefault();
    
    if (!currentEditingUsername) return;

    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    
    if (!email) {
        alert('Vui lòng nhập email!');
        return;
    }

    const customers = window.dataManager.getCustomers();
    const index = customers.findIndex(c => c.username === currentEditingUsername);
    
    if (index !== -1) {
        customers[index] = {
            ...customers[index],
            email,
            phone,
            address
        };
        
        localStorage.setItem('customers', JSON.stringify(customers));
        window.dataManager.data.customers = customers;
        
        alert('Đã cập nhật thông tin khách hàng thành công!');
        closeCustomerModal();
        showCustomers();
        
        document.getElementById('customer-username').disabled = false;
    } else {
        alert('Không tìm thấy khách hàng!');
    }
}

async function refreshCustomers() {
    await window.dataManager.loadCustomers();
    showCustomers();
    alert('Đã tải lại danh sách khách hàng!');
}

function createCustomerModal() {
    const modalHTML = `
        <div class="modal add-customer" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Quản lý khách hàng</h3>
                    <button class="modal-close customer-form" onclick="closeCustomerModal()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="customer-form" id="customer-form">
                        <div class="form-group">
                            <label for="customer-username">Tên người dùng <span style="color: red;">*</span></label>
                            <input type="text" id="customer-username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email <span style="color: red;">*</span></label>
                            <input type="email" id="customer-email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-phone">Số điện thoại</label>
                            <input type="tel" id="customer-phone" name="phone">
                        </div>
                        <div class="form-group">
                            <label for="customer-address">Địa chỉ</label>
                            <textarea id="customer-address" name="address" rows="3"></textarea>
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="submit" id="add-customer-button" class="btn-primary" style="padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fa-solid fa-plus"></i> Thêm khách hàng
                            </button>
                            <button type="submit" id="update-customer-button" class="btn-primary" style="padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 5px; cursor: pointer; display: none;">
                                <i class="fa-solid fa-save"></i> Cập nhật
                            </button>
                            <button type="button" class="btn-secondary" onclick="closeCustomerModal()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fa-solid fa-xmark"></i> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const form = document.getElementById('customer-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const addBtn = document.getElementById('add-customer-button');
            if (addBtn && addBtn.style.display !== 'none') {
                handleAddCustomer(e);
            } else {
                handleUpdateCustomer(e);
            }
        });
    }
    
    const modal = document.querySelector('.modal.add-customer');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCustomerModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Đợi DataManager được khởi tạo
    const checkDataManager = setInterval(() => {
        if (window.dataManager && window.dataManager.initialized) {
            clearInterval(checkDataManager);
            
            initializeCustomers();
            
            // Setup event listeners
            const addBtn = document.getElementById('btn-add-user');
            if (addBtn) {
                addBtn.addEventListener('click', openAddCustomerModal);
            }

            const refreshBtn = document.getElementById('btn-refresh-user');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', refreshCustomers);
            }

            const searchInput = document.getElementById('form-search-user');
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    showCustomers();
                });
            }

            const statusSelect = document.getElementById('filter-user-status');
            if (statusSelect) {
                statusSelect.addEventListener('change', () => {
                    showCustomers();
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
window.showCustomers = showCustomers;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.openAddCustomerModal = openAddCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.refreshCustomers = refreshCustomers;