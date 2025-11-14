/*
 * KeySmith - Profile Module (wrapped)
 * Version: 1.0.1
 * Description: User profile management functionality — safe to load before/after app.js.
 */

(function () {
  // Safe DOM getter: prefer KeySmith.utils.getById if available
  function $get(id) {
    try {
      if (window.KeySmith && KeySmith.utils && typeof KeySmith.utils.getById === 'function') {
        return KeySmith.utils.getById(id);
      }
    } catch (e) {
      // ignore
    }
    return document.getElementById(id);
  }

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

        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        const customer = customers.find(c => (c && c.username) === loggedUser);

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
      const daySelect = $get('profile-birth-day');
      if (daySelect && daySelect.options.length === 1) {
        for (let i = 1; i <= 31; i++) {
          const option = document.createElement('option');
          option.value = i;
          option.textContent = i < 10 ? '0' + i : i;
          daySelect.appendChild(option);
        }
      }

      const monthSelect = $get('profile-birth-month');
      if (monthSelect && monthSelect.options.length === 1) {
        const months = [
          'January','February','March','April','May','June',
          'July','August','September','October','November','December'
        ];
        months.forEach((month, index) => {
          const option = document.createElement('option');
          option.value = index + 1;
          option.textContent = month;
          monthSelect.appendChild(option);
        });
      }

      const yearSelect = $get('profile-birth-year');
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

        const customer = customers.find(c => {
          if (!c) return false;
          const uname = (c.username || '').toString().trim().toLowerCase();
          const email = (c.email || '').toString().trim().toLowerCase();
          return uname === curLower || email === curLower;
        });

        if (!customer) {
          console.error('❌ Customer not found:', this.currentUser);
          console.log('Available usernames:', customers.map(c => c && c.username));
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
        const cur = (this.currentUser || '').toString().trim().toLowerCase();
        const index = customers.findIndex(c => {
          if (!c) return false;
          return ((c.username || '').toString().trim().toLowerCase() === cur) ||
                 ((c.email || '').toString().trim().toLowerCase() === cur);
        });

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

      const profileUsername = $get('profileUsername');
      if (profileUsername) {
        profileUsername.textContent = customer.username || 'User';
        console.log('✅ Set username display:', customer.username);
      }

      const fields = [
        { id: 'profile-first-name', key: 'firstName' },
        { id: 'profile-last-name', key: 'lastName' },
        { id: 'profile-email', key: 'email' },
        { id: 'profile-phone', key: 'phone' },
        { id: 'profile-address', key: 'address' }
      ];

      fields.forEach(field => {
        const element = $get(field.id);
        if (element) {
          const value = customer[field.key] || '';
          element.value = value;
          console.log(`✅ Set ${field.id} = "${value}"`);
        } else {
          console.warn(`⚠️ Field not found: ${field.id}`);
        }
      });

      if (customer.dateOfBirth) {
        try {
          const date = new Date(customer.dateOfBirth);
          const day = $get('profile-birth-day');
          const month = $get('profile-birth-month');
          const year = $get('profile-birth-year');

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

      const profileModal = $get('profileModalOverlay');
      if (!profileModal) {
        console.error('❌ Profile modal not found in DOM');
        return;
      }

      const closeBtn = $get('closeProfileModal');
      if (closeBtn) {
        closeBtn.onclick = () => {
          profileModal.style.display = 'none';
          document.body.style.overflow = 'auto';
          console.log('🚪 Profile modal closed');
        };
      }

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

      const logoutBtn = $get('profileLogout');
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

      this.initProfileForms();

      console.log('✅ Profile modal initialized');
    },

    initProfileForms: function() {
      const profileForm = $get('profileInfoForm');
      if (profileForm) {
        profileForm.onsubmit = (e) => this.handleProfileUpdate(e);
        console.log('✅ Profile form handler attached');
      }

      const passwordForm = $get('changePasswordForm');
      if (passwordForm) {
        passwordForm.onsubmit = (e) => this.handlePasswordChange(e);
        console.log('✅ Password form handler attached');
      }
    },

    handleProfileUpdate: function(e) {
      e.preventDefault();

      try {
        const firstName = ($get('profile-first-name') || {}).value.trim();
        const lastName = ($get('profile-last-name') || {}).value.trim();
        const email = ($get('profile-email') || {}).value.trim();
        const phone = ($get('profile-phone') || {}).value.trim();
        const address = ($get('profile-address') || {}).value.trim();
        const day = ($get('profile-birth-day') || {}).value;
        const month = ($get('profile-birth-month') || {}).value;
        const year = ($get('profile-birth-year') || {}).value;

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
          const d = new Date(year, month - 1, day);
          if (!isNaN(d.getTime())) {
            dateOfBirth = d.toISOString().slice(0,10);
          }
        }

        const detail = this.getCustomerDetail();
        if (!detail) {
          this.showNotification('Error loading customer data', 'error');
          return;
        }

        const updatedCustomer = {
          ...detail,
          firstName,
          lastName,
          email,
          phone,
          address,
          dateOfBirth
        };

        if (this.setCustomerDetail(updatedCustomer)) {
          this.showNotification('✅ Profile updated successfully!', 'success');
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
        const currentPass = ($get('current-password') || {}).value || '';
        const newPass = ($get('new-password') || {}).value || '';
        const confirmPass = ($get('confirm-password') || {}).value || '';

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

        customers[index] = {
          ...user,
          password: newPass,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem('customers', JSON.stringify(customers));
        this.currentCustomerDetail = customers[index];

        this.showNotification('✅ Password changed successfully!', 'success');
        const form = $get('changePasswordForm');
        if (form) form.reset();
      } catch (error) {
        console.error('Error changing password:', error);
        this.showNotification('Error changing password', 'error');
      }
    },

    showProfileModal: function() {
      const profileModal = $get('profileModalOverlay');
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
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#ff9800'};
        color: white; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000; font-size: 16px; opacity: 0; transition: opacity 0.3s;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.style.opacity = '1', 10);
      setTimeout(() => { notification.style.opacity = '0'; setTimeout(() => notification.remove(), 300); }, 3000);
    },

    isValidEmail: function(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone: function(phone) {
      return /^[0-9+\-\s()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
    }
  };

  // Export for CommonJS if present
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileModule;
  }

  // Expose globally
  window.ProfileModule = window.ProfileModule || ProfileModule;

  // Safe attach to KeySmith.profile when KeySmith becomes available
  function attachToKeySmith() {
    try {
      if (!window.KeySmith) return false;
      if (!window.KeySmith.profile) {
        window.KeySmith.profile = ProfileModule;
        console.log('🔗 ProfileModule attached to KeySmith.profile');
      } else {
        // do not overwrite existing profile implementation
        console.log('ℹ️ KeySmith.profile already exists — ProfileModule exposed as window.ProfileModule');
      }
      return true;
    } catch (e) {
      console.warn('Could not attach ProfileModule to KeySmith', e);
      return false;
    }
  }

  // Try immediate attach, otherwise poll for a short time
  if (!attachToKeySmith()) {
    const maxWait = 5000;
    const interval = 50;
    let elapsed = 0;
    const t = setInterval(() => {
      if (attachToKeySmith()) {
        clearInterval(t);
      } else {
        elapsed += interval;
        if (elapsed >= maxWait) {
          clearInterval(t);
          console.warn('⌛ Timeout waiting for KeySmith — ProfileModule still available as window.ProfileModule');
        }
      }
    }, interval);
  }

})();
