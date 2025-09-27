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

// ------------------- DRAG SCROLL KEYCAP -------------------
const keycap = document.querySelector(".keycap"); // chọn đúng class

let isDragStart = false, isDragging = false, prevPageX, prevScrollLeft, positionDiff;

const autoSlide = () => {
    // nếu không còn hình ảnh để scroll thì return ở đây
    if(keycap.scrollLeft == (keycap.scrollWidth - keycap.clientWidth)) return;
    positionDiff = Math.abs(positionDiff);
    let firstImgWidth = firstImg.clientWidth + 14;
    let valDifference = firstImgWidth - positionDiff;
    if(keycap.scrollLeft > prevScrollLeft) {
        // nếu user scroll về phía bên phải
        return keycap.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
    // nếu user đang scoll về phía bên trái
    keycap.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
}

const dragStart = (e) => {
    // updating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touched[0].pageX;
    prevScrollLeft = keycap.scrollLeft;
}

const dragging = (e) => {
    // scrolling images to left according to mouse pointer
    if(!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    positionDiff = (e.pageX || e.touched[0].pageX ) - prevPageX;
    keycap.scrollLeft = prevScrollLeft - positionDiff;
}

const dragStop = () => {
    isDragStart = false;
    if(!isDragging) return;
    isDragging = false;
    autoSlide();
}

keycap.addEventListener("mousedown", dragStart);
keycap.addEventListener("touchstart", dragStart);

keycap.addEventListener("mousemove", dragging);
keycap.addEventListener("touchmove", dragging);

keycap.addEventListener("mouseup", dragStop);
keycap.addEventListener("touchend", dragStop);
