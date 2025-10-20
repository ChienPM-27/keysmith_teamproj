const profileBtn = document.querySelector('.profile');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');

// Mở modal khi click icon profile
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Đóng modal khi click nút X
if (closeModal) {
    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

// Đóng modal khi click bên ngoài
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Đóng modal khi nhấn ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Xử lý form submit
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Thêm logic xử lý login ở đây
        alert('Login successful!');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}