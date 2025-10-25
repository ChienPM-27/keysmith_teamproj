document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
});

function populateBirthdayOptions() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    // tao option cho ngày (1-31)
    if (daySelect.options.length > 1) return;

    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    // tao option cho tháng (1-12)
    if (monthSelect.options.length > 1) return;

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = monthNames[i - 1];
        monthSelect.appendChild(option);
    }   

    // tao option cho năm (1900 - hiện tại)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1900; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

populateBirthdayOptions();

// goi ham khi trang duoc tai
document.addEventListener('DOMContentLoaded', function() {
    populateBirthdayOptions();
}); 

document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        lastName: document.getElementById('last-name').value,
        firstName: document.getElementById('first-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthday: document.getElementById('birthday').value,
        gender: document.getElementById('gender').value
    };

    localStorage.setItem('profileData', JSON.stringify(formData));

    alert('Profile updated successfully!');
});

document.addEventListener('DOMContentLoaded', function() {
    const savedData = JSON.parse(localStorage.getItem('profileData'));
    if (savedData) {
        document.getElementById('last-name').value = savedData.lastName || '';
        document.getElementById('first-name').value = savedData.firstName || '';
        document.getElementById('email').value = savedData.email || '';
        document.getElementById('phone').value = savedData.phone || '';
        document.getElementById('birthday').value = savedData.birthday || '';
        document.getElementById('gender').value = savedData.gender || '';
    }   
});