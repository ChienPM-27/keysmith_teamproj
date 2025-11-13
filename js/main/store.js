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

const NON_DISPLAYABLE_STATUSES = new Set(["inactive", "deleted"]);

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
  const products = dataManager.getAll("products") || [];
  return products.filter(isProductDisplayable);
}

function isProductDisplayable(product) {
  if (!product) return false;
  const status = (product.status || "").toLowerCase();
  return !NON_DISPLAYABLE_STATUSES.has(status);
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
    }
    return;
  }

  const status = (product.status || "").toLowerCase();
  if (NON_DISPLAYABLE_STATUSES.has(status)) {
    if (window.showToast) {
      window.showToast("Sản phẩm không khả dụng.", "error");
    }
    return;
  }

  // Kiểm tra quantity hợp lệ
  if (quantity <= 0) {
    if (window.showToast) {
      window.showToast("Số lượng phải lớn hơn 0!", "error");
    }
    return;
  }

  // Lấy giỏ hàng hiện tại
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Tính tổng số lượng hiện tại trong giỏ
  const existingItem = cart.find((item) => item.id === productId);
  const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

  // Kiểm tra tổng số lượng sau khi thêm có vượt quá tồn kho không
  const totalQuantityAfterAdd = currentQuantityInCart + quantity;
  if (totalQuantityAfterAdd > product.stock) {
    if (window.showToast) {
      window.showToast(`Vượt quá tồn kho!`, "error");
    }
    return;
  }

  // Thêm/cập nhật sản phẩm trong giỏ
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.amountPrice = existingItem.unitPrice * existingItem.quantity;
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

  // Hiển thị thông báo thành công
  if (window.showToast) {
    window.showToast(`Product added to cart!`, "success");
  }

  // Cập nhật số lượng giỏ hàng
  updateCartCount();
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {number} productId - ID sản phẩm
 * @param {number} newQuantity - Số lượng mới
 */
export function updateCartQuantity(productId, newQuantity) {
  const product = dataManager.getById("products", productId);
  if (!product) {
    if (window.showToast) {
      window.showToast("Không tìm thấy sản phẩm!", "error");
    }
    return;
  }

  const status = (product.status || "").toLowerCase();
  if (NON_DISPLAYABLE_STATUSES.has(status)) {
    if (window.showToast) {
      window.showToast("Sản phẩm không khả dụng.", "error");
    }
    return;
  }

  // Kiểm tra quantity hợp lệ
  if (newQuantity <= 0) {
    if (window.showToast) {
      window.showToast("Số lượng phải lớn hơn 0!", "error");
    }
    return;
  }

  // Kiểm tra không vượt quá stock
  if (newQuantity > product.stock) {
    if (window.showToast) {
      window.showToast(`Không thể vượt quá tồn kho (${product.stock})!`, "error");
    }
    return;
  }

  // Lấy giỏ hàng hiện tại
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Tìm item
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.amountPrice = existingItem.unitPrice * newQuantity;
  } else {
    // Nếu chưa có, thêm mới
    cart.push({
      id: productId,
      quantity: newQuantity,
      unitPrice: product.price,
      amountPrice: product.price * newQuantity,
    });
  }

  // Lưu lại giỏ hàng
  localStorage.setItem("cart", JSON.stringify(cart));

  // Cập nhật số lượng giỏ hàng
  updateCartCount();

  // Hiển thị thông báo thành công
  if (window.showToast) {
    window.showToast("Đã cập nhật số lượng trong giỏ hàng!", "success");
  }
}

// ========== POPULATE FILTER DROPDOWNS ==========
/**
 * Điền options cho dropdown thương hiệu
 */
function populateBrandsDropdown() {
  const brandsSelect = document.getElementById("brands");
  if (!brandsSelect) return;

  const products = getAllProducts();
  const brands = Array.from(
    new Set(
      products
        .map((product) => product.specs?.brand)
        .filter((brand) => Boolean(brand))
    )
  );
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

  const products = getAllProducts();
  const categories = Array.from(
    new Set(
      products
        .map((product) => product.specs?.category)
        .filter((category) => Boolean(category))
    )
  );
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

  const products = getAllProducts();
  const colors = Array.from(
    new Set(
      products
        .map((product) => product.specs?.color)
        .filter((color) => Boolean(color))
    )
  );
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

// ========== GIỎ HÀNG (CART) MODULE ==========
// Module quản lý giỏ hàng, thanh toán và các chức năng liên quan

// ========== HELPER FUNCTIONS CHO GIỎ HÀNG ==========
/**
 * Lấy giỏ hàng từ localStorage
 * @returns {Array} Mảng các item trong giỏ hàng
 */
function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    console.error("Lỗi khi đọc giỏ hàng:", e);
    return [];
  }
}

/**
 * Lưu giỏ hàng vào localStorage
 * @param {Array} cart - Mảng các item trong giỏ hàng
 */
function saveCartToStorage(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  } catch (e) {
    console.error("Lỗi khi lưu giỏ hàng:", e);
  }
}

/**
 * Lấy địa chỉ giao hàng từ localStorage
 * @returns {Object|null} Đối tượng địa chỉ giao hàng
 */
function getShippingAddress() {
  try {
    return JSON.parse(localStorage.getItem("shipping") || "null");
  } catch (e) {
    return null;
  }
}

// ========== HIỂN THỊ GIỎ HÀNG ==========
/**
 * Hiển thị view giỏ hàng
 */
export function showCartView() {
  const storeView = document.getElementById("store-view");
  const detailView = document.getElementById("product-detail");
  const cartView = document.getElementById("cart-view");

  // Ẩn các view khác
  if (storeView) storeView.style.display = "none";
  if (detailView) detailView.style.display = "none";

  // Hiển thị cart view
  if (cartView) {
    cartView.style.setProperty("display", "flex", "important");
    cartView.style.zIndex = "9999";
    renderCartView();
    cartView.scrollIntoView({ behavior: "smooth" });
  } else {
    console.warn("Element #cart-view không tồn tại trong DOM");
  }
}

/**
 * Hiển thị lại trang store
 */
function showStoreView() {
  const storeView = document.getElementById("store-view");
  const detailView = document.getElementById("product-detail");
  const cartView = document.getElementById("cart-view");

  // Hiển thị store, ẩn các view khác
  if (storeView) storeView.style.removeProperty("display");
  if (detailView) detailView.style.setProperty("display", "none");
  if (cartView) cartView.style.setProperty("display", "none", "important");

  // Scroll lên đầu
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Render nội dung giỏ hàng
 */
function renderCartView() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) return;

  const cart = getCartFromStorage();

  // Lưu trạng thái checkbox đã chọn trước khi rebuild
  const previouslySelected = new Set();
  tbody.querySelectorAll("input.choose-item:checked").forEach(cb => {
    const tr = cb.closest("tr");
    const id = tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
    if (id !== null) previouslySelected.add(id);
  });

  tbody.innerHTML = "";

  if (!cart.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:18px;color:#777">Giỏ hàng trống</td></tr>`;
    updateCartFooter(0, 0);
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

    // Lấy thông tin sản phẩm
    let title = `#${id}`;
    let meta = "";
    let thumb = "/img/blank-image.png";
    try {
      if (dataManager) {
        const p = dataManager.getById("products", id);
        if (p) {
          title = p.title || title;
          meta = (p.specs && p.specs.color) ? `• ${p.specs.color}` : (p.sku ? `• ${p.sku}` : "");
          thumb = p.mainImage || p.image || thumb;
        }
      }
    } catch (e) {
      // Sử dụng thông tin mặc định nếu không lấy được
    }

    const tr = document.createElement("tr");
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
      <td class="Price">${formatCurrency(unit)}</td>
      <td class="Quantity">
        <div class="qty-controls" data-id="${id}">
          <button class="qty-decrease" aria-label="Giảm">−</button>
          <input class="qty-input" type="number" value="${qty}" min="1" />
          <button class="qty-increase" aria-label="Tăng">+</button>
        </div>
      </td>
      <td class="TotalPrice">${formatCurrency(qty * unit)}</td>
      <td class="Actions">
        <button class="delete-one" title="Xóa"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // Khôi phục trạng thái checkbox
    const cb = tr.querySelector("input.choose-item");
    if (cb && previouslySelected.has(id)) cb.checked = true;
  });

  updateCartFooter(totalQty, totalMoney);

  // Wire selection handlers sau khi render
  setTimeout(() => {
    wireSelectionHandlers();
    updateFooterFromSelection();
  }, 10);
}

/**
 * Cập nhật footer giỏ hàng
 * @param {number} totalQty - Tổng số lượng
 * @param {number} totalMoney - Tổng tiền
 */
function updateCartFooter(totalQty, totalMoney) {
  const totalMoneyEl = document.querySelector("#cart-table .footer-money .money");
  const totalCountEl = document.querySelector("#cart-table .footer-total .total");

  if (totalMoneyEl) totalMoneyEl.textContent = formatCurrency(totalMoney);
  if (totalCountEl) totalCountEl.textContent = `Total (${totalQty} items):`;
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ
 * @param {number} itemId - ID sản phẩm
 * @param {number} newQty - Số lượng mới
 */
export function updateItemQuantity(itemId, newQty) {
  const cart = getCartFromStorage();
  const idx = cart.findIndex(c => c.id === itemId);
  if (idx === -1) return;

  // Lấy thông tin sản phẩm để check stock
  let productStock = 0;
  if (dataManager) {
    const product = dataManager.getById("products", itemId);
    if (product) {
      productStock = Number(product.stock) || 0;
    }
  }

  // Validate số lượng không vượt quá stock
  const q = Math.max(1, Math.min(parseInt(newQty, 10) || 1, productStock));

  // Nếu vượt quá stock, hiển thị warning và set về max cho phép
  if (parseInt(newQty, 10) > productStock) {
    showToast(`Không thể vượt quá tồn kho!`, "warn");
  }

  cart[idx].quantity = q;
  cart[idx].amountPrice = (Number(cart[idx].unitPrice) || 0) * q;

  saveCartToStorage(cart);
  renderCartView();
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {number} itemId - ID sản phẩm cần xóa
 */
function removeItem(itemId) {
  let cart = getCartFromStorage();
  cart = cart.filter(c => c.id !== itemId);
  saveCartToStorage(cart);
  renderCartView();
  showToast("Đã xóa sản phẩm khỏi giỏ", "info");
}

/**
 * Xóa tất cả sản phẩm trong giỏ
 */
function clearCart() {
  saveCartToStorage([]);
  renderCartView();
  showToast("Đã xóa tất cả sản phẩm trong giỏ", "info");
}

// ========== XỬ LÝ SỰ KIỆN GIỎ HÀNG ==========
/**
 * Gắn event listeners cho các nút trong giỏ hàng
 */
function wireCartEvents() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) return;

  // Event delegation cho các nút trong giỏ hàng
  document.addEventListener("click", function(e) {
    // Nếu đang ở trong modal checkout thì bỏ qua
    if (e.target.closest("#checkout-modal")) return;

    const inc = e.target.closest(".qty-increase");
    const dec = e.target.closest(".qty-decrease");
    const del = e.target.closest(".delete-one");
    const clear = e.target.closest(".btn-clear");
    const checkoutBtn = e.target.closest(".checkout-visual");

    if (inc || dec) {
      const wrapper = (inc || dec).closest(".qty-controls");
      if (!wrapper) return;
      const id = parseInt(wrapper.dataset.id, 10);
      const input = wrapper.querySelector(".qty-input");
      let cur = Number(input.value) || 1;

      // Lấy stock của sản phẩm
      let productStock = 0;
      if (dataManager) {
        const product = dataManager.getById("products", id);
        if (product) {
          productStock = Number(product.stock) || 0;
        }
      }

      if (inc) {
        cur = Math.min(cur + 1, productStock);
      }
      if (dec) {
        cur = Math.max(1, cur - 1);
      }

      input.value = cur;
      updateItemQuantity(id, cur);
    }

    if (del) {
      const tr = del.closest("tr");
      const id = tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
      if (id !== null) removeItem(id);
    }

    if (clear) {
      if (confirm("Xóa tất cả sản phẩm trong giỏ?")) clearCart();
    }

    if (checkoutBtn) {
      showCheckout();
    }
  });

  // Xử lý input số lượng trực tiếp
  document.addEventListener("focusout", function(e) {
    const el = e.target;
    if (!el.classList.contains("qty-input")) return;
    const tr = el.closest("tr");
    const id = tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
    if (id === null) return;
    const v = Math.max(1, parseInt(el.value, 10) || 1);
    el.value = v;
    updateItemQuantity(id, v);
  });
}

// ========== THANH TOÁN (CHECKOUT) ==========
/**
 * Hiển thị modal thanh toán
 */
function showCheckout() {
  // Kiểm tra có sản phẩm được chọn không
  const selectedIds = getSelectedIds();
  if (!selectedIds.length) {
    showToast("Chọn ít nhất 1 sản phẩm trước khi thanh toán", "warn");
    return;
  }

  renderCheckoutItems();
  renderAddressText();

  const modal = document.getElementById("checkout-modal");

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

/**
 * Đóng modal thanh toán
 */
function closeCheckout() {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/**
 * Lấy danh sách ID sản phẩm được chọn
 * @returns {Array} Mảng các ID được chọn
 */
function getSelectedIds() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) return [];

  const checked = Array.from(tbody.querySelectorAll("input.choose-item:checked"));
  return checked.map(cb => {
    const tr = cb.closest("tr");
    return tr?.dataset?.id ? parseInt(tr.dataset.id, 10) : null;
  }).filter(Boolean);
}

/**
 * Render các sản phẩm đã chọn trong modal thanh toán
 */
function renderCheckoutItems() {
  const checkoutItemsEl = document.getElementById("checkout-items");
  if (!checkoutItemsEl) return;

  checkoutItemsEl.innerHTML = "";
  const cart = getCartFromStorage();
  const selectedIds = getSelectedIds();

  if (!cart.length || !selectedIds.length) {
    if (!cart.length) {
      checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Giỏ hàng trống</div>';
    } else {
      checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Bạn chưa chọn sản phẩm nào để thanh toán.</div>';
    }
    updateCheckoutTotals(0, 0);
    return;
  }

  const itemsToShow = cart.filter(it => selectedIds.includes(Number(it.id)));
  if (!itemsToShow.length) {
    checkoutItemsEl.innerHTML = '<div style="padding:14px;text-align:center;color:#777">Bạn chưa chọn sản phẩm nào để thanh toán.</div>';
    updateCheckoutTotals(0, 0);
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

    let title = String(pid);
    let thumb = "/img/blank-image.png";
    try {
      if (dataManager) {
        const p = dataManager.getById("products", pid);
        if (p) {
          title = p.title || title;
          thumb = p.mainImage || p.image || thumb;
        }
      }
    } catch (e) {}

    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <img src="${thumb}" alt="${escapeHtml(title)}" />
      <div class="meta">
        <div class="nm">${escapeHtml(title)}</div>
        <div class="qty">Qty: ${qty} — ${formatCurrency(unit)} each</div>
      </div>
      <div class="line-total">${formatCurrency(qty * unit)}</div>
    `;
    checkoutItemsEl.appendChild(row);
  });

  updateCheckoutTotals(totalQty, totalMoney);
}

/**
 * Cập nhật tổng tiền trong modal thanh toán
 * @param {number} totalQty - Tổng số lượng
 * @param {number} totalMoney - Tổng tiền
 */
function updateCheckoutTotals(totalQty, totalMoney) {
  const totalQtyEl = document.getElementById("checkout-total-qty");
  const totalMoneyEl = document.getElementById("checkout-total-money");

  if (totalQtyEl) totalQtyEl.textContent = totalQty;
  if (totalMoneyEl) totalMoneyEl.textContent = formatCurrency(totalMoney);
}

/**
 * Render text địa chỉ giao hàng
 */
function renderAddressText() {
  const addrTextEl = document.getElementById("addr-text");
  if (!addrTextEl) return;

  const a = getShippingAddress();
  if (!a || !a.name) {
    addrTextEl.textContent = "Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ giao hàng.";
  } else {
    addrTextEl.textContent = `${a.name} — ${a.phone} — ${a.line}, ${a.city}${a.postal ? ' (' + a.postal + ')' : ''}`;
  }
}

/**
 * Đặt hàng
 */
function placeOrder() {
  const selectedIds = getSelectedIds();
  if (!selectedIds.length) {
    showToast("Chọn ít nhất 1 sản phẩm trước khi thanh toán", "warn");
    return;
  }

  const addr = getShippingAddress();
  if (!addr || !addr.name || !addr.phone || !addr.line || !addr.city) {
    showToast("Vui lòng cung cấp địa chỉ giao hàng trước khi đặt", "warn");
    return;
  }

  const payment = (document.querySelector('input[name="payment"]:checked') || {}).value || 'cod';
  const cart = getCartFromStorage();
  const itemsToOrder = cart.filter(it => selectedIds.includes(Number(it.id)));

  if (!itemsToOrder.length) {
    showToast("Không có sản phẩm hợp lệ để đặt", "warn");
    return;
  }

  // Tạo đơn hàng
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const orderId = 'ORD-' + Date.now();
  const detailedItems = itemsToOrder.map(it => {
    let title = `#${it.id}`;
    let thumb = "/img/blank-image.png";
    try {
      if (dataManager) {
        const p = dataManager.getById("products", Number(it.id));
        if (p) {
          title = p.title || title;
          thumb = p.mainImage || p.image || thumb;
        }
      }
    } catch (e) {}
    const qty = Number(it.quantity) || 0;
    const unit = Number(it.unitPrice) || 0;
    return {
      id: Number(it.id),
      title,
      qty,
      unitPrice: unit,
      amount: qty * unit,
      thumb
    };
  });

  const totalAmount = detailedItems.reduce((s, i) => s + (i.amount || 0), 0);
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
  localStorage.setItem("orders", JSON.stringify(orders));

  // Xóa sản phẩm đã đặt khỏi giỏ hàng
  const remaining = cart.filter(it => !selectedIds.includes(Number(it.id)));
  saveCartToStorage(remaining);

  // Refresh UI
  renderCartView();
  closeCheckout();

  showToast(`Đặt hàng thành công — Phương thức: ${payment}`, "success");
}

// ========== XỬ LÝ SELECTION VÀ FOOTER ==========
/**
 * Cập nhật footer dựa trên sản phẩm được chọn
 */
function updateFooterFromSelection() {
  const totals = calculateSelectedTotals();
  const totalMoneyEl = document.querySelector("#cart-table .footer-money .money");
  const totalCountEl = document.querySelector("#cart-table .footer-total .total");

  if (totalMoneyEl) totalMoneyEl.textContent = formatCurrency(totals.money);
  if (totalCountEl) totalCountEl.textContent = `Total (${totals.qty} items):`;

  // Toggle nút thanh toán
  const checkoutBtns = document.querySelectorAll(".checkout-visual");
  checkoutBtns.forEach(btn => {
    if (totals.qty === 0) {
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    } else {
      btn.removeAttribute("disabled");
      btn.style.opacity = "";
      btn.style.pointerEvents = "";
    }
  });
}

/**
 * Tính tổng cho các sản phẩm được chọn
 * @returns {Object} {qty, money}
 */
function calculateSelectedTotals() {
  const cart = getCartFromStorage();
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

/**
 * Gắn event handlers cho selection
 */
function wireSelectionHandlers() {
  const tbody = document.querySelector("#cart-table tbody");
  if (!tbody) return;

  // Checkbox "chọn tất cả"
  const chooseAll = document.getElementById("chooseALL");
  if (chooseAll) {
    const rows = tbody.querySelectorAll("tr");
    chooseAll.checked = rows.length > 0 && Array.from(rows).every(r => r.querySelector("input.choose-item")?.checked);
    chooseAll.addEventListener("change", () => {
      const boxes = tbody.querySelectorAll("input.choose-item");
      boxes.forEach(cb => cb.checked = chooseAll.checked);
      updateFooterFromSelection();
    });
  }

  // Các checkbox từng item
  tbody.querySelectorAll("input.choose-item").forEach(cb => {
    cb.removeEventListener("change", onRowCheckboxChange);
    cb.addEventListener("change", onRowCheckboxChange);
  });

  function onRowCheckboxChange() {
    const chooseAllEl = document.getElementById("chooseALL");
    const boxes = Array.from(tbody.querySelectorAll("input.choose-item"));
    if (chooseAllEl) {
      chooseAllEl.checked = boxes.length > 0 && boxes.every(x => x.checked);
    }
    updateFooterFromSelection();
  }
}

/**
 * Gắn guards cho nút thanh toán
 */
function attachCheckoutGuards() {
  const btns = document.querySelectorAll(".checkout-visual");
  btns.forEach(b => {
    b.removeEventListener("click", guardCheckoutClicks);
    b.addEventListener("click", guardCheckoutClicks);
  });

  function guardCheckoutClicks(e) {
    const selIds = getSelectedIds();
    if (!selIds.length) {
      e.preventDefault();
      e.stopPropagation();
      showToast("Vui lòng chọn ít nhất 1 sản phẩm trước khi thanh toán", "error");
      return false;
    }
    return true;
  }
}

// ========== KHỞI TẠO GIỎ HÀNG ==========
/**
 * Khởi tạo module giỏ hàng
 */
function initCartModule() {
  // Gắn events cho giỏ hàng
  wireCartEvents();

  // Gắn guards cho checkout
  attachCheckoutGuards();

  // Gắn events cho modal checkout
  const modal = document.getElementById("checkout-modal");
  const backdrop = document.getElementById("checkout-backdrop");
  const closeBtn = document.getElementById("checkout-close");
  const cancelBtn = document.getElementById("btn-cancel");
  const placeBtn = document.getElementById("btn-place-order");

  if (closeBtn) closeBtn.addEventListener("click", closeCheckout);
  if (cancelBtn) cancelBtn.addEventListener("click", closeCheckout);
  if (backdrop) backdrop.addEventListener("click", closeCheckout);
  if (placeBtn) placeBtn.addEventListener("click", placeOrder);

  // Gắn events cho địa chỉ
  document.addEventListener("click", function(e) {
    const el = e.target;
    if (el.closest && (el.closest("#addr-change-btn") || el.id === "addr-change-btn")) {
      e.preventDefault();
      showAddressEdit();
    }
    if (el.closest && (el.closest("#addr-cancel-btn") || el.id === "addr-cancel-btn")) {
      e.preventDefault();
      hideAddressEdit();
    }
    if (el.closest && (el.closest("#addr-save-btn") || el.id === "addr-save-btn")) {
      e.preventDefault();
      saveShippingAddressFromInputs();
    }
  });

  // Render cart lần đầu nếu cần
  if (document.getElementById("cart-view") && getComputedStyle(document.getElementById("cart-view")).display !== "none") {
    renderCartView();
  }
}

/**
 * Hiển thị form chỉnh sửa địa chỉ
 */
function showAddressEdit() {
  const addrDisplayEl = document.getElementById("address-display");
  const addrEditEl = document.getElementById("address-edit");

  if (!addrDisplayEl || !addrEditEl) return;

  const a = getShippingAddress() || {};
  const nameEl = document.getElementById("chk-name");
  const phoneEl = document.getElementById("chk-phone");
  const lineEl = document.getElementById("chk-line");
  const cityEl = document.getElementById("chk-city");
  const postalEl = document.getElementById("chk-postal");

  if (nameEl) nameEl.value = a.name || "";
  if (phoneEl) phoneEl.value = a.phone || "";
  if (lineEl) lineEl.value = a.line || "";
  if (cityEl) cityEl.value = a.city || "";
  if (postalEl) postalEl.value = a.postal || "";

  addrDisplayEl.style.display = "none";
  addrEditEl.style.display = "block";
}

/**
 * Ẩn form chỉnh sửa địa chỉ
 */
function hideAddressEdit() {
  const addrDisplayEl = document.getElementById("address-display");
  const addrEditEl = document.getElementById("address-edit");

  if (!addrDisplayEl || !addrEditEl) return;

  addrDisplayEl.style.display = "flex";
  addrEditEl.style.display = "none";
}

/**
 * Lưu địa chỉ giao hàng từ form
 */
function saveShippingAddressFromInputs() {
  const nameEl = document.getElementById("chk-name");
  const phoneEl = document.getElementById("chk-phone");
  const lineEl = document.getElementById("chk-line");
  const cityEl = document.getElementById("chk-city");
  const postalEl = document.getElementById("chk-postal");

  const name = (nameEl?.value ?? "").trim();
  const phone = (phoneEl?.value ?? "").trim();
  const line = (lineEl?.value ?? "").trim();
  const city = (cityEl?.value ?? "").trim();
  const postal = (postalEl?.value ?? "").trim();

  if (!name || !phone || !line || !city) {
    showToast("Vui lòng nhập đầy đủ thông tin địa chỉ", "error");
    return false;
  }

  const obj = { name, phone, line, city, postal };
  localStorage.setItem("shipping", JSON.stringify(obj));

  renderAddressText();
  hideAddressEdit();

  showToast("Đã lưu địa chỉ giao hàng", "success");
  return true;
}

// ========== EXPORTS ==========
/**
 * Export các hàm cần thiết ra global scope
 */
window.showCartView = showCartView;
window.showStoreView = showStoreView;
window.renderCartView = renderCartView;
window.showCheckout = showCheckout;
window.closeCheckout = closeCheckout;
window.placeOrder = placeOrder;
window.addToCart = addToCart;

// ========== KHỞI TẠO ==========
document.addEventListener("DOMContentLoaded", () => {
  initProductModule();
  initCartModule();
  // Initialize store-page header & mobile nav
  if (typeof initStorePageHeader === "function") initStorePageHeader();
});
