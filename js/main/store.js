// ========================================
// 🏪 STORE MODULE - Quản lý trang cửa hàng
// ========================================
// Module chính xử lý hiển thị sản phẩm, giỏ hàng, thanh toán

// ========== IMPORTS ==========
import { dataManager } from "../admin/DatabaseManager.js";
import { formatCurrency, escapeHtml, updateCartCount } from "./utils.js";

// ========== CONSTANTS & CONFIG ==========
/**
 * Cấu hình phân trang mặc định
 */
const DEFAULT_PER_PAGE = 8;

/**
 * Trạng thái bộ lọc mặc định
 */
const DEFAULT_FILTERS = {
  status: "", // "ready" | "outofstock"
  brand: "",
  category: "",
  color: "",
  minPrice: 0,
  maxPrice: Infinity,
  sort: "", // "incre-price" | "decre-price"
  search: "",
};

/**
 * Formatter tiền tệ USD
 */
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ========== DOM REFERENCES ==========
/**
 * Tham chiếu các element DOM chính
 */
let containerProducts = null;
let templateProductItem = null;
let pageProductNavListEl = null;
let perProductPageSelectEl = null;

// ========== STATE MANAGEMENT ==========
/**
 * Trạng thái phân trang hiện tại
 */
let currentPage = 1;
let perPage = DEFAULT_PER_PAGE;

/**
 * Trạng thái bộ lọc hiện tại
 */
let currentFilters = { ...DEFAULT_FILTERS };

// ========== DATA MANAGEMENT ==========
/**
 * Lấy danh sách tất cả sản phẩm từ DatabaseManager
 * @returns {Array} Mảng sản phẩm
 */
function getAllProducts() {
  return dataManager.getAll("products") || [];
}

/**
 * Chuẩn hóa dữ liệu sản phẩm theo schema DatabaseManager
 * Schema: { id, title, specs: {category, brand, color}, price, stock, sold, status }
 * @param {Object} product - Đối tượng sản phẩm thô
 * @returns {Object} Sản phẩm đã chuẩn hóa
 */
function normalizeProduct(product) {
  if (!product) return null;

  return {
    id: product.id || 0,
    title: product.title || "Untitled Product",
    shortDesc: product.shortDesc || "",
    longDesc: product.longDesc || "",
    image: product.image || "/img/blank-image.png",
    mainImage: product.mainImage || product.image,
    thumbnails: product.thumbnails || [],
    specs: {
      category: product.specs?.category || "",
      brand: product.specs?.brand || "",
      color: product.specs?.color || "",
    },
    price: parseFloat(product.price) || 0,
    importPrice: parseFloat(product.importPrice) || 0,
    stock: parseInt(product.stock, 10) || 0,
    sold: parseInt(product.sold, 10) || 0,
    status: product.status || "available",
  };
}

// ========== FILTERING & SORTING ==========
/**
 * Áp dụng bộ lọc trạng thái tồn kho
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} status - Trạng thái lọc ("ready" | "outofstock")
 * @returns {Array} Danh sách đã lọc
 */
function filterByStatus(products, status) {
  if (!status) return products;

  return products.filter((product) => {
    if (status === "ready") return product.stock > 0;
    if (status === "outofstock") return product.stock <= 0;
    return true;
  });
}

/**
 * Áp dụng bộ lọc thương hiệu
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} brand - Thương hiệu cần lọc
 * @returns {Array} Danh sách đã lọc
 */
function filterByBrand(products, brand) {
  if (!brand) return products;
  return products.filter((product) => product.specs.brand === brand);
}

/**
 * Áp dụng bộ lọc danh mục
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} category - Danh mục cần lọc
 * @returns {Array} Danh sách đã lọc
 */
function filterByCategory(products, category) {
  if (!category) return products;
  return products.filter((product) => product.specs.category === category);
}

/**
 * Áp dụng bộ lọc màu sắc
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} color - Màu sắc cần lọc
 * @returns {Array} Danh sách đã lọc
 */
function filterByColor(products, color) {
  if (!color) return products;
  return products.filter((product) => product.specs.color === color);
}

/**
 * Áp dụng bộ lọc khoảng giá
 * @param {Array} products - Danh sách sản phẩm
 * @param {number} minPrice - Giá tối thiểu
 * @param {number} maxPrice - Giá tối đa
 * @returns {Array} Danh sách đã lọc
 */
function filterByPriceRange(products, minPrice, maxPrice) {
  return products.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
}

/**
 * Áp dụng bộ lọc từ khóa tìm kiếm
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Array} Danh sách đã lọc
 */
function filterBySearch(products, query) {
  if (!query) return products;

  const searchTerm = query.toLowerCase();
  return products.filter((product) => {
    const searchableText = [
      product.title,
      product.shortDesc,
      product.specs.category,
      product.specs.brand,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });
}

/**
 * Áp dụng tất cả bộ lọc
 * @param {Array} products - Danh sách sản phẩm gốc
 * @param {Object} filters - Đối tượng chứa các bộ lọc
 * @returns {Array} Danh sách đã lọc
 */
function applyAllFilters(products, filters) {
  let filtered = [...products];

  filtered = filterByStatus(filtered, filters.status);
  filtered = filterByBrand(filtered, filters.brand);
  filtered = filterByCategory(filtered, filters.category);
  filtered = filterByColor(filtered, filters.color);
  filtered = filterByPriceRange(filtered, filters.minPrice, filters.maxPrice);
  filtered = filterBySearch(filtered, filters.search);

  return filtered;
}

/**
 * Sắp xếp danh sách sản phẩm
 * @param {Array} products - Danh sách sản phẩm
 * @param {string} sortType - Kiểu sắp xếp ("incre-price" | "decre-price")
 * @returns {Array} Danh sách đã sắp xếp
 */
function sortProducts(products, sortType) {
  const sorted = [...products];

  if (sortType === "incre-price") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortType === "decre-price") {
    sorted.sort((a, b) => b.price - a.price);
  }

  return sorted;
}

/**
 * Phân trang danh sách sản phẩm
 * @param {Array} products - Danh sách sản phẩm
 * @param {number} page - Trang hiện tại
 * @param {number} pageSize - Số sản phẩm mỗi trang
 * @returns {Object} { items, total, totalPages, page }
 */
function paginateProducts(products, page, pageSize) {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = products.slice(start, start + pageSize);

  return { items, total, totalPages, page: currentPage };
}

// ========== RENDERING FUNCTIONS ==========
/**
 * Tạo DOM node cho một sản phẩm từ template
 * @param {Object} product - Sản phẩm đã chuẩn hóa
 * @returns {DocumentFragment} Fragment chứa DOM node sản phẩm
 */
function createProductNode(product) {
  const fragment = templateProductItem.content.cloneNode(true);
  const item = fragment.querySelector(".pro");

  if (!item) return fragment;

  // Gán ID sản phẩm
  item.dataset.productId = product.id;

  // Ảnh sản phẩm
  const img = fragment.querySelector(".pro-img img");
  if (img) {
    img.src = product.mainImage || product.image;
    img.alt = product.title;
  }

  // Danh mục (collection)
  const collectionEl = fragment.querySelector(".pro-collection");
  if (collectionEl) {
    collectionEl.textContent = product.specs.category || "General";
  }

  // Tiêu đề
  const titleEl = fragment.querySelector(".pro-title");
  if (titleEl) {
    titleEl.textContent = product.title;
  }

  // Giá
  const priceEl = fragment.querySelector(".pro-price");
  if (priceEl) {
    priceEl.textContent = formatCurrency(product.price);
  }

  // Nút thêm vào giỏ hàng
  const addToCartBtn = fragment.querySelector(".btn-add-to-cart");
  if (addToCartBtn) {
    addToCartBtn.dataset.productId = product.id;

    // Vô hiệu hóa nếu hết hàng
    if (product.stock <= 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.title = "Out of stock";
      addToCartBtn.style.opacity = "0.5";
      addToCartBtn.style.cursor = "not-allowed";
    }
  }

  // Click vào sản phẩm để xem chi tiết
  if (item) {
    item.style.cursor = "pointer";
    item.addEventListener("click", (e) => {
      // Không chuyển trang nếu click vào nút add-to-cart
      if (e.target.closest(".btn-add-to-cart")) return;
      showProductDetail(product.id);
    });
  }

  return fragment;
}

/**
 * Render danh sách sản phẩm vào container
 * @param {Array} products - Danh sách sản phẩm cần render
 */
function renderProductList(products) {
  containerProducts.innerHTML = "";

  products.forEach((product) => {
    if (product.stock <= 0 || product.status == "outofstock") return;

    const normalizedProduct = normalizeProduct(product);
    const node = createProductNode(normalizedProduct);
    containerProducts.appendChild(node);
  });
}

/**
 * Render controls phân trang
 * @param {number} totalItems - Tổng số sản phẩm
 * @param {number} currentPage - Trang hiện tại
 * @param {number} pageSize - Số sản phẩm mỗi trang
 */
function renderPaginationControls(totalItems, currentPage, pageSize) {
  if (!pageProductNavListEl) return;

  pageProductNavListEl.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Helper tạo nút phân trang
  const createPageButton = (text, targetPage, options = {}) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = text;

    if (options.active) a.classList.add("active");
    if (options.disabled) {
      a.classList.add("disabled");
      a.style.pointerEvents = "none";
      a.style.opacity = "0.5";
    }

    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (!options.disabled) goToPage(targetPage);
    });

    li.appendChild(a);
    return li;
  };

  // Nút đầu tiên
  pageProductNavListEl.appendChild(
    createPageButton("<<", 1, { disabled: currentPage <= 1 })
  );

  // Nút trước
  pageProductNavListEl.appendChild(
    createPageButton("<", Math.max(1, currentPage - 1), {
      disabled: currentPage <= 1,
    })
  );

  // Các nút trang
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageProductNavListEl.appendChild(
      createPageButton(String(i), i, { active: i === currentPage })
    );
  }

  // Nút sau
  pageProductNavListEl.appendChild(
    createPageButton(">", Math.min(totalPages, currentPage + 1), {
      disabled: currentPage >= totalPages,
    })
  );

  // Nút cuối cùng
  pageProductNavListEl.appendChild(
    createPageButton(">>", totalPages, { disabled: currentPage >= totalPages })
  );
}

/**
 * Cập nhật tiêu đề hiển thị số lượng sản phẩm
 * @param {number} count - Số lượng sản phẩm
 */
function updateProductCount(count) {
  const titleEl = document.querySelector("#store-view h1.title");
  if (titleEl) {
    titleEl.textContent = `In stock products (${count})`;
  }
}

/**
 * Render toàn bộ danh sách sản phẩm với filter, sort, pagination
 */
function renderProducts() {
  const allProducts = getAllProducts();
  let filtered = applyAllFilters(allProducts, currentFilters);
  filtered = sortProducts(filtered, currentFilters.sort);

  const { items, total, page } = paginateProducts(
    filtered,
    currentPage,
    perPage
  );
  currentPage = page;

  renderProductList(items);
  renderPaginationControls(total, currentPage, perPage);

  // Cập nhật select per-page
  if (perProductPageSelectEl) {
    perProductPageSelectEl.value = perPage;
  }

  updateProductCount(total);
}

// ========== FILTER CONTROLS ==========
/**
 * Đặt bộ lọc trạng thái và render lại
 * @param {string} status - Trạng thái mới
 */
function setFilterStatus(status) {
  currentFilters.status = status;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc thương hiệu và render lại
 * @param {string} brand - Thương hiệu mới
 */
function setFilterBrand(brand) {
  currentFilters.brand = brand;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc danh mục và render lại
 * @param {string} category - Danh mục mới
 */
function setFilterCategory(category) {
  currentFilters.category = category;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt bộ lọc màu sắc và render lại
 * @param {string} color - Màu sắc mới
 */
function setFilterColor(color) {
  currentFilters.color = color;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt khoảng giá và render lại
 * @param {number} min - Giá tối thiểu
 * @param {number} max - Giá tối đa
 */
function setFilterPriceRange(min, max) {
  currentFilters.minPrice = min;
  currentFilters.maxPrice = max;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt sắp xếp và render lại
 * @param {string} sort - Kiểu sắp xếp
 */
function setSort(sort) {
  currentFilters.sort = sort;
  currentPage = 1;
  renderProducts();
}

/**
 * Đặt từ khóa tìm kiếm và render lại
 * @param {string} query - Từ khóa tìm kiếm
 */
function setSearchQuery(query) {
  currentFilters.search = query.trim();
  currentPage = 1;
  renderProducts();
}

/**
 * Chuyển đến trang cụ thể
 * @param {number} page - Số trang
 */
function goToPage(page) {
  currentPage = page;
  renderProducts();

  // Scroll lên đầu danh sách sản phẩm
  const storeView = document.getElementById("store-view");
  if (storeView) {
    storeView.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Đặt số sản phẩm mỗi trang và render lại
 * @param {number} n - Số sản phẩm mỗi trang
 */
function setPerProductPage(n) {
  perPage = Math.max(1, parseInt(n, 10) || DEFAULT_PER_PAGE);
  currentPage = 1;
  renderProducts();
}

// ========== PRODUCT DETAIL & CART ==========
/**
 * Hiển thị chi tiết sản phẩm
 * @param {number} productId - ID sản phẩm
 */
async function showProductDetail(productId) {
  const storeView = document.getElementById("store-view");
  const detailView = document.getElementById("product-detail");
  const backBtn = document.getElementById("back-btn");

  // Hiển thị detail và ẩn store
  if (detailView) {
    detailView.style.display = "block";
  }
  if (storeView) {
    storeView.style.display = "none";
  }
  if (backBtn) {
    backBtn.style.display = "inline-block";
  }

  // Dynamic import để tránh circular dependency
  try {
    const { showProductDetailById } = await import("./detail.js");
    showProductDetailById(productId);
  } catch (error) {
    console.error("Failed to load product detail:", error);
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} productId - ID sản phẩm
 * @param {number} quantity - Số lượng
 */
export function addToCart(productId, quantity = 1) {
  const product = dataManager.getById("products", productId);
  if (!product) {
    if (window.showToast) {
      window.showToast("Không tìm thấy sản phẩm!", "error");
    } else {
      console.error("Không tìm thấy sản phẩm!");
    }
    return;
  }

  if (product.stock < quantity) {
    if (window.showToast) {
      window.showToast("Số lượng trong kho không đủ!", "warn");
    } else {
      console.warn("Số lượng trong kho không đủ!");
    }
    return;
  }

  // Lấy giỏ hàng hiện tại
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Kiểm tra sản phẩm đã có trong giỏ
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
  if (window.showToast) {
    window.showToast("Product added to cart!", "success");
  } else {
    console.log("Toast: Product added to cart!");
  }

  // Cập nhật số lượng giỏ hàng
  updateCartCount();
}

// ========== POPULATE FILTER DROPDOWNS ==========
/**
 * Điền options cho dropdown thương hiệu
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
 * Điền options cho dropdown danh mục
 */
function populateCategoryDropdown() {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  const categories = dataManager.getAllCategories();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

/**
 * Điền options cho dropdown màu sắc
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

// ========== EVENT WIRING ==========
/**
 * Gắn event listeners cho các controls bộ lọc
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

  // Search input với debounce
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  if (searchInput) {
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
  if (containerProducts) {
    containerProducts.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-add-to-cart");
      if (btn && !btn.disabled) {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId, 10);
        if (productId) {
          addToCart(productId, 1);
        }
      }
    });
  }
}

/**
 * Gắn event listeners cho các controls khác
 */
function wireOtherControls() {
  // Per-page select
  if (perProductPageSelectEl) {
    perProductPageSelectEl.addEventListener("change", (e) => {
      setPerProductPage(e.target.value);
    });
  }

  // Back button
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const storeView = document.getElementById("store-view");
      const detailView = document.getElementById("product-detail");
      const cartView = document.getElementById("cart-view");

      // Ẩn detail hoặc cart, hiển thị store
      if (detailView && detailView.style.display !== "none") {
        detailView.style.display = "none";
        if (storeView) storeView.style.display = "block";
        backBtn.style.display = "none";
        return;
      }

      if (cartView && cartView.style.display !== "none") {
        cartView.style.display = "none";
        if (storeView) storeView.style.display = "block";
        backBtn.style.display = "none";
        return;
      }

      // Mặc định hiển thị store
      if (storeView) storeView.style.display = "block";
      backBtn.style.display = "none";
    });
  }

  // Cart icon click
  const cartIcon = document.querySelector(".header-icons .cart");
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      if (backBtn) backBtn.style.display = "inline-block";
    });
  }
}

// ========== INITIALIZATION ==========
/**
 * Khởi tạo module hiển thị sản phẩm
 */
function initProductModule() {
  // Lấy tham chiếu DOM
  containerProducts = document.getElementById("show-product-container");
  templateProductItem = document.getElementById("product-item-template");
  pageProductNavListEl = document.querySelector(".page-nav-list");
  perProductPageSelectEl = document.getElementById("per-page");

  if (!containerProducts || !templateProductItem) {
    return;
  }

  // Populate dropdowns
  populateBrandsDropdown();
  populateCategoryDropdown();
  populateColorDropdown();

  // Wire events
  wireFilterControls();
  wireAddToCartButtons();
  wireOtherControls();

  // Ẩn back button mặc định
  const backBtn = document.getElementById("back-btn");
  if (backBtn) backBtn.style.display = "none";

  // Render lần đầu
  renderProducts();

  // Cập nhật cart count
  updateCartCount();
}

/**
 * Khởi tạo header và mobile nav cho trang store
 */
function initStorePageHeader() {
  if (!document.body.classList.contains("store-page")) return;

  const header = document.getElementById("header");
  const bar = document.getElementById("bar");
  const close = document.getElementById("close");
  const nav = document.getElementById("navbar");

  // Mobile menu toggles
  if (bar && nav)
    bar.addEventListener("click", () => nav.classList.add("active"));
  if (close && nav)
    close.addEventListener("click", () => nav.classList.remove("active"));

  // Click outside to close mobile nav
  document.addEventListener("click", function (e) {
    if (!nav || !bar) return;
    if (nav.classList.contains("active")) {
      if (!nav.contains(e.target) && !bar.contains(e.target)) {
        nav.classList.remove("active");
      }
    }
  });

  // Header hide on scroll
  let lastScroll = 0;
  window.addEventListener("scroll", function () {
    const current = window.pageYOffset || document.documentElement.scrollTop;
    if (!header) return;
    if (current <= 0) {
      header.classList.remove("hidden");
    } else if (current > lastScroll && current > 100) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }
    lastScroll = current;
  });
}

// ========== AUTO-INIT ON DOM READY ==========
document.addEventListener("DOMContentLoaded", () => {
  initProductModule();

  // Initialize store-page header & mobile nav
  if (typeof initStorePageHeader === "function") initStorePageHeader();
});
