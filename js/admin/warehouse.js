// ===============================
// WAREHOUSE SCRIPT - Quản lý kho hàng
// ===============================

// DOM references và state cho warehouse module
let warehouseSection = null;
let containerWarehouse = null;
let templateWarehouseItem = null;
let modalImportDetail = null;
let modalAddImport = null;
let perWarehousePage = 8;
let currentWarehousePage = 1;
let pageWarehouseNavListEl = null;
let perWarehousePageSelectEl = null;

// Trạng thái bộ lọc/tìm kiếm warehouse
let currentWarehouseFilterStatus = "";
let currentWarehouseSearchQuery = "";
let currentWarehouseStartDate = "";
let currentWarehouseEndDate = "";

// Format currency
const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(v) {
  const n = Number(v) || 0;
  return fmtCurrency.format(n);
}

// ===============================
// HELPER FUNCTIONS - Lấy dữ liệu từ localStorage
// ===============================

/**
 * Lấy tất cả đơn nhập hàng từ dataManager
 */
function getAllImportOrders() {
  try {
    return window.dataManager && typeof window.dataManager.getAll === "function"
      ? window.dataManager.getAll("importOrders") || []
      : window.dataManager?.data?.importOrders || [];
  } catch (e) {
    return [];
  }
}

/**
 * Lấy tất cả sản phẩm từ dataManager
 */
function getAllProducts() {
  try {
    return window.dataManager && typeof window.dataManager.getAll === "function"
      ? window.dataManager.getAll("products") || []
      : window.dataManager?.data?.products || [];
  } catch (e) {
    return [];
  }
}

/**
 * Lấy sản phẩm theo ID
 */
function getProductById(id) {
  try {
    return window.dataManager && typeof window.dataManager.getById === "function"
      ? window.dataManager.getById("products", id)
      : (window.dataManager?.data?.products || []).find((p) => p.id == id) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Lấy import order theo ID
 */
function getImportOrderById(id) {
  try {
    return window.dataManager && typeof window.dataManager.getById === "function"
      ? window.dataManager.getById("importOrders", id)
      : (window.dataManager?.data?.importOrders || []).find((io) => io.idImportOrders == id) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Lưu dữ liệu vào localStorage
 */
function saveData() {
  if (window.dataManager && typeof window.dataManager.save === "function") {
    window.dataManager.save();
  }
}

/**
 * Chuẩn hóa import order cho UI
 */
function normalizeImportOrderForUI(io) {
  if (!io) return io;
  io.idImportOrders = io.idImportOrders || 0;
  io.productId = io.productId || io.id || 0;
  io.quantity = parseInt(io.quantity, 10) || 0;
  io.unitImportPrice = parseFloat(io.unitImportPrice) || 0;
  io.amountPrice = parseFloat(io.amountPrice) || 0;
  io.status = io.status || "processing";
  io.date = io.date || new Date().toISOString();
  return io;
}

// ===============================
// FILTERING & SORTING
// ===============================

/**
 * Áp dụng bộ lọc cho danh sách import orders
 */
function applyWarehouseFilters(list) {
  return (list || []).filter((io) => {
    // Filter by status
    if (currentWarehouseFilterStatus && io.status !== currentWarehouseFilterStatus) {
      return false;
    }

    // Search query - tìm theo product name hoặc ID
    if (currentWarehouseSearchQuery) {
      const q = currentWarehouseSearchQuery.toLowerCase();
      const product = getProductById(io.productId || io.id);
      const searchable = [
        product?.title || "",
        product?.name || "",
        String(io.idImportOrders || ""),
        String(io.productId || io.id || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Date range filtering
    if (currentWarehouseStartDate || currentWarehouseEndDate) {
      const ioDate = io.date || null;
      if (!ioDate) return false;
      const dt = new Date(ioDate);
      if (currentWarehouseStartDate) {
        const s = new Date(currentWarehouseStartDate);
        s.setHours(0, 0, 0, 0);
        if (dt < s) return false;
      }
      if (currentWarehouseEndDate) {
        const e = new Date(currentWarehouseEndDate);
        e.setHours(23, 59, 59, 999);
        if (dt > e) return false;
      }
    }

    return true;
  });
}

/**
 * Phân trang cho warehouse
 */
function paginateWarehouse(list, page, pageSize) {
  const total = (list || []).length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page || 1), totalPages);
  const start = (p - 1) * pageSize;
  const items = (list || []).slice(start, start + pageSize);
  return { items, total, totalPages, page: p };
}

// ===============================
// RENDERING FUNCTIONS
// ===============================

/**
 * Tạo DOM node cho import order item
 */
function createWarehouseNode(io) {
  if (!templateWarehouseItem) return null;
  normalizeImportOrderForUI(io);

  const frag = templateWarehouseItem.content.cloneNode(true);
  const item = frag.querySelector(".warehouse-item");
  if (item) item.dataset.importId = String(io.idImportOrders || "");

  // Import ID
  const importIdEl = frag.querySelector(".import-id");
  if (importIdEl) importIdEl.textContent = "#" + (io.idImportOrders || "");

  // Product info
  const product = getProductById(io.productId || io.id);
  const productNameEl = frag.querySelector(".product-name");
  if (productNameEl) {
    productNameEl.textContent = product?.title || product?.name || "Unknown Product";
  }

  // Product image
  const productImgEl = frag.querySelector(".product-img");
  if (productImgEl) {
    productImgEl.src = product?.mainImage || product?.image || "/img/blank-image.png";
  }

  // Quantity
  const quantityEl = frag.querySelector(".import-quantity");
  if (quantityEl) quantityEl.textContent = io.quantity || 0;

  // Unit price
  const unitPriceEl = frag.querySelector(".import-unit-price");
  if (unitPriceEl) unitPriceEl.textContent = formatCurrency(io.unitImportPrice || 0);

  // Total price
  const totalPriceEl = frag.querySelector(".import-total-price");
  if (totalPriceEl) totalPriceEl.textContent = formatCurrency(io.amountPrice || 0);

  // Date
  const dateEl = frag.querySelector(".import-date");
  if (dateEl) {
    try {
      dateEl.textContent = io.date ? new Date(io.date).toLocaleDateString() : "";
    } catch (e) {
      dateEl.textContent = "";
    }
  }

  // Status select
  const sel = frag.querySelector(".status-select");
  if (sel) {
    sel.value = io.status || "processing";
    sel.className = "status-select status-badge " + (io.status || "processing");
  }

  return frag;
}

/**
 * Render danh sách warehouse
 */
function renderWarehouse() {
  if (!containerWarehouse || !templateWarehouseItem) return;

  // Chỉ render khi warehouse section đang active
  const section =
    warehouseSection ||
    containerWarehouse?.closest(".warehouse-wrapper") ||
    document.getElementById("warehouse-section");
  if (section && !section.classList.contains("active")) return;

  containerWarehouse.innerHTML = "";

  const all = getAllImportOrders();
  const filtered = applyWarehouseFilters(all);
  perWarehousePage = Math.max(1, parseInt(perWarehousePage, 10) || 8);
  const { items, total, page } = paginateWarehouse(
    filtered,
    currentWarehousePage,
    perWarehousePage
  );
  currentWarehousePage = page;

  items.forEach((io) => {
    const node = createWarehouseNode(io);
    if (node) containerWarehouse.appendChild(node);
  });

  renderWarehousePaginationControls(total, currentWarehousePage, perWarehousePage);
}

/**
 * Render pagination controls
 */
function renderWarehousePaginationControls(totalItems, page, pageSize) {
  if (!pageWarehouseNavListEl) {
    pageWarehouseNavListEl =
      containerWarehouse?.closest(".warehouse-wrapper")?.querySelector(".page-nav-list") || null;
  }
  if (!pageWarehouseNavListEl) return;

  pageWarehouseNavListEl.innerHTML = "";
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

  pageWarehouseNavListEl.appendChild(makeItem("<<", 1, { disabled: page <= 1 }));
  pageWarehouseNavListEl.appendChild(
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
    pageWarehouseNavListEl.appendChild(
      makeItem(String(p), p, { active: p === page })
    );
  }

  pageWarehouseNavListEl.appendChild(
    makeItem(">", Math.min(totalPages, page + 1), { disabled: page >= totalPages })
  );
  pageWarehouseNavListEl.appendChild(
    makeItem(">>", totalPages, { disabled: page >= totalPages })
  );
}

// ===============================
// FILTER & CONTROL FUNCTIONS
// ===============================

function setWarehouseFilterStatus(status) {
  currentWarehouseFilterStatus = status || "";
  currentWarehousePage = 1;
  renderWarehouse();
}

function setWarehouseSearchQuery(q) {
  currentWarehouseSearchQuery = (q || "").toString().trim();
  currentWarehousePage = 1;
  renderWarehouse();
}

function setWarehouseStartDate(v) {
  currentWarehouseStartDate = (v || "").toString().trim();
  currentWarehousePage = 1;
  renderWarehouse();
}

function setWarehouseEndDate(v) {
  currentWarehouseEndDate = (v || "").toString().trim();
  currentWarehousePage = 1;
  renderWarehouse();
}

function setPerWarehousePage(n) {
  const v = parseInt(n, 10) || 1;
  perWarehousePage = Math.max(1, v);
  currentWarehousePage = 1;
  renderWarehouse();
}

function goToWarehousePage(p) {
  const importOrders = getAllImportOrders();
  const total = importOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / perWarehousePage));
  let page = parseInt(p, 10) || 1;
  page = Math.min(Math.max(1, page), totalPages);
  currentWarehousePage = page;
  renderWarehouse();
}

function refreshWarehouse() {
  const reloaded = window.dataManager?.load?.();
  if (reloaded) window.dataManager.data = reloaded;

  currentWarehouseFilterStatus = "";
  currentWarehouseSearchQuery = "";
  currentWarehousePage = 1;
  perWarehousePage = 8;

  const filterEl = warehouseSection?.querySelector("#filter-warehouse-status");
  if (filterEl) filterEl.value = "";
  const searchEl = warehouseSection?.querySelector("#form-search-warehouse");
  if (searchEl) searchEl.value = "";
  const perSel = perWarehousePageSelectEl || warehouseSection?.querySelector("#per-page");
  if (perSel) perSel.value = String(perWarehousePage);

  renderWarehouse();
}

// ===============================
// MODAL FUNCTIONS
// ===============================

/**
 * Mở modal thêm phiếu nhập hàng
 */
function openAddImportModal() {
  modalAddImport = warehouseSection?.querySelector("#addImportModal");
  if (!modalAddImport) return;

  const productSelect = modalAddImport.querySelector("#add-import-product");
  const products = getAllProducts();

  // Clear và populate product dropdown
  if (productSelect) {
    productSelect.innerHTML = '<option value="">-- Select Product --</option>';
    products.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.title || p.name || "#" + p.id;
      option.dataset.importPrice = p.importPrice || 0;
      productSelect.appendChild(option);
    });
  }

  // Auto-generate import ID
  const imports = getAllImportOrders();
  const maxId = imports.reduce((m, x) => Math.max(m, Number(x.idImportOrders) || 0), 0);
  const nextId = maxId + 1;
  const idInput = modalAddImport.querySelector("#add-import-id");
  if (idInput) idInput.value = String(nextId);

  // Wire buttons
  const saveBtn = modalAddImport.querySelector("#btn-save-import");
  const cancelBtn = modalAddImport.querySelector("#btn-cancel-add-import");
  const closeBtn = modalAddImport.querySelector(".modal-close");

  if (saveBtn) saveBtn.onclick = () => saveNewImport(modalAddImport);
  if (cancelBtn) cancelBtn.onclick = () => closeImportModal(modalAddImport);
  if (closeBtn) closeBtn.onclick = () => closeImportModal(modalAddImport);

  // Update unit price khi chọn sản phẩm
  if (productSelect) {
    productSelect.addEventListener("change", function () {
      const selected = this.options[this.selectedIndex];
      const unitPriceInput = modalAddImport.querySelector("#add-import-unit-price");
      if (unitPriceInput && selected) {
        unitPriceInput.value = selected.dataset.importPrice || 0;
      }
      recalcImportTotal();
    });
  }

  // Update total khi thay đổi quantity hoặc unit price
  const qtyInput = modalAddImport.querySelector("#add-import-quantity");
  const unitInput = modalAddImport.querySelector("#add-import-unit-price");
  if (qtyInput) qtyInput.addEventListener("input", recalcImportTotal);
  if (unitInput) unitInput.addEventListener("input", recalcImportTotal);

  modalAddImport.setAttribute("aria-hidden", "false");
}

function recalcImportTotal() {
  if (!modalAddImport) return;
  const qty = Number(modalAddImport.querySelector("#add-import-quantity")?.value || 0);
  const unit = Number(modalAddImport.querySelector("#add-import-unit-price")?.value || 0);
  const total = qty * unit;
  const totalEl = modalAddImport.querySelector("#add-import-total");
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function saveNewImport(modalEl) {
  if (!modalEl) return;

  const productId = Number(modalEl.querySelector("#add-import-product")?.value || 0);
  const quantity = Number(modalEl.querySelector("#add-import-quantity")?.value || 0);
  const unitPrice = Number(modalEl.querySelector("#add-import-unit-price")?.value || 0);

  if (!productId) {
    alert("Please select a product");
    return;
  }
  if (quantity <= 0) {
    alert("Quantity must be greater than 0");
    return;
  }
  if (unitPrice <= 0) {
    alert("Unit price must be greater than 0");
    return;
  }

  // Tạo import order mới
  const existing = getAllImportOrders();
  const maxId = existing.reduce((m, x) => Math.max(m, Number(x.idImportOrders) || 0), 0);
  const newId = maxId + 1;

  const newImport = {
    idImportOrders: newId,
    productId: productId,
    id: productId, // backward compatibility
    quantity: quantity,
    unitImportPrice: unitPrice,
    amountPrice: quantity * unitPrice,
    date: new Date().toISOString(),
    status: "processing",
  };

  // Thêm vào dataManager (sẽ tự động cập nhật stock)
  if (window.dataManager && typeof window.dataManager.add === "function") {
    window.dataManager.add("importOrders", newImport);
  } else {
    if (!window.dataManager.data.importOrders) {
      window.dataManager.data.importOrders = [];
    }
    window.dataManager.data.importOrders.push(newImport);
    
    // Cập nhật stock sản phẩm
    const product = getProductById(productId);
    if (product) {
      product.stock = (product.stock || 0) + quantity;
    }
  }

  saveData();
  renderWarehouse();
  closeImportModal(modalEl);
}

function closeImportModal(modalEl) {
  if (!modalEl) return;
  modalEl.setAttribute("aria-hidden", "true");
}

/**
 * Mở modal chi tiết import order
 */
function openImportDetail(importId) {
  modalImportDetail = warehouseSection?.querySelector("#importDetailModal");
  if (!modalImportDetail) return;

  const io = getImportOrderById(importId);
  if (!io) return;

  normalizeImportOrderForUI(io);

  const setText = (id, v) => {
    const el = modalImportDetail.querySelector("#" + id);
    if (el) el.textContent = v;
  };

  setText("detail-import-id", "#" + io.idImportOrders);

  const product = getProductById(io.productId || io.id);
  setText("detail-import-product", product?.title || product?.name || "Unknown");
  setText("detail-import-quantity", io.quantity || 0);
  setText("detail-import-unit-price", formatCurrency(io.unitImportPrice || 0));
  setText("detail-import-total", formatCurrency(io.amountPrice || 0));

  try {
    setText("detail-import-date", io.date ? new Date(io.date).toLocaleString() : "");
  } catch (e) {
    setText("detail-import-date", "");
  }

  const badge = modalImportDetail.querySelector("#modal-import-status-badge");
  if (badge) {
    const map = {
      processing: "Processing",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    badge.textContent = map[io.status] || io.status || "-";
    badge.className = "status-badge detail-status-badge " + (io.status || "processing");
  }

  const closeBtn = modalImportDetail.querySelector("#btn-close-import-detail");
  const headerClose = modalImportDetail.querySelector(".modal-close");
  if (closeBtn) closeBtn.onclick = () => closeImportModal(modalImportDetail);
  if (headerClose) headerClose.onclick = () => closeImportModal(modalImportDetail);

  modalImportDetail.setAttribute("aria-hidden", "false");
}

// ===============================
// EVENT WIRING
// ===============================

function wireWarehouseListActions() {
  if (!containerWarehouse) return;

  // Click handlers
  containerWarehouse.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".btn-view-import");
    if (viewBtn) {
      const item = viewBtn.closest(".warehouse-item");
      if (item) openImportDetail(item.dataset.importId);
      return;
    }

    const delBtn = e.target.closest(".btn-delete-import");
    if (delBtn) {
      const item = delBtn.closest(".warehouse-item");
      if (item) {
        if (confirm("Are you sure you want to delete this import order?")) {
          const arr = window.dataManager?.data?.importOrders || [];
          const idx = arr.findIndex((x) => x.idImportOrders == item.dataset.importId);
          if (idx !== -1) {
            // Hoàn trả stock nếu status là delivered
            const io = arr[idx];
            if (io.status === "delivered") {
              const product = getProductById(io.productId || io.id);
              if (product) {
                product.stock = Math.max(0, (product.stock || 0) - (io.quantity || 0));
              }
            }
            arr.splice(idx, 1);
            saveData();
          }
          item.remove();
        }
      }
      return;
    }
  });

  // Status change handler
  containerWarehouse.addEventListener("change", (e) => {
    const sel = e.target.closest(".status-select");
    if (!sel) return;
    const item = sel.closest(".warehouse-item");
    if (!item) return;

    const newStatus = (sel.value || "").toString().toLowerCase();
    sel.className = "status-select status-badge " + newStatus;

    const arr = window.dataManager?.data?.importOrders || [];
    const idx = arr.findIndex((x) => x.idImportOrders == item.dataset.importId);
    if (idx !== -1) {
      const prevStatus = arr[idx].status;
      const io = arr[idx];
      const product = getProductById(io.productId || io.id);

      // Xử lý thay đổi stock dựa trên status
      if (newStatus === "delivered" && prevStatus !== "delivered") {
        // Thêm stock khi chuyển sang delivered
        if (product) {
          product.stock = (product.stock || 0) + (io.quantity || 0);
        }
      } else if (prevStatus === "delivered" && newStatus !== "delivered") {
        // Trừ stock khi chuyển từ delivered sang status khác
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - (io.quantity || 0));
        }
      } else if (newStatus === "cancelled" && prevStatus === "processing") {
        // Trừ stock đã thêm trước đó khi tạo import order
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - (io.quantity || 0));
        }
      }

      arr[idx].status = newStatus;
      saveData();
      renderWarehouse();
    }
  });
}

// ===============================
// INITIALIZATION
// ===============================

function initWarehouseModule() {
  if (window._warehouseModuleInited) return;

  warehouseSection =
    document.getElementById("warehouse-section") ||
    document.querySelector(".warehouse-wrapper");
  if (!warehouseSection) return;

  containerWarehouse = warehouseSection.querySelector("#show-warehouse-container");
  templateWarehouseItem = warehouseSection.querySelector("#warehouse-item-template");
  perWarehousePageSelectEl = warehouseSection.querySelector("#per-page");
  pageWarehouseNavListEl = warehouseSection.querySelector(".page-nav-list");

  if (!containerWarehouse || !templateWarehouseItem) return;

  // Per-page select
  if (perWarehousePageSelectEl) {
    const v = parseInt(perWarehousePageSelectEl.value, 10);
    if (!isNaN(v)) perWarehousePage = v;
    perWarehousePageSelectEl.addEventListener("change", (ev) =>
      setPerWarehousePage(ev.target.value)
    );
  }

  // Filter controls
  const filterSelect = warehouseSection.querySelector("#filter-warehouse-status");
  const searchInput = warehouseSection.querySelector("#form-search-warehouse");
  const refreshBtn = warehouseSection.querySelector("#btn-refresh-warehouse");
  const addImportBtn = document.getElementById("btn-add-import");

  if (filterSelect) {
    filterSelect.addEventListener("change", (ev) =>
      setWarehouseFilterStatus(ev.target.value)
    );
  }

  if (searchInput) {
    searchInput.addEventListener("input", (ev) =>
      setWarehouseSearchQuery(ev.target.value)
    );
  }

  // Date filters
  const startInput = warehouseSection.querySelector("#time-start-warehouse");
  const endInput = warehouseSection.querySelector("#time-end-warehouse");
  if (startInput) {
    startInput.addEventListener("change", (ev) =>
      setWarehouseStartDate(ev.target.value)
    );
  }
  if (endInput) {
    endInput.addEventListener("change", (ev) => setWarehouseEndDate(ev.target.value));
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      refreshWarehouse();
    });
  }

  if (addImportBtn) {
    addImportBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      openAddImportModal();
    });
  }

  // Pagination
  if (pageWarehouseNavListEl) {
    pageWarehouseNavListEl.addEventListener("click", (ev) => {
      const el = ev.target.closest && ev.target.closest("[data-page]");
      if (!el) return;
      if (el.tagName === "A") ev.preventDefault();
      const page = el.dataset && el.dataset.page;
      if (!page) return;
      goToWarehousePage(page);
    });
  }

  wireWarehouseListActions();
  window._warehouseModuleInited = true;
}

// Export functions nếu cần
export {
  initWarehouseModule,
  renderWarehouse,
  refreshWarehouse,
  openAddImportModal,
};

// Auto-init khi DOM ready
document.addEventListener("DOMContentLoaded", initWarehouseModule);