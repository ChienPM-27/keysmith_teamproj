// STORE SCRIPT - Hiển thị danh sách sản phẩm
import { dataManager } from "../js/admin/DatabaseManager.js";

// Từ detail.js
import { showProductDetailById } from "./detail.js";
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

export function formatCurrency(v) {
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
  
/**
 * Đặt số sản phẩm mỗi trang và render lại
 */
function setPerProductPage(n) {
  const v = parseInt(n, 10) || 1;
  perProductPage = Math.max(1, v);
  currentProductPage = 1;
  renderProducts();
}
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
  // Hiển thị section chi tiết sản phẩm đơn giản
  try {
    const storeView = document.getElementById("store-view");
    const detailView = document.getElementById("product-detail");
    const backBtn = document.getElementById("back-btn");

    // Nếu có detail section thì show và ẩn store view
    if (detailView) {
      // Hiển thị detail
      detailView.style.display = "block";
      // Ẩn store view
      if (storeView) storeView.style.display = "none";
      // Hiển thị nút back
      if (backBtn) backBtn.style.display = "inline-block";
    }

    // Thực hiện nạp dữ liệu chi tiết (nếu cần) — hiện tại để log
    console.log("Show detail for product:", productId);
  } catch (e) {
    console.error("Error showing product detail:", e);
  }
  showProductDetailById(productId);
}

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export function addToCart(productId, quantity = 1) {
  try {
    const product = dataManager.getById("products", productId);
    if (!product) {
      alert("Product not found!");
      return;
    }

    if (product.stock < quantity) {
      alert("Not enough stock!");
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
export function showToast(message, type = "info") {
  // Tìm hoặc tạo container cho toast
  let toastContainer = document.getElementById("ks-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "ks-toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `ks-toast ks-toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Tự động xóa sau 3 giây
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
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

  // Ẩn nút back mặc định (chỉ hiển thị khi ở detail hoặc cart)
  const backBtn = document.getElementById("back-btn");
  if (backBtn) backBtn.style.display = "none";

  // Khi click vào icon cart ở header — hiện back button (giả sử showCartView sẽ hiển thị #cart-view)
  const cartIcon = document.querySelector(".header-icons .cart");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      // showCartView may be defined elsewhere; just ensure back button visible when cart is requested
      if (backBtn) backBtn.style.display = "inline-block";
    });
  }

  // Xử lý click cho back button: trở về Store view
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const storeView = document.getElementById("store-view");
      const detailView = document.getElementById("product-detail");
      const cartView = document.getElementById("cart-view");

      // Nếu đang ở detail -> ẩn detail, hiển thị store
      if (detailView && detailView.style.display !== "none") {
        detailView.style.display = "none";
        if (storeView) storeView.style.display = "block";
        backBtn.style.display = "none";
        return;
      }

      // Nếu đang ở cart -> ẩn cart, hiển thị store
      if (cartView && cartView.style.display !== "none") {
        cartView.style.display = "none";
        if (storeView) storeView.style.display = "block";
        backBtn.style.display = "none";
        return;
      }

      // Mặc định: ẩn back và show store
      if (storeView) storeView.style.display = "block";
      backBtn.style.display = "none";
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