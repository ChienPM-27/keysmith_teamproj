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

    if (!daySelect || !monthSelect || !yearSelect) return;

    // Populate days (1-31)
    if (daySelect.options.length <= 1) { 
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    
    // Populate months
    if (monthSelect.options.length <= 1) { 
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = monthNames[i - 1];
            monthSelect.appendChild(option);
        }   
    }

    // Populate years (1900 - current)
    if (yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1900; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }
}

// ========================= DOM LOADED =========================
document.addEventListener('DOMContentLoaded', function() {
    populateBirthdayOptions();
    
    const mainForm = document.getElementById('addressForm');
    const navLinks = document.querySelectorAll('.account-sidebar ul li a'); 
    const accountSections = document.querySelectorAll('.account-section');

    // ========================= LOAD SAVED DATA =========================
    const savedData = JSON.parse(localStorage.getItem('profileData'));
    if (savedData) {
        document.getElementById('last-name').value = savedData.lastName || '';
        document.getElementById('first-name').value = savedData.firstName || '';
        document.getElementById('email').value = savedData.email || ''; 
        document.getElementById('phone').value = savedData.phone || '';
        
        document.getElementById('birth-day').value = savedData.birthDay || '';
        document.getElementById('birth-month').value = savedData.birthMonth || '';
        document.getElementById('birth-year').value = savedData.birthYear || '';
        
        document.getElementById('gender').value = savedData.gender || 'male'; 
    }
    
    // ========================= PROFILE FORM SUBMIT =========================
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const formData = {
                lastName: document.getElementById('last-name').value,
                firstName: document.getElementById('first-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                birthDay: document.getElementById('birth-day').value,
                birthMonth: document.getElementById('birth-month').value,
                birthYear: document.getElementById('birth-year').value,
                gender: document.getElementById('gender').value
            };
    
            localStorage.setItem('profileData', JSON.stringify(formData));
            alert('Profile updated successfully!');
        });
    }

    // ========================= TAB SWITCHING =========================
    function switchSection(targetSectionName) {
        accountSections.forEach(section => section.classList.remove('active'));
        navLinks.forEach(nav => nav.classList.remove('active'));
        
        const targetSection = document.querySelector(`.account-section[data-section-name="${targetSectionName}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            const targetLink = document.querySelector(`.account-sidebar ul li a[data-section="${targetSectionName}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
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

    // Initialize Profile section
    const initialSection = document.querySelector('.account-section.active');
    if (!initialSection) {
        switchSection('Profile');
    }

    // ========================= ADDRESS MODAL =========================
    const addressModal = document.getElementById('addressModal');
    const openAddressModalBtn = document.getElementById('openAddressModalBtn');
    const closeAddressModalBtn = document.getElementById('closeAddressModal');
    const cancelAddressBtn = document.getElementById('cancelAddressBtn');
    const saveAddressBtn = document.getElementById('saveAddressBtn');
    const newAddressForm = document.getElementById('newAddressForm');

    // Open modal
    if (openAddressModalBtn) {
        openAddressModalBtn.addEventListener('click', () => {
            addressModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal function
    function closeAddressModal() {
        addressModal.classList.remove('active');
        document.body.style.overflow = '';
        if (newAddressForm) {
            newAddressForm.reset();
            // Clear validation states
            const inputs = newAddressForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('invalid');
            });
            clearErrors();
        }
    }

    // Close modal - X button
    if (closeAddressModalBtn) {
        closeAddressModalBtn.addEventListener('click', closeAddressModal);
    }

    // Close modal - Cancel button
    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', closeAddressModal);
    }

    // Close modal - Click outside
    addressModal.addEventListener('click', (e) => {
        if (e.target === addressModal) {
            closeAddressModal();
        }
    });

    // Close modal - ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addressModal.classList.contains('active')) {
            closeAddressModal();
        }
    });

    // ========================= VALIDATION FUNCTIONS =========================
    function showError(input, message) {
        const errorMsg = input.parentElement.querySelector(".error-message");
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = "block";
        }
        input.classList.add('invalid');
    }

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(e => {
            e.textContent = "";
            e.style.display = "none";
        });
        document.querySelectorAll("input, select").forEach(input => {
            input.classList.remove('invalid');
        });
    }

    // ========================= SAVE ADDRESS =========================
    if (saveAddressBtn) {
        saveAddressBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearErrors();
            
            const fullname = document.getElementById('modal-fullname');
            const phone = document.getElementById('modal-phone');
            const address = document.getElementById('modal-address');
            const country = document.getElementById('modal-country');
            const company = document.getElementById('modal-company');
            const isDefault = document.getElementById('modal-default-address');
            
            let valid = true;

            // Validate required fields
            if (!fullname.value.trim()) {
                showError(fullname, "Full name is required!");
                valid = false;
            }
            
            if (!phone.value.trim()) {
                showError(phone, "Phone number is required!");
                valid = false;
            } else if (!/^[\d\s\-\+\(\)]+$/.test(phone.value.trim())) {
                showError(phone, "Invalid phone number format!");
                valid = false;
            }
            
            if (!address.value.trim()) {
                showError(address, "Address cannot be empty!");
                valid = false;
            }

            if (!valid) return;

            // Create address object
            const newAddress = {
                fullname: fullname.value.trim(),
                phone: phone.value.trim(),
                company: company.value.trim(),
                address: address.value.trim(),
                country: country.value,
                isDefault: isDefault.checked
            };
            
            console.log('New address:', newAddress);
            
            // TODO: Send to server or save to localStorage
            
            alert('Address added successfully!');
            closeAddressModal();
        });
    }

    // ========================= CHANGE PASSWORD =========================
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value.trim();
            const newPassword = document.getElementById('new-password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();
            
            // Validate empty fields
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all fields!');
                return;
            }
            
            // Validate password length
            if (newPassword.length < 8) {
                alert('New password must be at least 8 characters long!');
                return;
            }
            
            // Validate password strength
            if (!/[A-Z]/.test(newPassword)) {
                alert('Password must contain at least one uppercase letter!');
                return;
            }
            
            if (!/[a-z]/.test(newPassword)) {
                alert('Password must contain at least one lowercase letter!');
                return;
            }
            
            if (!/\d/.test(newPassword)) {
                alert('Password must contain at least one number!');
                return;
            }
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                alert('New password and confirmation do not match!');
                return;
            }
            
            // Check if new password is different from current
            if (currentPassword === newPassword) {
                alert('New password must be different from current password!');
                return;
            }
            
            // TODO: Send to server
            console.log('Change password:', {
                currentPassword,
                newPassword
            });
            
            alert('Password changed successfully!');
            changePasswordForm.reset();
        });
    }

    // ========================= LOGOUT =========================
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault(); 
            const confirmLogout = confirm('Are you sure you want to log out?');
            if (confirmLogout) {
                localStorage.removeItem('profileData');
                window.location.href = 'index.html'; 
            }
        });
    }
});