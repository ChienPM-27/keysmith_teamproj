document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
});

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
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
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
            
            const birthDay = document.getElementById('birth-day').value;
            const birthMonth = document.getElementById('birth-month').value;
            const birthYear = document.getElementById('birth-year').value;

            const formData = {
                lastName: document.getElementById('last-name').value,
                firstName: document.getElementById('first-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                
                birthDay: birthDay,
                birthMonth: birthMonth,
                birthYear: birthYear,

                gender: document.getElementById('gender').value
            };
    
            localStorage.setItem('profileData', JSON.stringify(formData));
    
            alert('Profile updated successfully!');
        });
    }

    // --- 4. LOGIC CHUYỂN ĐỔI MENU/SECTION (TAB) ---

    function switchSection(targetSectionName) {
        // Ẩn tất cả các sections
        accountSections.forEach(section => {
            section.classList.remove('active');
        });

        // Xóa trạng thái active khỏi tất cả các link
        navLinks.forEach(nav => {
            nav.classList.remove('active');
        });
        
        // Hiển thị section đích
        // Vì data-section="Profile" và data-section-name="Profile"
        const targetSection = document.querySelector(`.account-section[data-section-name="${targetSectionName}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Đặt trạng thái active cho link menu tương ứng
            const targetLink = document.querySelector(`.account-sidebar ul li a[data-section="${targetSectionName}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const sectionTarget = this.getAttribute('data-section');
            
            // Xử lý Log Out riêng
            if (sectionTarget === null || sectionTarget === 'logout') { 
                return; 
            }
            
            // Xử lý chuyển đổi tab nội bộ
            e.preventDefault(); 
            switchSection(sectionTarget);
        });
    });

    // Khởi tạo section "Profile" khi tải trang (Nếu chưa có section active nào)
    const initialSection = document.querySelector('.account-section.active');
    if (!initialSection) {
        switchSection('Profile');
    }
});
    
   // --- 5. BỔ SUNG LOGIC MỞ/ĐÓNG MODAL ĐỊA CHỈ ---
    
  // ========================= ADDRESS MODAL FUNCTIONALITY =========================

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
        
        // Lấy dữ liệu từ form
        const fullname = document.getElementById('modal-fullname').value.trim();
        const phone = document.getElementById('modal-phone').value.trim();
        const company = document.getElementById('modal-company').value.trim();
        const address = document.getElementById('modal-address').value.trim();
        const country = document.getElementById('modal-country').value;
        const isDefault = document.getElementById('modal-default-address').checked;
        
        // Validate
        if (!fullname) {
            alert('Vui lòng nhập họ tên!');
            return;
        }
        
        if (!phone) {
            alert('Vui lòng nhập số điện thoại!');
            return;
        }
        
        if (!address) {
            alert('Vui lòng nhập địa chỉ!');
            return;
        }
        
        // Tạo object địa chỉ
        const newAddress = {
            fullname,
            phone,
            company,
            address,
            country,
            isDefault
        };
        
        console.log('Địa chỉ mới:', newAddress);
        
        // TODO: Gửi dữ liệu lên server hoặc lưu vào localStorage
        
        alert('Đã thêm địa chỉ thành công!');
        closeAddressModal();
    });
}

// Đóng modal khi nhấn phím ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addressModal.classList.contains('active')) {
        closeAddressModal();
    }
});

// ========================= CHANGE PASSWORD FUNCTIONALITY =========================

const changePasswordForm = document.getElementById('changePasswordForm');

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();
        
        // Validate empty fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields!');
            return;
        }
        
        // Validate password length
        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long!');
            return;
        }
        
        // Validate password strength
        if (!/[A-Z]/.test(newPassword)) {
            alert('Password must contain at least one uppercase letter!');
            return;
        }
        
        if (!/[a-z]/.test(newPassword)) {
            alert('Password must contain at least one lowercase letter!');
            return;
        }
        
        if (!/\d/.test(newPassword)) {
            alert('Password must contain at least one number!');
            return;
        }
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            alert('New password and confirmation do not match!');
            return;
        }
        
        // Check if new password is different from current
        if (currentPassword === newPassword) {
            alert('New password must be different from current password!');
            return;
        }
        
        // TODO: Send to server
        console.log('Change password:', {
            currentPassword,
            newPassword
        });
        
        alert('Password changed successfully!');
        changePasswordForm.reset();
    });
}

// --- 6. BỔ SUNG LOGIC LOG OUT ---
    
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            // Ngăn trình duyệt chuyển trang (href="index.html") ngay lập tức
            e.preventDefault(); 
            
            // Hỏi xác nhận
            const confirmLogout = confirm('Bạn có chắc chắn muốn đăng xuất không?');
            
            if (confirmLogout) {
                // Xóa dữ liệu đã lưu
                localStorage.removeItem('profileData');
                
                // Chuyển về trang chủ (lấy từ href của nút)
                window.location.href = this.getAttribute('href'); 
            }
        });
    }