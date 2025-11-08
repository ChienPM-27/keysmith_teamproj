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
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if user is already logged in
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        // If user is logged in and is a regular user
        if (loggedUser && userRole === 'user') {
            // If profile modal exists, show it
            const profileModalOverlay = document.getElementById('profileModalOverlay');
            if (profileModalOverlay) {
                profileModalOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // If profile modal doesn't exist yet, create it
            if (window.ProfileModalController && !window.profileModal) {
                window.profileModal = new window.ProfileModalController();
                setTimeout(() => {
                    const newOverlay = document.getElementById('profileModalOverlay');
                    if (newOverlay) {
                        newOverlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                }, 100);
            }
            return;
        }
        
        // If not logged in, open login modal
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// ------------------ MỞ / ĐÓNG REGISTER ------------------
const openRegisterBtn = document.getElementById('openRegister');
if (openRegisterBtn) {
    openRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (modalOverlay) modalOverlay.classList.remove('active');
        if (registerOverlay) registerOverlay.classList.add('active');
    });
}

if (closeRegister) {
    closeRegister.addEventListener('click', () => {
        registerOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

if (registerOverlay) {
    registerOverlay.addEventListener('click', (e) => {
        if (e.target === registerOverlay) {
            registerOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

const switchToLoginBtn = document.getElementById('switchToLogin');
if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerOverlay) registerOverlay.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.add('active');
    });
}

// ------------------ XỬ LÝ REGISTER ------------------
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('registerUsername');
        const passwordInput = document.getElementById('registerPassword');
        
        if (!usernameInput || !passwordInput) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

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

        if (registerOverlay) registerOverlay.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.add('active');
    });
}

// ------------------ XỬ LÝ LOGIN ------------------
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const rememberMeInput = document.getElementById('rememberMe');
        
        if (!usernameInput || !passwordInput) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeInput ? rememberMeInput.checked : false;

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
            
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                window.location.href = '../../admin.html';
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
            
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Update profile display after login
            updateProfileDisplay();
            
            // Trigger profile modal initialization if needed
            if (window.ProfileManager && !window.profileModal) {
                // Initialize profile modal after successful login
                setTimeout(() => {
                    window.profileModal = new window.ProfileModalController();
                }, 100);
            }
        } else {
            alert('❌ Invalid username or password!');
        }
    });
}

// ------------------ CẬP NHẬT GIAO DIỆN KHI LOGIN ------------------
function updateProfileDisplay() {
    const loggedUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');
    const profile = document.querySelector('.profile');

    if (!profile) return;

    // Chỉ hiển thị profile nếu là user thường
    if (loggedUser && userRole === 'user') {
        profile.innerHTML = `<i class="fa-solid fa-user-check"></i> <span style="font-size:14px;">${loggedUser}</span>`;
    } else {
        // Not logged in - show default icon
        profile.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
    }
    
    profile.style.cursor = 'pointer';
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

// Export for use by profile manager
window.updateProfileDisplay = updateProfileDisplay;
