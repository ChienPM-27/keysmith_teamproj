/*
 * KeySmith - Main Application JavaScript
 * Version: 1.0.0
 * Description: Combined JS file for all main website functionality
 */
 
// ==================== UTILITIES ====================
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
        this.smoothScroll.init();
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

    // ======= handleRegister =======
    handleRegister: function(e) {
        e.preventDefault();
        const username = KeySmith.utils.getById('registerUsername').value.trim();
        const password = KeySmith.utils.getById('registerPassword').value.trim();

        if (!username || !password) {
            alert('Please enter all fields!');
            return;
        }

        // Check admin username
        if (this.ADMIN_ACCOUNTS.some(admin => admin.username === username)) {
            alert('❌ This username is reserved for admin only!');
            return;
        }

        // Lấy customers từ localStorage
        let customers = JSON.parse(localStorage.getItem('customers')) || [];

        if (customers.find(u => u.username === username)) {
            alert('❌ Username already exists!');
            return;
        }

        // Check email trùng
        const email = username.includes('@') ? username : '';
        if (email && customers.find(u => u.email === email)) {
            alert('❌ Email already exists!');
            return;
        }

        // Tạo object customer mới
        const newCustomer = {
            username,
            password,
            img: "/img/blank-image.png",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            dateOfBirth: "",
            status: "active"
        };

        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));

        alert('✅ Account created successfully!');

        const registerOverlay = KeySmith.utils.getById('registerOverlay');
        const modalOverlay = KeySmith.utils.getById('modalOverlay');
        
        if (registerOverlay) registerOverlay.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.add('active');

        // Clear form
        KeySmith.utils.getById('registerUsername').value = '';
        KeySmith.utils.getById('registerPassword').value = '';
    },

    // ======= handleLogin =======
    handleLogin: function(e) {
        e.preventDefault();
        const input = KeySmith.utils.getById('loginUsername').value.trim();
        const password = KeySmith.utils.getById('loginPassword').value.trim();
        const rememberMe = KeySmith.utils.getById('rememberMe').checked;

        if (!input || !password) {
            alert('❌ Please enter all fields!');
            return;
        }

        // Admin check
        const isAdmin = this.ADMIN_ACCOUNTS.find(admin =>
            admin.username === input && admin.password === password
        );

        if (isAdmin) {
            localStorage.setItem('loggedInUser', input);
            localStorage.setItem('userRole', 'admin');
            if (rememberMe) localStorage.setItem('rememberedUser', input);

            alert('✅ Admin login successful! Redirecting to admin page...');
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            setTimeout(() => window.location.href = './admin/admin.html', 800);
            return;
        }

        // User check - từ localStorage (đã bao gồm cả sample data)
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        
        // Cho phép đăng nhập bằng username hoặc email
        const user = customers.find(u => {
            const uname = (u.username || '').trim().toLowerCase();
            const email = (u.email || '').trim().toLowerCase();
            const inputLower = input.toLowerCase();
            return (uname === inputLower || email === inputLower);
        });

        if (user && user.password === password) {
            // Kiểm tra status
            if (user.status === 'inactive') {
                alert('❌ Your account has been deactivated. Please contact support.');
                return;
            }

            localStorage.setItem('loggedInUser', user.username);
            localStorage.setItem('userRole', 'user');
            if (rememberMe) localStorage.setItem('rememberedUser', user.username);

            alert('✅ Login successful!');
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Clear form
            KeySmith.utils.getById('loginUsername').value = '';
            KeySmith.utils.getById('loginPassword').value = '';
            
            KeySmith.login.updateProfileDisplay();
            if (KeySmith.profile.initProfileModal) {
                KeySmith.profile.initProfileModal();
            }
        } else {
            alert('❌ Invalid username/email or password!');
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
    init: function() {
        // Initialize only if user is logged in
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        if (loggedUser && userRole === 'user') {
            this.initProfileModal();
        }
    },

    initProfileModal: function() {
        const profileModal = KeySmith.utils.getById('profileModalOverlay');
        if (!profileModal) return;

        // Close button
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

    initProfileForms: function() {
        // Profile info form
        const profileForm = KeySmith.utils.getById('profileInfoForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Profile updated successfully!');
            });
        }

        // Password change form
        const passwordForm = KeySmith.utils.getById('changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentPass = KeySmith.utils.getById('current-password').value;
                const newPass = KeySmith.utils.getById('new-password').value;
                const confirmPass = KeySmith.utils.getById('confirm-password').value;

                if (newPass !== confirmPass) {
                    alert('New passwords do not match!');
                    return;
                }

                alert('Password changed successfully!');
                passwordForm.reset();
            });
        }
    },

    showProfileModal: function() {
        const profileModal = KeySmith.utils.getById('profileModalOverlay');
        if (profileModal) {
            profileModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
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

// ==================== SMOOTH SCROLL MODULE ====================
KeySmith.smoothScroll = {
    init: function() {
        // Scroll to top cho nút Home
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                this.closeMobileMenu();
            });
        }

        // Tìm link Feature trong navbar
        const navbarLinks = document.querySelectorAll('#navbar li a');
        navbarLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            
            // Nếu là link Feature
            if (text === 'feature') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToFeature();
                    this.closeMobileMenu();
                });
            }
        });
    },

    scrollToFeature: function() {
        // Tìm section Featured Products
        const featureSection = document.querySelector('#product1 .title');
        
        if (featureSection) {
            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = featureSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback: scroll đến section #product1
            const product1Section = document.getElementById('product1');
            if (product1Section) {
                product1Section.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    },

    closeMobileMenu: function() {
        const nav = document.getElementById('navbar');
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
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

// ==================== DATA SYNC MODULE ====================
KeySmith.dataSync = {
    init: function() {
        // Kiểm tra nếu chưa có dữ liệu trong localStorage
        if (!localStorage.getItem('dataInitialized')) {
            this.loadSampleData();
        }
    },

    // Replace existing loadSampleData with this robust version
// ---------- REPLACE EXISTING loadSampleData WITH THIS ----------
loadSampleData: async function() {
  try {
    // Try dynamic import using the path you said
    try {
      const module = await import('./sampledata/sampleData.js');
      const sampleData = module && module.sampleData ? module.sampleData : null;
      if (sampleData) {
        if (!localStorage.getItem('customers') && sampleData.customers) {
          localStorage.setItem('customers', JSON.stringify(sampleData.customers));
          console.log('✅ Loaded customers via import (./sampledata/sampleData.js).');
        }
        if (!localStorage.getItem('products') && sampleData.products) {
          localStorage.setItem('products', JSON.stringify(sampleData.products));
          console.log('✅ Loaded products via import.');
        }
        if (!localStorage.getItem('orders') && sampleData.orders) {
          localStorage.setItem('orders', JSON.stringify(sampleData.orders));
          console.log('✅ Loaded orders via import.');
        }
        if (!localStorage.getItem('importOrders') && sampleData.importOrders) {
          localStorage.setItem('importOrders', JSON.stringify(sampleData.importOrders));
          console.log('✅ Loaded importOrders via import.');
        }
        localStorage.setItem('dataInitialized', 'true');
        return;
      }
    } catch (impErr) {
      console.warn('Dynamic import failed (path ./sampledata/sampleData.js). Will try fetch fallback.', impErr);
    }

    // Fetch fallback - try several paths
    const paths = ['./sampledata/sampleData.js', './sampleData.js','/js/sampleData.js','/sampleData.js'];
    let text = null;
    for (const p of paths) {
      try {
        const r = await fetch(p, {cache:'no-store'});
        if (r.ok) {
          text = await r.text();
          console.log('Fetched sampleData from', p);
          break;
        }
      } catch (e) { /* try next */ }
    }
    if (!text) {
      console.error('❌ Could not fetch sampleData.js from any path.');
      return;
    }

    // Extract object literal (assumes "export const sampleData = { ... }")
    let start = text.indexOf('export const sampleData');
    if (start !== -1) {
      start = text.indexOf('=', start);
      if (start !== -1) start = start + 1;
      else start = text.indexOf('{', start);
    } else {
      start = text.indexOf('{');
    }
    const objText = text.slice(start);
    let sampleDataObj = null;
    try {
      sampleDataObj = Function('"use strict"; return (' + objText + ')')();
    } catch (e) {
      console.error('Failed to eval sampleData.js content:', e);
      return;
    }
    if (!sampleDataObj) {
      console.error('No sampleData object found after eval.');
      return;
    }

    if (!localStorage.getItem('customers') && sampleDataObj.customers) {
      localStorage.setItem('customers', JSON.stringify(sampleDataObj.customers));
      console.log('✅ Loaded customers via fetch fallback.');
    }
    if (!localStorage.getItem('products') && sampleDataObj.products) {
      localStorage.setItem('products', JSON.stringify(sampleDataObj.products));
      console.log('✅ Loaded products via fetch fallback.');
    }
    if (!localStorage.getItem('orders') && sampleDataObj.orders) {
      localStorage.setItem('orders', JSON.stringify(sampleDataObj.orders));
      console.log('✅ Loaded orders via fetch fallback.');
    }
    if (!localStorage.getItem('importOrders') && sampleDataObj.importOrders) {
      localStorage.setItem('importOrders', JSON.stringify(sampleDataObj.importOrders));
      console.log('✅ Loaded importOrders via fetch fallback.');
    }

    localStorage.setItem('dataInitialized','true');
    console.log('✅ Sample data loaded (fallback).');
  } catch (finalErr) {
    console.error('Error loading sample data (final):', finalErr);
  }
},
// ---------- end replacement ----------

};

// ==================== INITIALIZE ====================
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    KeySmith.dataSync.init();
    KeySmith.init();
});


