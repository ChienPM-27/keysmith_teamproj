// ==================== FIXED PROFILE MANAGER ====================
// File: main/js/profile-manager.js

(function() {
    'use strict';

    // ========================= PROFILE DATA MANAGER =========================
    class ProfileManager {
        constructor() {
            this.storageKey = 'userProfileData';
            this.initializeProfile();
        }

        initializeProfile() {
            if (!localStorage.getItem(this.storageKey)) {
                const defaultProfile = {
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    birthDay: '',
                    birthMonth: '',
                    birthYear: ''
                };
                this.saveProfile(defaultProfile);
            }
        }

        getProfile() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Error loading profile:', error);
                return null;
            }
        }

        saveProfile(profileData) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(profileData));
                return true;
            } catch (error) {
                console.error('Error saving profile:', error);
                return false;
            }
        }

        updateField(fieldName, value) {
            const profile = this.getProfile();
            if (profile) {
                profile[fieldName] = value;
                return this.saveProfile(profile);
            }
            return false;
        }

        clearProfile() {
            localStorage.removeItem(this.storageKey);
            this.initializeProfile();
        }
    }

    // ========================= PROFILE MODAL CONTROLLER =========================
    class ProfileModalController {
        constructor() {
            this.profileManager = new ProfileManager();
            // ❌ XÓA createModal() - Vì HTML đã có sẵn modal rồi!
            this.modal = document.getElementById('profileModalOverlay');
            this.currentSection = 'profile-info';
            this.init();
        }

        init() {
            // Kiểm tra modal có tồn tại không
            if (!this.modal) {
                console.error('❌ Profile modal not found in HTML!');
                return;
            }
            
            this.attachEventListeners();
            this.populateBirthdayOptions();
            console.log('✅ Profile Modal Controller initialized');
        }

        populateBirthdayOptions() {
            const daySelect = document.getElementById('profile-birth-day');
            const monthSelect = document.getElementById('profile-birth-month');
            const yearSelect = document.getElementById('profile-birth-year');

            if (!daySelect || !monthSelect || !yearSelect) return;

            // Clear existing options (except first one)
            daySelect.innerHTML = '<option value="">Day</option>';
            monthSelect.innerHTML = '<option value="">Month</option>';
            yearSelect.innerHTML = '<option value="">Year</option>';

            // Days
            for (let i = 1; i <= 31; i++) {
                daySelect.innerHTML += `<option value="${i}">${i}</option>`;
            }

            // Months
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            months.forEach((month, index) => {
                monthSelect.innerHTML += `<option value="${index + 1}">${month}</option>`;
            });

            // Years
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= 1900; i--) {
                yearSelect.innerHTML += `<option value="${i}">${i}</option>`;
            }
        }

        attachEventListeners() {
            // ✅ SỬA: Đợi DOM load xong mới attach profile button
            setTimeout(() => {
                const profileBtn = document.querySelector('.profile');
                if (profileBtn) {
                    // Clone để xóa tất cả listeners cũ
                    const newProfileBtn = profileBtn.cloneNode(true);
                    profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
                    
                    // Add new listener
                    newProfileBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const loggedUser = localStorage.getItem('loggedInUser');
                        const userRole = localStorage.getItem('userRole');
                        
                        // CHỈ mở modal nếu user đã login và là user thường
                        if (loggedUser && userRole === 'user') {
                            this.openModal();
                        }
                        // Nếu chưa login, login.js sẽ xử lý
                    });
                    
                    console.log('✅ Profile button listener attached');
                }
            }, 300);

            // Close modal
            const closeBtn = document.getElementById('closeProfileModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Close on overlay click
            if (this.modal) {
                this.modal.addEventListener('click', (e) => {
                    if (e.target === this.modal) {
                        this.closeModal();
                    }
                });
            }

            // Section switching
            const sectionLinks = document.querySelectorAll('.profile-sidebar a[data-section]');
            sectionLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = e.currentTarget.getAttribute('data-section');
                    if (section) {
                        this.switchSection(section);
                    }
                });
            });

            // Profile form submit
            const profileForm = document.getElementById('profileInfoForm');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
            }

            // Password form submit
            const passwordForm = document.getElementById('changePasswordForm');
            if (passwordForm) {
                passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
            }

            // Logout
            const logoutBtn = document.getElementById('profileLogout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }

            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                    this.closeModal();
                }
            });
        }

        openModal() {
            if (!this.modal) return;
            
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.loadProfileData();
            this.updateUsername();
            
            console.log('✅ Profile modal opened');
        }

        closeModal() {
            if (!this.modal) return;
            
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        switchSection(sectionName) {
            document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.profile-sidebar a[data-section]').forEach(l => l.classList.remove('active'));

            const targetSection = document.querySelector(`[data-section-name="${sectionName}"]`);
            const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
            
            if (targetSection) targetSection.classList.add('active');
            if (targetLink) targetLink.classList.add('active');
        }

        loadProfileData() {
            const profile = this.profileManager.getProfile();
            if (profile) {
                const fields = {
                    'profile-last-name': profile.lastName,
                    'profile-first-name': profile.firstName,
                    'profile-email': profile.email,
                    'profile-phone': profile.phone,
                    'profile-address': profile.address,
                    'profile-birth-day': profile.birthDay,
                    'profile-birth-month': profile.birthMonth,
                    'profile-birth-year': profile.birthYear
                };
                
                Object.keys(fields).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = fields[id] || '';
                    }
                });
            }
        }

        updateUsername() {
            const loggedUser = localStorage.getItem('loggedInUser');
            const usernameDisplay = document.getElementById('profileUsername');
            if (usernameDisplay && loggedUser) {
                usernameDisplay.textContent = loggedUser;
            }
        }

        handleProfileSubmit(e) {
            e.preventDefault();

            const profileData = {
                firstName: document.getElementById('profile-first-name').value.trim(),
                lastName: document.getElementById('profile-last-name').value.trim(),
                email: document.getElementById('profile-email').value.trim(),
                phone: document.getElementById('profile-phone').value.trim(),
                address: document.getElementById('profile-address').value.trim(),
                birthDay: document.getElementById('profile-birth-day').value,
                birthMonth: document.getElementById('profile-birth-month').value,
                birthYear: document.getElementById('profile-birth-year').value
            };

            if (this.profileManager.saveProfile(profileData)) {
                this.showNotification('✅ Profile updated successfully!', 'success');
            } else {
                this.showNotification('❌ Failed to update profile', 'error');
            }
        }

        handlePasswordSubmit(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value.trim();
            const newPassword = document.getElementById('new-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showNotification('⚠️ Please fill in all fields!', 'warning');
                return;
            }

            if (newPassword.length < 6) {
                this.showNotification('⚠️ Password must be at least 6 characters!', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showNotification('⚠️ Passwords do not match!', 'warning');
                return;
            }

            if (currentPassword === newPassword) {
                this.showNotification('⚠️ New password must be different!', 'warning');
                return;
            }

            const loggedUser = localStorage.getItem('loggedInUser');
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === loggedUser);

            if (userIndex !== -1 && users[userIndex].password === currentPassword) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                document.getElementById('changePasswordForm').reset();
                this.showNotification('✅ Password changed successfully!', 'success');
            } else {
                this.showNotification('❌ Current password is incorrect!', 'error');
            }
        }

        handleLogout() {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('rememberedUser');
                
                this.closeModal();
                
                const profileBtn = document.querySelector('.profile');
                if (profileBtn) {
                    profileBtn.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
                }
                
                this.showNotification('👋 Logged out successfully!', 'success');
                
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }

        showNotification(message, type = 'info') {
            const existing = document.querySelector('.profile-notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.className = `profile-notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => notification.classList.add('show'), 10);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // ========================= INITIALIZE =========================
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const loggedUser = localStorage.getItem('loggedInUser');
            const userRole = localStorage.getItem('userRole');

            if (loggedUser && userRole === 'user') {
                window.profileModal = new ProfileModalController();
                console.log('✅ Profile Manager initialized for:', loggedUser);
            } else {
                console.log('ℹ️ No user logged in');
            }
        }, 500);
    });

    window.ProfileManager = ProfileManager;
    window.ProfileModalController = ProfileModalController;

})();

// ========================= NOTIFICATION STYLES =========================
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.profile-notification {
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    z-index: 100000;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    backdrop-filter: blur(10px);
}

.profile-notification.show {
    opacity: 1;
    transform: translateX(0);
}

.profile-notification.success {
    background: rgba(76, 175, 80, 0.95);
    color: white;
    border-left: 4px solid #388E3C;
}

.profile-notification.error {
    background: rgba(244, 67, 54, 0.95);
    color: white;
    border-left: 4px solid #C62828;
}

.profile-notification.warning {
    background: rgba(255, 152, 0, 0.95);
    color: white;
    border-left: 4px solid #E65100;
}

.profile-notification.info {
    background: rgba(33, 150, 243, 0.95);
    color: white;
    border-left: 4px solid #1565C0;
}

@media (max-width: 768px) {
    .profile-notification {
        right: 10px;
        left: 10px;
        top: 80px;
    }
}
`;
document.head.appendChild(notificationStyles);