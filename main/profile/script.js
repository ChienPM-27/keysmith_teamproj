document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    var navbar = document.getElementById('navbar');
    navbar.classList.toggle('active');
});

function populateBirthdayOptions() {
    const daySelect = document.getElementById('birth-day');
    const monthSelect = document.getElementById('birth-month');
    const yearSelect = document.getElementById('birth-year');

    if (!daySelect || !monthSelect || !yearSelect) return;

    // tao option cho ngày (1-31)
    if (daySelect.options.length > 1) return;

    if(daySelect.option.length <= 1){
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    // tao option cho tháng (1-12)
    if(monthSelect.option.length <= 1){
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = monthNames[i - 1];
            monthSelect.appendChild(option);
        }   
    }
    // tao option cho năm (1900 - hiện tại)
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

// goi ham khi trang duoc tai
document.addEventListener('DOMContentLoaded', function() {
    populateBirthdayOptions();
}); 

const mainForm = document.getElementById('addressForm');

const savedData = JSON.parse(localStorage.getItem('profileData'));
    if (savedData) {
        // Tải các trường cơ bản
        document.getElementById('last-name').value = savedData.lastName || '';
        document.getElementById('first-name').value = savedData.firstName || '';
        document.getElementById('email').value = savedData.email || ''; 
        document.getElementById('phone').value = savedData.phone || '';
        
        // Tải dữ liệu Ngày sinh (sử dụng 3 trường)
        document.getElementById('birth-day').value = savedData.birthDay || '';
        document.getElementById('birth-month').value = savedData.birthMonth || '';
        document.getElementById('birth-year').value = savedData.birthYear || '';
        
        document.getElementById('gender').value = savedData.gender || 'male'; 
    }
    
    // 3. Xử lý sự kiện Submit (nút Update)
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault(); // NGĂN CHẶN FORM TẢI LẠI TRANG
    
            // Lấy dữ liệu ngày sinh
            const birthDay = document.getElementById('birth-day').value;
            const birthMonth = document.getElementById('birth-month').value;
            const birthYear = document.getElementById('birth-year').value;

            const formData = {
                lastName: document.getElementById('last-name').value,
                firstName: document.getElementById('first-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                
                // LƯU DỮ LIỆU NGÀY SINH (sử dụng 3 trường)
                birthDay: birthDay,
                birthMonth: birthMonth,
                birthYear: birthYear,

                gender: document.getElementById('gender').value
            };
    
            localStorage.setItem('profileData', JSON.stringify(formData));
    
            alert('Profile updated successfully!');
        });
    }