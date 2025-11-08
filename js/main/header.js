let lastScroll = 0;
const header = document.getElementById('header');
const button = document.querySelector(".profile");
const login = document.querySelector(".login");

// ====== ẨN/HIỆN HEADER KHI CUỘN ======
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

// ====== MỞ LOGIN MODAL ======
if (button && login) {
    button.addEventListener("click", () => {
        login.style.display = "flex";
    });
}

// ====== ĐỔI STYLE HEADER KHI Ở TRANG CONTACT ======
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("contact")) {
        header.classList.add("contact-mode");
    } else {
        header.classList.remove("contact-mode");
    }
});
