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