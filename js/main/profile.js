/*
 * KeySmith - Profile Module
 * Version: 1.0.0
 * Description: User profile management functionality
 */

const ProfileModule = {
    currentUser: null,           
    currentCustomerDetail: null,
    isInitialized: false,

    init: function() {
        console.log('🔧 Profile.init() called');
        
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');
        
        console.log('👤 Logged user:', loggedUser, '| Role:', userRole);
        
        if (loggedUser && userRole === 'user') {
            this.currentUser = loggedUser;
            
            // Kiểm tra customer có tồn tại không
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const customer = customers.find(c => c.username === loggedUser);
            
            console.log('📋 Found customer:', customer);
            
            if (customer) {
                this.initProfileModal();
                this.isInitialized = true;
                console.log('✅ Profile initialized successfully');
            } else {
                console.error('❌ Customer not found in localStorage');
            }
        } else {
            console.log('ℹ️ No user logged in or not a user role');
        }
    },

    populateBirthdaySelects: function() {
        const daySelect = document.getElementById('profile-birth-day');
        if (daySelect && daySelect.options.length === 1) {
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i < 10 ? '0' + i : i;
                daySelect.appendChild(option);
            }
        }

        const monthSelect = document.getElementById('profile-birth-month');
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

        const yearSelect = document.getElementById('profile-birth-year');
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

    getCustomerDetail: function() {
        try {
            console.log('🔍 Getting customer detail for:', this.currentUser);

            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            console.log('📦 Total customers in storage:', customers.length);

            if (!this.currentUser) {
                console.warn('⚠ currentUser is null/undefined');
                return null;
            }

            const curLower = String(this.currentUser).trim().toLowerCase();

            // tìm theo username (case-insensitive) hoặc email
            const customer = customers.find(c => {
                if (!c) return false;
                const uname = (c.username || '').toString().trim().toLowerCase();
                const email = (c.email || '').toString().trim().toLowerCase();
                return uname === curLower || email === curLower;
            });

            if (!customer) {
                console.error('❌ Customer not found:', this.currentUser);
                console.log('Available usernames:', customers.map(c => c.username));
                return null;
            }

            console.log('✅ Customer found:', customer);
            this.currentCustomerDetail = customer;
            return customer;
        } catch (error) {
            console.error('❌ Error getting customer detail:', error);
            return null;
        }
    },

    setCustomerDetail: function(updatedCustomer) {
        try {
            console.log('💾 Saving customer detail:', updatedCustomer);
            
            let customers = JSON.parse(localStorage.getItem('customers')) || [];
            const index = customers.findIndex(c => c.username === this.currentUser);
            
            if (index === -1) {
                console.error('❌ Customer not found for update');
                return false;
            }

            customers[index] = {
                ...customers[index],
                ...updatedCustomer,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('customers', JSON.stringify(customers));
            this.currentCustomerDetail = customers[index];
            
            console.log('✅ Customer saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error setting customer detail:', error);
            return false;
        }
    },

    loadProfileToForm: function() {
        console.log('📝 Loading profile to form...');
        
        this.populateBirthdaySelects();

        const customer = this.getCustomerDetail();
        if (!customer) {
            console.error('❌ Cannot load profile - no customer data');
            return;
        }

        console.log('📋 Customer data to load:', {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            dateOfBirth: customer.dateOfBirth
        });

        // Update username in sidebar
        const profileUsername = document.getElementById('profileUsername');
        if (profileUsername) {
            profileUsername.textContent = customer.username || 'User';
            console.log('✅ Set username display:', customer.username);
        }

        // Fill form fields
        const fields = [
            { id: 'profile-first-name', key: 'firstName' },
            { id: 'profile-last-name', key: 'lastName' },
            { id: 'profile-email', key: 'email' },
            { id: 'profile-phone', key: 'phone' },
            { id: 'profile-address', key: 'address' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                const value = customer[field.key] || '';
                element.value = value;
                console.log(`✅ Set ${field.id} = "${value}"`);
            } else {
                console.warn(`⚠️ Field not found: ${field.id}`);
            }
        });

        // Fill birthday
        if (customer.dateOfBirth) {
            try {
                const date = new Date(customer.dateOfBirth);
                const day = document.getElementById('profile-birth-day');
                const month = document.getElementById('profile-birth-month');
                const year = document.getElementById('profile-birth-year');
                
                if (day) {
                    day.value = date.getDate();
                    console.log('✅ Set day:', date.getDate());
                }
                if (month) {
                    month.value = date.getMonth() + 1;
                    console.log('✅ Set month:', date.getMonth() + 1);
                }
                if (year) {
                    year.value = date.getFullYear();
                    console.log('✅ Set year:', date.getFullYear());
                }
            } catch (e) {
                console.error('❌ Error parsing date:', e);
            }
        }

        console.log('✅ Profile loaded to form successfully');
    },

    initProfileModal: function() {
        console.log('🎭 Initializing profile modal...');
        
        const profileModal = document.getElementById('profileModalOverlay');
        if (!profileModal) {
            console.error('❌ Profile modal not found in DOM');
            return;
        }

        // Close button
        const closeBtn = document.getElementById('closeProfileModal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                profileModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                console.log('🚪 Profile modal closed');
            };
        }

        // Section navigation
        const sidebarLinks = profileModal.querySelectorAll('.profile-sidebar a[data-section]');
        sidebarLinks.forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('data-section');
                
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const sections = profileModal.querySelectorAll('.profile-section');
                sections.forEach(section => {
                    section.classList.toggle('active', 
                        section.getAttribute('data-section-name') === targetSection);
                });
                
                console.log('📑 Switched to section:', targetSection);
            };
        });

        // Logout
        const logoutBtn = document.getElementById('profileLogout');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                console.log('👋 Logging out...');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('rememberedUser');
                window.location.reload();
            };
        }

        // Forms
        this.initProfileForms();
        
        console.log('✅ Profile modal initialized');
    },

    initProfileForms: function() {
        const profileForm = document.getElementById('profileInfoForm');
        if (profileForm) {
            profileForm.onsubmit = (e) => this.handleProfileUpdate(e);
            console.log('✅ Profile form handler attached');
        }

        const passwordForm = document.getElementById('changePasswordForm');
        if (passwordForm) {
            passwordForm.onsubmit = (e) => this.handlePasswordChange(e);
            console.log('✅ Password form handler attached');
        }
    },

    handleProfileUpdate: function(e) {
        e.preventDefault();

        try {
            const firstName = document.getElementById('profile-first-name').value.trim();
            const lastName = document.getElementById('profile-last-name').value.trim();
            const email = document.getElementById('profile-email').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            const address = document.getElementById('profile-address').value.trim();
            const day = document.getElementById('profile-birth-day').value;
            const month = document.getElementById('profile-birth-month').value;
            const year = document.getElementById('profile-birth-year').value;

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

            let dateOfBirth = '';
            if (day && month && year) {
                // Save as YYYY-MM-DD (ISO date string base)
                const d = new Date(year, month - 1, day);
                if (!isNaN(d.getTime())) {
                    dateOfBirth = d.toISOString().slice(0,10);
                }
            }

            // get detail
            const detail = this.getCustomerDetail();
            if (!detail) {
                this.showNotification('Error loading customer data', 'error');
                return;
            }

            // build updated customer object (top-level)
            const updatedCustomer = {
                ...detail,
                firstName,
                lastName,
                email,
                phone,
                address,
                dateOfBirth
            };

            // set detail
            if (this.setCustomerDetail(updatedCustomer)) {
                this.showNotification('✅ Profile updated successfully!', 'success');
                // reload internal detail
                this.currentCustomerDetail = updatedCustomer;
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
            const currentPass = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;

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

            // GET customers
            const customers = JSON.parse(localStorage.getItem('customers')) || [];
            const cur = (this.currentUser || '').toString().trim().toLowerCase();
            const index = customers.findIndex(c => {
                if (!c) return false;
                return ((c.username || '').toString().trim().toLowerCase() === cur) ||
                       ((c.email || '').toString().trim().toLowerCase() === cur);
            });

            if (index === -1) {
                this.showNotification('User not found', 'error');
                return;
            }

            const user = customers[index];

            if ((user.password || '').toString().trim() !== currentPass) {
                this.showNotification('Current password is incorrect', 'error');
                return;
            }

            if (currentPass === newPass) {
                this.showNotification('New password must be different from current password', 'warning');
                return;
            }

            // Update password
            customers[index] = {
                ...user,
                password: newPass,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('customers', JSON.stringify(customers));
            this.currentCustomerDetail = customers[index];

            this.showNotification('✅ Password changed successfully!', 'success');
            const form = document.getElementById('changePasswordForm');
            if (form) form.reset();
        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification('Error changing password', 'error');
        }
    },

    showProfileModal: function() {
        const profileModal = document.getElementById('profileModalOverlay');
        if (profileModal) {
            profileModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.loadProfileToForm();
        }
    },

    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `profile-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 16px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    isValidEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone: function(phone) {
        return /^[0-9+\-\s()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileModule;
}

// Make available globally
window.ProfileModule = ProfileModule;
// expose but do NOT auto-init
window.ProfileModule = window.ProfileModule || ProfileModule;
