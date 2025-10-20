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