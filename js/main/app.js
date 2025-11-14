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
        // Profile module is now external
        if (window.ProfileModule) {
            window.ProfileModule.init();
        }
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
                    // Call external ProfileModule
                    if (window.ProfileModule && window.ProfileModule.showProfileModal) {
                        window.ProfileModule.showProfileModal();
                    }
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
        console.log('DEBUG handleLogin input=', KeySmith.utils.getById('loginUsername')?.value, 'password=', KeySmith.utils.getById('loginPassword')?.value);

        e.preventDefault();
        const rawInput = KeySmith.utils.getById('loginUsername').value || '';
        const rawPassword = KeySmith.utils.getById('loginPassword').value || '';
        const input = rawInput.toString().trim();
        const password = rawPassword.toString().trim();
        const rememberMe = KeySmith.utils.getById('rememberMe').checked;

        if (!input || !password) {
            alert('❌ Please enter all fields!');
            return;
        }

        // Admin check (admin usernames are lowercase in ADMIN_ACCOUNTS, compare case-insensitive)
        const isAdmin = this.ADMIN_ACCOUNTS.find(admin =>
            admin.username.toLowerCase() === input.toLowerCase() && admin.password === password
        );

        if (isAdmin) {
            localStorage.setItem('loggedInUser', isAdmin.username);
            localStorage.setItem('userRole', 'admin');
            if (rememberMe) localStorage.setItem('rememberedUser', isAdmin.username);
            alert('✅ Admin login successful! Redirecting to admin page...');
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            setTimeout(() => window.location.href = './admin/admin.html', 800);
            return;
        }

        // User check
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const inputLower = input.toLowerCase();

        const user = customers.find(u => {
            const uname = (u.username || '').toString().trim().toLowerCase();
            const email = (u.email || '').toString().trim().toLowerCase();
            return (uname === inputLower || email === inputLower);
        });

        if (user && (user.password || '').toString().trim() === password) {
            if (user.status && user.status.toString().trim().toLowerCase() === 'inactive') {
                alert('❌ Your account has been deactivated. Please contact support.');
                return;
            }

            localStorage.setItem('loggedInUser', user.username);
            localStorage.setItem('userRole', 'user');
            if (rememberMe) localStorage.setItem('rememberedUser', user.username);

            // Update external ProfileModule
            if (window.ProfileModule) {
                window.ProfileModule.currentUser = user.username;
            }

            alert('✅ Login successful!');
            const modalOverlay = KeySmith.utils.getById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }

            KeySmith.utils.getById('loginUsername').value = '';
            KeySmith.utils.getById('loginPassword').value = '';

            KeySmith.login.updateProfileDisplay();
            if (window.ProfileModule && window.ProfileModule.initProfileModal) {
                window.ProfileModule.initProfileModal();
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
        // nếu dataInitialized true nhưng customers/products/etc bị thiếu -> vẫn load lại
        const initialized = localStorage.getItem('dataInitialized');
        const hasCustomers = !!localStorage.getItem('customers');
        const hasProducts = !!localStorage.getItem('products');

        if (initialized && hasCustomers && hasProducts) {
            return Promise.resolve();
        }
        // otherwise try to load (even nếu dataInitialized=true nhưng thiếu bảng)
        return this.loadSampleData();
    },

    loadSampleData: async function () {
        const trySet = (obj) => {
            try {
                // if we have sample object, write missing tables OR if dataInitialized !== 'true' write them
                const initialized = localStorage.getItem('dataInitialized') === 'true';
                const hasCustomers = !!localStorage.getItem('customers');
                const hasProducts = !!localStorage.getItem('products');

                // Write customers/products/orders/importOrders if provided by sample data
                // We write customers if missing OR if dataInitialized is false (to refresh on first load)
                if (obj.customers && (!hasCustomers || !initialized)) {
                    localStorage.setItem("customers", JSON.stringify(obj.customers));
                    console.log("✅ customers saved (from sample data)");
                }
                if (obj.products && (!hasProducts || !initialized)) {
                    localStorage.setItem("products", JSON.stringify(obj.products));
                    console.log("✅ products saved (from sample data)");
                }
                if (obj.orders && (!localStorage.getItem("orders") || !initialized)) {
                    localStorage.setItem("orders", JSON.stringify(obj.orders));
                    console.log("✅ orders saved (from sample data)");
                }
                if (obj.importOrders && (!localStorage.getItem("importOrders") || !initialized)) {
                    localStorage.setItem("importOrders", JSON.stringify(obj.importOrders));
                    console.log("✅ importOrders saved (from sample data)");
                }

                // mark initialized
                localStorage.setItem("dataInitialized", "true");
                console.log("✅ dataInitialized set true");

                return true;
            } catch (e) {
                console.error("Error saving sample data to localStorage", e);
                return false;
            }
        };

        console.log("🔍 app.js import.meta.url =", import.meta.url);

        // ============================================================
        // 1) Dynamic IMPORT (resolve path bằng import.meta.url)
        // ============================================================
        const importPaths = [
            "./sampledata/sampleData.js",
            "../sampledata/sampleData.js",
            "/js/main/sampledata/sampleData.js",
            "/sampledata/sampleData.js",
            "/sampleData.js",
        ];

        for (const p of importPaths) {
            try {
                const resolved = new URL(p, import.meta.url).href;
                console.log("Trying import():", resolved);

                const mod = await import(resolved);
                let sample = mod.sampleData || mod.default || mod;

                // Normalize: nếu sample là array => customers; nếu là single user object => bọc vào customers
                const normalize = (s) => {
                    if (!s) return null;
                    if (Array.isArray(s)) return { customers: s };
                    if (typeof s === 'object') {
                        // nếu object có key customers/products/orders thì giữ nguyên
                        if (s.customers || s.products || s.orders || s.importOrders) return s;
                        // nếu object có vẻ như là một customer (username/password) -> wrap
                        if (s.username && s.password) return { customers: [s] };
                    }
                    return null;
                };

                const norm = normalize(sample);
                if (norm) {
                    console.log("🍀 Import OK from", resolved, "| normalized shape:", Object.keys(norm));
                    if (trySet(norm)) return;
                } else {
                    console.warn("⚠ Imported module didn't match expected shapes:", sample);
                }
            } catch (e) {
                console.warn("import failed:", e.message);
            } 
        }  

        // ============================================================
        // 2) FETCH fallback
        // ============================================================
        const fetchPaths = [
            "./sampledata/sampleData.js",
            "../sampledata/sampleData.js",
            "/js/main/sampledata/sampleData.js",
            "/sampledata/sampleData.js",
            "/sampleData.js",
        ];

        let text = null;

        for (const p of fetchPaths) {
            try {
                const resolved = new URL(p, import.meta.url).href;
                console.log("Trying fetch():", resolved);

                const r = await fetch(resolved, { cache: "no-store" });
                if (!r.ok) {
                    console.warn("fetch returned", r.status, "for", resolved);
                    continue;
                }

                text = await r.text();
                console.log("📄 Fetch OK from", resolved);
                break;
            } catch (e) {
                console.warn("fetch failed:", e.message);
            }
        }

        if (!text) {
            console.error("❌ Could NOT load sampleData via import or fetch.");
            return;
        }

        // ============================================================
        // 3) Try to EXTRACT Object Literal (export const sampleData = {...})
        // ============================================================
        try {
            let objText = null;

            const exportIdx = text.indexOf("export const sampleData");
            if (exportIdx !== -1) {
                let start = text.indexOf("=", exportIdx) + 1;
                objText = text.slice(start);
            } else {
                const idx = text.indexOf("sampleData");
                if (idx !== -1) {
                    const eq = text.indexOf("=", idx);
                    if (eq !== -1) objText = text.slice(eq + 1);
                }
            }

            if (objText) {
                const firstBrace = objText.indexOf("{");
                if (firstBrace !== -1) {
                    let i = firstBrace,
                        depth = 0;
                    for (; i < objText.length; i++) {
                        if (objText[i] === "{") depth++;
                        else if (objText[i] === "}") {
                            depth--;
                            if (depth === 0) {
                                objText = objText.slice(firstBrace, i + 1);
                                break;
                            }
                        }
                    }
                }

                const sampleObj = Function('"use strict"; return (' + objText + ")")();
                if (sampleObj && typeof sampleObj === "object") {
                    const normObj = (function (s) {
                        if (Array.isArray(s)) return { customers: s };
                        if (s.customers || s.products || s.orders || s.importOrders) return s;
                        if (s.username && s.password) return { customers: [s] };
                        return null;
                    })(sampleObj);

                    if (normObj) {
                        console.log("✨ Eval OK — loaded sampleData (normalized)");
                        if (trySet(normObj)) return;
                    } else {
                        console.warn("⚠ Eval produced object but not recognized shape:", sampleObj);
                    }
                }
            }
        } catch (e) {
            console.warn("Eval failed:", e.message);
        }

        // ============================================================
        // 4) Last Fallback — Inject script -> window.sampleData
        // ============================================================
        try {
            console.log("Injecting script fallback...");

            const script = document.createElement("script");
            script.text = text;
            document.head.appendChild(script);

            await new Promise((res) => setTimeout(res, 50));

            if (window.sampleData && trySet(window.sampleData)) {
                console.log("🌟 Loaded from window.sampleData");
                return;
            }
        } catch (e) {
            console.warn("Script injection failed", e.message);
        }

        console.error("❌ ALL METHODS FAILED — sampleData NOT LOADED.");
    }
};

// ==================== AUTH SESSION VALIDATOR ====================
KeySmith.auth = {
    /**
     * Validate session keys in localStorage:
     * - If userRole === 'user' then ensure customers exists and contains that username (case-insensitive).
     * - If validation fails, clear login-related keys (loggedInUser, userRole, rememberedUser).
     * - Returns true if session is valid (userRole==='user' and customer exists OR admin session left intact),
     *   false if session was cleared.
     */
    validateSession: function() {
        try {
            const loggedUser = localStorage.getItem('loggedInUser');
            const userRole = localStorage.getItem('userRole');

            // nothing to validate
            if (!loggedUser || !userRole) return false;

            // if it's a 'user' role, ensure customers list contains the username (case-insensitive) or email
            if (userRole === 'user') {
                const customers = JSON.parse(localStorage.getItem('customers') || '[]');
                const curLower = String(loggedUser).trim().toLowerCase();

                const found = customers.some(c => {
                    if (!c) return false;
                    const uname = (c.username || '').toString().trim().toLowerCase();
                    const email = (c.email || '').toString().trim().toLowerCase();
                    return uname === curLower || email === curLower;
                });

                if (!found) {
                    // invalid session: clear keys
                    console.warn('KeySmith.auth: invalid user session detected — clearing login keys');
                    localStorage.removeItem('loggedInUser');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('rememberedUser');
                    return false;
                }

                return true; // valid user session
            }

            // For admin role: optionally validate against ADMIN_ACCOUNTS; if not found, clear as well.
            if (userRole === 'admin') {
                const accounts = KeySmith.login && KeySmith.login.ADMIN_ACCOUNTS ? KeySmith.login.ADMIN_ACCOUNTS : [];
                const isAdminValid = accounts.some(a => a.username === loggedUser);
                if (!isAdminValid) {
                    console.warn('KeySmith.auth: invalid admin session detected — clearing login keys');
                    localStorage.removeItem('loggedInUser');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('rememberedUser');
                    return false;
                }
                return true;
            }

            // other roles: clear by default
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberedUser');
            return false;
        } catch (e) {
            console.error('KeySmith.auth.validateSession error', e);
            return false;
        }
    }
};

// ==================== SAMPLE DATA INJECTION ====================
(function ensureSampleData() {
    try {
        const already = !!localStorage.getItem('customers');
        // nếu muốn luôn ghi đè khi dev, đổi điều kiện bên dưới
        if (!already) {
            const sampleCustomers = [
                {
                    username: "cust01",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "An",
                    lastName: "Nguyen",
                    email: "an.nguyen@example.com",
                    phone: "0901000001",
                    address: "Hanoi, Vietnam",
                    dateOfBirth: "1990-04-15",
                    status: "active",
                },
                {
                    username: "cust02",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Binh",
                    lastName: "Tran",
                    email: "binh.tran@example.com",
                    phone: "0901000002",
                    address: "Ho Chi Minh City, Vietnam",
                    dateOfBirth: "1988-09-02",
                    status: "active",
                },
                {
                    username: "cust03",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Chi",
                    lastName: "Le",
                    email: "chi.le@example.com",
                    phone: "0901000003",
                    address: "Da Nang, Vietnam",
                    dateOfBirth: "1995-06-30",
                    status: "active",
                },
                {
                    username: "cust04",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Dung",
                    lastName: "Pham",
                    email: "dung.pham@example.com",
                    phone: "0901000004",
                    address: "Hai Phong, Vietnam",
                    dateOfBirth: "1985-12-11",
                    status: "active",
                },
                {
                    username: "cust05",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Em",
                    lastName: "Ho",
                    email: "em.ho@example.com",
                    phone: "0901000005",
                    address: "Can Tho, Vietnam",
                    dateOfBirth: "1992-03-21",
                    status: "active",
                },
                {
                    username: "cust06",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Minh",
                    lastName: "Vo",
                    email: "minh.vo@example.com",
                    phone: "0901000006",
                    address: "Nha Trang, Vietnam",
                    dateOfBirth: "1991-07-08",
                    status: "active",
                },
                {
                    username: "cust07",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Hoa",
                    lastName: "Pham",
                    email: "hoa.pham@example.com",
                    phone: "0901000007",
                    address: "Hue, Vietnam",
                    dateOfBirth: "1998-11-19",
                    status: "active",
                },
                {
                    username: "cust08",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Khanh",
                    lastName: "Do",
                    email: "khanh.do@example.com",
                    phone: "0901000008",
                    address: "Vung Tau, Vietnam",
                    dateOfBirth: "1987-02-03",
                    status: "inactive",
                },
                {
                    username: "cust09",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Lan",
                    lastName: "Nguyen",
                    email: "lan.nguyen@example.com",
                    phone: "0901000009",
                    address: "Da Lat, Vietnam",
                    dateOfBirth: "1993-08-27",
                    status: "active",
                },
                {
                    username: "cust10",
                    password: "pass123",
                    img: "/img/blank-image.png",
                    firstName: "Quynh",
                    lastName: "Pham",
                    email: "quynh.pham@example.com",
                    phone: "0901000010",
                    address: "Bien Hoa, Vietnam",
                    dateOfBirth: "1996-01-05",
                    status: "active",
                },
            ];

            localStorage.setItem('customers', JSON.stringify(sampleCustomers));
            // nếu bạn muốn cho dataSync biết đã nạp dữ liệu:
            localStorage.setItem('dataInitialized', 'true');
            console.log('✅ Sample customers injected into localStorage');
        } else {
            console.log('ℹ️ customers already present — skip injecting sample data');
        }
    } catch (e) {
        console.error('Could not inject sample data', e);
    }
})();

// ==================== INITIALIZE ====================
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        KeySmith.auth && KeySmith.auth.validateSession();
    } catch (e) {
        console.warn('Session validation failed', e);
    }

    // make dataSync.init return a promise that resolves when loadSampleData finishes
    if (KeySmith.dataSync && KeySmith.dataSync.init) {
        await KeySmith.dataSync.init();
    }

    // --- LOAD PROFILE MODULE AFTER dataSync COMPLETES ---
    try {
        // chỉnh đường dẫn nếu cần: './profile.js' hoặc './main/profile.js'
        await import('./profile.js');
        console.log('✅ profile.js dynamically loaded');

        // nếu đã có người login, truyền giá trị cho ProfileModule trước khi init
        if (window.ProfileModule) {
            window.ProfileModule.currentUser = localStorage.getItem('loggedInUser') || null;
        }
    } catch (err) {
        console.warn('⚠ Could not dynamically import profile.js:', err);
        // nếu import fail, vẫn tiếp tục để app không bị chặn
    }

    // Now initialize the app
    KeySmith.init();
});

window.KeySmith = KeySmith;