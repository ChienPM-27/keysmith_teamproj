let currentEditingUsername = null;
let customersLoaded = false;

async function initializeCustomers() {
    // Đợi DataManager được khởi tạo
    if (!window.dataManager) {
        console.log('DataManager chưa sẵn sàng, đang đợi...');
        return;
    }
    // Đọc dữ liệu từ localStorage.users thay vì customers
    customersLoaded = true;
    showCustomers();
}

function showCustomers(searchTerm = '', status = '') {
    if (!customersLoaded) {
        console.log('Customers chưa được tải, đang đợi...');
        return;
    }
    // Merge customers from localStorage.customers and localStorage.users
    // - If username exists in both, merge fields (customers data wins for contact fields)
    // - If user exists but not in customers, add a customer entry derived from user (status default 'active')
    let customers = [];
    try {
        const localCustomers = Array.isArray(JSON.parse(localStorage.getItem('customers') || '[]')) ? JSON.parse(localStorage.getItem('customers') || '[]') : [];
        const users = Array.isArray(JSON.parse(localStorage.getItem('users') || '[]')) ? JSON.parse(localStorage.getItem('users') || '[]') : [];

        // Build map of customers by username
        const custMap = new Map();
        localCustomers.forEach(c => {
            if (c && c.username) {
                custMap.set(c.username, Object.assign({}, c));
            }
        });

        // Merge or add from users
        users.forEach(u => {
            if (!u || !u.username) return;
            const existing = custMap.get(u.username);
            if (existing) {
                // supplement: keep existing contact fields; but copy non-sensitive user fields if missing
                Object.keys(u).forEach(k => {
                    if (k === 'password') return; // do not copy password
                    if (!existing[k] && u[k] !== undefined) existing[k] = u[k];
                });
                // ensure status default
                if (!existing.status) existing.status = 'active';
                custMap.set(u.username, existing);
            } else {
                // create a new customer record from user (do not copy password)
                const newCust = {
                    username: u.username,
                    email: '',
                    phone: '',
                    address: '',
                    joinDate: '',
                    status: 'active'
                };
                Object.keys(u).forEach(k => { if (k !== 'password' && !(k in newCust)) newCust[k] = u[k]; });
                custMap.set(u.username, newCust);
            }
        });

        // Ensure every customer has the standard fields
        customers = Array.from(custMap.values()).map(c => ({
            username: c.username || '',
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            joinDate: c.joinDate || '',
            status: c.status || 'active',
            // keep any extra non-sensitive fields
            ...(c.role ? { role: c.role } : {})
        }));

        // Persist merged customers back to localStorage so future loads are consistent
        localStorage.setItem('customers', JSON.stringify(customers));
        if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = customers;
    } catch (err) {
        console.error('Error merging customers/users from localStorage', err);
        customers = [];
    }
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
        const joinDate = '';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.username)}&background=random&size=110`;
        const statusText = customer.status || '';
        const isActive = (customer.status || '').toLowerCase() === 'active';
        const lockIcon = isActive ? 'fa-lock-open' : 'fa-lock';
        const lockTitle = isActive ? 'Khóa/Không khóa (Hiện đang hoạt động) — bấm để chuyển sang inactive' : 'Khóa/Không khóa (Đang bị khóa) — bấm để kích hoạt';
        
        return `
        <div class="list" data-username="${customer.username}">
            <div class="list-left">
                <img src="${avatarUrl}" alt="${customer.username}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=cccccc&size=110'">
                <div class="list-info">
                    <h4>${customer.username}</h4>
                    <p class="list-note"><i class="fa-solid fa-envelope"></i> ${customer.email || ''}</p>
                    ${customer.phone ? `<p class=\"list-note\"><i class=\"fa-solid fa-phone\"></i> ${customer.phone}</p>` : ''}
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
                        <button class="btn-lock" title="${lockTitle}" onclick="toggleCustomerStatus('${customer.username}')"><i class="fa-solid ${lockIcon}"></i></button>
                        <button class="btn-delete" onclick="deleteCustomer('${customer.username}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function toggleCustomerStatus(username) {
    try {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const idx = (customers || []).findIndex(c => c.username === username);
        if (idx === -1) {
            alert('Không tìm thấy khách hàng để thay đổi trạng thái.');
            return;
        }

        const current = (customers[idx].status || 'active').toLowerCase();
        const next = current === 'active' ? 'inactive' : 'active';
        customers[idx].status = next;
        localStorage.setItem('customers', JSON.stringify(customers));
        if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = customers;
        showCustomers();
        alert(`Đã chuyển trạng thái ${username} sang ${next}.`);
    } catch (err) {
        console.error('Lỗi khi thay đổi trạng thái khách hàng', err);
        alert('Không thể thay đổi trạng thái, xem console để biết chi tiết.');
    }
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
    // Lấy user từ localStorage.users
    let users = [];
    try {
        if (typeof DataManager !== 'undefined' && typeof DataManager.getUsers === 'function') {
            users = DataManager.getUsers() || [];
        } else {
            users = JSON.parse(localStorage.getItem('users') || '[]');
        }
    } catch (_) {
        users = [];
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
        alert('Không tìm thấy người dùng!');
        return;
    }

    const modal = document.querySelector('.modal.add-customer');
    if (!modal) {
        createCustomerModal();
        setTimeout(() => editCustomer(username), 100);
        return;
    }

    currentEditingUsername = username;
    
    document.getElementById('customer-username').value = username;
    document.getElementById('customer-username').disabled = true;
    // Các trường khác để trống vì users chỉ có username, password, role
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    
    const addBtn = document.getElementById('add-customer-button');
    const updateBtn = document.getElementById('update-customer-button');
    if (addBtn) addBtn.style.display = 'none';
    if (updateBtn) updateBtn.style.display = 'inline-block';
    
    modal.style.display = 'flex';
}

function deleteCustomer(username) {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${username}"?`)) return;
    // remove from localStorage.customers if present, otherwise attempt via DataManager
    try {
        let customers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (Array.isArray(customers) && customers.length > 0) {
            const filtered = customers.filter(c => c.username !== username);
            localStorage.setItem('customers', JSON.stringify(filtered));
            if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = filtered;
            // Also remove corresponding user from localStorage.users if exists
            try {
                let users = JSON.parse(localStorage.getItem('users') || '[]');
                if (Array.isArray(users) && users.some(u => u.username === username)) {
                    users = users.filter(u => u.username !== username);
                    localStorage.setItem('users', JSON.stringify(users));
                    if (window.dataManager && window.dataManager.data) window.dataManager.data.users = users;
                }
            } catch (e) {
                console.error('Error removing user from localStorage.users', e);
            }

            alert('Đã xóa khách hàng và tài khoản người dùng (nếu có) thành công!');
            showCustomers();
            return;
        }
    } catch (e) {
        console.error('Error deleting from local customers', e);
    }

    // fallback: try DataManager
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
        const customersDM = window.dataManager.getCustomers() || [];
        const filtered = customersDM.filter(c => c.username !== username);
        localStorage.setItem('customers', JSON.stringify(filtered));
        if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = filtered;
        // Also remove the user from localStorage.users if present
        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            if (Array.isArray(users) && users.some(u => u.username === username)) {
                users = users.filter(u => u.username !== username);
                localStorage.setItem('users', JSON.stringify(users));
                if (window.dataManager && window.dataManager.data) window.dataManager.data.users = users;
            }
        } catch (e) {
            console.error('Error removing user from localStorage.users', e);
        }

        alert('Đã xóa khách hàng và tài khoản người dùng (nếu có) thành công!');
        showCustomers();
        return;
    }

    alert('Không tìm thấy danh sách khách hàng để xóa.');
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

    // ensure username uniqueness in local customers (or users)
    try {
        const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (Array.isArray(localCustomers) && localCustomers.some(c => c.username === username)) {
            alert('Tên người dùng đã tồn tại!');
            return;
        }
        // also check users list to avoid collisions if desired
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (Array.isArray(users) && users.some(u => u.username === username)) {
            // username exists as a user; still allow adding customer but warn
            if (!confirm('Tên người dùng tồn tại trong hệ thống users. Bạn vẫn muốn thêm thông tin khách hàng?')) return;
        }
    } catch (err) {
        console.error('Error reading local storage for uniqueness check', err);
    }

    const newCustomer = {
        username,
        email,
        phone,
        address,
        joinDate: new Date().toISOString(),
        status: 'active'
    };

    // Save to localStorage.customers
    try {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        // also update DataManager if present
        if (window.dataManager && window.dataManager.data) {
            window.dataManager.data.customers = customers;
        }

        alert('Đã thêm khách hàng thành công!');
        closeCustomerModal();
        showCustomers();
        return;
    } catch (err) {
        console.error('Lỗi khi lưu khách hàng vào localStorage:', err);
        alert('Không thể lưu khách hàng. Xem console để biết chi tiết.');
    }
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
    // Try update in localStorage.customers first
    try {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const index = (customers || []).findIndex(c => c.username === currentEditingUsername);
        if (index !== -1) {
            customers[index] = {
                ...customers[index],
                email,
                phone,
                address
            };
            localStorage.setItem('customers', JSON.stringify(customers));
            if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = customers;
            alert('Đã cập nhật thông tin khách hàng thành công!');
            closeCustomerModal();
            showCustomers();
            document.getElementById('customer-username').disabled = false;
            return;
        }
    } catch (err) {
        console.error('Error updating local customers', err);
    }

    // Fallback to DataManager
    if (window.dataManager && typeof window.dataManager.getCustomers === 'function') {
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
            if (window.dataManager && window.dataManager.data) window.dataManager.data.customers = customers;
            alert('Đã cập nhật thông tin khách hàng thành công!');
            closeCustomerModal();
            showCustomers();
            document.getElementById('customer-username').disabled = false;
            return;
        }
    }

    alert('Không tìm thấy khách hàng!');
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