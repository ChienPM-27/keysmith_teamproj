// ADMIN SCRIPT

import { dataManager } from "./DatabaseManager.js";

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

    // Hiển thị/ẩn các section khi bấm vào sidebar (chỉ phần middle-sidebar)
    try {
        const sidebarItems = Array.from(document.querySelectorAll('.sidebar .middle-sidebar .sidebar-list .sidebar-list-item.tab-content'));
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
        const bottomItems = Array.from(document.querySelectorAll('.sidebar .bottom-sidebar .sidebar-list .sidebar-list-item.user-logout'));
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
// DOM references (will be scoped to the customer section in initCustomerModule)
let containerCustomer = null;
let templateCustomerItem = null;
let modalCustomerDetail = null;

// Lưu trữ tham chiếu đến input ẩn chứa tên người dùng bên trong modal
let detailUsernameEl = null;

// Pagination state
let currentCustomerPage = 1;
let perCustomerPage = 8; // default
let perCustomerPageSelectEl = null;
let pageCustomerNavListEl = null;

// Customer control state (filters/search)
let currentCustomerFilterStatus = "";
let currentCustomerSearchQuery = "";

// small debounce helper for search input
function debounce(fn, wait = 250) {
    let t = null;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

// Render toàn bộ danh sách khách hàng
function renderCustomers() {
    if (!containerCustomer || !templateCustomerItem) return;
    containerCustomer.innerHTML = "";
    const allCustomers = dataManager.getAll("customers") || [];

    // apply filters and search (scoped to customer section)
    let customers = allCustomers.filter((c) => {
        if (currentCustomerFilterStatus) {
            if (c.status !== currentCustomerFilterStatus) return false;
        }
        if (currentCustomerSearchQuery) {
            const q = currentCustomerSearchQuery.toLowerCase();
            const hay = [
                c.username,
                c.firstName,
                c.lastName,
                c.email,
                c.phone,
            ].filter(Boolean).join(' ').toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });

    // ensure perCustomerPage is valid
    perCustomerPage = Math.max(1, parseInt(perCustomerPage, 10) || 8);
    const total = customers.length;
    const totalPages = Math.max(1, Math.ceil(total / perCustomerPage));
    if (currentCustomerPage > totalPages) currentCustomerPage = totalPages;
    if (currentCustomerPage < 1) currentCustomerPage = 1;

    const start = (currentCustomerPage - 1) * perCustomerPage;
    const end = start + perCustomerPage;
    const pageItems = customers.slice(start, end);

    pageItems.forEach((c) => {
        const node = templateCustomerItem.content.cloneNode(true);
        const item = node.querySelector(".customer-item");
        if (!item) return;
        item.dataset.username = c.username || "";

        const avatarImg = node.querySelector(".customer-avatar img");
        if (avatarImg) avatarImg.src = c.img || "/img/blank-image.png";

        const nameEl = node.querySelector(".customer-name");
        if (nameEl) nameEl.textContent = `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.username;

        const emailEl = node.querySelector(".customer-email");
        if (emailEl) emailEl.textContent = c.email || "";

        const phoneEl = node.querySelector(".customer-phone");
        if (phoneEl) phoneEl.textContent = c.phone || "";

        const statusBadge = node.querySelector(".status-badge");
        if (statusBadge) updateBadgeElement(statusBadge, c.status);

        const lockIcon = node.querySelector(".btn-lock-unlock-customer i");
        if (lockIcon) {
            if (c.status === "locked" || c.status === "inactive") {
                lockIcon.className = "fa-solid fa-lock";
            } else {
                lockIcon.className = "fa-solid fa-lock-open";
            }
        }

        containerCustomer.appendChild(node);
    });

    // render pagination controls
    renderPaginationControls(customers.length, currentCustomerPage, perCustomerPage);
}

function renderPaginationControls(totalItems, page, pageSize) {
    if (!pageCustomerNavListEl) {
        // Prefer the pagination list inside the customer section to avoid picking other sections'
        pageCustomerNavListEl = containerCustomer?.closest('.customer-wrapper')?.querySelector('.page-nav-list') || document.querySelector('.page-nav-list');
    }

    pageCustomerNavListEl.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Helper to create li > a
    const makeItem = (text, targetPage, opts = {}) => {
        const li = document.createElement('li');
        li.className = 'page-nav-item' + (opts.active ? ' active' : '');
        if (opts.disabled) li.classList.add('disabled');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        a.dataset.page = String(targetPage);
        li.appendChild(a);
        return li;
    };

    // First
    pageCustomerNavListEl.appendChild(makeItem('<<', 1, { disabled: page <= 1 }));
    // Prev
    pageCustomerNavListEl.appendChild(makeItem('<', Math.max(1, page - 1), { disabled: page <= 1 }));

    // page buttons (limit to reasonable number)
    const maxButtons = 7;
    let startPage = 1;
    let endPage = totalPages;
    if (totalPages > maxButtons) {
        const half = Math.floor(maxButtons / 2);
        startPage = Math.max(1, page - half);
        endPage = startPage + maxButtons - 1;
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        pageCustomerNavListEl.appendChild(makeItem(String(p), p, { active: p === page }));
    }

    // Next
    pageCustomerNavListEl.appendChild(makeItem('>', Math.min(totalPages, page + 1), { disabled: page >= totalPages }));
    // Last
    pageCustomerNavListEl.appendChild(makeItem('>>', totalPages, { disabled: page >= totalPages }));
}

function setPerPage(n) {
    const v = parseInt(n, 10) || 1;
    perCustomerPage = Math.max(1, v);
    currentCustomerPage = 1;
    renderCustomers();
}

// --- Customer control helpers (scoped) ---
function setFilterStatus(status) {
    currentCustomerFilterStatus = status || "";
    currentCustomerPage = 1;
    renderCustomers();
}

function setSearchQuery(q) {
    currentCustomerSearchQuery = (q || "").trim();
    currentCustomerPage = 1;
    renderCustomers();
}

function refreshCustomers() {
    // reload data from storage if available
    try {
        const reloaded = dataManager.load();
        if (reloaded) dataManager.data = reloaded;
    } catch (e) {
        // ignore
    }
    
    // reset controls to defaults (scoped to the customer section if available)
    currentCustomerFilterStatus = "";
    currentCustomerSearchQuery = "";
    currentCustomerPage = 1;
    perCustomerPage = 8; // default per-page

    // update DOM controls if present (use cached select when available)
    const customerSection = containerCustomer?.closest('.customer-wrapper') || document.getElementById('customer-section');
    if (customerSection) {
        const filterEl = customerSection.querySelector('#filter-user-status');
        if (filterEl) filterEl.value = "";

        const searchEl = customerSection.querySelector('#form-search-user');
        if (searchEl) searchEl.value = "";

        const perSel = perCustomerPageSelectEl || customerSection.querySelector('#per-page');
        if (perSel) perSel.value = String(perCustomerPage);
    }

    renderCustomers();
}

function goToPage(p) {
    const total = dataManager.getAll('customers')?.length || 0;
    const totalPages = Math.max(1, Math.ceil(total / perCustomerPage));
    let page = parseInt(p, 10) || 1;
    page = Math.min(Math.max(1, page), totalPages);
    currentCustomerPage = page;
    renderCustomers();
}

// Mở modal chi tiết cho khách hàng cụ thể
// Truy cập detailUsernameEl để biết đang hiển thị khách hàng nào
function openModalFor(username) {
    const c = dataManager.getCustomerByUsername(username);
    if (!c || !modalCustomerDetail) return;

    const set = (id, value) => {
        const el = modalCustomerDetail.querySelector(`#${id}`);
        if (el) el.value = value ?? "";
    };

    const avatar = modalCustomerDetail.querySelector('#customer-detail-avatar');
    if (avatar) avatar.src = c.img || "/img/blank-image.png";

    // keep the username in a hidden field so modal actions know which user is active
    if (detailUsernameEl) detailUsernameEl.value = c.username || "";

    set("detail-firstname", c.firstName || "");
    set("detail-lastname", c.lastName || "");
    set("detail-email", c.email || "");
    set("detail-phone", c.phone || "");
    set("detail-address", c.address || "");
    set("detail-dob", c.dateOfBirth || "");

    const modalBadge = modalCustomerDetail.querySelector('#modal-detail-status-badge');
    if (modalBadge) updateBadgeElement(modalBadge, c.status);

    const lockBtn = modalCustomerDetail.querySelector('#btn-lock-account');
    if (lockBtn) updateLockButtonElement(lockBtn, c.status);
    
    if (modalCustomerDetail) modalCustomerDetail.setAttribute("aria-hidden", "false");
}

// Đóng modal chi tiết khách hàng
function closeModal() {
    if (modalCustomerDetail) modalCustomerDetail.setAttribute("aria-hidden", "true");
}

// Cập nhật trạng thái badge hiển thị trạng thái khách hàng
function updateBadgeElement(badgeEl, status) {
    if (!badgeEl) return;
    const isLocked = status === "locked" || status === "inactive";
    badgeEl.textContent = isLocked ? "Bị khóa" : "Đang hoạt động";
    badgeEl.classList.remove("locked", "active");
    badgeEl.classList.add(isLocked ? "locked" : "active");
}

// Cập nhật nút khóa/mở tài khoản trong modal
function updateLockButtonElement(btnEl, status) {
    if (!btnEl) return;
    const isLocked = status === "locked" || status === "inactive";
    btnEl.innerHTML = isLocked ? '<i class="fa-solid fa-lock-open"></i> Mở tài khoản' : '<i class="fa-solid fa-lock"></i> Khóa tài khoản';
    btnEl.classList.remove("locked", "unlocked");
    btnEl.classList.add(isLocked ? "locked" : "unlocked");
}

// Cập nhật giao diện cho một khách hàng trong danh sách khách hàng
function updateListItemUI(username, customerObj) {
    if (!containerCustomer) return;
    const itemEl = containerCustomer.querySelector(`.customer-item[data-username="${username}"]`);
    if (!itemEl) return;
    const badge = itemEl.querySelector('.status-badge');
    if (badge) updateBadgeElement(badge, customerObj.status);
    const lockIcon = itemEl.querySelector('.btn-lock-unlock-customer i');
    if (lockIcon) lockIcon.className = (customerObj.status === 'locked' || customerObj.status === 'inactive') ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
}

// Cập nhật giao diện cả danh sách và modal cho một khách hàng
function updateCustomerUI(username, customerObj) {
    updateListItemUI(username, customerObj);
    
    // Nếu đang mở modal cho khách hàng này, cập nhật badge và nút khóa trong modal
    const usernameInModal = detailUsernameEl?.value;
    if (usernameInModal === username) {
        const modalBadge = modalCustomerDetail?.querySelector('#modal-detail-status-badge');
        if (modalBadge) updateBadgeElement(modalBadge, customerObj.status);

        const lockBtn = modalCustomerDetail?.querySelector('#btn-lock-account');
        if (lockBtn) updateLockButtonElement(lockBtn, customerObj.status);
    }
}

// Chỉnh sửa trạng thái khóa/mở khóa khách hàng
export function setCustomerLock(username, locked) {
    const c = dataManager.getCustomerByUsername(username);
    if (!c) return null;
    c.status = locked ? "locked" : "active";
    dataManager.save();

    // Cập nhập giao diện cả danh sách và modal cho khách hàng này
    updateCustomerUI(username, c);

    return c;
}

export function toggleLock(username) {
    const c = dataManager.getCustomerByUsername(username);
    if (!c) return null;
    const isLocked = c.status === "locked" || c.status === "inactive";
    return setCustomerLock(username, !isLocked);
}

export function resetPassword(username) {
    const c = dataManager.getCustomerByUsername(username);
    if (!c) return false;
    c.password = "123";
    dataManager.save();
    return true;
}

function deleteCustomer(username, itemEl) {
    if (!confirm("Bạn có chắc muốn xóa khách hàng này không?")) return;
    const idx = dataManager.data.customers.findIndex((x) => x.username === username);
    if (idx === -1) return;
    dataManager.data.customers.splice(idx, 1);
    dataManager.save();

    if (itemEl && itemEl.parentElement) {
        itemEl.parentElement.removeChild(itemEl);
    } else {
        renderCustomers();
    }

    const usernameInModal = detailUsernameEl?.value;
    if (usernameInModal === username) closeModal();
}

// Các hành động trong modal (reset password, lock/unlock)
function wireModalActions() {
    if (!modalCustomerDetail) return;
    const resetBtn = modalCustomerDetail.querySelector("#btn-reset-password");
    const lockBtn = modalCustomerDetail.querySelector("#btn-lock-account");

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const username = detailUsernameEl?.value;
            if (!username) return;
            const ok = resetPassword(username);
            if (ok) alert("Mật khẩu đã được đặt lại về: 123");
        });
    }

    if (lockBtn) {
        lockBtn.addEventListener("click", () => {
            const username = detailUsernameEl?.value;
            if (!username) return;
            toggleLock(username);
        });
    }
}

// Wire file input and change-avatar button inside modal
function wireAvatarUpload() {
    if (!modalCustomerDetail) return;
    const changeBtn = modalCustomerDetail.querySelector("#btn-change-avatar");
    const fileInput = modalCustomerDetail.querySelector("#customer-avatar-input");
    
    if (changeBtn && fileInput) {
        changeBtn.addEventListener("click", () => fileInput.click());
        
        fileInput.addEventListener("change", (ev) => {
            const f = fileInput.files && fileInput.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                const dataUrl = e.target.result;
                const username = detailUsernameEl?.value;
                if (!username) return;
                const c = dataManager.getCustomerByUsername(username);
                if (!c) return;
                c.img = dataUrl;
                dataManager.save();
                // update modal avatar and list item
                const avatar = modalCustomerDetail.querySelector("#customer-detail-avatar");
                if (avatar) avatar.src = c.img || "/img/blank-image.png";
                updateListItemUI(username, c);
            };
            reader.readAsDataURL(f);
        });
    }
}

// Quản lý module khách hàng
function initCustomerModule() {
    const customerSection = document.getElementById('customer-section') || document.querySelector('.customer-wrapper');

    containerCustomer = customerSection.querySelector('#show-customer-container');
    templateCustomerItem = customerSection.querySelector('#customer-item-template');
    modalCustomerDetail = customerSection.querySelector('#customerDetailModal');

    // cache per-page select and pagination container scoped to this section
    perCustomerPageSelectEl = customerSection.querySelector('#per-page');
    pageCustomerNavListEl = customerSection.querySelector('.page-nav-list');

    // cache hidden username input inside modal (scoped)
    detailUsernameEl = customerSection.querySelector('#detail-username');

    // initialize per-page from select if present
    if (perCustomerPageSelectEl) {
        const v = parseInt(perCustomerPageSelectEl.value, 10);
        if (!Number.isNaN(v)) perCustomerPage = v;
        perCustomerPageSelectEl.addEventListener('change', (ev) => {
            setPerPage(ev.target.value);
        });
    }

    // customer-control: filter, search, refresh (scoped)
    const filterSelect = customerSection.querySelector('#filter-user-status');
    const searchInput = customerSection.querySelector('#form-search-user');
    const refreshBtn = customerSection.querySelector('#btn-refresh-user');

    if (filterSelect) {
        filterSelect.addEventListener('change', (ev) => setFilterStatus(ev.target.value));
    }

    if (searchInput) {
        const debounced = debounce((e) => setSearchQuery(e.target.value), 200);
        searchInput.addEventListener('input', debounced);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            refreshCustomers();
        });
    }

    // delegate clicks on pagination controls (scoped)
    if (pageCustomerNavListEl) {
        pageCustomerNavListEl.addEventListener('click', (ev) => {
            const el = ev.target.closest && ev.target.closest('[data-page]');
            if (!el) return;
            if (el.tagName === 'A') ev.preventDefault();
            const page = el.dataset && el.dataset.page;
            if (!page) return;
            goToPage(page);
        });
    }

    // Các hành dộng trong danh sách khách hàng (xem chi tiết, khóa/mở, xóa)
    if (containerCustomer) {
        containerCustomer.addEventListener("click", (ev) => {
            const btn = ev.target.closest && ev.target.closest("button");
            if (!btn) return;
            const item = btn.closest && btn.closest(".customer-item");
            const username = item && item.dataset && item.dataset.username;
            if (!username) return;
            
            if (btn.classList.contains("btn-view-customer")) {
                openModalFor(username);
            } else if (btn.classList.contains("btn-lock-unlock-customer")) {
                toggleLock(username);
            } else if (btn.classList.contains("btn-delete-customer")) {
                deleteCustomer(username, item);
            }
        });
    }

    // Đóng modal chi tiết khách hàng
    if (modalCustomerDetail) {
        const modalCloseBtn = modalCustomerDetail.querySelector('.modal-close');
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

        // close when clicking on overlay (outside .modal-container)
        modalCustomerDetail.addEventListener('click', (ev) => {
            if (ev.target === modalCustomerDetail) closeModal();
        });

        // close on ESC when modal is open
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && modalCustomerDetail.getAttribute('aria-hidden') === 'false') {
                closeModal();
            }
        });
    }

    wireModalActions();
    wireAvatarUpload();
}

// Initial render should remain as-is
document.addEventListener("DOMContentLoaded", () => {
    initCustomerModule();
    renderCustomers();
});



// ===============================
// ORDERS SCRIPT
// ===============================



// ===============================
// ANALYTICS SCRIPT
// ===============================



// ===============================
// WAREHOUSE SCRIPT
// ===============================
