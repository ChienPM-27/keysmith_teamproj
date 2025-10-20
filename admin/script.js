// ==================== ADMIN PAGE SCRIPT ====================
// Script này đặt trong admin.html

// Kiểm tra xác thực khi tải trang
window.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');

    // Nếu không phải admin hoặc chưa đăng nhập, chuyển về trang chủ
    if (!loggedInUser || userRole !== 'admin') {
        alert('⚠️ Access denied! Admin authentication required.');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberedUser');
        window.location.href = '../main/index.html';
        return;
    }

    // Cập nhật tên admin
    updateAdminDisplay();
});

// Cập nhật hiển thị tên admin
function updateAdminDisplay() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const adminNameElement = document.querySelector('.bottom-sidebar .user-logout:nth-child(2) .sidebar-hidden');
    
    if (adminNameElement && loggedInUser) {
        adminNameElement.textContent = loggedInUser;
    }
}

// Xử lý sidebar toggle
const burgerBtn = document.querySelector('.menu-icon-btn');
const sidebar = document.querySelector('.sidebar');

if (burgerBtn && sidebar) {
    burgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Xử lý nút Home page
const homeBtn = document.querySelector('.bottom-sidebar .user-logout:nth-child(1) a');
if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Do you want to return to home page? You will be logged out from admin panel.')) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberedUser');
            window.location.href = '../main/index.html';
        }
    });
}

// Xử lý nút Log out
const logoutBtn = document.querySelector('.bottom-sidebar .user-logout:nth-child(3) a');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberedUser');
            alert('👋 Logged out successfully!');
            window.location.href = '../main/index.html';
        }
    });
}

// Ngăn chặn truy cập trái phép qua console
Object.defineProperty(window, 'bypassAuth', {
    get: function() {
        console.warn('⚠️ Unauthorized access attempt detected!');
        return false;
    },
    set: function() {
        console.warn('⚠️ Cannot bypass authentication!');
    }
});