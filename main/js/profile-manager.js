// ==================== PROFILE MANAGER ====================
// File: main/js/profile-manager.js

(function() {
    'use strict';

    // ========================= PROFILE DATA MANAGER =========================
    class ProfileManager {
        constructor() {
            this.storageKey = 'userProfileData';
            this.initializeProfile();
        }

        // Initialize profile data structure
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

        // Get profile data
        getProfile() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Error loading profile:', error);
                return null;
            }
        }

        // Save profile data
        saveProfile(profileData) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(profileData));
                return true;
            } catch (error) {
                console.error('Error saving profile:', error);
                return false;
            }
        }

        // Update specific field
        updateField(fieldName, value) {
            const profile = this.getProfile();
            if (profile) {
                profile[fieldName] = value;
                return this.saveProfile(profile);
            }
            return false;
        }

        // Clear profile data
        clearProfile() {
            localStorage.removeItem(this.storageKey);
            this.initializeProfile();
        }
    }

    // ========================= PROFILE MODAL CONTROLLER =========================
    class ProfileModalController {
        constructor() {
            this.profileManager = new ProfileManager();
            this.modal = null;
            this.currentSection = 'profile-info';
            this.init();
        }

        init() {
            this.createModal();
            this.attachEventListeners();
            this.populateBirthdayOptions();
        }

        // Create profile modal HTML
        createModal() {
            const modalHTML = `
                <div class="profile-modal-overlay" id="profileModalOverlay">
                    <div class="profile-modal">
                        <div class="close-profile-modal" id="closeProfileModal">
                            <i class="fa-solid fa-xmark"></i>
                        </div>

                        <div class="profile-container">
                            <!-- SIDEBAR -->
                            <div class="profile-sidebar">
                                <div class="sidebar-header">
                                    <div class="sidebar-avatar">
                                        <i class="fa-solid fa-user-circle"></i>
                                    </div>
                                    <p class="sidebar-username" id="profileUsername">User</p>
                                </div>
                                
                                <ul>
                                    <li><a href="#" class="active" data-section="profile-info">
                                        <i class="fa-solid fa-user"></i>
                                        <span>Account Settings</span>
                                    </a></li>
                                    <li><a href="#" data-section="profile-orders">
                                        <i class="fa-solid fa-box"></i>
                                        <span>My Orders</span>
                                    </a></li>
                                    <li><a href="#" data-section="profile-password">
                                        <i class="fa-solid fa-lock"></i>
                                        <span>Change Password</span>
                                    </a></li>
                                    <li><a href="#" id="profileLogout">
                                        <i class="fa-solid fa-right-from-bracket"></i>
                                        <span>Log out</span>
                                    </a></li>
                                </ul>
                            </div>

                            <!-- CONTENT -->
                            <div class="profile-content">
                                <!-- ACCOUNT INFO SECTION -->
                                <div class="profile-section active" data-section-name="profile-info">
                                    <h2>ACCOUNT INFORMATION</h2>
                                    <form id="profileInfoForm">
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Last Name</label>
                                                <input type="text" id="profile-last-name" placeholder="Enter last name">
                                            </div>
                                            <div class="form-group">
                                                <label>First Name</label>
                                                <input type="text" id="profile-first-name" placeholder="Enter first name">
                                            </div>
                                        </div>

                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Email</label>
                                                <input type="email" id="profile-email" placeholder="Enter email">
                                            </div>
                                            <div class="form-group">
                                                <label>Phone Number</label>
                                                <input type="tel" id="profile-phone" placeholder="Enter phone number">
                                            </div>
                                        </div>

                                        <div class="form-group">
                                            <label>Address</label>
                                            <input type="text" id="profile-address" placeholder="Enter address">
                                        </div>

                                        <div class="form-group">
                                            <label>Date of Birth</label>
                                            <div class="birthday-selectors">
                                                <select id="profile-birth-day"><option value="">Day</option></select>
                                                <select id="profile-birth-month"><option value="">Month</option></select>
                                                <select id="profile-birth-year"><option value="">Year</option></select>
                                            </div>
                                        </div>

                                        <button type="submit" class="profile-btn">Update Profile</button>
                                    </form>
                                </div>

                                <!-- ORDERS SECTION -->
                                <div class="profile-section" data-section-name="profile-orders">
                                    <h2>YOUR ORDERS</h2>
                                    <div class="order-table">
                                        <div class="order-header-row">
                                            <div class="order-col">Order ID</div>
                                            <div class="order-col">Date</div>
                                            <div class="order-col">Address</div>
                                            <div class="order-col">Value</div>
                                            <div class="order-col">Status</div>
                                        </div>
                                        <div class="order-empty-row">
                                            <p>You have no orders yet.</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- PASSWORD SECTION -->
                                <div class="profile-section" data-section-name="profile-password">
                                    <h2>CHANGE PASSWORD</h2>
                                    <div class="password-form">
                                        <form id="changePasswordForm">
                                            <div class="form-group">
                                                <label>Current Password</label>
                                                <input type="password" id="current-password" placeholder="Enter current password" required>
                                            </div>
                                            <div class="form-group">
                                                <label>New Password</label>
                                                <input type="password" id="new-password" placeholder="Enter new password" required>
                                            </div>
                                            <div class="form-group">
                                                <label>Confirm New Password</label>
                                                <input type="password" id="confirm-password" placeholder="Re-enter new password" required>
                                            </div>
                                            <button type="submit" class="profile-btn">Change Password</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.modal = document.getElementById('profileModalOverlay');
        }

        // Populate birthday dropdown options
        populateBirthdayOptions() {
            const daySelect = document.getElementById('profile-birth-day');
            const monthSelect = document.getElementById('profile-birth-month');
            const yearSelect = document.getElementById('profile-birth-year');

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
            // Open profile modal - Use setTimeout to ensure this runs after login.js
            setTimeout(() => {
                const profileBtn = document.querySelector('.profile');
                if (profileBtn) {
                    // Remove all existing click listeners
                    const newProfileBtn = profileBtn.cloneNode(true);
                    profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
                    
                    // Add new click listener
                    newProfileBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const loggedUser = localStorage.getItem('loggedInUser');
                        const userRole = localStorage.getItem('userRole');
                        
                        if (loggedUser && userRole === 'user') {
                            this.openModal();
                        }
                    });
                }
            }, 100);

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
            const sectionLinks = document.querySelectorAll('.profile-sidebar ul li a');
            sectionLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const section = e.currentTarget.getAttribute('data-section');
                    if (section) {
                        e.preventDefault();
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
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });
        }

        // Open modal
        openModal() {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.loadProfileData();
            this.updateUsername();
        }

        // Close modal
        closeModal() {
            this.modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Switch between sections
        switchSection(sectionName) {
            // Remove active from all sections and links
            document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.profile-sidebar ul li a').forEach(l => l.classList.remove('active'));

            // Add active to target section and link
            const targetSection = document.querySelector(`[data-section-name="${sectionName}"]`);
            const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
            
            if (targetSection) targetSection.classList.add('active');
            if (targetLink) targetLink.classList.add('active');
        }

        // Load profile data into form
        loadProfileData() {
            const profile = this.profileManager.getProfile();
            if (profile) {
                document.getElementById('profile-last-name').value = profile.lastName || '';
                document.getElementById('profile-first-name').value = profile.firstName || '';
                document.getElementById('profile-email').value = profile.email || '';
                document.getElementById('profile-phone').value = profile.phone || '';
                document.getElementById('profile-address').value = profile.address || '';
                document.getElementById('profile-birth-day').value = profile.birthDay || '';
                document.getElementById('profile-birth-month').value = profile.birthMonth || '';
                document.getElementById('profile-birth-year').value = profile.birthYear || '';
            }
        }

        // Update username display
        updateUsername() {
            const loggedUser = localStorage.getItem('loggedInUser');
            const usernameDisplay = document.getElementById('profileUsername');
            if (usernameDisplay && loggedUser) {
                usernameDisplay.textContent = loggedUser;
            }
        }

        // Handle profile form submit
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
                this.showNotification('✓ Profile updated successfully!', 'success');
            } else {
                this.showNotification('✗ Failed to update profile', 'error');
            }
        }

        // Handle password change
        handlePasswordSubmit(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value.trim();
            const newPassword = document.getElementById('new-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showNotification('⚠ Please fill in all fields!', 'warning');
                return;
            }

            if (newPassword.length < 8) {
                this.showNotification('⚠ Password must be at least 8 characters!', 'warning');
                return;
            }

            if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
                this.showNotification('⚠ Password must contain uppercase, lowercase, and numbers!', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showNotification('⚠ Passwords do not match!', 'warning');
                return;
            }

            if (currentPassword === newPassword) {
                this.showNotification('⚠ New password must be different!', 'warning');
                return;
            }

            // Get current user
            const loggedUser = localStorage.getItem('loggedInUser');
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === loggedUser);

            if (userIndex !== -1 && users[userIndex].password === currentPassword) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                document.getElementById('changePasswordForm').reset();
                this.showNotification('✓ Password changed successfully!', 'success');
            } else {
                this.showNotification('✗ Current password is incorrect!', 'error');
            }
        }

        // Handle logout
        handleLogout() {
            if (confirm('Do you want to log out?')) {
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                this.closeModal();
                this.showNotification('👋 Logged out successfully!', 'success');
                
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }

        // Show notification
        showNotification(message, type = 'info') {
            // Remove existing notification
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
        // Only initialize if user is logged in
        const loggedUser = localStorage.getItem('loggedInUser');
        const userRole = localStorage.getItem('userRole');

        if (loggedUser && userRole === 'user') {
            window.profileModal = new ProfileModalController();
            console.log('✅ Profile Manager initialized');
        }
    });

    // Export for global access
    window.ProfileManager = ProfileManager;

})();