// ADMIN SCRIPT


// ===============================
// ❌️ KHÔNG ĐƯỢC SỬA ĐỔI (báo lên nhóm nếu cần thay đổi)
// ===============================

// Kiểm tra quyền truy cập admin
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('loggedInUser');
    const role = localStorage.getItem('userRole');
    if (!user || role !== 'admin') {
        alert('⚠️ Truy cập bị từ chối. Vui lòng đăng nhập bằng tài khoản quản trị.');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberedUser');
        window.location.href = '/index.html';
    }

    // Hiển thị/ẩn các section khi bấm vào sidebar (chỉ phần điều hướng)
    try {
        const sidebarItems = Array.from(document.querySelectorAll('.admin-sidebar .admin-sidebar__nav .admin-sidebar__list .admin-sidebar__item.tab-content'));
        const sections = Array.from(document.querySelectorAll('main .section'));
        if (sidebarItems.length && sections.length) {
            sidebarItems.forEach((item, idx) => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    // xóa active trước đó
                    sidebarItems.forEach(si => si.classList.remove('active'));
                    sections.forEach(sec => sec.classList.remove('active'));

                    // bật active cho item và section tương ứng (theo chỉ số)
                    item.classList.add('active');
                    if (sections[idx]) sections[idx].classList.add('active');
                });
            });
        }
    } catch (err) {
        // im lặng nếu DOM khác cấu trúc
        console.warn('Sidebar show/hide init failed:', err);
    }

    // Xử lý 3 nút phía dưới (Home, Admin, Log out)
    try {
        const bottomItems = Array.from(document.querySelectorAll('.admin-sidebar .admin-sidebar__actions .admin-sidebar__list .admin-sidebar__item.user-logout'));
        // bottomItems[0] = Home page, [1] = Admin (display), [2] = Log out
        if (bottomItems.length) {
            const clearAuthAndRedirect = (msg) => {
                if (msg && !confirm(msg)) return;
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                localStorage.removeItem('rememberedUser');
                window.location.href = '/index.html';
            };

            if (bottomItems[0]) {
                bottomItems[0].addEventListener('click', (e) => {
                    e.preventDefault();
                    clearAuthAndRedirect('Bạn có muốn quay về trang chủ? Bạn sẽ bị đăng xuất khỏi trang quản trị.');
                });
            }

            if (bottomItems[1]) {
                bottomItems[1].addEventListener('click', (e) => {
                    e.preventDefault();
                    const current = localStorage.getItem('loggedInUser') || 'Admin';
                    alert('Người dùng hiện tại: ' + current);
                });
            }

            if (bottomItems[2]) {
                bottomItems[2].addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Bạn có chắc muốn đăng xuất không?')) {
                        localStorage.removeItem('loggedInUser');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('rememberedUser');
                        alert('👋 Đăng xuất thành công!');
                        window.location.href = '/index.html';
                    }
                });
            }
        }
    } catch (err) {
        console.warn('Bottom sidebar handlers init failed:', err);
    }
});
// ===============================
// ✔️ ĐƯỢC PHÉP SỬA ĐỔI
// ===============================


// ===============================
// SCRIPT HOẠT ĐÔNG CHUNG CHO ADMIN PAGE
// ===============================



// ===============================
// PRODUCTS SCRIPT
// ===============================



// ===============================
// CUSTOMERS SCRIPT
// ===============================



// ===============================
// ORDERS SCRIPT
// ===============================



// ===============================
// ANALYTICS SCRIPT
// ===============================



// ===============================
// WAREHOUSE SCRIPT
// ===============================
