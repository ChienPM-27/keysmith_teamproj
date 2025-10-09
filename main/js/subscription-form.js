// ------------------- SUBSCRIPTION FORM HANDLER -------------------

// Hàm khởi tạo form subscription
function initSubscriptionForm() {
    const form = document.getElementById('subscriptionForm');
    
    if (!form) {
        console.warn('Subscription form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('formMessage');
        const emailInput = form.querySelector('input[name="user_email"]');
        const userEmail = emailInput.value.trim();
        
        // Validate email
        if (!validateEmail(userEmail)) {
            showMessage(messageDiv, 'error', '✗ Please enter a valid email address.');
            return;
        }
        
        // Disable button và input khi đang gửi
        submitButton.disabled = true;
        emailInput.disabled = true;
        submitButton.textContent = 'SENDING...';
        
        // Tạo FormData với format khớp với Google Apps Script
        const formData = new FormData();
        formData.append('access_key', '3610378c-53cc-4af5-bbbc-fff27cda52f3');
        formData.append('subject', 'New Subscription from KeySmith');
        formData.append('from_name', 'KeySmith Website');
        
        // Format message để match với pattern /Email:\s*([^\s]+)/ trong script
        const currentDate = new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh'
        });
        
        formData.append('message', 
            `=== NEW SUBSCRIPTION ===\n` +
            `Email: ${userEmail}\n` +
            `Date: ${currentDate}\n` +
            `Source: Homepage Footer\n` +
            `========================`
        );
        
        // Honeypot chống spam
        formData.append('botcheck', '');
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Thành công
                showMessage(messageDiv, 'success', '✓ Thank you for subscribing! Check your email for confirmation.');
                form.reset();
                
                // Log để debug
                console.log('Subscription successful:', {
                    email: userEmail,
                    timestamp: new Date().toISOString()
                });
                
            } else {
                // Thất bại
                showMessage(messageDiv, 'error', '✗ Something went wrong. Please try again.');
                console.error('Subscription failed:', data);
            }
            
        } catch (error) {
            // Lỗi kết nối
            console.error('Subscription error:', error);
            showMessage(messageDiv, 'error', '✗ Network error. Please check your connection.');
        } finally {
            // Enable lại button và input
            submitButton.disabled = false;
            emailInput.disabled = false;
            submitButton.textContent = 'SIGN UP';
        }
    });
}

// Hàm hiển thị thông báo
function showMessage(element, type, message) {
    if (!element) return;
    
    element.style.display = 'block';
    element.textContent = message;
    
    // Style theo loại thông báo
    if (type === 'success') {
        element.style.background = '#4CAF50';
        element.style.color = 'white';
        element.style.border = '1px solid #45a049';
    } else if (type === 'error') {
        element.style.background = '#f44336';
        element.style.color = 'white';
        element.style.border = '1px solid #da190b';
    }
    
    element.style.padding = '12px';
    element.style.marginTop = '10px';
    element.style.fontSize = '14px';
    element.style.borderRadius = '4px';
    element.style.textAlign = 'center';
    element.style.fontFamily = "'Bebas Neue', sans-serif";
    element.style.letterSpacing = '1px';
    
    // Ẩn thông báo sau 5 giây
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Validation email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Khởi chạy khi DOM đã load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubscriptionForm);
} else {
    initSubscriptionForm();
}