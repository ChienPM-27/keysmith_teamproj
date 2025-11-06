// ==================== UPDATED LOGIN.JS ====================
const profileBtn = document.querySelector('.profile');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

const registerOverlay = document.getElementById('registerOverlay');
const closeRegister = document.getElementById('closeRegister');
const registerForm = document.getElementById('registerForm');

// Danh sách admin cố định (không thể đăng ký)
const ADMIN_ACCOUNTS = [
    { username: 'admin', password: 'admin123' },
    { username: 'superadmin', password: 'super123' }
];

// ------------------ MỞ / ĐÓNG LOGIN ------------------
// ONLY open login if user is NOT logged in
profileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Check if user is already logged in
    const loggedUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');
    
    // If user is logged in, don't open login modal (let profile manager handle it)
    if (loggedUser && userRole === 'user') {
        return; // Profile modal will handle this
    }
    
    // If not logged in, open login modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ------------------ MỞ / ĐÓNG REGISTER ------------------
document.getElementById('openRegister').addEventListener('click', (e) => {
    e.preventDefault();
    modalOverlay.classList.remove('active');
    registerOverlay.classList.add('active');
});

closeRegister.addEventListener('click', () => {
    registerOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

registerOverlay.addEventListener('click', (e) => {
    if (e.target === registerOverlay) {
        registerOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    registerOverlay.classList.remove('active');
    modalOverlay.classList.add('active');
});

// ------------------ XỬ LÝ REGISTER ------------------
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
        alert('Please enter all fields!');
        return;
    }

    // Kiểm tra nếu username trùng với admin
    const isAdminUsername = ADMIN_ACCOUNTS.some(admin => admin.username === username);
    if (isAdminUsername) {
        alert('❌ This username is reserved for admin only!');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        alert('Username already exists!');
        return;
    }

    // Lưu user với role = 'user'
    users.push({ username, password, role: 'user' });
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Account created successfully!');

    registerOverlay.classList.remove('active');
    modalOverlay.classList.add('active');
});

// ------------------ XỬ LÝ LOGIN ------------------
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    // Kiểm tra xem có phải admin không
    const isAdmin = ADMIN_ACCOUNTS.find(admin => 
        admin.username === username && admin.password === password
    );

    if (isAdmin) {
        // Đăng nhập admin
        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('userRole', 'admin');
        if (rememberMe) localStorage.setItem('rememberedUser', username);
        
        alert('✅ Admin login successful! Redirecting to admin page...');
        
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            window.location.href = '../admin/admin.html';
        }, 1000);
        return;
    }

    // Kiểm tra user thường
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Đăng nhập user thường
        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('userRole', 'user');
        if (rememberMe) localStorage.setItem('rememberedUser', username);
        
        alert('✅ Login successful!');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        updateProfileDisplay();
    } else {
        alert('❌ Invalid username or password!');
    }
});

// ------------------ CẬP NHẬT GIAO DIỆN KHI LOGIN ------------------
function updateProfileDisplay() {
    const loggedUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');
    const profile = document.querySelector('.profile');

    // Chỉ hiển thị profile nếu là user thường
    if (loggedUser && userRole === 'user') {
        profile.innerHTML = `<i class="fa-solid fa-user-check"></i> <span style="font-size:14px;">${loggedUser}</span>`;
        profile.style.cursor = 'pointer';
        
        // Remove the logout onclick - let profile modal handle this
        profile.onclick = null;
    }
}

// Khi tải trang, kiểm tra và cập nhật
window.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    
    // Nếu đang là admin, xóa session và reload
    if (userRole === 'admin') {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberedUser');
    } else {
        updateProfileDisplay();
    }
});