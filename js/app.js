/*
 * KeySmith - Enhanced Single Page Application
 * Version: 2.0.0
 * Combined and optimized router with all features
 */

// ==================== NAMESPACE & UTILITIES ====================
const KeySmith = {
    // Quick selectors
    $: (sel) => document.querySelector(sel),
    $$: (sel) => Array.from(document.querySelectorAll(sel)),
    
    // Utility functions
    utils: {
        toggle: function(element, show) {
            if (element) element.style.display = show ? 'flex' : 'none';
        },
        
        toggleClass: function(element, className, force) {
            if (element) element.classList.toggle(className, force);
        },
        
        getById: function(id) {
            return document.getElementById(id);
        }
    },
    
    // Ready handler
    ready: (fn) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
};

// ==================== HEADER MODULE ====================
KeySmith.header = {
    header: null,
    lastScroll: 0,
    
    init: function() {
        this.header = document.getElementById('header');
        if (!this.header) return;
        
        // Header scroll behavior
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
        const bar = document.getElementById('bar');
        const close = document.getElementById('close');
        const nav = document.getElementById('navbar');
        
        if (bar && nav) {
            bar.addEventListener('click', () => nav.classList.add('active'));
        }
        
        if (close && nav) {
            close.addEventListener('click', () => nav.classList.remove('active'));
        }
        
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
    ADMIN_ACCOUNTS: [
        { username: 'admin', password: 'admin123' },
        { username: 'superadmin', password: 'super123' }
    ],
    
    init: function() {
        const profileBtn = document.querySelector('.profile');
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');
        const loginForm = document.getElementById('loginForm');
        
        const registerOverlay = document.getElementById('registerOverlay');
        const closeRegister = document.getElementById('closeRegister');
        const registerForm = document.getElementById('registerForm');
        const openRegister = document.getElementById('openRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        
        // Profile button click
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const loggedUser = localStorage.getItem('loggedInUser');
                const userRole = localStorage.getItem('userRole');
                
                if (loggedUser && userRole === 'user') {
                    KeySmith.router.navigate('profile');
                } else {
                    if (modalOverlay) {
                        modalOverlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        }
        
        // Close login modal
        if (closeModal && modalOverlay) {
            closeModal.addEventListener('click', () => {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
        
        // Register modal controls
        if (openRegister && modalOverlay && registerOverlay) {
            openRegister.addEventListener('click', (e) => {
                e.preventDefault();
                modalOverlay.style.display = 'none';
                registerOverlay.style.display = 'flex';
            });
        }
        
        if (closeRegister && registerOverlay) {
            closeRegister.addEventListener('click', () => {
                registerOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
        
        if (switchToLogin && registerOverlay && modalOverlay) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerOverlay.style.display = 'none';
                modalOverlay.style.display = 'flex';
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
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        
        if (!username || !password) {
            alert('Please enter all fields!');
            return;
        }
        
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
        
        const registerOverlay = document.getElementById('registerOverlay');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (registerOverlay) registerOverlay.style.display = 'none';
        if (modalOverlay) modalOverlay.style.display = 'flex';
    },
    
    handleLogin: function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        // Check admin login
        const isAdmin = this.ADMIN_ACCOUNTS.find(admin => 
            admin.username === username && admin.password === password
        );
        
        if (isAdmin) {
            localStorage.setItem('loggedInUser', username);
            localStorage.setItem('userRole', 'admin');
            if (rememberMe) localStorage.setItem('rememberedUser', username);
            
            alert('✅ Admin login successful! Redirecting to admin page...');
            
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            setTimeout(() => {
                window.location.href = '../admin.html';
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
            
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
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
    init: function() {
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        if (loggedUser && userRole === 'user') {
            this.initProfileModal();
        }
    },
    
    initProfileModal: function() {
        const profileModal = document.getElementById('profileModalOverlay');
        if (!profileModal) return;
        
        const closeBtn = document.getElementById('closeProfileModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                KeySmith.router.navigate('home');
            });
        }
        
        const sidebarLinks = profileModal.querySelectorAll('.profile-sidebar a[data-section]');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const sections = profileModal.querySelectorAll('.profile-section');
                sections.forEach(section => {
                    section.classList.toggle('active', 
                        section.getAttribute('data-section-name') === targetSection);
                });
            });
        });
        
        const logoutBtn = document.getElementById('profileLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('rememberedUser');
                window.location.reload();
            });
        }
        
        this.initProfileForms();
    },
    
    initProfileForms: function() {
        const profileForm = document.getElementById('profileInfoForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Profile updated successfully!');
            });
        }
        
        const passwordForm = document.getElementById('changePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentPass = document.getElementById('current-password').value;
                const newPass = document.getElementById('new-password').value;
                const confirmPass = document.getElementById('confirm-password').value;
                
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
        const profileModal = document.getElementById('profileModalOverlay');
        if (profileModal) {
            profileModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
};

// ==================== CONTACT MODULE ====================
KeySmith.contact = {
    init: function() {
        const contactLink = document.getElementById('contactLink');
        const contactModal = document.getElementById('contactModalOverlay');
        const closeContactModal = document.getElementById('closeContactModal');
        
        if (contactLink && contactModal) {
            contactLink.addEventListener('click', (e) => {
                e.preventDefault();
                contactModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closeContactModal && contactModal) {
            closeContactModal.addEventListener('click', () => {
                contactModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) {
                    contactModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
};

// ==================== STORE MODULE ====================
KeySmith.store = {
    inited: false,
    
    init: function() {
        const cartBtn = document.querySelector('.cart');
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const loggedUser = localStorage.getItem('loggedInUser');
                
                if (!loggedUser) {
                    const modalOverlay = document.getElementById('modalOverlay');
                    if (modalOverlay) {
                        modalOverlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    }
                } else {
                    KeySmith.router.navigate('cart');
                }
            });
        }
    },
    
    initStorePage: function() {
        const storeEl = document.getElementById('store');
        if (!storeEl || this.inited) return;
        
        this.inited = true;
        
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                KeySmith.router.navigate('home');
            });
        }
        
        // Demo products
        const demoProducts = [
            {id:101, title:'White Tree', collection:'Lord Of The Rings', price:'85$', img:'/img/keycap/LOTR/gondor/white_tree.jpg'},
            {id:102, title:'Wings of Freedom', collection:'Attack On Titan', price:'85$', img:'/img/keycap/AttackOnTitan/spacebar.jpg'},
            {id:103, title:'Horn Of Gordor', collection:'Lord Of The Rings', price:'90$', img:'/img/keycap/LOTR/gondor/horn_of_gordor.jpg'},
            {id:104, title:'Attack Titan', collection:'Attack On Titan', price:'75$', img:'/img/keycap/AttackOnTitan/Eren.jpg'}
        ];
        
        this.renderProducts(demoProducts);
        this.initSearch();
        this.initFilters();
    },
    
    renderProducts: function(products) {
        const proContainer = document.getElementById('pro-container');
        if (!proContainer) return;
        
        proContainer.innerHTML = '';
        
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'owl-carousel store-products-carousel';
        
        products.forEach(p => {
            const productDiv = document.createElement('div');
            productDiv.className = 'pro';
            productDiv.dataset.productId = p.id;
            productDiv.style.cursor = 'pointer';
            productDiv.innerHTML = `
                <img src="${p.img}" alt="${p.title}">
                <div class="des">
                    <span>${p.collection}</span>
                    <h4>${p.title}<br>Keycap Artisan</h4>
                    <h5>${p.price}</h5>
                </div>
            `;
            
            productDiv.addEventListener('click', () => {
                this.showProductDetail(p);
            });
            
            carouselWrapper.appendChild(productDiv);
        });
        
        proContainer.appendChild(carouselWrapper);
        
        // Initialize Owl Carousel
        try {
            if (window.jQuery && jQuery().owlCarousel) {
                $('.store-products-carousel').owlCarousel({
                    loop: true,
                    center: true,
                    margin: 20,
                    items: 3,
                    autoplay: true,
                    autoplayTimeout: 3000,
                    autoplayHoverPause: true,
                    responsive: {
                        0: { items: 1 },
                        600: { items: 2 },
                        1000: { items: 3 }
                    }
                });
            }
        } catch (err) {
            console.warn('Owl carousel initialization failed:', err);
        }
    },
    
    showProductDetail: function(product) {
        const detailSection = document.getElementById('product-detail');
        const storeView = document.getElementById('store-view');
        
        if (!detailSection) return;
        
        // Fill product details
        const titleEl = document.getElementById('productTitle');
        const descEl = document.getElementById('productDesc');
        const priceEl = document.getElementById('productPrice');
        
        if (titleEl) titleEl.textContent = product.title;
        if (descEl) descEl.textContent = `${product.collection} Collection - Premium Resin Keycap`;
        if (priceEl) priceEl.textContent = product.price;
        
        // Show detail, hide list
        if (storeView) storeView.style.display = 'none';
        detailSection.style.display = 'block';
        
        // Scroll to top
        detailSection.scrollIntoView({ behavior: 'smooth' });
    },
    
    initSearch: function() {
        const searchBtn = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    console.log('Searching for:', query);
                    alert(`Searching for: ${query}`);
                }
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }
    },
    
    initFilters: function() {
        const filterElements = [
            'status', 'brands', 'category', 'color', 
            'price-min', 'price-max', 'sort'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    console.log(`Filter changed: ${id}`);
                });
            }
        });
    }
};

// ==================== SUBSCRIPTION FORM ====================
KeySmith.subscriptionForm = {
    init: function() {
        const form = document.getElementById('subscribeForm');
        const message = document.getElementById('formMessage');
        
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    if (message) {
                        message.textContent = '✅ Thank you for subscribing!';
                        message.style.color = 'green';
                        message.style.display = 'block';
                    }
                    form.reset();
                } else {
                    throw new Error('Subscription failed');
                }
            } catch (error) {
                if (message) {
                    message.textContent = '❌ Something went wrong. Please try again.';
                    message.style.color = 'red';
                    message.style.display = 'block';
                }
            }
            
            if (message) {
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            }
        });
    }
};

// ==================== 404 ERROR MODULE ====================
KeySmith.error404 = {
    init: function() {
        const errorOverlay = document.getElementById('error404Overlay');
        const backHomeBtn = document.getElementById('backHomeBtn404');
        
        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => {
                KeySmith.router.navigate('home');
            });
        }
        
        if (document.body.classList.contains('error-page') && errorOverlay) {
            errorOverlay.style.display = 'flex';
        }
    }
};

// ==================== HOME CAROUSELS ====================
KeySmith.homeCarousels = {
    init: function() {
        try {
            if (!window.jQuery || !jQuery().owlCarousel) {
                console.warn('jQuery or Owl Carousel not loaded');
                return;
            }
            
            // Making Of carousel
            $('#homeMakingOf').owlCarousel({
                loop: true,
                nav: false,
                dots: true,
                autoplay: true,
                autoplayTimeout: 3000,
                autoplayHoverPause: true,
                items: 1
            });
            
            // Home products carousel
            $('#homeProductsCarousel').owlCarousel({
                loop: true,
                center: true,
                margin: 20,
                items: 3,
                autoplay: true,
                autoplayTimeout: 3000,
                autoplayHoverPause: true,
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 3 }
                }
            });
            
            // Product click handler - go to store
            $('#homeProductsCarousel').on('click', '.pro', function(e) {
                e.preventDefault();
                KeySmith.router.navigate('store');
            });
            
        } catch (err) {
            console.warn('Home carousels initialization failed:', err);
        }
    }
};

// ==================== ENHANCED ROUTER ====================
KeySmith.router = {
    routes: {
        '': 'home',
        '#': 'home',
        '#home': 'home',
        '#store': 'store',
        '#product-detail': 'product-detail',
        '#cart': 'cart',
        '#profile': 'profile'
    },
    
    currentRoute: null,
    
    init: function() {
        // Listen to hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute(location.hash);
        });
        
        // Handle initial load
        this.handleRoute(location.hash || '#home');
        
        // Intercept navigation links
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && this.routes[href]) {
                    e.preventDefault();
                    this.navigate(this.routes[href]);
                }
            }
        });
    },
    
    navigate: function(routeName) {
        const hash = this.getHashByRoute(routeName);
        if (hash) {
            location.hash = hash;
        }
    },
    
    getHashByRoute: function(routeName) {
        for (let [hash, route] of Object.entries(this.routes)) {
            if (route === routeName) {
                return hash || '#home';
            }
        }
        return '#home';
    },
    
    handleRoute: function(hash) {
        const normalizedHash = hash || '#home';
        const routeName = this.routes[normalizedHash] || 'home';
        
        // Prevent unnecessary re-renders
        if (this.currentRoute === routeName) return;
        
        this.currentRoute = routeName;
        
        // Hide all views first
        this.hideAllViews();
        
        // Show the appropriate view
        switch(routeName) {
            case 'home':
                this.showHome();
                break;
            case 'store':
                this.showStore();
                break;
            case 'product-detail':
                this.showProductDetail();
                break;
            case 'cart':
                this.showCart();
                break;
            case 'profile':
                this.showProfile();
                break;
            default:
                this.showHome();
        }
    },
    
    hideAllViews: function() {
        const views = ['store', 'product-detail', 'cart-view', 'mainContent'];
        views.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        // Hide modals
        const profileModal = document.getElementById('profileModalOverlay');
        if (profileModal) profileModal.style.display = 'none';
        
        document.body.style.overflow = 'auto';
    },
    
    showHome: function() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.style.display = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    
    showStore: function() {
        const storeEl = document.getElementById('store');
        if (storeEl) {
            storeEl.style.display = '';
            
            // Lazy init store
            KeySmith.store.initStorePage();
            
            // Show store view, hide product detail
            const storeView = document.getElementById('store-view');
            const productDetail = document.getElementById('product-detail');
            
            if (storeView) storeView.style.display = '';
            if (productDetail) productDetail.style.display = 'none';
            
            // Scroll to store
            storeEl.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    showProductDetail: function() {
        const storeEl = document.getElementById('store');
        const productDetail = document.getElementById('product-detail');
        
        if (storeEl) storeEl.style.display = '';
        if (productDetail) productDetail.style.display = '';
    },
    
    showCart: function() {
        const cartView = document.getElementById('cart-view');
        if (cartView) {
            cartView.style.display = '';
        } else {
            alert('Cart feature - Coming soon!');
            this.navigate('home');
        }
    },
    
    showProfile: function() {
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        if (loggedUser && userRole === 'user') {
            KeySmith.profile.showProfileModal();
        } else {
            // Redirect to login
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            this.navigate('home');
        }
    }
};

// ==================== APP INITIALIZATION ====================
KeySmith.init = function() {
    console.log('🔧 KeySmith SPA initializing...');
    
    // Initialize all modules
    this.header.init();
    this.login.init();
    this.profile.init();
    this.contact.init();
    this.subscriptionForm.init();
    this.store.init();
    this.error404.init();
    this.homeCarousels.init();
    
    // Initialize router (must be last)
    this.router.init();
    
    console.log('✅ KeySmith SPA ready!');
};

// Start the application when DOM is ready
KeySmith.ready(() => {
    KeySmith.init();
});

// Export for debugging
window.KeySmith = KeySmith;