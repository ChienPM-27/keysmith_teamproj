// ADMIN SCRIPT

import { dataManager } from "./DatabaseManager.js";

// ===============================
// ❌️ KHÔNG ĐƯỢC SỬA ĐỔI (báo lên nhóm nếu cần thay đổi)
// ===============================

// Kiểm tra quyền truy cập admin
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("loggedInUser");
  const role = localStorage.getItem("userRole");
  if (!user || role !== "admin") {
    alert(
      "⚠️ Truy cập bị từ chối. Vui lòng đăng nhập bằng tài khoản quản trị."
    );
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberedUser");
    window.location.href = "/index.html";
  }

  // Hiển thị/ẩn các section khi bấm vào sidebar (chỉ phần middle-sidebar)
  try {
    const sidebarItems = Array.from(
      document.querySelectorAll(
        ".sidebar .middle-sidebar .sidebar-list .sidebar-list-item.tab-content"
      )
    );
    const sections = Array.from(document.querySelectorAll("main .section"));
    if (sidebarItems.length && sections.length) {
      sidebarItems.forEach((item, idx) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          // xóa active trước đó
          sidebarItems.forEach((si) => si.classList.remove("active"));
          sections.forEach((sec) => sec.classList.remove("active"));

          // bật active cho item và section tương ứng (theo chỉ số)
          item.classList.add("active");
          if (sections[idx]) sections[idx].classList.add("active");

          // lazy-init modules when their section becomes active (idempotent)
          const activated = sections[idx];
          if (activated) {
            // Customer section: đảm bảo init (một lần) rồi luôn render khi activated
            if (
              activated.id === "customer-section" ||
              activated.classList.contains("customer-wrapper")
            ) {
              if (!window._customerModuleInited) initCustomerModule();
              renderCustomers();
            }

            // Orders section: đảm bảo init (một lần) rồi luôn render khi activated
            if (
              activated.id === "orders-section" ||
              activated.classList.contains("orders-wrapper")
            ) {
              if (!window._orderModuleInited) initOrderModule();
              renderOrders();
            }
          }
        });
      });
    }
  } catch (err) {
    // im lặng nếu DOM khác cấu trúc
    console.warn("Sidebar show/hide init failed:", err);
  }

  // Xử lý 3 nút phía dưới (Home, Admin, Log out)
  try {
    const bottomItems = Array.from(
      document.querySelectorAll(
        ".sidebar .bottom-sidebar .sidebar-list .sidebar-list-item.user-logout"
      )
    );
    // bottomItems[0] = Trang chủ, [1] = Admin (hiển thị), [2] = Đăng xuất
    if (bottomItems.length) {
      const clearAuthAndRedirect = (msg) => {
        if (msg && !confirm(msg)) return;
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("userRole");
        localStorage.removeItem("rememberedUser");
        window.location.href = "/index.html";
      };

      if (bottomItems[0]) {
        bottomItems[0].addEventListener("click", (e) => {
          e.preventDefault();
          clearAuthAndRedirect(
            "Bạn có muốn quay về trang chủ? Bạn sẽ bị đăng xuất khỏi trang quản trị."
          );
        });
      }

      if (bottomItems[1]) {
        bottomItems[1].addEventListener("click", (e) => {
          e.preventDefault();
          const current = localStorage.getItem("loggedInUser") || "Admin";
          alert("Người dùng hiện tại: " + current);
        });
      }

      if (bottomItems[2]) {
        bottomItems[2].addEventListener("click", (e) => {
          e.preventDefault();
          if (confirm("Bạn có chắc muốn đăng xuất không?")) {
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("userRole");
            localStorage.removeItem("rememberedUser");
            alert("👋 Đăng xuất thành công!");
            window.location.href = "/index.html";
          }
        });
      }
    }
  } catch (err) {
    console.warn("Bottom sidebar handlers init failed:", err);
  }
});

// ===============================
// ✔️ ĐƯỢC PHÉP SỬA ĐỔI
// ===============================

// lazy-init flags for modules (idempotence guards)
window._customerModuleInited = window._customerModuleInited || false;
window._orderModuleInited = window._orderModuleInited || false;

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

// Trạng thái pagination
let currentCustomerPage = 1;
let perCustomerPage = 8; // default
let perCustomerPageSelectEl = null;
let pageCustomerNavListEl = null;

// Trạng thái bộ lọc/tìm kiếm khách hàng
let currentCustomerFilterStatus = "";
let currentCustomerSearchQuery = "";

// helper nhỏ debounce cho input tìm kiếm
function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Render toàn bộ danh sách khách hàng
// --- các helper nhỏ cho module Customers ---
function getAllCustomers() {
  try {
    return dmGetAll("customers");
  } catch (e) {
    // fallback về list rỗng nếu gặp lỗi
    return [];
  }
}

// Chuẩn hóa customer record cho UI và đảm bảo các trường theo DatabaseManager
function normalizeCustomerForUI(c) {
  if (!c) return c;
  // đảm bảo các trường canonical tồn tại
  c.username = c.username || "";
  c.password = c.password || "";
  c.img = c.img || "";
  c.firstName = c.firstName || "";
  c.lastName = c.lastName || "";
  c.email = c.email || "";
  c.phone = c.phone || "";
  c.address = c.address || "";
  c.dateOfBirth = c.dateOfBirth || "";
  // chuẩn hóa status: 'active', 'inactive', hoặc 'locked'
  if (!c.status) c.status = "active";
  // đảm bảo kiểu string
  c.username = String(c.username || "");
  c.firstName = String(c.firstName || "");
  c.lastName = String(c.lastName || "");
  c.email = String(c.email || "");
  c.phone = String(c.phone || "");
  c.address = String(c.address || "");
  c.dateOfBirth = String(c.dateOfBirth || "");
  return c;
}

// Truy vấn customer theo username (wrapper nhỏ)
function dmGetCustomerByUsername(username) {
  try {
    if (window.dataManager && typeof window.dataManager.getCustomerByUsername === "function")
      return window.dataManager.getCustomerByUsername(username) || null;
    return (dmGetAll("customers") || []).find((c) => c.username === username) || null;
  } catch (e) {
    return null;
  }
}

// Xóa customer theo username (nhỏ gọn)
function dmDeleteCustomerByUsername(username) {
  const arr = dmGetAll("customers");
  const idx = arr.findIndex((x) => x.username === username);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  dmSave();
  return true;
}

function applyCustomerFilters(list) {
  const arr = list || [];
  return arr.filter((c) => {
    if (currentCustomerFilterStatus) {
      if (c.status !== currentCustomerFilterStatus) return false;
    }
    if (currentCustomerSearchQuery) {
      const q = currentCustomerSearchQuery.toLowerCase();
      const hay = [c.username, c.firstName, c.lastName, c.email, c.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function paginateCustomers(list, page, pageSize) {
  const all = list || [];
  const size = Math.max(1, parseInt(pageSize, 10) || 8);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const p = Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
  const start = (p - 1) * size;
  const items = all.slice(start, start + size);
  return { items, total, totalPages, page: p };
}

function createCustomerNode(c) {
  // chuẩn hóa trước khi render để UI có thể dựa vào các trường canonical
  normalizeCustomerForUI(c);
  const frag = templateCustomerItem.content.cloneNode(true);
  const item = frag.querySelector(".customer-item");
  if (!item) return frag;
  item.dataset.username = c.username || "";

  const avatarImg = frag.querySelector(".customer-avatar img");
  if (avatarImg) avatarImg.src = c.img || "/img/blank-image.png";

  const nameEl = frag.querySelector(".customer-name");
  if (nameEl)
    nameEl.textContent =
      `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.username;

  const emailEl = frag.querySelector(".customer-email");
  if (emailEl) emailEl.textContent = c.email || "";

  const phoneEl = frag.querySelector(".customer-phone");
  if (phoneEl) phoneEl.textContent = c.phone || "";

  const statusBadge = frag.querySelector(".status-badge");
  if (statusBadge) updateBadgeElement(statusBadge, c.status);

  const lockIcon = frag.querySelector(".btn-lock-unlock-customer i");
  if (lockIcon) {
    lockIcon.className =
      c.status === "locked" || c.status === "inactive"
        ? "fa-solid fa-lock"
        : "fa-solid fa-lock-open";
  }

  return frag;
}

function renderCustomers() {
  if (!containerCustomer || !templateCustomerItem) return;
  // chỉ render khi customer section đang active để tránh xung đột
  // với các module khác có thể dùng chung DOM ids/selectors
  const customerSection =
    containerCustomer?.closest(".customer-wrapper") ||
    document.getElementById("customer-section");
  if (customerSection && !customerSection.classList.contains("active")) return;
  containerCustomer.innerHTML = "";

  const allCustomers = getAllCustomers();
  const customers = applyCustomerFilters(allCustomers);

  // đảm bảo perCustomerPage hợp lệ
  perCustomerPage = Math.max(1, parseInt(perCustomerPage, 10) || 8);

  const { items, total, page } = paginateCustomers(
    customers,
    currentCustomerPage,
    perCustomerPage
  );
  currentCustomerPage = page;

  items.forEach((c) => {
    const node = createCustomerNode(c);
    if (node) containerCustomer.appendChild(node);
  });

  // render pagination controls
  renderPaginationControls(total, currentCustomerPage, perCustomerPage);
}

function renderPaginationControls(totalItems, page, pageSize) {
  if (!pageCustomerNavListEl) {
    // Ưu tiên pagination list bên trong customer section để tránh lấy nhầm section khác
    pageCustomerNavListEl =
      containerCustomer
        ?.closest(".customer-wrapper")
        ?.querySelector(".page-nav-list") ||
      document.querySelector(".page-nav-list");
  }

  pageCustomerNavListEl.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Helper để tạo li > a
  const makeItem = (text, targetPage, opts = {}) => {
    const li = document.createElement("li");
    li.className = "page-nav-item" + (opts.active ? " active" : "");
    if (opts.disabled) li.classList.add("disabled");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = text;
    a.dataset.page = String(targetPage);
    li.appendChild(a);
    return li;
  };

  // Đầu tiên
  pageCustomerNavListEl.appendChild(makeItem("<<", 1, { disabled: page <= 1 }));
  // Trước
  pageCustomerNavListEl.appendChild(
    makeItem("<", Math.max(1, page - 1), { disabled: page <= 1 })
  );

  // các nút trang (giới hạn số lượng hợp lý)
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
    pageCustomerNavListEl.appendChild(
      makeItem(String(p), p, { active: p === page })
    );
  }

  // Tiếp theo
  pageCustomerNavListEl.appendChild(
    makeItem(">", Math.min(totalPages, page + 1), {
      disabled: page >= totalPages,
    })
  );
  // Cuối cùng
  pageCustomerNavListEl.appendChild(
    makeItem(">>", totalPages, { disabled: page >= totalPages })
  );
}

function setPerPage(n) {
  const v = parseInt(n, 10) || 1;
  perCustomerPage = Math.max(1, v);
  currentCustomerPage = 1;
  renderCustomers();
}

// --- Các helper điều khiển khách hàng (scoped) ---
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
  // tải lại dữ liệu từ storage nếu có (tránh throw lỗi; dùng kiểm tra an toàn)
  const reloaded =
    dataManager && typeof dataManager.load === "function"
      ? dataManager.load()
      : null;
  if (reloaded) dataManager.data = reloaded;

  // đặt lại các control về giá trị mặc định (giới hạn trong customer section nếu có)
  currentCustomerFilterStatus = "";
  currentCustomerSearchQuery = "";
  currentCustomerPage = 1;
  perCustomerPage = 8; // mặc định số item mỗi trang

  // cập nhật các control DOM nếu có (dùng cached select khi có sẵn)
  const customerSection =
    containerCustomer?.closest(".customer-wrapper") ||
    document.getElementById("customer-section");
  if (customerSection) {
    const filterEl = customerSection.querySelector("#filter-user-status");
    if (filterEl) filterEl.value = "";

    const searchEl = customerSection.querySelector("#form-search-user");
    if (searchEl) searchEl.value = "";

    const perSel =
      perCustomerPageSelectEl || customerSection.querySelector("#per-page");
    if (perSel) perSel.value = String(perCustomerPage);
  }

  renderCustomers();
}

function goToPage(p) {
  const total = dmGetAll("customers")?.length || 0;
  const totalPages = Math.max(1, Math.ceil(total / perCustomerPage));
  let page = parseInt(p, 10) || 1;
  page = Math.min(Math.max(1, page), totalPages);
  currentCustomerPage = page;
  renderCustomers();
}

// Mở modal chi tiết cho khách hàng cụ thể
// Truy cập detailUsernameEl để biết đang hiển thị khách hàng nào
function openModalFor(username) {
  const c = dmGetCustomerByUsername(username);
  if (!c || !modalCustomerDetail) return;
  // chuẩn hóa record cho modal sử dụng
  normalizeCustomerForUI(c);

  const set = (id, value) => {
    const el = modalCustomerDetail.querySelector(`#${id}`);
    if (el) el.value = value ?? "";
  };

  const avatar = modalCustomerDetail.querySelector("#customer-detail-avatar");
  if (avatar) avatar.src = c.img || "/img/blank-image.png";

  // lưu username trong trường ẩn để các modal action biết user nào đang active
  if (detailUsernameEl) detailUsernameEl.value = c.username || "";

  set("detail-firstname", c.firstName || "");
  set("detail-lastname", c.lastName || "");
  set("detail-email", c.email || "");
  set("detail-phone", c.phone || "");
  set("detail-address", c.address || "");
  set("detail-dob", c.dateOfBirth || "");

  const modalBadge = modalCustomerDetail.querySelector(
    "#modal-detail-status-badge"
  );
  if (modalBadge) updateBadgeElement(modalBadge, c.status);

  const lockBtn = modalCustomerDetail.querySelector("#btn-lock-account");
  if (lockBtn) updateLockButtonElement(lockBtn, c.status);

  if (modalCustomerDetail)
    modalCustomerDetail.setAttribute("aria-hidden", "false");
}

// Đóng modal chi tiết khách hàng
function closeCustomerDetailModal() {
  if (modalCustomerDetail)
    modalCustomerDetail.setAttribute("aria-hidden", "true");
}

// Cập nhật trạng thái badge hiển thị trạng thái khách hàng
function updateBadgeElement(badgeEl, status) {
  if (!badgeEl) return;
  const isLocked = status === "locked" || status === "inactive";
  badgeEl.textContent = isLocked ? "Locked" : "Active";
  badgeEl.classList.remove("locked", "active");
  badgeEl.classList.add(isLocked ? "locked" : "active");
}

// Cập nhật nút khóa/mở tài khoản trong modal
function updateLockButtonElement(btnEl, status) {
  if (!btnEl) return;
  const isLocked = status === "locked" || status === "inactive";
  btnEl.innerHTML = isLocked
    ? '<i class="fa-solid fa-lock-open"></i> Unlock Account'
    : '<i class="fa-solid fa-lock"></i> Lock Account';
  btnEl.classList.remove("locked", "unlocked");
  btnEl.classList.add(isLocked ? "locked" : "unlocked");
}

// Cập nhật giao diện cho một khách hàng trong danh sách khách hàng
function updateListItemUI(username, customerObj) {
  if (!containerCustomer) return;
  const itemEl = containerCustomer.querySelector(
    `.customer-item[data-username="${username}"]`
  );
  if (!itemEl) return;
  const badge = itemEl.querySelector(".status-badge");
  if (badge) updateBadgeElement(badge, customerObj.status);
  const lockIcon = itemEl.querySelector(".btn-lock-unlock-customer i");
  if (lockIcon)
    lockIcon.className =
      customerObj.status === "locked" || customerObj.status === "inactive"
        ? "fa-solid fa-lock"
        : "fa-solid fa-lock-open";
}

// Cập nhật giao diện cả danh sách và modal cho một khách hàng
function updateCustomerUI(username, customerObj) {
  updateListItemUI(username, customerObj);

  // Nếu đang mở modal cho khách hàng này, cập nhật badge và nút khóa trong modal
  const usernameInModal = detailUsernameEl?.value;
  if (usernameInModal === username) {
    const modalBadge = modalCustomerDetail?.querySelector(
      "#modal-detail-status-badge"
    );
    if (modalBadge) updateBadgeElement(modalBadge, customerObj.status);

    const lockBtn = modalCustomerDetail?.querySelector("#btn-lock-account");
    if (lockBtn) updateLockButtonElement(lockBtn, customerObj.status);
  }
}

// Chỉnh sửa trạng thái khóa/mở khóa khách hàng
export function setCustomerLock(username, locked) {
  const c = dmGetCustomerByUsername(username);
  if (!c) return null;
  c.status = locked ? "locked" : "active";
  dmSave();

  // Cập nhập giao diện cả danh sách và modal cho khách hàng này
  updateCustomerUI(username, c);

  return c;
}

export function toggleLock(username) {
  const c = dmGetCustomerByUsername(username);
  if (!c) return null;
  const isLocked = c.status === "locked" || c.status === "inactive";
  return setCustomerLock(username, !isLocked);
}

export function resetPassword(username) {
  const c = dmGetCustomerByUsername(username);
  if (!c) return false;
  c.password = "123";
  dmSave();
  return true;
}

function deleteCustomer(username, itemEl) {
  if (!confirm("Are you sure you want to delete this customer?")) return;
  const ok = dmDeleteCustomerByUsername(username);
  if (!ok) return;

  if (itemEl && itemEl.parentElement) {
    itemEl.parentElement.removeChild(itemEl);
  } else {
    renderCustomers();
  }

  const usernameInModal = detailUsernameEl?.value;
  if (usernameInModal === username) closeCustomerDetailModal();
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
      if (ok) alert("Password has been reset to: 123");
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

// Wire input file và nút change-avatar trong modal
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
  const c = dmGetCustomerByUsername(username);
  if (!c) return;
  c.img = dataUrl;
  dmSave();
        // cập nhật avatar trong modal và item trong list
        const avatar = modalCustomerDetail.querySelector(
          "#customer-detail-avatar"
        );
        if (avatar) avatar.src = c.img || "/img/blank-image.png";
        updateListItemUI(username, c);
      };
      reader.readAsDataURL(f);
    });
  }
}

// Quản lý module khách hàng
function initCustomerModule() {
  // init idempotent: tránh wire listener nhiều lần
  if (window._customerModuleInited) return;

  const customerSection =
    document.getElementById("customer-section") ||
    document.querySelector(".customer-wrapper");

  containerCustomer = customerSection.querySelector("#show-customer-container");
  templateCustomerItem = customerSection.querySelector(
    "#customer-item-template"
  );
  modalCustomerDetail = customerSection.querySelector("#customerDetailModal");

  // cache select per-page và pagination container trong section này
  perCustomerPageSelectEl = customerSection.querySelector("#per-page");
  pageCustomerNavListEl = customerSection.querySelector(".page-nav-list");

  // cache input username ẩn trong modal (scoped)
  detailUsernameEl = customerSection.querySelector("#detail-username");

  // khởi tạo per-page từ select nếu có
  if (perCustomerPageSelectEl) {
    const v = parseInt(perCustomerPageSelectEl.value, 10);
    if (!Number.isNaN(v)) perCustomerPage = v;
    perCustomerPageSelectEl.addEventListener("change", (ev) => {
      setPerPage(ev.target.value);
    });
  }

  // customer-control: filter, search, refresh (scoped trong section này)
  const filterSelect = customerSection.querySelector("#filter-user-status");
  const searchInput = customerSection.querySelector("#form-search-user");
  const refreshBtn = customerSection.querySelector("#btn-refresh-user");

  if (filterSelect) {
    filterSelect.addEventListener("change", (ev) =>
      setFilterStatus(ev.target.value)
    );
  }

  if (searchInput) {
    const debounced = debounce((e) => setSearchQuery(e.target.value), 200);
    searchInput.addEventListener("input", debounced);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      refreshCustomers();
    });
  }

  // ủy quyền clicks trên pagination controls (scoped)
  if (pageCustomerNavListEl) {
    pageCustomerNavListEl.addEventListener("click", (ev) => {
      const el = ev.target.closest && ev.target.closest("[data-page]");
      if (!el) return;
      if (el.tagName === "A") ev.preventDefault();
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
    const modalCloseBtn = modalCustomerDetail.querySelector(".modal-close");
    if (modalCloseBtn)
      modalCloseBtn.addEventListener("click", closeCustomerDetailModal);

    // đóng khi click vào overlay (ngoài .modal-container)
    modalCustomerDetail.addEventListener("click", (ev) => {
      if (ev.target === modalCustomerDetail) closeCustomerDetailModal();
    });

    // đóng khi nhấn ESC khi modal đang mở
    document.addEventListener("keydown", (ev) => {
      if (
        ev.key === "Escape" &&
        modalCustomerDetail.getAttribute("aria-hidden") === "false"
      ) {
        closeCustomerDetailModal();
      }
    });
  }

  wireModalActions();
  wireAvatarUpload();
  // đánh dấu đã khởi tạo để các lần gọi tiếp theo không làm gì
  window._customerModuleInited = true;
}

// Render ban đầu giữ nguyên
document.addEventListener("DOMContentLoaded", () => {
  initCustomerModule();
  renderCustomers();
});

// ===============================
// ORDERS SCRIPT
// ===============================
const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(v) {
  const n = Number(v) || 0;
  return fmtCurrency.format(n);
}

// --- các helper nhỏ để tách trách nhiệm ---
// tham chiếu DOM/state ở module-scope (phải khai báo trước khi dùng)
let ordersSection = null;
let containerOrders = null;
let templateOrderItem = null;
let modalOrderDetail = null;
let perOrderPageSelectEl = null;
let pageOrderNavListEl = null;

// trạng thái pagination / filter
let perOrderPage = 8;
let currentOrderPage = 1;
let currentOrderFilterStatus = "";
let currentOrderSearchQuery = "";
let currentOrderStartDate = "";
let currentOrderEndDate = "";

function getAllOrders() {
  return window.dataManager && window.dataManager.getAll
    ? window.dataManager.getAll("orders") || []
    : window.dataManager?.data?.orders || [];
}

function getProductById(id) {
  return window.dataManager && typeof window.dataManager.getById === "function"
    ? window.dataManager.getById("products", id)
    : (window.dataManager?.data?.products || []).find((p) => p.id == id) ||
        null;
}

// -----------------------------
// Helpers chung cho truy cập dataManager
// - gom các thao tác đọc/ghi vào hàm nhỏ, nhất quán
// -----------------------------
function dmGetAll(collection) {
  try {
    return window.dataManager && typeof window.dataManager.getAll === "function"
      ? window.dataManager.getAll(collection) || []
      : window.dataManager?.data?.[collection] || [];
  } catch (e) {
    return [];
  }
}

function dmGetById(collection, id) {
  try {
    return window.dataManager && typeof window.dataManager.getById === "function"
      ? window.dataManager.getById(collection, id)
      : (window.dataManager?.data?.[collection] || []).find((x) => x.id == id) || null;
  } catch (e) {
    return null;
  }
}

function dmAdd(collection, obj) {
  if (window.dataManager && typeof window.dataManager.add === "function") {
    window.dataManager.add(collection, obj);
    return true;
  }
  if (window.dataManager && window.dataManager.data && Array.isArray(window.dataManager.data[collection])) {
    window.dataManager.data[collection].push(obj);
    return true;
  }
  return false;
}

function dmSave() {
  if (window.dataManager && typeof window.dataManager.save === "function") window.dataManager.save();
}

// Chuẩn hóa tên trường đơn hàng để dùng chung trong UI
function normalizeOrderForUI(o) {
  if (!o) return o;
  // đảm bảo dùng totalPrice và idOrder theo schema
  if (o.totalPrice === undefined) o.totalPrice = 0;
  if (o.idOrder === undefined) o.idOrder = 0;
  return o;
}

// Trả về chuỗi hiển thị id đơn hàng (dùng idOrder numeric theo schema)
function displayOrderId(o) {
  if (!o) return "";
  const id = o.idOrder ?? "";
  return "#" + id;
}

function applyOrderFilters(list) {
  return (list || []).filter((o) => {
    if (currentOrderFilterStatus) {
      if (o.status !== currentOrderFilterStatus) return false;
    }
    if (currentOrderSearchQuery) {
      const q = currentOrderSearchQuery.toLowerCase();
      const hay = [
        o.username,
        o.userDeliveryPhone,
        o.userDeliveryAdress,
        String(o.idOrder || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    // date range filtering
    if (currentOrderStartDate || currentOrderEndDate) {
      const od = o.date || null;
      if (!od) return false;
      const dt = new Date(od);
      if (currentOrderStartDate) {
        const s = new Date(currentOrderStartDate);
        s.setHours(0, 0, 0, 0);
        if (dt < s) return false;
      }
      if (currentOrderEndDate) {
        const e = new Date(currentOrderEndDate);
        e.setHours(23, 59, 59, 999);
        if (dt > e) return false;
      }
    }
    return true;
  });
}

// Phân trang riêng cho Orders (đổi tên để tránh xung đột với paginator của customers)
function paginateOrders(list, page, pageSize) {
  // simple paginator: returns items for given page and totals
  const total = (list || []).length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page || 1), totalPages);
  const start = (p - 1) * pageSize;
  const items = (list || []).slice(start, start + pageSize);
  return { items, total, totalPages, page: p };
}

// readOrders: wrapper nhỏ tiện lợi (giữ lại cho tương thích)
function readOrders() {
  return getAllOrders();
}

// createOrderNode: tạo DOM fragment từ template và điền các trường đã biết
function createOrderNode(o) {
  if (!templateOrderItem) return null;
  // chuẩn hóa object order để UI dùng chung các trường (idOrder, totalPrice)
  normalizeOrderForUI(o);
  const frag = templateOrderItem.content.cloneNode(true);
  const item = frag.querySelector(".order-item");
  if (item) item.dataset.orderId = String(o.idOrder || o.id || "");

  const orderNumEl = frag.querySelector(".order-number");
  if (orderNumEl) orderNumEl.textContent = displayOrderId(o);

  const userEl = frag.querySelector(".order-username");
  if (userEl) userEl.textContent = o.username || "-";

  const phoneEl = frag.querySelector(".order-phone");
  if (phoneEl) phoneEl.textContent = o.userDeliveryPhone || "-";

  const totalEl = frag.querySelector(".order-total");
  // đảm bảo dùng totalPrice (normalizeOrderForUI có thể đã set trước đó)
  if (totalEl) totalEl.textContent = formatCurrency(o.totalPrice || 0);

  const dateEl = frag.querySelector(".order-date");
  if (dateEl) {
    try {
      dateEl.textContent = o.date ? new Date(o.date).toLocaleString() : "";
    } catch (e) {
      dateEl.textContent = "";
    }
  }

  const sel = frag.querySelector(".status-select");
  if (sel) {
    sel.value = o.status || "new";
    sel.className = "status-select status-badge " + (o.status || "new");
  } else {
    const badge = frag.querySelector(".status-badge");
    if (badge) {
      const map = {
        new: "New",
        processing: "Processing",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };
      badge.textContent = map[o.status] || o.status || "-";
      badge.className = "status-badge " + (o.status || "new");
    }
  }

  return frag;
}

function renderOrders() {
  if (!containerOrders || !templateOrderItem) return;
  // chỉ render khi orders section đang visible/active
  const section =
    ordersSection ||
    containerOrders?.closest(".orders-wrapper") ||
    document.getElementById("orders-section");
  if (section && !section.classList.contains("active")) return;
  containerOrders.innerHTML = "";

  const all = getAllOrders();
  const filtered = applyOrderFilters(all);
  perOrderPage = Math.max(1, parseInt(perOrderPage, 10) || 8);
  const { items, total, page } = paginateOrders(
    filtered,
    currentOrderPage,
    perOrderPage
  );
  currentOrderPage = page;

  items.forEach((o) => {
    const node = createOrderNode(o);
    if (node) containerOrders.appendChild(node);
  });

  renderOrderPaginationControls(total, currentOrderPage, perOrderPage);
}

// --- các helper filter/search/reset (scoped cho orders) ---
function setOrderFilterStatus(status) {
  currentOrderFilterStatus = status || "";
  currentOrderPage = 1;
  renderOrders();
}

function setOrderSearchQuery(q) {
  currentOrderSearchQuery = (q || "").toString().trim();
  currentOrderPage = 1;
  renderOrders();
}

function setOrderStartDate(v) {
  currentOrderStartDate = (v || "").toString().trim();
  currentOrderPage = 1;
  renderOrders();
}

function setOrderEndDate(v) {
  currentOrderEndDate = (v || "").toString().trim();
  currentOrderPage = 1;
  renderOrders();
}

function refreshOrders() {
  const reloaded = window.dataManager?.load?.();
  if (reloaded) window.dataManager.data = reloaded;

  // đặt lại controls/state
  currentOrderFilterStatus = "";
  currentOrderSearchQuery = "";
  currentOrderPage = 1;
  perOrderPage = 8;
  // cập nhật DOM controls nếu có
  const filterEl = ordersSection?.querySelector("#filter-order-status");
  if (filterEl) filterEl.value = "";
  const searchEl = ordersSection?.querySelector("#form-search-order");
  if (searchEl) searchEl.value = "";
  const perSel =
    perOrderPageSelectEl || ordersSection?.querySelector("#per-page");
  if (perSel) perSel.value = String(perOrderPage);

  renderOrders();
}

function renderOrderPaginationControls(totalItems, page, pageSize) {
  if (!pageOrderNavListEl) {
    pageOrderNavListEl =
      containerOrders
        ?.closest(".orders-wrapper")
        ?.querySelector(".page-nav-list") || null;
  }
  if (!pageOrderNavListEl) return;
  pageOrderNavListEl.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const makeItem = (text, targetPage, opts = {}) => {
    const li = document.createElement("li");
    li.className = "page-nav-item" + (opts.active ? " active" : "");
    if (opts.disabled) li.classList.add("disabled");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = text;
    a.dataset.page = String(targetPage);
    li.appendChild(a);
    return li;
  };

  // đầu tiên / trước
  pageOrderNavListEl.appendChild(makeItem("<<", 1, { disabled: page <= 1 }));
  pageOrderNavListEl.appendChild(
    makeItem("<", Math.max(1, page - 1), { disabled: page <= 1 })
  );

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
    pageOrderNavListEl.appendChild(
      makeItem(String(p), p, { active: p === page })
    );
  }

  // tiếp theo / cuối cùng
  pageOrderNavListEl.appendChild(
    makeItem(">", Math.min(totalPages, page + 1), {
      disabled: page >= totalPages,
    })
  );
  pageOrderNavListEl.appendChild(
    makeItem(">>", totalPages, { disabled: page >= totalPages })
  );
}

function setPerOrderPage(n) {
  const v = parseInt(n, 10) || 1;
  perOrderPage = Math.max(1, v);
  currentOrderPage = 1;
  renderOrders();
}

function goToOrderPage(p) {
  const orders = readOrders();
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / perOrderPage));
  let page = parseInt(p, 10) || 1;
  page = Math.min(Math.max(1, page), totalPages);
  currentOrderPage = page;
  renderOrders();
}

function openOrderDetail(orderId) {
  const orders = readOrders();
  const o = orders.find(
    (x) => (x.idOrder || "").toString() === orderId.toString()
  );
  if (!o || !modalOrderDetail) return;
  // chuẩn hóa trước khi hiển thị
  normalizeOrderForUI(o);
  const setText = (id, v) => {
    const el = modalOrderDetail.querySelector("#" + id);
    if (el) el.textContent = v;
  };
  // dùng idOrder cho display theo schema
  setText("detail-order-id", displayOrderId(o));
  setText("detail-order-customer", o.username || "-");
  // dùng các trường delivery theo schema
  setText("detail-order-phone", o.userDeliveryPhone || "-");
  setText("detail-order-address", o.userDeliveryAdress || "-");

  // items
  const itemsContainer = modalOrderDetail.querySelector(".order-detail-items");
  itemsContainer.innerHTML = "";
  let total = 0;
  (o.items || []).forEach((it) => {
    const row = document.createElement("div");
    row.className = "order-detail-row";

    // resolve chi tiết sản phẩm từ bảng products theo id
    const product = getProductById(it.id);

    const name = it.name || it.title || product?.title || product?.name || "-";
    const qty = Number(it.quantity || 0);
    const unit = Number(it.unitPrice ?? it.price ?? product?.price ?? 0);
    const line = qty * unit;
    total += line;
    const imgSrc =
      product?.mainImage ||
      product?.image ||
      it.image ||
      "/img/blank-image.png";
    row.innerHTML = `
                <div class="order-detail-left">
                  <img src="${imgSrc}" alt="" />
                  <div class="order-detail-meta">
                    <div class="order-detail-name">${name}</div>
                    <div class="order-detail-qty">Số lượng: ${qty}</div>
                  </div>
                </div>
                <div class="order-detail-price">
                  <div>Đơn giá: ${formatCurrency(unit)}</div>
                  <div>Thành tiền: ${formatCurrency(line)}</div>
                </div>
            `;
    itemsContainer.appendChild(row);
  });

  const totalEl = modalOrderDetail.querySelector("#detail-order-total");
  if (totalEl) totalEl.textContent = formatCurrency(o.totalPrice ?? 0);

  const badge = modalOrderDetail.querySelector("#modal-order-status-badge");
  if (badge) {
    const map = {
      new: "New",
      processing: "Processing",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    badge.textContent = map[o.status] || o.status || "-";
    badge.className = "status-badge detail-status-badge " + (o.status || "new");
  }

  // wire nút đóng
  const closeBtn = modalOrderDetail.querySelector("#btn-close-order");
  if (closeBtn) closeBtn.onclick = () => closeOrderModal(modalOrderDetail);
  const headerClose = modalOrderDetail.querySelector(".modal-close");
  if (headerClose)
    headerClose.onclick = () => closeOrderModal(modalOrderDetail);

  modalOrderDetail.setAttribute("aria-hidden", "false");
}

function closeOrderModal(modalEl) {
  if (!modalEl) return;
  modalEl.setAttribute("aria-hidden", "true");
}

// -------------------------
// Hành vi modal Add Order
// -------------------------
function openAddOrderModal() {
  const addModal = ordersSection.querySelector("#addOrderModal");
  if (!addModal) return;
  const itemsContainer = addModal.querySelector(".add-order-items");
  const prodList =
    window.dataManager && window.dataManager.getAll
      ? window.dataManager.getAll("products")
      : [];

  // xóa và thêm dòng đầu tiên
  itemsContainer.innerHTML = "";
  addProductRow(itemsContainer, prodList);

  // tự động tạo idOrder numeric tiếp theo và hiển thị trong input readonly
  const orders = getAllOrders();
  const maxId = orders.reduce((m, x) => Math.max(m, Number(x.idOrder) || 0), 0);
  const nextId = maxId + 1;
  const idInput = addModal.querySelector("#add-order-id");
  if (idInput) idInput.value = String(nextId);

  // wire các nút bấm
  const addRowBtn = addModal.querySelector("#btn-add-product-row");
  if (addRowBtn)
    addRowBtn.onclick = () => addProductRow(itemsContainer, prodList);
  const saveBtn = addModal.querySelector("#btn-save-order");
  if (saveBtn) saveBtn.onclick = () => saveNewOrder(addModal);
  const cancelBtn = addModal.querySelector("#btn-cancel-add-order");
  if (cancelBtn) cancelBtn.onclick = () => closeOrderModal(addModal);
  const headerClose = addModal.querySelector(".modal-close");
  if (headerClose) headerClose.onclick = () => closeOrderModal(addModal);

  // áp dụng thuộc tính cho input phone và hành vi chỉ chấp nhận số
  const phoneInput = addModal.querySelector("#add-order-phone");
  if (phoneInput) {
    phoneInput.setAttribute("inputmode", "numeric");
    phoneInput.setAttribute("maxlength", "10");
    phoneInput.setAttribute("pattern", "0[0-9]{9}");
    if (!phoneInput.dataset._phoneListener) {
      phoneInput.addEventListener("input", (ev) => {
        const v = phoneInput.value || "";
        const digits = v.replace(/[^0-9]/g, "");
        if (digits !== v) phoneInput.value = digits;
        // áp dụng bắt đầu bằng 0 tự động nếu user gõ không có
        // (không tự động chèn, chỉ giữ nội dung)
        if (phoneInput.value.length > 10)
          phoneInput.value = phoneInput.value.slice(0, 10);
      });
      phoneInput.dataset._phoneListener = "1";
    }
  }

  recalcAddOrderTotal(addModal);
  addModal.setAttribute("aria-hidden", "false");
}

function addProductRow(container, prodList, defaultId) {
  const row = document.createElement("div");
  row.className = "add-order-row";
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "12px";
  row.style.marginTop = "8px";

  // select dropdown
  const select = document.createElement("select");
  select.className = "add-order-product-select";
  select.style.minWidth = "200px";
  const emptyOpt = document.createElement("option");
  emptyOpt.value = "";
  emptyOpt.textContent = "-- Select Product --";
  select.appendChild(emptyOpt);
  prodList.forEach((p) => {
    const o = document.createElement("option");
    o.value = String(p.id);
    o.textContent = p.title || p.name || "#" + p.id;
    o.dataset.price = String(p.price || 0);
    o.dataset.img = p.mainImage || p.image || "";
    select.appendChild(o);
  });
  if (defaultId) select.value = String(defaultId);

  // hình ảnh
  const img = document.createElement("img");
  img.src = "/img/blank-image.png";
  img.alt = "";
  img.style.width = "48px";
  img.style.height = "48px";
  img.style.objectFit = "cover";

  // đơn giá
  const unitSpan = document.createElement("span");
  unitSpan.className = "add-order-unit";
  unitSpan.dataset.price = "0";

  // số lượng
  const qty = document.createElement("input");
  qty.type = "number";
  qty.min = "1";
  qty.value = "1";
  qty.className = "add-order-qty";
  qty.style.width = "80px";
  qty.setAttribute("inputmode", "numeric");

  // tổng dòng
  const lineSpan = document.createElement("span");
  lineSpan.className = "add-order-line";

  // nút xóa
  const remBtn = document.createElement("button");
  remBtn.type = "button";
  remBtn.className = "btn-remove-order-row";
  remBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

  // sắp xếp theo thứ tự: hình ảnh, select, đơn giá, số lượng, tổng dòng, xóa
  row.appendChild(img);
  row.appendChild(select);
  row.appendChild(unitSpan);
  row.appendChild(qty);
  row.appendChild(lineSpan);
  row.appendChild(remBtn);

  // sự kiện
  function updateRow() {
    const pid = Number(select.value) || null;
    const prod = pid
      ? window.dataManager?.getById
        ? window.dataManager.getById("products", pid)
        : prodList.find((x) => x.id == pid)
      : null;
    if (prod) {
      img.src = prod.mainImage || prod.image || "/img/blank-image.png";
      unitSpan.textContent = formatCurrency(prod.price || 0);
      unitSpan.dataset.price = String(prod.price || 0);
      // áp dụng ràng buộc stock nếu product cung cấp stock
      const stock = Number(prod.stock || 0);
      if (stock > 0) {
        qty.max = String(stock);
        qty.title = `Max ${stock}`;
        // giới hạn nếu giá trị hiện tại vượt quá stock
        if (Number(qty.value || 0) > stock) qty.value = String(stock);
        qty.disabled = false;
      } else {
        // hết hàng -> set max thành 0 và disable qty
        qty.max = "0";
        qty.value = "0";
        qty.disabled = true;
        qty.title = "Out of stock";
      }
    } else {
      img.src = "/img/blank-image.png";
      unitSpan.textContent = formatCurrency(0);
      unitSpan.dataset.price = "0";
      qty.removeAttribute("max");
      qty.disabled = false;
      qty.title = "";
    }
    const q = Math.max(0, Number(qty.value) || 0);
    const unit = Number(unitSpan.dataset.price) || 0;
    lineSpan.textContent = formatCurrency(q * unit);
    recalcAddOrderTotal(container.closest("#addOrderModal"));
  }

  select.addEventListener("change", updateRow);
  qty.addEventListener("input", (e) => {
    // giới hạn theo max nếu được cung cấp
    const m = Number(qty.max || Infinity);
    const v = Number(qty.value || 0);
    if (v > m) {
      qty.value = String(m);
    }
    updateRow();
  });
  remBtn.addEventListener("click", () => {
    row.remove();
    recalcAddOrderTotal(container.closest("#addOrderModal"));
  });

  container.appendChild(row);
  // cập nhật ban đầu
  updateRow();
  return row;
}

function recalcAddOrderTotal(modalEl) {
  if (!modalEl) return;
  const items = modalEl.querySelectorAll(".add-order-row");
  let total = 0;
  items.forEach((r) => {
    const q = Number(r.querySelector(".add-order-qty")?.value || 0);
    const unit = Number(r.querySelector(".add-order-unit")?.dataset.price || 0);
    total += q * unit;
  });
  const totalEl = modalEl.querySelector("#add-order-total");
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function saveNewOrder(modalEl) {
  if (!modalEl) return;
  const username = (
    modalEl.querySelector("#add-order-username")?.value || ""
  ).trim();
  const phone = (modalEl.querySelector("#add-order-phone")?.value || "").trim();
  const address = (
    modalEl.querySelector("#add-order-address")?.value || ""
  ).trim();
  if (!username) {
    alert("Please enter username");
    return;
  }
  // kiểm tra phone: phải có 10 chữ số và bắt đầu bằng 0
  const phoneRe = /^0\d{9}$/;
  if (!phoneRe.test(phone)) {
    const ip = modalEl.querySelector("#add-order-phone");
    if (ip) ip.focus();
    alert(
      "Invalid phone number. Please enter 10 digits starting with 0."
    );
    return;
  }

  const rows = modalEl.querySelectorAll(".add-order-row");
  const items = [];
  for (const r of rows) {
    const pid = Number(
      r.querySelector(".add-order-product-select")?.value || 0
    );
    const qty = Math.max(
      0,
      Number(r.querySelector(".add-order-qty")?.value || 0)
    );
    if (!pid || qty <= 0) continue;
    const prod = window.dataManager?.getById
      ? window.dataManager.getById("products", pid)
      : null;
    const unit = prod
      ? Number(prod.price || 0)
      : Number(r.querySelector(".add-order-unit")?.dataset.price || 0);
    // kiểm tra so với stock nếu có
    const stock = prod ? Number(prod.stock || 0) : undefined;
    if (stock !== undefined && !Number.isNaN(stock) && qty > stock) {
      const name = prod?.title || prod?.name || "#" + pid;
      alert(
        `Quantity for product "${name}" exceeds stock (${stock}). Please adjust.`
      );
      return;
    }
    items.push({
      id: pid,
      quantity: qty,
      unitPrice: unit,
      amountPrice: qty * unit,
    });
  }
  if (items.length === 0) {
    alert("Please add at least 1 product with quantity > 0");
    return;
  }
  const total = items.reduce((s, it) => s + (it.amountPrice || 0), 0);

  // Sinh idOrder numeric theo schema
  const existing = dmGetAll("orders") || [];
  const maxExistingId = existing.reduce((m, x) => Math.max(m, Number(x.idOrder) || 0), 0);
  const generatedId = maxExistingId + 1;

  const newOrder = {
    idOrder: generatedId,
    username: username,
    items: items,
    totalPrice: total,
    date: new Date().toISOString(),
    status: "new",
    userDeliveryPhone: phone || null,
    userDeliveryAdress: address || null,
    // flag để chỉ ra rằng stock đã được điều chỉnh cho đơn hàng này
    _stockAdjusted: true,
  };

  // điều chỉnh tồn kho sản phẩm khi tạo đơn hàng mới
  (newOrder.items || []).forEach((it) => {
    const p = dmGetById("products", it.id) || getProductById(it.id);
    if (p) p.stock = Math.max(0, Number(p.stock || 0) - Number(it.quantity || 0));
  });

  // Lưu trữ qua dataManager wrapper
  dmAdd("orders", newOrder);
  dmSave();

  renderOrders();
  closeOrderModal(modalEl);
}

function wireListActions() {
  if (!containerOrders) return;
  // click handler cho các nút bấm
  containerOrders.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".btn-view-order");
    if (viewBtn) {
      const item = viewBtn.closest(".order-item");
      if (item) openOrderDetail(item.dataset.orderId);
      return;
    }
    // đã xóa xử lý nút edit (không còn trong DOM nữa)
    const delBtn = e.target.closest(".btn-delete-order");
    if (delBtn) {
      const item = delBtn.closest(".order-item");
      if (item) {
        if (confirm("Are you sure you want to delete this order?")) {
          const arr = window.dataManager?.data?.orders || [];
          const idx = arr.findIndex(
            (x) => (x.idOrder || "").toString() === item.dataset.orderId
          );
          if (idx !== -1) {
            arr.splice(idx, 1);
            if (window.dataManager && window.dataManager.save)
              window.dataManager.save();
          }
          item.remove();
        }
      }
      return;
    }
  });

  // xử lý thay đổi status select (delegated)
  containerOrders.addEventListener("change", (e) => {
    const sel = e.target.closest(".status-select");
    if (!sel) return;
    const item = sel.closest(".order-item");
    if (!item) return;
    const newStatus = (sel.value || "").toString().toLowerCase();

    // cập nhật CSS class trên select để giữ giao diện badge màu
    sel.className = "status-select status-badge " + newStatus;

    // cập nhật dữ liệu nền và lưu trữ
    const arr = window.dataManager?.data?.orders || [];
    const idx = arr.findIndex(
      (x) => (x.idOrder || "").toString() === item.dataset.orderId
    );
    if (idx !== -1) {
      const prevStatus = arr[idx].status;
      const targetStatus = newStatus;

      if (targetStatus === "cancelled" && arr[idx]._stockAdjusted) {
        (arr[idx].items || []).forEach((it) => {
          const p = getProductById(it.id);
          if (p) p.stock = Number(p.stock || 0) + Number(it.quantity || 0);
        });
        arr[idx]._stockAdjusted = false;
      }

      if (targetStatus === "delivered" && !arr[idx]._stockAdjusted) {
        // kiểm tra khả năng có sẵn
        for (const it of arr[idx].items || []) {
          const p = getProductById(it.id);
          const avail = Number(p?.stock || 0);
          const need = Number(it.quantity || 0);
          if (p && avail < need) {
            alert(
              `Not enough stock for product "${
                p.title || p.name || "#" + it.id
              }". Available: ${avail}, needed: ${need}.`
            );
            sel.value = prevStatus || "";
            sel.className =
              "status-select status-badge " + (prevStatus || "new");
            return;
          }
        }
        // trừ đi
        (arr[idx].items || []).forEach((it) => {
          const p = getProductById(it.id);
          if (p) p.stock = Number(p.stock || 0) - Number(it.quantity || 0);
        });
        arr[idx]._stockAdjusted = true;
      }

      arr[idx].status = newStatus;
      if (window.dataManager && typeof window.dataManager.save === "function")
        window.dataManager.save();
      renderOrders();
    }
  });
}

function initOrderModule() {
  // init idempotent: tránh wire hai lần
  if (window._orderModuleInited) return;

  ordersSection =
    document.getElementById("orders-section") ||
    document.querySelector(".orders-wrapper");
  if (!ordersSection) return;
  containerOrders = ordersSection.querySelector("#show-order-container");
  templateOrderItem = ordersSection.querySelector("#order-item-template");
  modalOrderDetail = ordersSection.querySelector("#orderDetailModal");
  // tham chiếu addOrder modal sẽ được dùng khi mở
  const addOrderBtn = document.getElementById("btn-add-order");
  if (addOrderBtn)
    addOrderBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      openAddOrderModal();
    });
  // wire select per-page scoped trong orders section
  perOrderPageSelectEl = ordersSection.querySelector("#per-page");
  pageOrderNavListEl = ordersSection.querySelector(".page-nav-list");

  if (perOrderPageSelectEl) {
    const v = parseInt(perOrderPageSelectEl.value, 10);
    if (!Number.isNaN(v)) perOrderPage = v;
    perOrderPageSelectEl.addEventListener("change", (ev) =>
      setPerOrderPage(ev.target.value)
    );
  }

  // tùy chọn: wire các control filter, search và refresh scoped trong orders section
  const filterSelect = ordersSection.querySelector("#filter-order-status");
  const searchInput = ordersSection.querySelector("#form-search-order");
  const refreshBtn = ordersSection.querySelector("#btn-refresh-order");

  if (filterSelect) {
    filterSelect.addEventListener("change", (ev) =>
      setOrderFilterStatus(ev.target.value)
    );
  }

  if (searchInput) {
    searchInput.addEventListener("input", (ev) =>
      setOrderSearchQuery(ev.target.value)
    );
  }

  // wire các input ngày
  const startInput = ordersSection.querySelector("#time-start-order");
  const endInput = ordersSection.querySelector("#time-end-order");
  if (startInput)
    startInput.addEventListener("change", (ev) =>
      setOrderStartDate(ev.target.value)
    );
  if (endInput)
    endInput.addEventListener("change", (ev) =>
      setOrderEndDate(ev.target.value)
    );

  if (refreshBtn) {
    refreshBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      refreshOrders();
    });
  }

  // ủy quyền clicks trên page nav trong orders section
  if (pageOrderNavListEl) {
    pageOrderNavListEl.addEventListener("click", (ev) => {
      const el = ev.target.closest && ev.target.closest("[data-page]");
      if (!el) return;
      if (el.tagName === "A") ev.preventDefault();
      const page = el.dataset && el.dataset.page;
      if (!page) return;
      goToOrderPage(page);
    });
  }

  renderOrders();
  wireListActions();
  window._orderModuleInited = true;
}

document.addEventListener("DOMContentLoaded", initOrderModule);

// ===============================
// ANALYTICS SCRIPT
// ===============================

// ===============================
// WAREHOUSE SCRIPT
// ===============================
