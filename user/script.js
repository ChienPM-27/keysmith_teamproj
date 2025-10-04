// ------------------- HEADER HIDE/SHOW -------------------
let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScroll && currentScroll > 50) {
        // cuộn xuống → ẩn header
        header.style.top = "-100px"; // điều chỉnh theo chiều cao header
    } else {
        // cuộn lên → hiện header
        header.style.top = "0";
    }

    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});

