// Profile Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile modal if user is logged in
    const loggedUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');
    
    if (loggedUser && userRole === 'user') {
        initializeProfileModal();
}

function initializeProfileModal() {
    const profileModalOverlay = document.getElementById('profileModalOverlay');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileSections = document.querySelectorAll('.profile-section');
    const sidebarLinks = document.querySelectorAll('.profile-sidebar a[data-section]');
    const profileUsername = document.getElementById('profileUsername');
    const profileLogout = document.getElementById('profileLogout');
    const profileInfoForm = document.getElementById('profileInfoForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    // Initialize profile data
    const profileData = JSON.parse(localStorage.getItem('userProfileData') || '{}');

    // Populate profile username
    if (profileUsername) {
        profileUsername.textContent = localStorage.getItem('loggedInUser') || 'User';
    }

    // Close modal functionality
    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Click outside to close
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) {
                profileModalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Section switching
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.currentTarget.getAttribute('data-section');
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            profileSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link and corresponding section
            e.currentTarget.classList.add('active');
            document.querySelector(`.profile-section[data-section-name="${targetSection}"]`)
                .classList.add('active');
        });
    });

    // Handle logout
    if (profileLogout) {
        profileLogout.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear user data
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberedUser');
            
            // Close modal and reload page
            profileModalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Update profile button
            const profileBtn = document.querySelector('.profile');
            if (profileBtn) {
                profileBtn.innerHTML = '<i class="fa-solid fa-circle-user"></i>';
            }
            
            // Show success message and reload
            alert('✅ Logged out successfully!');
            location.reload();
        });
    }

    // Populate birthday selectors
    function populateBirthdaySelectors() {
        const daySelect = document.getElementById('profile-birth-day');
        const monthSelect = document.getElementById('profile-birth-month');
        const yearSelect = document.getElementById('profile-birth-year');

        if (!daySelect || !monthSelect || !yearSelect) return;

        // Days
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }

        // Months
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            monthSelect.appendChild(option);
        });

        // Years
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }

    // Load profile data into form
    function loadProfileData() {
        const fields = [
            'profile-last-name',
            'profile-first-name',
            'profile-email',
            'profile-phone',
            'profile-address',
            'profile-birth-day',
            'profile-birth-month',
            'profile-birth-year'
        ];

        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && profileData[fieldId]) {
                element.value = profileData[fieldId];
            }
        });
    }

    // Handle profile form submit
    if (profileInfoForm) {
        profileInfoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                'profile-last-name': document.getElementById('profile-last-name').value,
                'profile-first-name': document.getElementById('profile-first-name').value,
                'profile-email': document.getElementById('profile-email').value,
                'profile-phone': document.getElementById('profile-phone').value,
                'profile-address': document.getElementById('profile-address').value,
                'profile-birth-day': document.getElementById('profile-birth-day').value,
                'profile-birth-month': document.getElementById('profile-birth-month').value,
                'profile-birth-year': document.getElementById('profile-birth-year').value
            };

            // Save to localStorage
            localStorage.setItem('userProfileData', JSON.stringify(formData));
            
            // Show success message
            alert('✅ Profile updated successfully!');
        });
    }

    // Handle password change
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Get current user data
            const username = localStorage.getItem('loggedInUser');
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.username === username);

            if (userIndex === -1) {
                alert('❌ User not found!');
                return;
            }

            // Verify current password
            if (users[userIndex].password !== currentPassword) {
                alert('❌ Current password is incorrect!');
                return;
            }

            // Verify new password match
            if (newPassword !== confirmPassword) {
                alert('❌ New passwords do not match!');
                return;
            }

            // Update password
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Clear form
            changePasswordForm.reset();
            
            // Show success message
            alert('✅ Password changed successfully!');
        });
    }

    // Initialize
    populateBirthdaySelectors();
    loadProfileData();

    // Add click event to profile button
    const profileBtn = document.querySelector('.profile');
    if (profileBtn) {
        const existingClickHandler = profileBtn.onclick;
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Only handle if user is logged in
            const loggedUser = localStorage.getItem('loggedInUser');
            const userRole = localStorage.getItem('userRole');
            
            if (loggedUser && userRole === 'user' && profileModalOverlay) {
                profileModalOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    }
});