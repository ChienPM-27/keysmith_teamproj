// ------------------- HEADER HIDE/SHOW -------------------
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScroll && currentScroll > 50) {
        // cuộn xuống → ẩn header
        header.style.top = "-100px";
    } else {
        // cuộn lên → hiện header
        header.style.top = "0";
    }

    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});

const button = document.querySelector(".profile");
const login = document.querySelector(".login");

button.addEventListener("click", () => {
    login.style.display = "flex";
});

// ------------------- CART CLICK HANDLER -------------------
const cartBtn = document.querySelector('.cart');
if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const loggedUser = localStorage.getItem('loggedInUser');
        if (!loggedUser) {
            // Mở modal login đúng chuẩn
            const modalOverlay = document.getElementById('modalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                modalOverlay.style.display = 'flex'; // Đảm bảo modal hiển thị
                document.body.style.overflow = 'hidden';
            }
        } else {
            // Đã đăng nhập -> chuyển sang store và mở cart
            window.location.href = './main/store/Store.html?cart=1';
        }
    });
}

// ------------------- MOBILE MENU TOGGLE -------------------
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

// Đóng menu khi click vào link
const navLinks = document.querySelectorAll('#navbar li a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    });
});

// Đóng menu khi click bên ngoài
document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('active')) {
        if (!nav.contains(e.target) && !bar.contains(e.target)) {
            nav.classList.remove('active');
        }
    }
});


