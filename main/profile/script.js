// 1. Chức năng xử lý Menu di động
// Xử lý hiển thị/ẩn menu cho thiết bị di động khi click vào toggle button
document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    document.getElementById('navbar').classList.toggle('active');
});

// 2. Chức năng nhập liệu Ngày sinh
// Tạo các option cho các select box ngày/tháng/năm sinh
function populateBirthdayOptions() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    if (!daySelect || !monthSelect || !yearSelect) return;

    // Logic tạo option cho ngày (1-31)
    if (daySelect.options.length <= 1) { 
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    
    // Logic tạo option cho tháng (1-12)
    if (monthSelect.options.length <= 1) { 
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = monthNames[i - 1];
            monthSelect.appendChild(option);
        }   
    }

    // Logic tạo option cho năm (1900 - hiện tại)
    if (yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }
}

// 3. Chức năng Quản lý hồ sơ (Profile)
document.addEventListener('DOMContentLoaded', function() {
    // 1. Khởi tạo option ngày sinh
    populateBirthdayOptions();
    
    const mainForm = document.getElementById('addressForm');
    const navLinks = document.querySelectorAll('.account-sidebar ul li a'); 
    const accountSections = document.querySelectorAll('.account-section');

    // 2. Tải dữ liệu đã lưu khi trang được tải
    const savedData = JSON.parse(localStorage.getItem('profileData'));
    if (savedData) {
        document.getElementById('last-name').value = savedData.lastName || '';
        document.getElementById('first-name').value = savedData.firstName || '';
        document.getElementById('email').value = savedData.email || ''; 
        document.getElementById('phone').value = savedData.phone || '';
        
        document.getElementById('birth-day').value = savedData.birthDay || '';
        document.getElementById('birth-month').value = savedData.birthMonth || '';
        document.getElementById('birth-year').value = savedData.birthYear || '';
        
        document.getElementById('gender').value = savedData.gender || 'male'; 
    }
    
    // 3. Xử lý sự kiện Submit (nút Update)
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const formData = {
                lastName: document.getElementById('last-name').value,
                firstName: document.getElementById('first-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                
                birthDay: document.getElementById('birth-day').value,
                birthMonth: document.getElementById('birth-month').value,
                birthYear: document.getElementById('birth-year').value,
                gender: document.getElementById('gender').value
            };
    
            localStorage.setItem('profileData', JSON.stringify(formData));
            alert('Profile updated successfully!');
        });
    }

    // 4. Chuyển đổi giữa các phần (tab)
    function switchSection(targetSectionName) {
        accountSections.forEach(section => {
            section.classList.remove('active');
        });
        navLinks.forEach(nav => {
            nav.classList.remove('active');
        });
        
        const targetSection = document.querySelector(`.account-section[data-section-name="${targetSectionName}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            const targetLink = document.querySelector(`.account-sidebar ul li a[data-section="${targetSectionName}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const sectionTarget = this.getAttribute('data-section');
            
            if (sectionTarget === null || sectionTarget === 'logout') { 
                return; 
            }
            
            e.preventDefault(); 
            switchSection(sectionTarget);
        });
    });

    // Khởi tạo section "Profile" khi tải trang
    const initialSection = document.querySelector('.account-section.active');
    if (!initialSection) {
        switchSection('Profile');
    }
});

// 5. Chức năng Modal địa chỉ
const addressModal = document.getElementById('addressModal');
const openAddressModalBtn = document.getElementById('openAddressModalBtn');
const closeAddressModalBtn = document.getElementById('closeAddressModal');
const cancelAddressBtn = document.getElementById('cancelAddressBtn');
const saveAddressBtn = document.getElementById('saveAddressBtn');
const newAddressForm = document.getElementById('newAddressForm');

// Mở modal khi click nút "Add New Address"
if (openAddressModalBtn) {
    openAddressModalBtn.addEventListener('click', () => {
        addressModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Khóa scroll
    });
}

// Hàm đóng modal
function closeAddressModal() {
    addressModal.classList.remove('active');
    document.body.style.overflow = ''; // Mở lại scroll
    if (newAddressForm) {
        newAddressForm.reset(); // Reset form
    }
}

// Đóng modal khi click nút X
if (closeAddressModalBtn) {
    closeAddressModalBtn.addEventListener('click', closeAddressModal);
}

// Đóng modal khi click nút Hủy
if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener('click', closeAddressModal);
}

// Đóng modal khi click bên ngoài
addressModal.addEventListener('click', (e) => {
    if (e.target === addressModal) {
        closeAddressModal();
    }
});

// Xử lý lưu địa chỉ
if (saveAddressBtn) {
    saveAddressBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById('modal-fullname').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const company = document.getElementById('modal-company').value.trim();
        const address = document.getElementById('modal-address').value.trim();
        const country = document.getElementById('modal-country').value;
        const isDefault = document.getElementById('modal-default-address').checked;
        
        // Validate
        if (!fullname || !phone || !address) {
            alert('Please fill in required fields!');
            return;
        }
        
        const newAddress = {
            fullname, phone, company, address, country, isDefault
        };
        
        console.log('New address:', newAddress);
        alert('Đã thêm địa chỉ thành công!');
        closeAddressModal();
    });
}

// Đóng modal khi nhấn ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addressModal.classList.contains('active')) {
        closeAddressModal();
    }
});

// 6. Chức năng Quản lý mật khẩu
const changePasswordForm = document.getElementById('changePasswordForm');

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        
        // Validate tất cả các trường
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Validate độ dài mật khẩu
        if (newPassword.length < 8) {
            alert('Mật khẩu mới phải dài ít nhất 8 ký tự!');
            return;
        }
        
        // Validate mật khẩu mới vs mật khẩu hiện tại
        if (currentPassword === newPassword) {
            alert('Mật khẩu mới phải khác mật khẩu hiện tại!');
            return;
        }
        
        // Validate mật khẩu xác nhận
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        // TODO: Xử lý gửi dữ liệu lên server
        console.log('Changing password:', {
            currentPassword,
            newPassword
        });
        
        // Xử lý thành công
        alert('Mật khẩu đã được cập nhật!');
        changePasswordForm.reset();
    });
}

// Logout
const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        const confirmLogout = confirm('Bạn có chắc muốn đăng xuất?');
        if (confirmLogout) {
            localStorage.removeItem('profileData');
            window.location.href = this.getAttribute('href'); 
        }
    });
}