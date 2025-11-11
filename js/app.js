// /*
//  * KeySmith - Main Application JavaScript
//  * Version: 1.0.0
//  * Description: Combined JS file for all main website functionality
//  */

// // ==================== UTILITIES ====================
// const KeySmith = {
//     // Utility functions
//     utils: {
//         // Show/hide element
//         toggle: function(element, show) {
//             if (element) {
//                 element.style.display = show ? 'flex' : 'none';
//             }
//         },
        
//         // Add/remove class
//         toggleClass: function(element, className, force) {
//             if (element) {
//                 element.classList.toggle(className, force);
//             }
//         },
        
//         // Get element by ID with null check
//         getById: function(id) {
//             return document.getElementById(id);
//         }
//     },
    
//     // Initialize all modules
//     init: function() {
//         this.header.init();
//         this.profile.init();
//         this.login.init();
//         this.contact.init();
//         this.store.init();
//         this.subscriptionForm.init();
//         this.error404.init();
//     }
// };

// // ==================== HEADER MODULE ====================
// KeySmith.header = {
//     header: null,
//     lastScroll: 0,
    
//     init: function() {
//         this.header = KeySmith.utils.getById('header');
//         if (!this.header) return;
        
//         // Header scroll hide/show
//         window.addEventListener('scroll', () => {
//             const currentScroll = window.pageYOffset;

//             if (currentScroll <= 0) {
//                 this.header.classList.remove('hidden');
//             } else if (currentScroll > this.lastScroll && currentScroll > 100) {
//                 this.header.classList.add('hidden');
//             } else {
//                 this.header.classList.remove('hidden');
//             }

//             this.lastScroll = currentScroll;
//         });

//         // Mobile menu
//         const bar = KeySmith.utils.getById('bar');
//         const close = KeySmith.utils.getById('close');
//         const nav = KeySmith.utils.getById('navbar');

//         if (bar) bar.addEventListener('click', () => nav.classList.add('active'));
//         if (close) close.addEventListener('click', () => nav.classList.remove('active'));

//         // Close menu on outside click
//         document.addEventListener('click', (e) => {
//             if (nav && nav.classList.contains('active')) {
//                 if (!nav.contains(e.target) && !bar.contains(e.target)) {
//                     nav.classList.remove('active');
//                 }
//             }
//         });
//     }
// };

// // ==================== LOGIN MODULE ====================
// KeySmith.login = {
//     // Admin accounts list
//     ADMIN_ACCOUNTS: [
//         { username: 'admin', password: 'admin123' },
//         { username: 'superadmin', password: 'super123' }
//     ],
    
//     init: function() {
//         // Login elements
//         const profileBtn = document.querySelector('.profile');
//         const modalOverlay = KeySmith.utils.getById('modalOverlay');
//         const closeModal = KeySmith.utils.getById('closeModal');
//         const loginForm = KeySmith.utils.getById('loginForm');

//         // Register elements
//         const registerOverlay = KeySmith.utils.getById('registerOverlay');
//         const closeRegister = KeySmith.utils.getById('closeRegister');
//         const registerForm = KeySmith.utils.getById('registerForm');
//         const openRegister = KeySmith.utils.getById('openRegister');
//         const switchToLogin = KeySmith.utils.getById('switchToLogin');

//         // Profile button click
//         if (profileBtn) {
//             profileBtn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const loggedUser = localStorage.getItem('loggedInUser');
//                 const userRole = localStorage.getItem('userRole');
                
//                 if (loggedUser && userRole === 'user') {
//                     KeySmith.profile.showProfileModal();
//                 } else {
//                     if (modalOverlay) {
//                         modalOverlay.classList.add('active');
//                         document.body.style.overflow = 'hidden';
//                     }
//                 }
//             });
//         }

//         // Close login modal
//         if (closeModal) {
//             closeModal.addEventListener('click', () => {
//                 modalOverlay.classList.remove('active');
//                 document.body.style.overflow = 'auto';
//             });
//         }

//         // Outside click close
//         if (modalOverlay) {
//             modalOverlay.addEventListener('click', (e) => {
//                 if (e.target === modalOverlay) {
//                     modalOverlay.classList.remove('active');
//                     document.body.style.overflow = 'auto';
//                 }
//             });
//         }

//         // Register modal controls
//         if (openRegister) {
//             openRegister.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 modalOverlay.classList.remove('active');
//                 registerOverlay.classList.add('active');
//             });
//         }

//         if (closeRegister) {
//             closeRegister.addEventListener('click', () => {
//                 registerOverlay.classList.remove('active');
//                 document.body.style.overflow = 'auto';
//             });
//         }

//         if (switchToLogin) {
//             switchToLogin.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 registerOverlay.classList.remove('active');
//                 modalOverlay.classList.add('active');
//             });
//         }

//         // Form submissions
//         if (registerForm) {
//             registerForm.addEventListener('submit', (e) => this.handleRegister(e));
//         }

//         if (loginForm) {
//             loginForm.addEventListener('submit', (e) => this.handleLogin(e));
//         }

//         // Update profile display on load
//         this.updateProfileDisplay();
//     },

//     handleRegister: function(e) {
//         e.preventDefault();
//         const username = KeySmith.utils.getById('registerUsername').value.trim();
//         const password = KeySmith.utils.getById('registerPassword').value.trim();

//         if (!username || !password) {
//             alert('Please enter all fields!');
//             return;
//         }

//         // Check for admin username
//         if (this.ADMIN_ACCOUNTS.some(admin => admin.username === username)) {
//             alert('❌ This username is reserved for admin only!');
//             return;
//         }

//         let users = JSON.parse(localStorage.getItem('users')) || [];
//         if (users.find(u => u.username === username)) {
//             alert('Username already exists!');
//             return;
//         }

//         users.push({ username, password, role: 'user' });
//         localStorage.setItem('users', JSON.stringify(users));
//         alert('✅ Account created successfully!');

//         const registerOverlay = KeySmith.utils.getById('registerOverlay');
//         const modalOverlay = KeySmith.utils.getById('modalOverlay');
        
//         registerOverlay.classList.remove('active');
//         modalOverlay.classList.add('active');
//     },

//     handleLogin: function(e) {
//         e.preventDefault();
//         const username = KeySmith.utils.getById('loginUsername').value.trim();
//         const password = KeySmith.utils.getById('loginPassword').value.trim();
//         const rememberMe = KeySmith.utils.getById('rememberMe').checked;

//         // Check admin login
//         const isAdmin = this.ADMIN_ACCOUNTS.find(admin => 
//             admin.username === username && admin.password === password
//         );

//         if (isAdmin) {
//             localStorage.setItem('loggedInUser', username);
//             localStorage.setItem('userRole', 'admin');
//             if (rememberMe) localStorage.setItem('rememberedUser', username);
            
//             alert('✅ Admin login successful! Redirecting to admin page...');
            
//             const modalOverlay = KeySmith.utils.getById('modalOverlay');
//             if (modalOverlay) {
//                 modalOverlay.classList.remove('active');
//                 document.body.style.overflow = 'auto';
//             }
            
//             setTimeout(() => {
//                 window.location.href = '../admin.html';
//             }, 1000);
//             return;
//         }

//         // Check regular user login
//         const users = JSON.parse(localStorage.getItem('users')) || [];
//         const user = users.find(u => u.username === username && u.password === password);

//         if (user) {
//             localStorage.setItem('loggedInUser', username);
//             localStorage.setItem('userRole', 'user');
//             if (rememberMe) localStorage.setItem('rememberedUser', username);
            
//             alert('✅ Login successful!');
            
//             const modalOverlay = KeySmith.utils.getById('modalOverlay');
//             if (modalOverlay) {
//                 modalOverlay.classList.remove('active');
//                 document.body.style.overflow = 'auto';
//             }
            
//             this.updateProfileDisplay();
//             KeySmith.profile.initProfileModal();
//         } else {
//             alert('❌ Invalid username or password!');
//         }
//     },

//     updateProfileDisplay: function() {
//         const loggedUser = localStorage.getItem('loggedInUser');
//         const userRole = localStorage.getItem('userRole');
//         const profile = document.querySelector('.profile');

//         if (!profile) return;

//         if (loggedUser && userRole === 'user') {
//             profile.innerHTML = `<i class="fa-solid fa-user-check"></i> <span style="font-size:14px;">${loggedUser}</span>`;
//         } else {
//             profile.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
//         }
        
//         profile.style.cursor = 'pointer';
//     }
// };

// // ==================== PROFILE MODULE ====================
// KeySmith.profile = {
//     init: function() {
//         // Initialize only if user is logged in
//         const loggedUser = localStorage.getItem('loggedInUser');
//         const userRole = localStorage.getItem('userRole');
        
//         if (loggedUser && userRole === 'user') {
//             this.initProfileModal();
//         }
//     },

//     initProfileModal: function() {
//         const profileModal = KeySmith.utils.getById('profileModalOverlay');
//         if (!profileModal) return;

//         // Close button
//         const closeBtn = KeySmith.utils.getById('closeProfileModal');
//         if (closeBtn) {
//             closeBtn.addEventListener('click', () => {
//                 profileModal.style.display = 'none';
//                 document.body.style.overflow = 'auto';
//             });
//         }

//         // Section navigation
//         const sidebarLinks = profileModal.querySelectorAll('.profile-sidebar a[data-section]');
//         sidebarLinks.forEach(link => {
//             link.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const targetSection = link.getAttribute('data-section');
                
//                 // Update active states
//                 sidebarLinks.forEach(l => l.classList.remove('active'));
//                 link.classList.add('active');
                
//                 // Show target section
//                 const sections = profileModal.querySelectorAll('.profile-section');
//                 sections.forEach(section => {
//                     section.classList.toggle('active', 
//                         section.getAttribute('data-section-name') === targetSection);
//                 });
//             });
//         });

//         // Logout
//         const logoutBtn = KeySmith.utils.getById('profileLogout');
//         if (logoutBtn) {
//             logoutBtn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 localStorage.removeItem('loggedInUser');
//                 localStorage.removeItem('userRole');
//                 localStorage.removeItem('rememberedUser');
//                 window.location.reload();
//             });
//         }

//         // Forms
//         this.initProfileForms();
//     },

//     initProfileForms: function() {
//         // Profile info form
//         const profileForm = KeySmith.utils.getById('profileInfoForm');
//         if (profileForm) {
//             profileForm.addEventListener('submit', (e) => {
//                 e.preventDefault();
//                 alert('Profile updated successfully!');
//             });
//         }

//         // Password change form
//         const passwordForm = KeySmith.utils.getById('changePasswordForm');
//         if (passwordForm) {
//             passwordForm.addEventListener('submit', (e) => {
//                 e.preventDefault();
//                 const currentPass = KeySmith.utils.getById('current-password').value;
//                 const newPass = KeySmith.utils.getById('new-password').value;
//                 const confirmPass = KeySmith.utils.getById('confirm-password').value;

//                 if (newPass !== confirmPass) {
//                     alert('New passwords do not match!');
//                     return;
//                 }

//                 alert('Password changed successfully!');
//                 passwordForm.reset();
//             });
//         }
//     },

//     showProfileModal: function() {
//         const profileModal = KeySmith.utils.getById('profileModalOverlay');
//         if (profileModal) {
//             profileModal.style.display = 'flex';
//             document.body.style.overflow = 'hidden';
//         }
//     }
// };

// // ==================== CONTACT MODULE ====================
// KeySmith.contact = {
//     init: function() {
//         const contactLink = KeySmith.utils.getById('contactLink');
//         const contactModal = KeySmith.utils.getById('contactModalOverlay');
//         const closeContactModal = KeySmith.utils.getById('closeContactModal');

//         if (contactLink) {
//             contactLink.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 if (contactModal) {
//                     contactModal.classList.add('active');
//                     document.body.style.overflow = 'hidden';
//                 }
//             });
//         }

//         if (closeContactModal) {
//             closeContactModal.addEventListener('click', () => {
//                 contactModal.classList.remove('active');
//                 document.body.style.overflow = 'auto';
//             });
//         }

//         if (contactModal) {
//             contactModal.addEventListener('click', (e) => {
//                 if (e.target === contactModal) {
//                     contactModal.classList.remove('active');
//                     document.body.style.overflow = 'auto';
//                 }
//             });
//         }
//     }
// };

// // ==================== STORE MODULE ====================
// KeySmith.store = {
//     init: function() {
//         // Cart functionality
//         const cartBtn = document.querySelector('.cart');
//         if (cartBtn) {
//             cartBtn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const loggedUser = localStorage.getItem('loggedInUser');
//                 if (!loggedUser) {
//                     const modalOverlay = KeySmith.utils.getById('modalOverlay');
//                     if (modalOverlay) {
//                         modalOverlay.classList.add('active');
//                         modalOverlay.style.display = 'flex';
//                         document.body.style.overflow = 'hidden';
//                     }
//                 } else {
//                     window.location.href = './main/store/Store.html?cart=1';
//                 }
//             });
//         }

//         // Product click handler (on home page)
//         const proContainer = document.querySelector('.pro-container');
//         if (proContainer) {
//             proContainer.addEventListener('click', (e) => {
//                 const productCard = e.target.closest('.pro');
//                 if (productCard) {
//                     window.location.href = './main/store/store.html';
//                 }
//             });
            
//             // Make products clickable
//             document.querySelectorAll('.pro').forEach(card => {
//                 card.style.cursor = 'pointer';
//             });
//         }
//     }
// };

// // ==================== SUBSCRIPTION FORM ====================
// KeySmith.subscriptionForm = {
//     init: function() {
//         const form = KeySmith.utils.getById('subscribeForm');
//         const message = KeySmith.utils.getById('formMessage');

//         if (form) {
//             form.addEventListener('submit', async (e) => {
//                 e.preventDefault();
//                 const formData = new FormData(form);

//                 try {
//                     const response = await fetch(form.action, {
//                         method: 'POST',
//                         body: formData
//                     });

//                     if (response.ok) {
//                         message.textContent = '✅ Thank you for subscribing!';
//                         message.style.color = 'green';
//                         form.reset();
//                     } else {
//                         throw new Error('Subscription failed');
//                     }
//                 } catch (error) {
//                     message.textContent = '❌ Something went wrong. Please try again.';
//                     message.style.color = 'red';
//                 }

//                 message.style.display = 'block';
//                 setTimeout(() => {
//                     message.style.display = 'none';
//                 }, 3000);
//             });
//         }
//     }
// };

// // ==================== 404 ERROR MODULE ====================
// KeySmith.error404 = {
//     init: function() {
//         const errorOverlay = KeySmith.utils.getById('error404Overlay');
//         const backHomeBtn = KeySmith.utils.getById('backHomeBtn404');
//         const mainContent = KeySmith.utils.getById('mainContent');

//         // Check if page not found
//         if (document.body.classList.contains('error-page')) {
//             if (errorOverlay) errorOverlay.style.display = 'flex';
//             if (mainContent) mainContent.style.display = 'none';
//         }

//         // Back home button
//         if (backHomeBtn) {
//             backHomeBtn.addEventListener('click', () => {
//                 window.location.href = '/';
//             });
//         }
//     }
// };

// // Initialize everything when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     KeySmith.init();
// });