// STORE SCRIPT - Hiển thị danh sách sản phẩm
import { dataManager } from "./admin/DatabaseManager.js";

// ===============================
// PRODUCT LISTING MODULE
// ===============================

// Tham chiếu DOM
let containerProducts = null;
let templateProductItem = null;

// Trạng thái pagination
let currentProductPage = 1;
let perProductPage = 8; // Hiển thị 8 sản phẩm mỗi trang (2 hàng x 4 cột)
let perProductPageSelectEl = null;
let pageProductNavListEl = null;

// Trạng thái bộ lọc/tìm kiếm sản phẩm
let currentProductStatus = ""; // "ready" hoặc "outofstock"
let currentProductBrand = "";
let currentProductCategory = "";
let currentProductColor = "";
let currentProductMinPrice = 0;
let currentProductMaxPrice = Infinity;
let currentProductSort = ""; // "incre-price" hoặc "decre-price"
let currentSearchQuery = "";

// Formatter cho giá tiền
const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(v) {
  return fmtCurrency.format(v || 0);
}

// ===============================
// HELPER FUNCTIONS - Lấy dữ liệu
// ===============================

/**
 * Lấy toàn bộ danh sách sản phẩm từ dataManager
 * @returns {Array} Mảng sản phẩm
 */
function getAllProducts() {
  try {
    return dataManager.getAll("products") || [];
  } catch (e) {
    return [];
  }
}

/**
 * Chuẩn hóa sản phẩm cho UI - đảm bảo các trường theo schema canonical
 * Schema từ DatabaseManager.js:
 * {
 *   id, title, shortDesc, longDesc, image, mainImage, thumbnails,
 *   specs: { category, brand, color },
 *   price, importPrice, stock, sold, status
 * }
 */
function normalizeProductForUI(p) {
  if (!p) return null;

  // Đảm bảo các trường canonical tồn tại
  p.id = p.id || 0;
  p.title = p.title || "Untitled Product";
  p.shortDesc = p.shortDesc || "";
  p.longDesc = p.longDesc || "";
  p.image = p.image || "/img/blank-image.png";
  p.mainImage = p.mainImage || p.image;
  p.thumbnails = p.thumbnails || [];
  p.specs = p.specs || {};
  p.specs.category = p.specs.category || "";
  p.specs.brand = p.specs.brand || "";
  p.specs.color = p.specs.color || "";
  p.price = parseFloat(p.price) || 0;
  p.importPrice = parseFloat(p.importPrice) || 0;
  p.stock = parseInt(p.stock, 10) || 0;
  p.sold = parseInt(p.sold, 10) || 0;
  p.status = p.status || "available";

  return p;
}

// ===============================
// FILTERING & SORTING
// ===============================

/**
 * Áp dụng các bộ lọc cho danh sách sản phẩm
 */
function applyProductFilters(list) {
  const arr = list || [];
  return arr.filter((p) => {
    normalizeProductForUI(p);

    // Lọc theo trạng thái tồn kho
    if (currentProductStatus === "ready" && p.stock <= 0) return false;
    if (currentProductStatus === "outofstock" && p.stock > 0) return false;

    // Lọc theo brand
    if (currentProductBrand && p.specs.brand !== currentProductBrand)
      return false;

    // Lọc theo category (collection)
    if (currentProductCategory && p.specs.category !== currentProductCategory)
      return false;

    // Lọc theo color
    if (currentProductColor && p.specs.color !== currentProductColor)
      return false;

    // Lọc theo khoảng giá
    if (p.price < currentProductMinPrice || p.price > currentProductMaxPrice)
      return false;

    // Lọc theo từ khóa tìm kiếm (title, shortDesc, category, brand)
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      const searchable = [
        p.title,
        p.shortDesc,
        p.specs.category,
        p.specs.brand,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Sắp xếp danh sách sản phẩm
 */
function sortProducts(list) {
  const arr = [...list];
  if (currentProductSort === "incre-price") {
    arr.sort((a, b) => a.price - b.price);
  } else if (currentProductSort === "decre-price") {
    arr.sort((a, b) => b.price - a.price);
  }
  return arr;
}

/**
 * Phân trang danh sách sản phẩm
 */
function paginateProducts(list, page, pageSize) {
  const all = list || [];
  const size = Math.max(1, parseInt(pageSize, 10) || 12);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const p = Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
  const start = (p - 1) * size;
  const items = all.slice(start, start + size);
  return { items, total, totalPages, page: p };
}

// ===============================
// RENDERING FUNCTIONS
// ===============================

/**
 * Tạo DOM node cho một sản phẩm từ template
 */
function createProductNode(p) {
  normalizeProductForUI(p);

  const frag = templateProductItem.content.cloneNode(true);
  const item = frag.querySelector(".pro");
  if (!item) return frag;

  // Lưu product id vào dataset để xử lý click sau
  item.dataset.productId = p.id;

  // Ảnh sản phẩm
  const img = frag.querySelector(".pro-img img");
  if (img) {
    img.src = p.mainImage || p.image || "/img/blank-image.png";
    img.alt = p.title;
  }

  // Collection (category)
  const collectionEl = frag.querySelector(".pro-collection");
  if (collectionEl) {
    collectionEl.textContent = p.specs.category || "General";
  }

  // Title
  const titleEl = frag.querySelector(".pro-title");
  if (titleEl) {
    titleEl.textContent = p.title;
  }

  // Price
  const priceEl = frag.querySelector(".pro-price");
  if (priceEl) {
    priceEl.textContent = formatCurrency(p.price);
  }

  // Add to cart button
  const btnAddToCart = frag.querySelector(".btn-add-to-cart");
  if (btnAddToCart) {
    btnAddToCart.dataset.productId = p.id;
    // Vô hiệu hóa nút nếu hết hàng
    if (p.stock <= 0) {
      btnAddToCart.disabled = true;
      btnAddToCart.title = "Out of stock";
      btnAddToCart.style.opacity = "0.5";
      btnAddToCart.style.cursor = "not-allowed";
    }
  }

  // Click vào sản phẩm để xem chi tiết
  if (item) {
    item.style.cursor = "pointer";
    item.addEventListener("click", (e) => {
      // Không chuyển trang nếu click vào nút add-to-cart
      if (e.target.closest(".btn-add-to-cart")) return;
      showProductDetail(p.id);
    });
  }

  return frag;
}

/**
 * Render toàn bộ danh sách sản phẩm với filter, sort, pagination
 */
function renderProducts() {
  if (!containerProducts) return;

  containerProducts.innerHTML = "";

  const allProducts = getAllProducts();
  let filtered = applyProductFilters(allProducts);
  filtered = sortProducts(filtered);

  const { items, total, page } = paginateProducts(
    filtered,
    currentProductPage,
    perProductPage
  );
  currentProductPage = page;

  // Render từng sản phẩm
  items.forEach((p) => {
    const node = createProductNode(p);
    containerProducts.appendChild(node);
  });

  // Render pagination controls
  renderPaginationControls(total, currentProductPage, perProductPage);

  // Cập nhật select per-page nếu có
  if (perProductPageSelectEl) {
    perProductPageSelectEl.value = perProductPage;
  }

  // Cập nhật tiêu đề số lượng sản phẩm
  updateProductCount(total);
}

/**
 * Render các nút phân trang
 */
function renderPaginationControls(totalItems, page, pageSize) {
  if (!pageProductNavListEl) {
    return;
  }

  pageProductNavListEl.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Helper tạo li > a
  const makeItem = (text, targetPage, opts = {}) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = text;
    if (opts.active) a.classList.add("active");
    if (opts.disabled) {
      a.classList.add("disabled");
      a.style.pointerEvents = "none";
      a.style.opacity = "0.5";
    }
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!opts.disabled) goToPage(targetPage);
    });
    li.appendChild(a);
    return li;
  };

  // Nút đầu tiên
  pageProductNavListEl.appendChild(
    makeItem("<<", 1, { disabled: page <= 1 })
  );

  // Nút trước
  pageProductNavListEl.appendChild(
    makeItem("<", Math.max(1, page - 1), { disabled: page <= 1 })
  );

  // Các nút trang
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageProductNavListEl.appendChild(
      makeItem(String(i), i, { active: i === page })
    );
  }

  // Nút sau
  pageProductNavListEl.appendChild(
    makeItem(">", Math.min(totalPages, page + 1), {
      disabled: page >= totalPages,
    })
  );

  // Nút cuối cùng
  pageProductNavListEl.appendChild(
    makeItem(">>", totalPages, { disabled: page >= totalPages })
  );
}

/**
 * Cập nhật tiêu đề hiển thị số lượng sản phẩm
 */
function updateProductCount(count) {
  const titleEl = document.querySelector("#store-view h1.title");
  if (titleEl) {
    titleEl.textContent = `In stock products (${count})`;
  }
}

/**
 * Đặt số sản phẩm mỗi trang và render lại
 */
function setPerProductPage(n) {
  const v = parseInt(n, 10) || 1;
  perProductPage = Math.max(1, v);
  currentProductPage = 1;
  renderProducts();
}

// ===============================
// FILTER & SEARCH CONTROLS
// ===============================

/**
 * Đặt bộ lọc trạng thái và render lại
 */
function setFilterStatus(status) {
  currentProductStatus = status;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc brand và render lại
 */
function setFilterBrand(brand) {
  currentProductBrand = brand;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc category và render lại
 */
function setFilterCategory(category) {
  currentProductCategory = category;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc color và render lại
 */
function setFilterColor(color) {
  currentProductColor = color;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt khoảng giá và render lại
 */
function setFilterPriceRange(min, max) {
  currentProductMinPrice = parseFloat(min) || 0;
  currentProductMaxPrice = parseFloat(max) || Infinity;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt sắp xếp và render lại
 */
function setSort(sort) {
  currentProductSort = sort;
  currentProductPage = 1;
  renderProducts();
}

/**
 * Đặt từ khóa tìm kiếm và render lại
 */
function setSearchQuery(query) {
  currentSearchQuery = query.trim();
  currentProductPage = 1;
  renderProducts();
}

/**
 * Chuyển trang
 */
function goToPage(page) {
  currentProductPage = page;
  renderProducts();
  // Scroll lên đầu danh sách sản phẩm
  const storeView = document.getElementById("store-view");
  if (storeView) {
    storeView.scrollIntoView({ behavior: "smooth" });
  }
}

// ===============================
// PRODUCT DETAIL & CART
// ===============================

/**
 * Hiển thị chi tiết sản phẩm (tích hợp với phần detail view có sẵn)
 */
function showProductDetail(productId) {
  // TODO: Tích hợp với phần product-detail section
  console.log("Show detail for product:", productId);
  // Có thể chuyển sang section #product-detail và điền thông tin
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
function addToCart(productId, quantity = 1) {
  try {
    const product = dataManager.getById("products", productId);
    if (!product) {
  showToast("Không tìm thấy sản phẩm!", "error");
  return;
}
if (product.stock < quantity) {
  showToast("Số lượng trong kho không đủ!", "warn");
  return;
}


    // Lấy giỏ hàng hiện tại từ localStorage
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        quantity: quantity,
        unitPrice: product.price,
        amountPrice: product.price * quantity,
      });
    }

    // Lưu lại giỏ hàng
    localStorage.setItem("cart", JSON.stringify(cart));

    // Hiển thị thông báo
    showToast("Product added to cart!", "success");

    // Cập nhật số lượng giỏ hàng trên header (nếu có)
    updateCartCount();
  } catch (e) {
    alert("Failed to add product to cart!");
  }
}

/**
 * Cập nhật số lượng items trong giỏ hàng (hiển thị trên icon giỏ)
 */
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartIcon = document.querySelector(".header-icons .cart");
  if (cartIcon) {
    // Thêm badge hiển thị số lượng
    let badge = cartIcon.querySelector(".cart-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "inline" : "none";
  }
}

/**
 * Hiển thị toast notification (cần có CSS hỗ trợ)
 */
// UNIFIED showToast wrapper — sử dụng toastManager nếu có, fallback nhẹ nếu không
function showToast(message, type = "info", opts = {}) {
  try {
    if (window && window.toastManager && typeof window.toastManager.show === 'function') {
      // toast.js manager có sẵn -> dùng
      return window.toastManager.show(message, type === 'warn' ? 'warn' : type, opts);
    }
  } catch (e) { /* ignore */ }

  // fallback đơn giản (nếu toast.js chưa load)
  let toastContainer = document.getElementById("ks-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "ks-toast-container";
    toastContainer.style.position = 'fixed';
    toastContainer.style.right = '20px';
    toastContainer.style.top = '20px';
    toastContainer.style.zIndex = '99999';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `ks-toast ks-toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, (opts.duration && typeof opts.duration === 'number') ? opts.duration : 3000);
}


// ===============================
// POPULATE FILTER DROPDOWNS
// ===============================

/**
 * Điền các option cho dropdown brands
 */
function populateBrandsDropdown() {
  const brandsSelect = document.getElementById("brands");
  if (!brandsSelect) return;

  const brands = dataManager.getAllBrands();
  brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandsSelect.appendChild(option);
  });
}

/**
 * Điền các option cho dropdown category
 */
function populateCategoryDropdown() {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  const categories = dataManager.getAllCategories();
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

/**
 * Điền các option cho dropdown color
 */
function populateColorDropdown() {
  const colorSelect = document.getElementById("color");
  if (!colorSelect) return;

  const colors = dataManager.getAllColors();
  colors.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });
}

// ===============================
// EVENT WIRING
// ===============================

/**
 * Gắn các event listener cho bộ lọc và tìm kiếm
 */
function wireFilterControls() {
  // Status filter
  const statusSelect = document.getElementById("status");
  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      setFilterStatus(e.target.value);
    });
  }

  // Brand filter
  const brandsSelect = document.getElementById("brands");
  if (brandsSelect) {
    brandsSelect.addEventListener("change", (e) => {
      setFilterBrand(e.target.value);
    });
  }

  // Category filter
  const categorySelect = document.getElementById("category");
  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      setFilterCategory(e.target.value);
    });
  }

  // Color filter
  const colorSelect = document.getElementById("color");
  if (colorSelect) {
    colorSelect.addEventListener("change", (e) => {
      setFilterColor(e.target.value);
    });
  }

  // Price range filter
  const priceMinInput = document.getElementById("price-min");
  const priceMaxInput = document.getElementById("price-max");
  if (priceMinInput && priceMaxInput) {
    const applyPriceFilter = () => {
      const min = parseFloat(priceMinInput.value) || 0;
      const max = parseFloat(priceMaxInput.value) || Infinity;
      setFilterPriceRange(min, max);
    };
    priceMinInput.addEventListener("change", applyPriceFilter);
    priceMaxInput.addEventListener("change", applyPriceFilter);
  }

  // Sort filter
  const sortSelect = document.getElementById("sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      setSort(e.target.value);
    });
  }

  // Search input
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  if (searchInput) {
    // Debounce search để tránh query quá nhiều
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        setSearchQuery(e.target.value);
      }, 300);
    });
  }
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      if (searchInput) {
        setSearchQuery(searchInput.value);
      }
    });
  }
}

/**
 * Gắn event listener cho nút Add to Cart
 */
function wireAddToCartButtons() {
  // Sử dụng event delegation trên container
  if (containerProducts) {
    containerProducts.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-add-to-cart");
      if (btn && !btn.disabled) {
        e.stopPropagation(); // Ngăn không cho trigger click vào sản phẩm
        const productId = parseInt(btn.dataset.productId, 10);
        if (productId) {
          addToCart(productId, 1);
        }
      }
    });
  }
}

// ===============================
// INITIALIZATION
// ===============================

/**
 * Khởi tạo module hiển thị sản phẩm
 */
function initProductModule() {
  // Lấy tham chiếu DOM
  containerProducts = document.getElementById("show-product-container");
  templateProductItem = document.getElementById("product-item-template");
  pageProductNavListEl = document.querySelector(".page-nav-list");
  perProductPageSelectEl = document.getElementById("per-page");

  if (!containerProducts) {
    return;
  }
  if (!templateProductItem) {
    return;
  }

  // Populate dropdowns
  populateBrandsDropdown();
  populateCategoryDropdown();
  populateColorDropdown();

  // Wire các controls
  wireFilterControls();
  wireAddToCartButtons();

  // Wire event cho select per-page
  if (perProductPageSelectEl) {
    perProductPageSelectEl.addEventListener("change", (e) => {
      setPerProductPage(e.target.value);
    });
  }

  // Render danh sách sản phẩm lần đầu
  renderProducts();

  // Cập nhật số lượng giỏ hàng
  updateCartCount();
}

// ===============================
// AUTO-INIT ON DOM READY
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initProductModule();
});

/* ==== QUICK FIX: đặt vào cuối /js/store.js ==== */

/* Hiển thị view giỏ hàng */
function showCartView() {
  const storeView = document.getElementById('store-view');
  const detailView = document.getElementById('product-detail');
  const cartView = document.getElementById('cart-view');

  if (storeView) storeView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';

  if (cartView) {
    // đảm bảo hiển thị (trường hợp css có !important)
    cartView.style.setProperty('display', 'flex', 'important');
    cartView.style.zIndex = '9999';
    // render lại nội dung giỏ
    if (typeof renderCartView === 'function') renderCartView();
    cartView.scrollIntoView({ behavior: 'smooth' });
  } else {
    console.warn('Element #cart-view không tồn tại trong DOM');
  }
}

/* Hiện lại trang store */
function showStoreView() {
  const storeView = document.getElementById('store-view');
  const detailView = document.getElementById('product-detail');
  const cartView = document.getElementById('cart-view');

  if (storeView) storeView.style.removeProperty('display'); // trả về default (block/section)
  if (detailView) detailView.style.setProperty('display', 'none');
  if (cartView) cartView.style.setProperty('display', 'none', 'important');
  // scroll lên header nếu cần
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* expose ra global để onclick trong HTML hoạt động (module scope không đưa hàm lên window) */
window.showCartView = showCartView;
window.showStoreView = showStoreView;


// ===== Checkout modal logic =====
(function () {
  const modal = document.getElementById('checkout-modal');
  // Stop clicks *inside* the dialog card from bubbling to backdrop; allow backdrop click to close
  document.querySelector('.checkout-card')?.addEventListener('click', (e) => e.stopPropagation());


  const backdrop = document.getElementById('checkout-backdrop');
  const closeBtn = document.getElementById('checkout-close');
  const cancelBtn = document.getElementById('btn-cancel');
  const placeBtn = document.getElementById('btn-place-order');
  const checkoutItemsEl = document.getElementById('checkout-items');
  const totalQtyEl = document.getElementById('checkout-total-qty');
  const totalMoneyEl = document.getElementById('checkout-total-money');

  // ----- Address helpers -----
  function getAddrInputs() {
    return {
      nameEl: document.getElementById('chk-name'),
      phoneEl: document.getElementById('chk-phone'),
      lineEl: document.getElementById('chk-line'),
      cityEl: document.getElementById('chk-city'),
      postalEl: document.getElementById('chk-postal'),
      addrTextEl: document.getElementById('addr-text'),
      addrDisplayEl: document.getElementById('address-display'),
      addrEditEl: document.getElementById('address-edit')
    };
  }

  function renderAddressText() {
    const { addrTextEl } = getAddrInputs();
    if (!addrTextEl) return;
    const a = (function(){
      try { return JSON.parse(localStorage.getItem('shipping') || 'null'); } catch { return null; }
    })();
    if (!a || !a.name) {
      addrTextEl.textContent = 'Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.';
    } else {
      addrTextEl.textContent = `${a.name} — ${a.phone} — ${a.line}, ${a.city}${a.postal ? ' ('+a.postal+')' : ''}`;
    }
  }

  function showAddressEdit() {
    const { addrDisplayEl, addrEditEl, nameEl, phoneEl, lineEl, cityEl, postalEl } = getAddrInputs();
    if (!addrDisplayEl || !addrEditEl) {
      if (typeof showToast === 'function') showToast('Form địa chỉ không tìm thấy', 'error');
      return;
    }
    const a = (function(){
      try { return JSON.parse(localStorage.getItem('shipping') || 'null'); } catch { return null; }
    })() || {};
    if (nameEl) nameEl.value = a.name || '';
    if (phoneEl) phoneEl.value = a.phone || '';
    if (lineEl) lineEl.value = a.line || '';
    if (cityEl) cityEl.value = a.city || '';
    if (postalEl) postalEl.value = a.postal || '';
    addrDisplayEl.style.display = 'none';
    addrEditEl.style.display = 'block';
  }

  function hideAddressEdit() {
    const { addrDisplayEl, addrEditEl } = getAddrInputs();
    if (!addrDisplayEl || !addrEditEl) return;
    addrDisplayEl.style.display = 'flex';
    addrEditEl.style.display = 'none';
  }

  function saveShippingAddressFromInputs() {
  const { nameEl, phoneEl, lineEl, cityEl, postalEl } = getAddrInputs();
  // safe-read values (use ?.value? to avoid calling .trim() on undefined)
  const name = (nameEl?.value ?? "").toString().trim();
  const phone = (phoneEl?.value ?? "").toString().trim();
  const line = (lineEl?.value ?? "").toString().trim();
  const city = (cityEl?.value ?? "").toString().trim();
  const postal = (postalEl?.value ?? "").toString().trim();

  if (!name || !phone || !line || !city) {
    if (typeof showToast === 'function') showToast('Vui lòng nhập đầy đủ thông tin địa chỉ', 'error');
    else alert('Vui lòng nhập đầy đủ thông tin địa chỉ');
    return false;
  }

  const obj = { name, phone, line, city, postal };
  try {
    localStorage.setItem('shipping', JSON.stringify(obj));
  } catch (e) { console.error(e); return false; }

  // update UI safely
  try { renderAddressText(); } catch(e){ console.error('renderAddressText error', e); }
  try { hideAddressEdit(); } catch(e){ /* ignore */ }

  if (typeof showToast === 'function') showToast('Đã lưu địa chỉ giao hàng', 'success');
  return true;
}


  // delegate clicks for address buttons inside modal (safer than direct element refs)
  document.addEventListener('click', function (e) {
    const el = e.target;
    if (!el) return;
    // Only act if inside checkout modal or relevant elements exist
    // Change
    if (el.closest && (el.closest('#addr-change-btn') || el.id === 'addr-change-btn')) {
      e.preventDefault(); e.stopPropagation();
      showAddressEdit();
      return;
    }
    // Cancel
    if (el.closest && (el.closest('#addr-cancel-btn') || el.id === 'addr-cancel-btn')) {
      e.preventDefault(); e.stopPropagation();
      hideAddressEdit();
      return;
    }
    // Save
    if (el.closest && (el.closest('#addr-save-btn') || el.id === 'addr-save-btn')) {
      e.preventDefault(); e.stopPropagation();
      saveShippingAddressFromInputs();
      return;
    }
  });

  // ----- Storage & format helpers -----
  function getCartFromStorage() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  }
  function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
  }
  function getShippingAddress() {
    try { return JSON.parse(localStorage.getItem('shipping') || 'null'); } catch { return null; }
  }

  function fmt(v) {
    try { if (typeof formatCurrency === 'function') return formatCurrency(Number(v)||0); } catch {}
    return new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(Number(v)||0);
  }
  function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  // Get selected ids in the cart table
  function getSelectedIdsFromCartTable() {
    try {
      const checkedBoxes = Array.from(document.querySelectorAll('#cart-table tbody input.choose-item:checked'));
      return checkedBoxes.map(cb => {
        const tr = cb.closest('tr');
        return tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
      }).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  // Render checkout items (only selected)
  function renderCheckoutItems() {
    if (!checkoutItemsEl) return;
    const cart = getCartFromStorage();
    checkoutItemsEl.innerHTML = '';

    const selectedIds = getSelectedIdsFromCartTable();
    if (!cart.length || !selectedIds.length) {
      if (!cart.length) checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Giỏ hàng trống</div>';
      else checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Bạn chưa chọn sản phẩm nào để thanh toán.</div>';
      if (totalQtyEl) totalQtyEl.textContent = '0';
      if (totalMoneyEl) totalMoneyEl.textContent = fmt(0);
      return;
    }

    const itemsToShow = cart.filter(it => selectedIds.includes(Number(it.id)));
    if (!itemsToShow.length) {
      checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Bạn chưa chọn sản phẩm nào để thanh toán.</div>';
      if (totalQtyEl) totalQtyEl.textContent = '0';
      if (totalMoneyEl) totalMoneyEl.textContent = fmt(0);
      return;
    }

    let totalQty = 0;
    let totalMoney = 0;

    itemsToShow.forEach(it => {
      const pid = it.id;
      const qty = Number(it.quantity) || 0;
      const unit = Number(it.unitPrice) || 0;
      totalQty += qty;
      totalMoney += qty * unit;

      let title = String(pid), thumb = '/img/blank-image.png';
      try {
        if (typeof dataManager !== 'undefined' && dataManager.getById) {
          const p = dataManager.getById('products', pid);
          if (p) { title = p.title || title; thumb = p.mainImage || p.image || thumb; }
        }
      } catch (e) {}

      const row = document.createElement('div');
      row.className = 'checkout-item';
      row.innerHTML = `
        <img src="${thumb}" alt="${escapeHtml(title)}" />
        <div class="meta">
          <div class="nm">${escapeHtml(title)}</div>
          <div class="qty">Qty: ${qty} — ${fmt(unit)} each</div>
        </div>
        <div class="line-total">${fmt(qty * unit)}</div>
      `;
      checkoutItemsEl.appendChild(row);
    });

    if (totalQtyEl) totalQtyEl.textContent = totalQty;
    if (totalMoneyEl) totalMoneyEl.textContent = fmt(totalMoney);
  }

  // open/close modal
  function openCheckout() {
    renderCheckoutItems();
    renderAddressText();
    hideAddressEdit();
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeCheckout() {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  // wire modal actions
  closeBtn?.addEventListener('click', closeCheckout);
  cancelBtn?.addEventListener('click', closeCheckout);
  backdrop?.addEventListener('click', closeCheckout);
  placeBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  // luôn ưu tiên gọi hàm global unified placeOrder (được bạn khai báo sau IIFE)
  if (typeof window.placeOrder === 'function') {
    try {
      window.placeOrder();
    } catch (err) {
      console.error('[checkout] calling global placeOrder failed', err);
      showToast?.('Lỗi khi đặt hàng', 'error');
    }
    return;
  }
  // nếu không có hàm global — báo lỗi rõ ràng (không gọi hàm nội bộ vì đã xóa)
  console.error('[checkout] unified placeOrder not found');
  showToast?.('Hệ thống chưa sẵn sàng để đặt hàng', 'error');
});




  // expose open/close
  window.showCheckout = openCheckout;
  window.closeCheckout = closeCheckout;

  // hook checkout open from cart's checkout button (if exists)
  document.addEventListener('DOMContentLoaded', () => {
    const footerCheckout = document.querySelector('.checkout-visual');
    if (footerCheckout) footerCheckout.addEventListener('click', (e) => {
      // openCheckout will guard against no selection via attachCheckoutGuards in cart code
      openCheckout();
    });
    renderAddressText();
  });
})();
/* ==========================
   Unified placeOrder (single canonical function)
   - Replace duplicates with this. It reads selected items, validates address, creates an order,
     saves to localStorage 'orders', removes selected items from 'cart', updates UI.
   ========================== */
function placeOrder() {
  // helpers referenced in your checkout IIFE (ensure these exist or adapt)
  function getCartFromStorage() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } }
  function saveCartToStorage(cart) { localStorage.setItem('cart', JSON.stringify(cart)); if (typeof updateCartCount === 'function') updateCartCount(); }
  function getShippingAddress() { try { return JSON.parse(localStorage.getItem('shipping') || 'null'); } catch { return null; } }

  // get selected ids from table
  const checkedBoxes = Array.from(document.querySelectorAll('#cart-table tbody input.choose-item:checked'));
  const selectedIds = checkedBoxes.map(cb => cb.closest('tr')?.dataset?.id).filter(Boolean).map(id => Number(id));
  if (!selectedIds.length) {
    showToast?.('Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán', 'error');
    return;
  }

  const addr = getShippingAddress();
  if (!addr || !addr.name || !addr.phone || !addr.line || !addr.city) {
    showToast?.('Vui lòng cung cấp địa chỉ giao hàng trước khi đặt', 'error');
    return;
  }

  const payment = (document.querySelector('input[name="payment"]:checked') || {}).value || 'cod';
  const cart = getCartFromStorage();
  const itemsToOrder = cart.filter(it => selectedIds.includes(Number(it.id)));
  if (!itemsToOrder.length) {
    showToast?.('Không có sản phẩm hợp lệ để đặt', 'error');
    return;
  }

  // create order
  const orders = (function(){ try { return JSON.parse(localStorage.getItem('orders') || '[]'); } catch { return []; } })();
  const orderId = 'ORD-' + Date.now();
  const detailedItems = itemsToOrder.map(it => {
    let title = `#${it.id}`; let thumb = '/img/blank-image.png';
    try {
      if (typeof dataManager !== 'undefined' && dataManager.getById) {
        const p = dataManager.getById('products', Number(it.id));
        if (p) { title = p.title || title; thumb = p.mainImage || p.image || thumb; }
      }
    } catch (e) {}
    const qty = Number(it.quantity)||0;
    const unit = Number(it.unitPrice)||0;
    return {
      id: Number(it.id),
      title,
      qty,
      unitPrice: unit,
      amount: qty * unit,
      thumb
    };
  });
  const totalAmount = detailedItems.reduce((s,i) => s + (i.amount||0), 0);
  const orderObj = {
    id: orderId,
    createdAt: new Date().toISOString(),
    items: detailedItems,
    total: totalAmount,
    shipping: addr,
    paymentMethod: payment,
    status: 'placed'
  };
  orders.unshift(orderObj);
  try { localStorage.setItem('orders', JSON.stringify(orders)); } catch (e) { console.error('save orders error', e); }

  // remove ordered items from cart
  const remaining = cart.filter(it => !selectedIds.includes(Number(it.id)));
  saveCartToStorage(remaining);

  // refresh UI
  try { if (typeof renderCheckoutItems === 'function') renderCheckoutItems(); } catch (e) {}
  try { if (typeof renderCartView === 'function') renderCartView(); } catch (e) {}
  try { if (typeof window.renderOrderHistory === 'function') window.renderOrderHistory(); } catch(e){}

  // close modal if exists
  try { if (typeof closeCheckout === 'function') closeCheckout(); } catch(e) {}
  showToast?.('Đặt hàng thành công — phương thức: ' + payment, 'success');
}
// đảm bảo hàm placeOrder có trên global scope
window.placeOrder = placeOrder;



/* ==== RENDER CART VIEW & INTERACTIONS ==== */
/* Dán vào cuối store.js (sau các hàm hiện có) */

(function () {
  const cartTableBodySelector = '#cart-table tbody';
  const cartTotalMoneyEl = document.querySelector('#cart-table .footer-money .money');
  const cartTotalCountEl = document.querySelector('#cart-table .footer-total .total');
  const clearBtn = document.querySelector('.btn-clear');

  // helper: read/write cart
  function readCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch (e) { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
  }

  // helper format currency (use formatCurrency if available)
  function fmt(v) {
    try { if (typeof formatCurrency === 'function') return formatCurrency(Number(v)||0); } catch (e) {}
    return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(v)||0);
  }

  // render the cart table body from localStorage
    // render the cart table body from localStorage
  function renderCartView() {
    const tbody = document.querySelector(cartTableBodySelector);
    if (!tbody) return;
    const cart = readCart();

    // --- SAVE selection state trước khi rebuild ---
    const previouslySelected = new Set();
    tbody.querySelectorAll('input.choose-item:checked').forEach(cb => {
      const tr = cb.closest('tr');
      const id = tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
      if (id !== null) previouslySelected.add(id);
    });

    tbody.innerHTML = '';

    if (!cart.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#777">Giỏ hàng trống</td></tr>`;
      updateCartFooter(0,0);
      // ensure selection-related UI updated
      setTimeout(() => {
        // re-wire selection handlers if any
        try { if (typeof wireSelectionHandlers === 'function') wireSelectionHandlers(); } catch(e){}
      }, 10);
      return;
    }

    let totalQty = 0;
    let totalMoney = 0;

    cart.forEach(item => {
      const id = item.id;
      const qty = Number(item.quantity) || 0;
      const unit = Number(item.unitPrice) || 0;
      totalQty += qty;
      totalMoney += qty * unit;

      // try to get product info
      let title = `#${id}`;
      let meta = '';
      let thumb = '/img/blank-image.png';
      try {
        if (typeof dataManager !== 'undefined' && dataManager.getById) {
          const p = dataManager.getById('products', id);
          if (p) {
            title = p.title || title;
            meta = (p.specs && p.specs.color) ? `• ${p.specs.color}` : (p.sku ? `• ${p.sku}` : '');
            thumb = p.mainImage || p.image || thumb;
          }
        }
      } catch (e) {}

      const tr = document.createElement('tr');
      tr.dataset.id = id;
      tr.innerHTML = `
        <td class="Choose"><input class="choose-item" type="checkbox" /></td>
        <td class="ProductInfo">
          <div class="product-info">
            <img src="${thumb}" alt="${escapeHtml(title)}" />
            <div>
              <div class="product-name">${escapeHtml(title)}</div>
              <div class="product-meta">${escapeHtml(meta)}</div>
            </div>
          </div>
        </td>
        <td class="Price">${fmt(unit)}</td>
        <td class="Quantity">
          <div class="qty-controls" data-id="${id}">
            <button class="qty-decrease" aria-label="Decrease">−</button>
            <input class="qty-input" type="number" value="${qty}" min="1" />
            <button class="qty-increase" aria-label="Increase">+</button>
          </div>
        </td>
        <td class="TotalPrice">${fmt(qty * unit)}</td>
        <td class="Actions">
          <button class="delete-one" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);

      // restore checkbox checked nếu trước đó đã chọn
      const cb = tr.querySelector('input.choose-item');
      if (cb && previouslySelected.has(id)) cb.checked = true;
    });

    updateCartFooter(totalQty, totalMoney);

    // sau khi render xong, trigger cập nhật selection-related UI (footer totals based on selected)
    // hàm updateFooterFromSelection nằm trong IIFE sau; chúng ta gọi global fallback nếu có
    setTimeout(() => {
      try {
        // prefer calling existing function in your other IIFE
        if (typeof updateFooterFromSelection === 'function') updateFooterFromSelection();
        // nếu không có, gọi thủ công tương tự:
        else {
          // compute selected totals here to sync footer if needed
          const selectedBoxes = Array.from(document.querySelectorAll('#cart-table tbody input.choose-item:checked'));
          if (!selectedBoxes.length) {
            // nothing selected -> keep footer as computed for all items (current behavior)
          } else {
            // recompute totals for selected items
            let selQty = 0, selMoney = 0;
            const map = new Map(readCart().map(it => [Number(it.id), it]));
            selectedBoxes.forEach(cb => {
              const tr = cb.closest('tr');
              const id = tr?.dataset?.id ? parseInt(tr.dataset.id,10) : null;
              if (id !== null) {
                const it = map.get(Number(id));
                if (it) { selQty += Number(it.quantity)||0; selMoney += (Number(it.quantity)||0) * (Number(it.unitPrice)||0); }
              }
            });
            // update footer display for selected
            const mEl = document.querySelector('#cart-table .footer-money .money');
            const cEl = document.querySelector('#cart-table .footer-total .total');
            if (mEl) mEl.textContent = fmt(selMoney);
            if (cEl) cEl.textContent = `Total (${selQty} items):`;
          }
        }
      } catch(e){/* ignore */ }
    }, 10);
  }


  // update footer display
  function updateCartFooter(totalQty, totalMoney) {
    if (cartTotalMoneyEl) cartTotalMoneyEl.textContent = fmt(totalMoney);
    if (cartTotalCountEl) cartTotalCountEl.textContent = `Total (${totalQty} items):`;
  }

  // escape html
  function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  // update quantity for itemId to newQty (and re-render)
  function updateItemQuantity(itemId, newQty) {
    const cart = readCart();
    const idx = cart.findIndex(c => c.id === itemId);
    if (idx === -1) return;
    const q = Math.max(1, parseInt(newQty,10) || 1);
    cart[idx].quantity = q;
    // keep amountPrice up-to-date if you store it
    cart[idx].amountPrice = (Number(cart[idx].unitPrice)||0) * q;
    writeCart(cart);
    renderCartView();
  }

  // remove item
  function removeItem(itemId) {
    let cart = readCart();
    cart = cart.filter(c => c.id !== itemId);
    writeCart(cart);
    renderCartView();
    if (typeof showToast === 'function') showToast('Đã xóa sản phẩm khỏi giỏ', 'info');
  }

  // clear cart
  function clearCart() {
    writeCart([]);
    renderCartView();
    if (typeof showToast === 'function') showToast('Đã xóa tất cả sản phẩm trong giỏ', 'info');
  }

  // event delegation for qty buttons, delete, input change
  document.addEventListener('click', function (e) {
    // Nếu click nằm trong modal checkout thì bỏ qua, không xử lý
    if (e.target.closest('#checkout-modal')) return;
    const inc = e.target.closest('.qty-increase');
    const dec = e.target.closest('.qty-decrease');
    const del = e.target.closest('.delete-one');
    const clear = e.target.closest('.btn-clear');
    const checkoutBtn = e.target.closest('.checkout-visual');

    if (inc || dec) {
      const wrapper = (inc || dec).closest('.qty-controls');
      if (!wrapper) return;
      const id = parseInt(wrapper.dataset.id,10);
      const input = wrapper.querySelector('.qty-input');
      let cur = Number(input.value)||1;
      if (inc) cur = cur + 1;
      if (dec) cur = Math.max(1, cur - 1);
      input.value = cur;
      updateItemQuantity(id, cur);
    }

    if (del) {
      const tr = del.closest('tr');
      const id = tr?.dataset?.id ? parseInt(tr.dataset.id,10) : null;
      if (id !== null) removeItem(id);
    }

    if (clear) {
      if (confirm('Xóa tất cả sản phẩm trong giỏ?')) clearCart();
    }

    if (checkoutBtn) {
      // open checkout modal (function from checkout code)
      if (typeof showCheckout === 'function') showCheckout();
      else alert('Open checkout');
    }
  });

  // input direct change
  document.addEventListener('input', function (e) {
    const el = e.target;
    if (!el.classList.contains('qty-input')) return;
    const tr = el.closest('tr');
    const id = tr?.dataset?.id ? parseInt(tr.dataset.id,10) : null;
    if (id === null) return;
    // don't update on every keystroke — wait until blur or Enter
  });

  // blur handler for qty input to commit change
  document.addEventListener('focusout', function (e) {
    const el = e.target;
    if (!el.classList.contains('qty-input')) return;
    const tr = el.closest('tr');
    const id = tr?.dataset?.id ? parseInt(tr.dataset.id,10) : null;
    if (id === null) return;
    const v = Math.max(1, parseInt(el.value,10) || 1);
    el.value = v;
    updateItemQuantity(id, v);
  });

  // ensure cart view renders when switching to cart
  window.renderCartView = renderCartView;

  // Ensure initial render if cart view is visible on page load
  document.addEventListener('DOMContentLoaded', () => {
    renderCartView();
    // hook checkout-visual button already wired in your code; redundancy safe
  });

  /* === Enhance existing addToCart: re-render cart view when item added === */
  // If addToCart already exists (your code), wrap it to call renderCartView after
  if (typeof addToCart === 'function') {
    const _origAdd = addToCart;
    window.addToCart = function wrappedAddToCart(productId, quantity = 1) {
      // call original (it will update localStorage & show toast)
      try {
        const ret = _origAdd(productId, quantity);
        // force render cart after short delay (in case original did async)
        setTimeout(() => {
          renderCartView();
        }, 60);
        return ret;
      } catch (e) {
        // fallback: try to implement simple add
        try {
          const product = (typeof dataManager !== 'undefined' && dataManager.getById) ? dataManager.getById('products', productId) : null;
          if (!product) { if (typeof showToast === 'function') showToast('Product not found', 'error'); return; }
          let cart = readCart();
          const ex = cart.find(it => it.id === productId);
          if (ex) ex.quantity = (ex.quantity||0) + quantity;
          else cart.push({ id: productId, quantity: quantity, unitPrice: product.price || 0 });
          writeCart(cart);
          renderCartView();
        } catch(err) { console.error(err); }
      }
    };
    // also expose globally if needed
    window.addToCart = window.addToCart;
  }
})();

/* ===== Fix: footer totals based on selected items + prevent checkout when none selected ===== */
(function () {
  // selectors
  const tbodySelector = '#cart-table tbody';
  const chooseAllSelector = '#chooseALL';
  const checkoutButtonsSelector = '.checkout-visual';
  const footerTotalMoneySelector = '#cart-table .footer-money .money';
  const footerTotalCountSelector = '#cart-table .footer-total .total';

  function readCart() {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  }
  function writeCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartCount === 'function') updateCartCount();
  }

  // currency helper (reuse if available)
  function fmt(v) {
    try { if (typeof formatCurrency === 'function') return formatCurrency(Number(v)||0); } catch (e) {}
    return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(v)||0);
  }

  // get selected item ids from DOM checkboxes
  function getSelectedIds() {
    const tbody = document.querySelector(tbodySelector);
    if (!tbody) return [];
    const checked = Array.from(tbody.querySelectorAll('input.choose-item:checked'));
    return checked.map(cb => {
      const tr = cb.closest('tr');
      return tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
    }).filter(Boolean);
  }

  // calculate totals for selected ids (if none selected -> zeros)
  function calculateSelectedTotals() {
    const cart = readCart();
    const sel = getSelectedIds();
    if (!sel.length) return { qty: 0, money: 0 };
    let qty = 0, money = 0;
    cart.forEach(it => {
      if (sel.includes(Number(it.id))) {
        const q = Number(it.quantity) || 0;
        const u = Number(it.unitPrice) || 0;
        qty += q;
        money += q * u;
      }
    });
    return { qty, money };
  }

  // Update footer display according to selected items
  function updateFooterFromSelection() {
    const totals = calculateSelectedTotals();
    const totalMoneyEl = document.querySelector(footerTotalMoneySelector);
    const totalCountEl = document.querySelector(footerTotalCountSelector);
    if (totalMoneyEl) totalMoneyEl.textContent = fmt(totals.money);
    if (totalCountEl) totalCountEl.textContent = `Total (${totals.qty} items):`;
    // toggle checkout buttons (disable if none selected)
    const checkoutBtns = document.querySelectorAll(checkoutButtonsSelector);
    checkoutBtns.forEach(btn => {
      if (totals.qty === 0) {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
      } else {
        btn.removeAttribute('disabled');
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
      }
    });
  }

  // wire selection events after cart rendered
  function wireSelectionHandlers() {
    const tbody = document.querySelector(tbodySelector);
    if (!tbody) return;
    // choose all checkbox
    const chooseAll = document.querySelector(chooseAllSelector);
    if (chooseAll) {
      // set initial state: if all rows checked -> checked, else false
      const rows = tbody.querySelectorAll('tr');
      chooseAll.checked = rows.length > 0 && Array.from(rows).every(r => r.querySelector('input.choose-item')?.checked);
      chooseAll.addEventListener('change', () => {
        const boxes = tbody.querySelectorAll('input.choose-item');
        boxes.forEach(cb => cb.checked = chooseAll.checked);
        updateFooterFromSelection();
      });
    }

    // for each row checkbox update footer & chooseAll
    tbody.querySelectorAll('input.choose-item').forEach(cb => {
      cb.removeEventListener('change', onRowCheckboxChange); // safe remove if previously bound
      cb.addEventListener('change', onRowCheckboxChange);
    });

    function onRowCheckboxChange() {
      // sync chooseAll
      const boxes = Array.from(tbody.querySelectorAll('input.choose-item'));
      const chooseAllEl = document.querySelector(chooseAllSelector);
      if (chooseAllEl) {
        chooseAllEl.checked = boxes.length > 0 && boxes.every(x => x.checked);
      }
      updateFooterFromSelection();
    }
  }

  // wrap existing renderCartView (if exists) to wire selection handlers & init footer
  if (typeof renderCartView === 'function') {
    const _orig = renderCartView;
    window.renderCartView = function wrappedRenderCartView() {
      const res = _orig();
      // short delay to ensure DOM rows inserted
      setTimeout(() => {
        wireSelectionHandlers();
        updateFooterFromSelection();
      }, 30);
      return res;
    };
    // also call once to ensure correct state
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        try { renderCartView(); } catch (e) {}
      }, 60);
    });
  } else {
    // if no renderCartView defined, create a minimal hook to update footer when DOM changes
    document.addEventListener('click', updateFooterFromSelection);
    document.addEventListener('focusout', updateFooterFromSelection);
    document.addEventListener('DOMContentLoaded', updateFooterFromSelection);
  }

  // intercept checkout button(s) to require selection
  function guardCheckoutClicks(e) {
    const selIds = getSelectedIds();
    if (!selIds.length) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán', 'error');
      else alert('Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán');
      return false;
    }
    // otherwise allow - existing showCheckout will open
    return true;
  }
  // attach to current and future checkout buttons
  function attachCheckoutGuards() {
    const btns = document.querySelectorAll(checkoutButtonsSelector);
    btns.forEach(b => {
      b.removeEventListener('click', guardCheckoutClicks);
      b.addEventListener('click', guardCheckoutClicks);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    attachCheckoutGuards();
    // also re-attach when cart is rendered (wrap a MutationObserver or hook to renderCartView)
    // simple approach: observe tbody for changes
    const tbody = document.querySelector(tbodySelector);
    if (tbody) {
      const mo = new MutationObserver(() => {
        attachCheckoutGuards();
        wireSelectionHandlers();
        updateFooterFromSelection();
      });
      mo.observe(tbody, { childList: true, subtree: true });
    }
  });

})();

// ---------- DEBUG + HARD FIX FOR ADDRESS HANDLERS ----------
(function(){
  // safe helpers mirrored from your IIFE
  function getAddrInputsSafe() {
    return {
      nameEl: document.getElementById('chk-name'),
      phoneEl: document.getElementById('chk-phone'),
      lineEl: document.getElementById('chk-line'),
      cityEl: document.getElementById('chk-city'),
      postalEl: document.getElementById('chk-postal'),
      addrTextEl: document.getElementById('addr-text'),
      addrDisplayEl: document.getElementById('address-display'),
      addrEditEl: document.getElementById('address-edit'),
      saveBtn: document.getElementById('addr-save-btn'),
      changeBtn: document.getElementById('addr-change-btn'),
      cancelBtn: document.getElementById('addr-cancel-btn')
    };
  }

  function renderAddressTextSafe() {
    const { addrTextEl } = getAddrInputsSafe();
    console.log('[ADDR] renderAddressTextSafe called. addrTextEl=', addrTextEl);
    if (!addrTextEl) return;
    let a = null;
    try { a = JSON.parse(localStorage.getItem('shipping') || 'null'); } catch (e) { console.error('[ADDR] parse shipping error', e); }
    if (!a || !a.name) {
      addrTextEl.textContent = 'Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.';
    } else {
      addrTextEl.textContent = `${a.name} — ${a.phone} — ${a.line}, ${a.city}${a.postal ? ' ('+a.postal+')' : ''}`;
    }
  }

  function hideAddressEditSafe() {
    const { addrDisplayEl, addrEditEl } = getAddrInputsSafe();
    if (!addrDisplayEl || !addrEditEl) return;
    addrDisplayEl.style.display = 'flex';
    addrEditEl.style.display = 'none';
  }

  function showAddressEditSafe() {
    const { addrDisplayEl, addrEditEl, nameEl, phoneEl, lineEl, cityEl, postalEl } = getAddrInputsSafe();
    if (!addrDisplayEl || !addrEditEl) {
      console.warn('[ADDR] address display/edit elements not found');
      return;
    }
    const a = (function(){ try { return JSON.parse(localStorage.getItem('shipping') || 'null'); } catch { return null; } })() || {};
    if (nameEl) nameEl.value = a.name || '';
    if (phoneEl) phoneEl.value = a.phone || '';
    if (lineEl) lineEl.value = a.line || '';
    if (cityEl) cityEl.value = a.city || '';
    if (postalEl) postalEl.value = a.postal || '';
    addrDisplayEl.style.display = 'none';
    addrEditEl.style.display = 'block';
  }

  function saveShippingAddressFromInputsSafe() {
    console.log('[ADDR] saveShippingAddressFromInputsSafe called');
    const { nameEl, phoneEl, lineEl, cityEl, postalEl } = getAddrInputsSafe();
    const name = (nameEl?.value ?? '').toString().trim();
    const phone = (phoneEl?.value ?? '').toString().trim();
    const line = (lineEl?.value ?? '').toString().trim();
    const city = (cityEl?.value ?? '').toString().trim();
    const postal = (postalEl?.value ?? '').toString().trim();

    console.log('[ADDR] values read:', { name, phone, line, city, postal });

    if (!name || !phone || !line || !city) {
      if (typeof showToast === 'function') showToast('Vui lòng nhập đầy đủ thông tin địa chỉ', 'error');
      else alert('Vui lòng nhập đầy đủ thông tin địa chỉ');
      return false;
    }

    const obj = { name, phone, line, city, postal };
    try {
      localStorage.setItem('shipping', JSON.stringify(obj));
      console.log('[ADDR] saved to localStorage:', obj);
    } catch (e) { console.error('[ADDR] localStorage set error', e); return false; }

    try { renderAddressTextSafe(); } catch(e){ console.error('[ADDR] renderAddressText error', e); }
    try { hideAddressEditSafe(); } catch(e){ console.error('[ADDR] hideAddressEdit error', e); }

    if (typeof showToast === 'function') showToast('Đã lưu địa chỉ giao hàng', 'success');
    return true;
  }

  // Attach direct listeners on DOMContentLoaded as a robust backup
  document.addEventListener('DOMContentLoaded', () => {
    const els = getAddrInputsSafe();
    console.log('[ADDR] attaching direct listeners', { found: !!els.saveBtn, els });

    if (els.saveBtn) {
      els.saveBtn.removeEventListener('click', saveShippingAddressFromInputsSafe);
      els.saveBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        saveShippingAddressFromInputsSafe();
      });
    }
    if (els.changeBtn) {
      els.changeBtn.removeEventListener('click', showAddressEditSafe);
      els.changeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); showAddressEditSafe(); });
    }
    if (els.cancelBtn) {
      els.cancelBtn.removeEventListener('click', (e)=>{});
      els.cancelBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); hideAddressEditSafe(); });
    }

    // initial render
    try { renderAddressTextSafe(); } catch(e){ console.error(e); }
  });

  // expose debug functions for console testing
  window.__addr_debug = {
    render: renderAddressTextSafe,
    showEdit: showAddressEditSafe,
    hideEdit: hideAddressEditSafe,
    saveTest: function(){ // convenience: save a test address
      localStorage.setItem('shipping', JSON.stringify({ name:'Test User', phone:'0123456789', line:'Test St', city:'HCM', postal:'70000' }));
      renderAddressTextSafe();
      console.log('[ADDR] saved test address to localStorage');
    },
    saveFromInputs: saveShippingAddressFromInputsSafe
  };
})();

/* --- Delete selected footer button --- */
(function () {
  function deleteSelectedFromCart() {
    try {
      const tbody = document.querySelector('#cart-table tbody');
      if (!tbody) return;
      // lấy selected ids
      const checked = Array.from(tbody.querySelectorAll('input.choose-item:checked'));
      if (!checked.length) {
        if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 sản phẩm để xóa', 'error');
        return;
      }
      const ids = checked.map(cb => {
        const tr = cb.closest('tr');
        return tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
      }).filter(Boolean);
      if (!ids.length) return;

      // confirm
      if (!confirm('Xóa các sản phẩm đã chọn?')) return;

      // read/write cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const remaining = cart.filter(it => !ids.includes(Number(it.id)));
      localStorage.setItem('cart', JSON.stringify(remaining));
      if (typeof renderCartView === 'function') renderCartView();
      if (typeof showToast === 'function') showToast('Đã xóa các sản phẩm đã chọn', 'info');
    } catch (e) {
      console.error('deleteSelectedFromCart error', e);
    }
  }

  // attach to current and future footer delete buttons
  document.addEventListener('click', function (e) {
    const delBtn = e.target.closest && e.target.closest('.delete-icon');
    if (delBtn) {
      e.preventDefault(); e.stopPropagation();
      deleteSelectedFromCart();
    }
  });
})();

/* ========================
   Order History as Modal (overlay) - replace previous order-history IIFE with this block
   ======================== */
(function () {
  const MODAL_ID = 'order-history-modal';
  const BACKDROP_ID = 'order-history-backdrop';
  const BTN_ID = 'btn-order-history';
  const ORDERS_KEY = 'orders';

  function readOrders() {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
    catch (e) { console.error('readOrders parse error', e); return []; }
  }
  function writeOrders(arr) {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(arr || [])); }
    catch (e) { console.error('writeOrders error', e); }
  }
  function fmtMoney(v) {
    try { if (typeof formatCurrency === 'function') return formatCurrency(Number(v)||0); } catch (e) {}
    // fallback
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v)||0);
  }
  function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  // create modal DOM (idempotent)
  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;
    // backdrop
    const backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2147483646;display:none;align-items:center;justify-content:center;'
    ].join('');
    // modal card
    modal = document.createElement('section');
    modal.id = MODAL_ID;
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.style.cssText = [
      'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);',
      'width:min(1100px,95%);max-height:80vh;overflow:auto;border-radius:12px;',
      'background:#fff;z-index:2147483647;box-shadow:0 20px 60px rgba(0,0,0,0.5);display:none;'
    ].join('');
    // header + close
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee;';
    header.innerHTML = `<h3 style="margin:0;font-size:1.05rem;">Lịch sử mua hàng</h3>`;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-ghost';
    closeBtn.style.cssText = 'margin-left:12px;';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closeModal);
    header.appendChild(closeBtn);

    // body container for content
    const body = document.createElement('div');
    body.id = MODAL_ID + '-body';
    body.style.cssText = 'padding:12px;overflow:auto;max-height:calc(80vh - 80px);';

    modal.appendChild(header);
    modal.appendChild(body);

    // append to document
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // close when clicking backdrop
    backdrop.addEventListener('click', closeModal);

    return modal;
  }

  function renderOrderHistory() {
    const modal = ensureModal();
    const body = document.getElementById(MODAL_ID + '-body');
    const orders = readOrders();

    const controlsHtml = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
        <button id="oh-refresh-btn" class="btn-ghost">Refresh</button>
        <button id="oh-clear-btn" class="btn-ghost">Xóa tất cả</button>
      </div>
    `;

    if (!orders.length) {
      body.innerHTML = controlsHtml + `<div style="padding:12px;color:#666">Chưa có đơn hàng nào.</div>`;
      attachModalListeners();
      return;
    }

    const rows = orders.map(o => {
      const created = new Date(o.createdAt).toLocaleString();
      const itemsSummary = (o.items || []).map(it => `${it.qty}× ${escapeHtml(it.title)}`).join(', ');
      return `
        <tr data-order-id="${escapeHtml(o.id)}">
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(o.id)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${created}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(o.shipping?.name||'—')}<br/><small>${escapeHtml(o.shipping?.line||'')}</small></td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${itemsSummary}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${fmtMoney(o.total)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            <button class="oh-view-btn btn-ghost" data-id="${escapeHtml(o.id)}">View</button>
            <button class="oh-delete-btn btn-ghost" data-id="${escapeHtml(o.id)}" style="margin-left:6px;">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    const tableHtml = `
      ${controlsHtml}
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Order ID</th>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Date</th>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Ship To</th>
              <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Items</th>
              <th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Total</th>
              <th style="padding:8px;border-bottom:2px solid #ddd;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
    body.innerHTML = tableHtml;
    attachModalListeners();
    return modal;
  }

  function attachModalListeners() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    // refresh & clear
    modal.querySelector('#oh-refresh-btn')?.addEventListener('click', (e) => { e.preventDefault(); renderOrderHistory(); });
    modal.querySelector('#oh-clear-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!confirm('Xóa tất cả lịch sử đơn hàng?')) return;
      writeOrders([]);
      renderOrderHistory();
      showToast?.('Đã xóa lịch sử đơn hàng','info');
    });
    // view & delete
    modal.querySelectorAll('.oh-view-btn').forEach(b => {
      b.removeEventListener('click', onViewOrder);
      b.addEventListener('click', onViewOrder);
    });
    modal.querySelectorAll('.oh-delete-btn').forEach(b => {
      b.removeEventListener('click', onDeleteOrder);
      b.addEventListener('click', onDeleteOrder);
    });
  }

  function onViewOrder(e) {
    e.preventDefault();
    const id = e.currentTarget?.dataset?.id;
    if (!id) return;
    const ord = readOrders().find(o => String(o.id) === String(id));
    if (!ord) { showToast?.('Order not found','error'); return; }
    const detail = [
      `Order: ${ord.id}`,
      `Date: ${new Date(ord.createdAt).toLocaleString()}`,
      `Payment: ${ord.paymentMethod || '—'}`,
      `Status: ${ord.status || '—'}`,
      `Shipping: ${ord.shipping?.name || '—'} — ${ord.shipping?.line || ''} (${ord.shipping?.phone || ''})`,
      'Items:',
      ...ord.items.map(it => ` - ${it.qty}× ${it.title} — ${fmtMoney(it.unitPrice)} each — ${fmtMoney(it.amount)}`)
    ].join('\n');
    alert(detail);
  }

  function onDeleteOrder(e) {
    e.preventDefault();
    const id = e.currentTarget?.dataset?.id;
    if (!id) return;
    if (!confirm('Xóa đơn hàng ' + id + '?')) return;
    let orders = readOrders();
    orders = orders.filter(o => String(o.id) !== String(id));
    writeOrders(orders);
    renderOrderHistory();
    showToast?.('Đã xóa đơn ' + id,'info');
  }

  // open/close modal
  function openModal() {
    renderOrderHistory();
    const backdrop = document.getElementById(BACKDROP_ID);
    const modal = ensureModal();
    backdrop.style.display = 'flex';
    modal.style.display = 'block';
    // prevent page scroll when modal open
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const backdrop = document.getElementById(BACKDROP_ID);
    const modal = document.getElementById(MODAL_ID);
    if (backdrop) backdrop.style.display = 'none';
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // wire button
  function ensureButton() {
    const cartContainer = document.querySelector('#cart-view .cart-container');
    if (!cartContainer) return;
    let wrapper = cartContainer.querySelector('.cart-actions-row');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'cart-actions-row';
      const hr = cartContainer.querySelector('hr');
      if (hr) hr.insertAdjacentElement('afterend', wrapper);
      else cartContainer.prepend(wrapper);
    }
    let btn = wrapper.querySelector(`#${BTN_ID}`);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.className = 'btn-ghost';
      btn.textContent = 'Lịch sử mua hàng';
      wrapper.appendChild(btn);
    }
    btn.removeEventListener('click', onBtnClick);
    btn.addEventListener('click', onBtnClick);
  }
  function onBtnClick(e) { e.preventDefault(); openModal(); }

  // expose API
  window.renderOrderHistory = renderOrderHistory;
  window.openOrderHistoryModal = openModal;
  window.closeOrderHistoryModal = closeModal;

  document.addEventListener('DOMContentLoaded', () => {
    ensureModal(); // create DOM nodes (hidden)
    ensureButton(); // ensure button exists and is wired
  });
})();
