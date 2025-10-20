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
