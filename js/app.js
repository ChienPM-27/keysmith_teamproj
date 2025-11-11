/*
 * KeySmith - Main Application JavaScript
 * Version: 1.0.0
 * Description: Combined JS file for all main website functionality
 */

// ==================== UTILITIES ====================
const KeySmith = {
    // Utility functions
    utils: {
        // Show/hide element
        toggle: function(element, show) {
            if (element) {
                element.style.display = show ? 'flex' : 'none';
            }
        },
        
        // Add/remove class
        toggleClass: function(element, className, force) {
            if (element) {
                element.classList.toggle(className, force);
            }
        },
        
        // Get element by ID with null check
        getById: function(id) {
            return document.getElementById(id);
        }
    },
    
    // Initialize all modules
    init: function() {
        this.header.init();
        this.profile.init();
        this.login.init();
        this.contact.init();
        this.store.init();
        this.subscriptionForm.init();
        this.error404.init();
        this.admin.init();
    }
};

// ==================== HEADER MODULE ====================
KeySmith.header = {
    header: null,
    lastScroll: 0,
    
    init: function() {
        this.header = KeySmith.utils.getById('header');
        if (!this.header) return;
        
        // Header scroll hide/show
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll <= 0) {
                this.header.classList.remove('hidden');
            } else if (currentScroll > this.lastScroll && currentScroll > 100) {
                this.header.classList.add('hidden');
            } else {
                this.header.classList.remove('hidden');
            }

            this.lastScroll = currentScroll;
        });

        // Mobile menu
        const bar = KeySmith.utils.getById('bar');
        const close = KeySmith.utils.getById('close');
        const nav = KeySmith.utils.getById('navbar');

        if (bar) bar.addEventListener('click', () => nav.classList.add('active'));
        if (close) close.addEventListener('click', () => nav.classList.remove('active'));

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (nav && nav.classList.contains('active')) {
                if (!nav.contains(e.target) && !bar.contains(e.target)) {
                    nav.classList.remove('active');
                }
            }
        });
    }
};

// ==================== LOGIN MODULE ====================
KeySmith.login = {
    // Admin accounts list
    ADMIN_ACCOUNTS: [
        { username: 'admin', password: 'admin123' },
        { username: 'superadmin', password: 'super123' }
    ],
    
    init: function() {
        // Login elements
        const profileBtn = document.querySelector('.profile');
        const modalOverlay = KeySmith.utils.getById('modalOverlay');
        const closeModal = KeySmith.utils.getById('closeModal');
        const loginForm = KeySmith.utils.getById('loginForm');

        // Register elements
        const registerOverlay = KeySmith.utils.getById('registerOverlay');
        const closeRegister = KeySmith.utils.getById('closeRegister');
        const registerForm = KeySmith.utils.getById('registerForm');
        const openRegister = KeySmith.utils.getById('openRegister');
        const switchToLogin = KeySmith.utils.getById('switchToLogin');

        // Profile button click
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const loggedUser = localStorage.getItem('loggedInUser');
                const userRole = localStorage.getItem('userRole');
                
                if (loggedUser && userRole === 'user') {
                    KeySmith.profile.showProfileModal();
                } else {
                    if (modalOverlay) {
                        modalOverlay.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        }

        // Close login modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Outside click close
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // Register modal controls
        if (openRegister) {
            openRegister.addEventListener('click', (e) => {
                e.preventDefault();
                modalOverlay.classList.remove('active');
                registerOverlay.classList.add('active');
            });
        }

        if (closeRegister) {
            closeRegister.addEventListener('click', () => {
                registerOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerOverlay.classList.remove('active');
                modalOverlay.classList.add('active');
            });
        }

        // Form submissions
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Update profile display on load
        this.updateProfileDisplay();
    },

    handleRegister: function(e) {
        e.preventDefault();
        const username = KeySmith.utils.getById('registerUsername').value.trim();
        const password = KeySmith.utils.getById('registerPassword').value.trim();

        if (!username || !password) {
            alert('Please enter all fields!');
            return;
        }

        // Check for admin username
        if (this.ADMIN_ACCOUNTS.some(admin => admin.username === username)) {
            alert('❌ This username is reserved for admin only!');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }

        users.push({ username, password, role: 'user' });
        localStorage.setItem('users', JSON.stringify(users));
        alert('✅ Account created successfully!');

        const registerOverlay = KeySmith.utils.getById('registerOverlay');
        const modalOverlay = KeySmith.utils.getById('modalOverlay');
        
        registerOverlay.classList.remove('active');
        modalOverlay.classList.add('active');
    },

    handleLogin: function(e) {
        e.preventDefault();
        const username = KeySmith.utils.getById('loginUsername').value.trim();
        const password = KeySmith.utils.getById('loginPassword').value.trim();
        const rememberMe = KeySmith.utils.getById('rememberMe').checked;

        // Check admin login
        const isAdmin = this.ADMIN_ACCOUNTS.find(admin => 
            admin.username === username && admin.password === password
        );

        if (isAdmin) {
            localStorage.setItem('loggedInUser', username);
            localStorage.setItem('userRole', 'admin');
            if (rememberMe) localStorage.setItem('rememberedUser', username);
            
            alert('✅ Admin login successful! Redirecting to admin page...');
            
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                window.location.href = '../admin/admin.html';
            }, 1000);
            return;
        }

        // Check regular user login
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', username);
            localStorage.setItem('userRole', 'user');
            if (rememberMe) localStorage.setItem('rememberedUser', username);
            
            alert('✅ Login successful!');
            
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            this.updateProfileDisplay();
            KeySmith.profile.initProfileModal();
        } else {
            alert('❌ Invalid username or password!');
        }
    },

    updateProfileDisplay: function() {
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        const profile = document.querySelector('.profile');

        if (!profile) return;

        if (loggedUser && userRole === 'user') {
            profile.innerHTML = `<i class="fa-solid fa-user-check"></i> <span style="font-size:14px;">${loggedUser}</span>`;
        } else {
            profile.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
        }
        
        profile.style.cursor = 'pointer';
    }
};

// ==================== PROFILE MODULE ====================
KeySmith.profile = {
    currentUser: null,           
    currentCustomerDetail: null, 

    init: function() {
        // Initialize only if user is logged in
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        if (loggedUser && userRole === 'user') {
            this.currentUser = loggedUser;
            this.initProfileModal();
        }
    },

    populateBirthdaySelects: function() {
        // Populate Day (1-31)
        const daySelect = KeySmith.utils.getById('profile-birth-day');
        if (daySelect && daySelect.options.length === 1) {
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i < 10 ? '0' + i : i;
                daySelect.appendChild(option);
            }
        }

        // Populate Month (1-12)
        const monthSelect = KeySmith.utils.getById('profile-birth-month');
        if (monthSelect && monthSelect.options.length === 1) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            months.forEach((month, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = month;
                monthSelect.appendChild(option);
            });
        }

        // Populate Year (1950 - current year)
        const yearSelect = KeySmith.utils.getById('profile-birth-year');
        if (yearSelect && yearSelect.options.length === 1) {
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= 1950; i--) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                yearSelect.appendChild(option);
            }
        }
    },

    // get customer profile - lay profile thoi
    getCustomerProfile: function() {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === this.currentUser);

            if (!user) {
                console.warn('User not found');
                return null;
            }

            // Trả về chỉ profile
            return user.profile || {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                birthDate: null
            };
        } catch (error) {
            console.error('Error getting customer profile:', error);
            return null;
        }
    },

    // get customer detail - lay toan bo detail
    getCustomerDetail: function() {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === this.currentUser);

            if (!user) {
                console.warn('User not found');
                return null;
            }
            this.currentCustomerDetail = {
                username: user.username,
                userId: user.userId || this.generateUserId(),
                role: user.role || 'user',
                password: user.password,
                
                profile: user.profile || {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    birthDate: null
                },

                orders: user.orders || [],
                payments: user.payments || [],
                status: user.status || 'active',
                
                preferences: user.preferences || {
                    newsletter: true,
                    notifications: true,
                    language: 'en'
                },

                createdAt: user.createdAt || new Date().toISOString(),
                updatedAt: user.updatedAt || new Date().toISOString(),
                lastLogin: user.lastLogin || new Date().toISOString()
            };
            return this.currentCustomerDetail;
        } catch (error) {
            console.error('Error getting customer detail:', error);
            return null;
        }
    },

    //set customer de luu lai
    setCustomerDetail: function(updatedDetail) {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === this.currentUser);

            if (userIndex === -1) {
                this.showNotification('User not found', 'error');
                return false;
            }
            users[userIndex] = {
                ...users[userIndex],
                ...updatedDetail,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('users', JSON.stringify(users));
            this.currentCustomerDetail = updatedDetail;
            return true;
        } catch (error) {
            console.error('Error setting customer detail:', error);
            return false;
        }
    },
    //kho tao khi mo modal
    initProfileModal: function() {
        const profileModal = KeySmith.utils.getById('profileModalOverlay');
        if (!profileModal) return;

        this.getCustomerDetail();

        this.loadProfileToForm();

        const closeBtn = KeySmith.utils.getById('closeProfileModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        // Section navigation
        const sidebarLinks = profileModal.querySelectorAll('.profile-sidebar a[data-section]');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                // Update active states
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                const sections = profileModal.querySelectorAll('.profile-section');
                sections.forEach(section => {
                    section.classList.toggle('active', 
                        section.getAttribute('data-section-name') === targetSection);
                });
            });
        });

        // Logout
        const logoutBtn = KeySmith.utils.getById('profileLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('rememberedUser');
                window.location.reload();
            });
        }

        // Forms
        this.initProfileForms();
    },
    // điền dữ liệu vào form vì khi mở modal nó hiện dữ liệu cũ
    loadProfileToForm: function() {
        this.populateBirthdaySelects();

        const profile = this.getCustomerProfile();
        if (!profile) return;

        const fields = {
            'profile-first-name': 'firstName',
            'profile-last-name': 'lastName',
            'profile-email': 'email',
            'profile-phone': 'phone',
            'profile-address': 'address'
        };

        Object.keys(fields).forEach(fieldId => {
            const element = KeySmith.utils.getById(fieldId);
            if (element && profile[fields[fieldId]]) {
                element.value = profile[fields[fieldId]];
            }
        });

        if (profile.birthDate) {
            const date = new Date(profile.birthDate);
            KeySmith.utils.getById('profile-birth-day').value = date.getDate();
            KeySmith.utils.getById('profile-birth-month').value = date.getMonth() + 1;
            KeySmith.utils.getById('profile-birth-year').value = date.getFullYear();
        }
    },

    initProfileForms: function() {
        const profileForm = KeySmith.utils.getById('profileInfoForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e)); 
        }

        const passwordForm = KeySmith.utils.getById('changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }
    },

    // dung ham hai hàm handle là vì alert nó chỉ hiện thông báo nó không lưu

    handleProfileUpdate: function(e) {
        e.preventDefault();

        try {
            const firstName = KeySmith.utils.getById('profile-first-name').value.trim();
            const lastName = KeySmith.utils.getById('profile-last-name').value.trim();
            const email = KeySmith.utils.getById('profile-email').value.trim();
            const phone = KeySmith.utils.getById('profile-phone').value.trim();
            const address = KeySmith.utils.getById('profile-address').value.trim();
            const day = KeySmith.utils.getById('profile-birth-day').value;
            const month = KeySmith.utils.getById('profile-birth-month').value;
            const year = KeySmith.utils.getById('profile-birth-year').value;

            // Validation
            if (!firstName || !lastName) {
                this.showNotification('Please enter both first and last name', 'error');
                return;
            }

            if (email && !this.isValidEmail(email)) {
                this.showNotification('Please enter a valid email', 'error');
                return;
            }

            if (phone && !this.isValidPhone(phone)) {
                this.showNotification('Please enter a valid phone number', 'error');
                return;
            }

            let birthDate = null;
            if (day && month && year) {
                birthDate = new Date(year, month - 1, day).toISOString();
            }

            // get detail
            const detail = this.getCustomerDetail();
            if (!detail) return;

            // update profile
            detail.profile = {
                firstName,
                lastName,
                email,
                phone,
                address,
                birthDate
            };

            // set detail
            if (this.setCustomerDetail(detail)) {
                this.showNotification('✅ Profile updated successfully!', 'success');
            } else {
                this.showNotification('Error updating profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification('Error updating profile', 'error');
        }
    },

    handlePasswordChange: function(e) {
        e.preventDefault();

        try {
            const currentPass = KeySmith.utils.getById('current-password').value;
            const newPass = KeySmith.utils.getById('new-password').value;
            const confirmPass = KeySmith.utils.getById('confirm-password').value;

            // Validation
            if (!currentPass || !newPass || !confirmPass) {
                this.showNotification('Please fill all password fields', 'error');
                return;
            }

            if (newPass.length < 6) {
                this.showNotification('New password must be at least 6 characters', 'error');
                return;
            }

            if (newPass !== confirmPass) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }

            // GET users
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === this.currentUser);

            if (!user || user.password !== currentPass) {
                this.showNotification('Current password is incorrect', 'error');
                return;
            }

            if (currentPass === newPass) {
                this.showNotification('New password must be different from current password', 'warning');
                return;
            }

            // GET detail
            const detail = this.getCustomerDetail();

            // UPDATE password
            detail.password = newPass;

            // SET detail
            if (this.setCustomerDetail(detail)) {
                this.showNotification('✅ Password changed successfully!', 'success');
                KeySmith.utils.getById('changePasswordForm').reset();
            } else {
                this.showNotification('Error changing password', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification('Error changing password', 'error');
        }
    },

    showProfileModal: function() {
        const profileModal = KeySmith.utils.getById('profileModalOverlay');
        if (profileModal) {
            profileModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.loadProfileToForm();
        }
    },

    // hien thị thong bao
    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `profile-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    isValidEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    isValidPhone: function(phone) {
        const regex = /^[0-9+\-\s()]+$/;
        return regex.test(phone) && phone.replace(/\D/g, '').length >= 9;
    },

    generateUserId: function() {
        return 'USR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};  

// ==================== CONTACT MODULE ====================
KeySmith.contact = {
    init: function() {
        const contactLink = KeySmith.utils.getById('contactLink');
        const contactModal = KeySmith.utils.getById('contactModalOverlay');
        const closeContactModal = KeySmith.utils.getById('closeContactModal');

        if (contactLink) {
            contactLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (contactModal) {
                    contactModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }

        if (closeContactModal) {
            closeContactModal.addEventListener('click', () => {
                contactModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        if (contactModal) {
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) {
                    contactModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
};

// ==================== STORE MODULE ====================
KeySmith.store = {
    init: function() {
        // Cart functionality
        const cartBtn = document.querySelector('.cart');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const loggedUser = localStorage.getItem('loggedInUser');
                if (!loggedUser) {
                    const modalOverlay = KeySmith.utils.getById('modalOverlay');
                    if (modalOverlay) {
                        modalOverlay.classList.add('active');
                        modalOverlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                } else {
                    window.location.href = './main/store/Store.html?cart=1';
                }
            });
        }

        // Product click handler (on home page)
        const proContainer = document.querySelector('.pro-container');
        if (proContainer) {
            proContainer.addEventListener('click', (e) => {
                const productCard = e.target.closest('.pro');
                if (productCard) {
                    window.location.href = './main/store/store.html';
                }
            });
            
            // Make products clickable
            document.querySelectorAll('.pro').forEach(card => {
                card.style.cursor = 'pointer';
            });
        }
    }
};

// ==================== SUBSCRIPTION FORM ====================
KeySmith.subscriptionForm = {
    init: function() {
        const form = KeySmith.utils.getById('subscribeForm');
        const message = KeySmith.utils.getById('formMessage');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        message.textContent = '✅ Thank you for subscribing!';
                        message.style.color = 'green';
                        form.reset();
                    } else {
                        throw new Error('Subscription failed');
                    }
                } catch (error) {
                    message.textContent = '❌ Something went wrong. Please try again.';
                    message.style.color = 'red';
                }

                message.style.display = 'block';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            });
        }
    }
};

// ==================== 404 ERROR MODULE ====================
KeySmith.error404 = {
    init: function() {
        const errorOverlay = KeySmith.utils.getById('error404Overlay');
        const backHomeBtn = KeySmith.utils.getById('backHomeBtn404');
        const mainContent = KeySmith.utils.getById('mainContent');

        // Check if page not found
        if (document.body.classList.contains('error-page')) {
            if (errorOverlay) errorOverlay.style.display = 'flex';
            if (mainContent) mainContent.style.display = 'none';
        }

        // Back home button
        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
    }
};

// ==================== ADMIN MODULE ====================
KeySmith.admin = {
    init: function() {
        this.mainContent = KeySmith.utils.getById('mainContent');
        this.adminSection = KeySmith.utils.getById('adminLogin');
        this.adminForm = KeySmith.utils.getById('adminLoginForm');
        this.adminBack = KeySmith.utils.getById('adminBack');
        this.adminMessage = KeySmith.utils.getById('adminMessage');

        // Nếu không có admin section thì return
        if (!this.adminSection) return;

        // Lắng nghe sự kiện hashchange
        window.addEventListener('hashchange', () => this.checkHash());
        
        // Kiểm tra hash khi trang load
        this.checkHash();

        // Nút Back
        if (this.adminBack) {
            this.adminBack.addEventListener('click', (e) => {
                e.preventDefault();
                // Xóa hash và quay về trang chính
                window.location.hash = '';
            });
        }

        // Form đăng nhập admin
        if (this.adminForm) {
            this.adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }
    },

    showAdmin: function(show) {
        if (this.mainContent) {
            this.mainContent.style.display = show ? 'none' : 'block';
        }
        if (this.adminSection) {
            this.adminSection.style.display = show ? 'flex' : 'none';
            if (show) {
                document.body.style.overflow = 'hidden';
                window.scrollTo(0, 0);
            } else {
                document.body.style.overflow = 'auto';
            }
        }
    },

    checkHash: function() {
        const hash = window.location.hash.toLowerCase();
        if (hash === '#admin') {
            this.showAdmin(true);
        } else {
            this.showAdmin(false);
        }
    },

    handleAdminLogin: function() {
        const usernameInput = document.getElementById('adminUsername');
        const passwordInput = document.getElementById('adminPassword');
        
        if (!usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Lấy danh sách admin từ KeySmith.login.ADMIN_ACCOUNTS
        const accounts = KeySmith.login && KeySmith.login.ADMIN_ACCOUNTS ? 
                        KeySmith.login.ADMIN_ACCOUNTS : [];

        // Kiểm tra đăng nhập
        const match = accounts.find(a => 
            a.username === username && a.password === password
        );

        if (match) {
            // Đăng nhập thành công
            localStorage.setItem('loggedInUser', username);
            localStorage.setItem('userRole', 'admin');

            if (this.adminMessage) {
                this.adminMessage.style.color = '#4caf50';
                this.adminMessage.textContent = '✅ Đăng nhập thành công! Đang chuyển hướng...';
            }

            // Chuyển hướng sau 1 giây
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1000);
        } else {
            // Đăng nhập thất bại
            if (this.adminMessage) {
                this.adminMessage.style.color = '#f44336';
                this.adminMessage.textContent = '❌ Sai tên đăng nhập hoặc mật khẩu!';
            }
            
            // Xóa thông báo sau 3 giây
            setTimeout(() => {
                if (this.adminMessage) {
                    this.adminMessage.textContent = '';
                }
            }, 3000);
        }
    }
};

// ==================== INITIALIZE ====================
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    KeySmith.init();
});