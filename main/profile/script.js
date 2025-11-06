console.log('Script loaded!');

// ========================= MOBILE MENU =========================
document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
});

// ========================= BIRTHDAY OPTIONS =========================
function populateBirthdayOptions() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    if (!daySelect || !monthSelect || !yearSelect) {
        console.log('Birthday selects not found');
        return;
    }

    // Populate Days
    if (daySelect.options.length <= 1) {
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
        console.log('Days populated');
    }

    // Populate Months
    if (monthSelect.options.length <= 1) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        for (let i = 0; i < monthNames.length; i++) {
            const option = document.createElement('option');
            option.value = i + 1;
            option.textContent = monthNames[i];
            monthSelect.appendChild(option);
        }
        console.log('Months populated');
    }

    // Populate Years
    if (yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
        console.log('Years populated');
    }
}

// ========================= DOM LOADED =========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Populate birthday dropdowns
    populateBirthdayOptions();

    const mainForm = document.getElementById('addressForm');
    const navLinks = document.querySelectorAll('.account-sidebar ul li a');
    const accountSections = document.querySelectorAll('.account-section');

    console.log('Found nav links:', navLinks.length);
    console.log('Found sections:', accountSections.length);

    // ========================= LOAD SAVED DATA =========================
    const savedData = JSON.parse(localStorage.getItem('profileData'));
    if (savedData) {
        console.log('Loading saved data');
        if (document.getElementById('last-name')) document.getElementById('last-name').value = savedData.lastName || '';
        if (document.getElementById('first-name')) document.getElementById('first-name').value = savedData.firstName || '';
        if (document.getElementById('email')) document.getElementById('email').value = savedData.email || '';
        if (document.getElementById('phone')) document.getElementById('phone').value = savedData.phone || '';
        if (document.getElementById('birth-day')) document.getElementById('birth-day').value = savedData.birthDay || '';
        if (document.getElementById('birth-month')) document.getElementById('birth-month').value = savedData.birthMonth || '';
        if (document.getElementById('birth-year')) document.getElementById('birth-year').value = savedData.birthYear || '';
        if (document.getElementById('address')) document.getElementById('address').value = savedData.address || '';
    }

    // ========================= PROFILE FORM SUBMIT =========================
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');

            const formData = {
                lastName: document.getElementById('last-name').value,
                firstName: document.getElementById('first-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                birthDay: document.getElementById('birth-day').value,
                birthMonth: document.getElementById('birth-month').value,
                birthYear: document.getElementById('birth-year').value,
                address: document.getElementById('address').value
            };

            console.log('Saving data:', formData);
            localStorage.setItem('profileData', JSON.stringify(formData));
            alert('✓ Profile updated successfully!');
        });
    }

    // ========================= TAB SWITCHING =========================
    function switchSection(targetSectionName) {
        console.log('Switching to:', targetSectionName);
        
        accountSections.forEach(section => {
            section.classList.remove('active');
        });
        
        navLinks.forEach(nav => nav.classList.remove('active'));
        
        const targetSection = document.querySelector(`.account-section[data-section-name="${targetSectionName}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section activated:', targetSectionName);
        } else {
            console.log('Section not found:', targetSectionName);
        }
        
        const targetLink = document.querySelector(`.account-sidebar ul li a[data-section="${targetSectionName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const sectionTarget = this.getAttribute('data-section');
            
            if (sectionTarget === null || sectionTarget === 'logout') {
                return;
            }
            
            e.preventDefault();
            switchSection(sectionTarget);
        });
    });

    const initialSection = document.querySelector('.account-section.active');
    if (!initialSection) {
        switchSection('Profile');
    }

    // ========================= CHANGE PASSWORD =========================
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value.trim();
            const newPassword = document.getElementById('new-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('⚠ Please fill in all fields!');
                return;
            }

            if (newPassword.length < 8) {
                alert('⚠ New password must be at least 8 characters long!');
                return;
            }

            if (!/[A-Z]/.test(newPassword)) {
                alert('⚠ Password must contain at least one uppercase letter!');
                return;
            }

            if (!/[a-z]/.test(newPassword)) {
                alert('⚠ Password must contain at least one lowercase letter!');
                return;
            }

            if (!/\d/.test(newPassword)) {
                alert('⚠ Password must contain at least one number!');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('⚠ New password and confirmation do not match!');
                return;
            }

            if (currentPassword === newPassword) {
                alert('⚠ New password must be different from current password!');
                return;
            }

            console.log('Password changed successfully');
            alert('✓ Password changed successfully!');
            changePasswordForm.reset();
        });
    }
});
