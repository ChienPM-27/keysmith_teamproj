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
    
    const addressModal = document.getElementById('addressModal');
    // Tìm nút bằng ID chúng ta đã thêm ở Bước 1
    const addAddressBtn = document.getElementById('openAddressModalBtn'); 
    const closeAddressModal = document.getElementById('closeAddressModal');
    const cancelAddressModal = document.getElementById('cancelAddressModal');

    // Hàm mở Modal
    function openModal() {
        if (addressModal) addressModal.classList.add('active');
    }

    // Hàm đóng Modal
    function closeModal() {
        if (addressModal) addressModal.classList.remove('active');
    }

    // Gán sự kiện
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', openModal);
    }
    if (closeAddressModal) {
        closeAddressModal.addEventListener('click', closeModal);
    }
    if (cancelAddressModal) {
        cancelAddressModal.addEventListener('click', closeModal);
    }

    // Tùy chọn: Đóng modal khi nhấp ra ngoài
    if (addressModal) {
        addressModal.addEventListener('click', function(e) {
            // Chỉ đóng nếu nhấp vào lớp phủ (overlay), không phải nội dung (content)
            if (e.target === addressModal) { 
                closeModal();
            }
        });
    }