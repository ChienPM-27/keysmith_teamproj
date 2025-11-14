// Đây là nội dung file detail.js
import { dataManager } from "../admin/DatabaseManager.js";
// Import các hàm tiện ích chúng ta vừa export từ store.js
import { addToCart, showCartView, updateCartQuantity } from "./store.js";
import { formatCurrency}  from "./utils.js";

/**
 * Lấy số lượng sản phẩm hiện tại trong giỏ hàng
 * @param {number} productId - ID sản phẩm
 * @returns {number} Số lượng trong giỏ
 */
function getCurrentQuantityInCart(productId) {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find(item => item.id === productId);
    return item ? (item.quantity || 0) : 0;
  } catch (e) {
    return 0;
  }
}

// === KHAI BÁO BIẾN TOÀN CỤC ===
let currentProduct = null; 
let currentSlideIndex = 0; 

// Tham chiếu đến các Section chính
let storeView = null;
let productDetailView = null;
let cartView = null;

// Tham chiếu đến các nút
let backBtn = null;
let decreaseQtyBtn = null;
let increaseQtyBtn = null;
let quantityInput = null;
let detailAddToCartBtn = null;
let detailBuyNowBtn = null;

// Tham chiếu đến các phần tử trong Product Detail
let productTitle = null;
let productDesc = null;
let productRating = null;
let productPrice = null;
let productOldPrice = null;
let productDiscount = null;
let productLongDesc = null;
let productSpecsTable = null;

// Tham chiếu đến Slider ảnh
let slidesContainer = null;
let dotsContainer = null;


function initDetailModule() {
  // Lấy các section
  storeView = document.getElementById("store-view");
  productDetailView = document.getElementById("product-detail");
  cartView = document.getElementById("cart-view");

  // Lấy các nút
  backBtn = document.getElementById("back-btn");
  decreaseQtyBtn = document.getElementById("decrease");
  increaseQtyBtn = document.getElementById("increase");
  quantityInput = document.getElementById("quantity");
  detailAddToCartBtn = document.querySelector("#product-detail .add-cart");
  detailBuyNowBtn = document.querySelector("#product-detail .buy-now");

  // Lấy các phần tử hiển thị thông tin
  productTitle = document.getElementById("productTitle");
  productDesc = document.getElementById("productDesc");
  productRating = document.getElementById("productRating");
  productPrice = document.getElementById("productPrice");
  productOldPrice = document.getElementById("productOldPrice");
  productDiscount = document.getElementById("productDiscount");
  productLongDesc = document.getElementById("productLongDesc");
  productSpecsTable = document.getElementById("productSpecs");

  // Lấy phần tử slider
  slidesContainer = document.querySelector("#imageSlider .slides");
  dotsContainer = document.getElementById("sliderDots");

  // === GẮN SỰ KIỆN ===
  if (backBtn) {
    backBtn.addEventListener("click", showStoreView);
  }
  if (decreaseQtyBtn) {
    decreaseQtyBtn.addEventListener("click", () => updateQuantity(-1));
  }
  if (increaseQtyBtn) {
    increaseQtyBtn.addEventListener("click", () => updateQuantity(1));
  }
  if (quantityInput) {
    quantityInput.addEventListener("input", validateQuantityInput);
    quantityInput.addEventListener("blur", validateQuantityInput);
  }
  if (detailBuyNowBtn) {
    detailBuyNowBtn.addEventListener("click", handleBuyNow);
  }
  if (detailAddToCartBtn) {
    detailAddToCartBtn.addEventListener("click", handleAddToCart);
  }
}

/**
 * Hàm chính, được gọi từ store.js
 * @param {number} productId ID của sản phẩm để hiển thị
 */
export function showProductDetailById(productId) {
  const id = parseInt(productId, 10);
  currentProduct = dataManager.getById("products", id);

  if (!currentProduct) {
    console.error("Không tìm thấy sản phẩm với ID:", id);
    alert("Product not found!");
    return;
  }

  // Đảm bảo DOM elements đã được khởi tạo
  if (!productTitle || !productDesc || !productPrice) {
    initDetailModule();
  }

  // Kiểm tra lại sau khi init
  if (!productTitle || !productDesc || !productPrice || !productLongDesc || !quantityInput) {
    console.error("Không thể khởi tạo DOM elements cho product detail");
    if (window.showToast) {
      window.showToast("Không thể tải chi tiết sản phẩm. Vui lòng thử lại.", "error");
    } else {
      alert("Không thể tải chi tiết sản phẩm. Vui lòng thử lại.");
    }
    return;
  }

  // --- 1. Chuyển đổi View ---
  if (storeView) storeView.style.display = "none";
  if (cartView) cartView.style.display = "none";
  if (productDetailView) productDetailView.style.display = "flex";

  // --- 2. Đổ dữ liệu sản phẩm vào HTML ---
  productTitle.textContent = currentProduct.title || "Product Title";
  productDesc.textContent = currentProduct.shortDesc || "";
  productLongDesc.textContent = currentProduct.longDesc || "No description available.";


  // Xử lý giá
  productPrice.textContent = formatCurrency(currentProduct.price);

  // Reset số lượng về 1
  quantityInput.value = 1;

  // Refresh quantity controls dựa trên giỏ hàng hiện tại
  refreshQuantityControls();

  // --- 3. Render Slider Ảnh và Bảng Specs ---

  // --- 3. Render Slider Ảnh và Bảng Specs ---
  renderImageSlider(currentProduct);
  renderSpecsTable(currentProduct.specs);

  // --- 4. Cuộn lên đầu trang ---
  window.scrollTo(0, 0);
}

/**
 * Quay trở lại Store View
 */
function showStoreView() {
  if (storeView) storeView.style.display = "block"; 
  if (cartView) cartView.style.display = "none";
  if (productDetailView) productDetailView.style.display = "none";
  
  // Reset sản phẩm hiện tại
  currentProduct = null;
  window.scrollTo(0, 0);
}

/**
 * Cập nhật ô số lượng
 * @param {number} change
 */
function updateQuantity(change) {
  let currentQty = parseInt(quantityInput.value, 10);
  currentQty = isNaN(currentQty) ? 1 : currentQty;
  currentQty += change;

  // Tính max quantity có thể thêm: stock - số lượng đã có trong giỏ
  const stock = currentProduct ? (currentProduct.stock || 0) : 0;
  const currentInCart = currentProduct ? getCurrentQuantityInCart(currentProduct.id) : 0;
  const maxAvailable = Math.max(0, stock - currentInCart);

  // Giới hạn trong khoảng 1 đến max available
  if (currentQty < 1) {
    currentQty = 1;
  } else if (currentQty > maxAvailable) {
    currentQty = maxAvailable;
  }

  // Nếu max available = 0, disable input và buttons
  if (maxAvailable === 0) {
    currentQty = 0;
  }

  quantityInput.value = currentQty;

  // Cập nhật trạng thái buttons
  updateQuantityButtons();
}

/**
 * Refresh quantity controls dựa trên stock và giỏ hàng hiện tại
 */
function refreshQuantityControls() {
  if (!quantityInput || !currentProduct) return;

  // Tính max quantity có thể thêm: stock - số lượng đã có trong giỏ
  const stock = currentProduct.stock || 0;
  const currentInCart = getCurrentQuantityInCart(currentProduct.id);
  const maxAvailable = Math.max(0, stock - currentInCart);

  // Set max attribute
  quantityInput.max = maxAvailable;

  // Set value
  let currentValue = parseInt(quantityInput.value, 10) || 1;
  if (maxAvailable === 0) {
    currentValue = 0;
  } else if (currentValue > maxAvailable) {
    currentValue = maxAvailable;
  } else if (currentValue < 1) {
    currentValue = 1;
  }

  quantityInput.value = currentValue;

  // Update buttons
  updateQuantityButtons();
}

/**
 * Cập nhật trạng thái disable/enable của các nút quantity
 */
function updateQuantityButtons() {
  if (!decreaseQtyBtn || !increaseQtyBtn || !quantityInput) return;

  const currentQty = parseInt(quantityInput.value, 10) || 0;

  // Tính max quantity có thể thêm: stock - số lượng đã có trong giỏ
  const stock = currentProduct ? (currentProduct.stock || 0) : 0;
  const currentInCart = currentProduct ? getCurrentQuantityInCart(currentProduct.id) : 0;
  const maxAvailable = Math.max(0, stock - currentInCart);

  // Disable decrease nếu quantity <= 1 hoặc maxAvailable = 0
  decreaseQtyBtn.disabled = currentQty <= 1 || maxAvailable === 0;

  // Disable increase nếu đã đạt max available hoặc maxAvailable = 0
  increaseQtyBtn.disabled = currentQty >= maxAvailable || maxAvailable === 0;

  // Disable add to cart button nếu không thể thêm
  if (detailAddToCartBtn) {
    detailAddToCartBtn.disabled = maxAvailable === 0 || currentQty === 0;
  }

  // Disable buy now button nếu sản phẩm hết hàng hoặc out of stock
  if (detailBuyNowBtn) {
    detailBuyNowBtn.disabled = currentProduct.status === "outofstock";
  }
}

/**
 * Validate input số lượng khi user nhập trực tiếp
 */
function validateQuantityInput() {
  let currentQty = parseInt(quantityInput.value, 10);

  // Tính max quantity có thể thêm: stock - số lượng đã có trong giỏ
  const stock = currentProduct ? (currentProduct.stock || 0) : 0;
  const currentInCart = currentProduct ? getCurrentQuantityInCart(currentProduct.id) : 0;
  const maxAvailable = Math.max(0, stock - currentInCart);

  // Nếu không phải số hợp lệ, set về 1 (hoặc 0 nếu hết hàng)
  if (isNaN(currentQty) || currentQty < 1) {
    quantityInput.value = maxAvailable > 0 ? 1 : 0;
  } else {
    // Giới hạn không vượt quá max available
    if (currentQty > maxAvailable) {
      quantityInput.value = maxAvailable;
    }
  }

  // Update max attribute
  quantityInput.max = maxAvailable;

  // Cập nhật trạng thái buttons
  updateQuantityButtons();
}

function handleAddToCart() {
  if (!currentProduct) return;

  const quantity = parseInt(quantityInput.value, 10) || 1;

  // Check nếu không còn sản phẩm để thêm
  const stock = currentProduct ? (currentProduct.stock || 0) : 0;
  const currentInCartBefore = getCurrentQuantityInCart(currentProduct.id);
  const maxAvailableBefore = Math.max(0, stock - currentInCartBefore);

  // Gọi hàm addToCart đã import từ store.js
  addToCart(currentProduct.id, quantity);

  // Update lại max quantity sau khi thêm vào giỏ
  const currentInCartAfter = getCurrentQuantityInCart(currentProduct.id);
  const maxAvailableAfter = Math.max(0, stock - currentInCartAfter);

  // Update input max và value nếu cần
  quantityInput.max = maxAvailableAfter;
  if (parseInt(quantityInput.value, 10) > maxAvailableAfter) {
    quantityInput.value = maxAvailableAfter;
  }

  // Update buttons
  updateQuantityButtons();
}

/**
 * Xử lý sự kiện nhấn nút Buy Now
 */
function handleBuyNow() {
  if (!currentProduct) return;

  // Tính tổng số lượng: số lượng nhập vào + số lượng đã có trong giỏ
  const inputQuantity = parseInt(quantityInput.value, 10) || 0;
  const currentInCart = getCurrentQuantityInCart(currentProduct.id);
  const totalQuantity = inputQuantity + currentInCart;

  // Sử dụng hàm updateCartQuantity từ store.js để cập nhật giỏ hàng
  updateCartQuantity(currentProduct.id, totalQuantity);

  // Chuyển sang trang giỏ hàng
  showCartView();
}

function renderImageSlider(product) {
  if (!slidesContainer || !dotsContainer) return;

  slidesContainer.innerHTML = "";
  dotsContainer.innerHTML = "";
  currentSlideIndex = 0;

  const images = [product.mainImage, ...(product.thumbnails || [])];
  
  if (images.length === 0) {
      images.push("/img/blank-image.png"); 
  }

  images.forEach((imgSrc, index) => {
    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = `${product.title} image ${index + 1}`;
    slidesContainer.appendChild(img);

    // Tạo dot
    const dot = document.createElement("span");
    dot.addEventListener("click", () => showSlide(index));
    if (index === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });

  // SỬA: Đã xóa dòng set width thủ công. CSS sẽ lo việc đó.
  showSlide(0); 
}

/**
 * Hiển thị một slide cụ thể
 * @param {number} index Chỉ số của slide
 */
function showSlide(index) {
  const totalSlides = slidesContainer.children.length;
  if (totalSlides === 0) return;

  if (index >= totalSlides) index = 0;
  if (index < 0) index = totalSlides - 1;

  // SỬA: Công thức dịch chuyển mới (-100% cho mỗi ảnh)
  // Vì mỗi ảnh trong CSS chiếm 100% khung nhìn
  slidesContainer.style.transform = `translateX(calc(-${index * 100}% - 4 * ${index}rem))`;

  // Cập nhật dot active
  const dots = dotsContainer.children;
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }
  if (dots[index]) {
    dots[index].classList.add("active");
  }
  
  currentSlideIndex = index;
}

function renderSpecsTable(specs) {
  if (!productSpecsTable) return;
  
  productSpecsTable.innerHTML = ""; 
  
  if (!specs) return;

  const specMap = {
    category: "Collection",
    brand: "Brand",
    color: "Color",
  };

  for (const key in specs) {
    if (specs.hasOwnProperty(key) && specs[key]) {
      const tr = document.createElement("tr");
      
      const th = document.createElement("th");
      th.textContent = specMap[key] || key; 
      
      const td = document.createElement("td");
      td.textContent = specs[key]; 
      
      tr.appendChild(th);
      tr.appendChild(td);
      productSpecsTable.appendChild(tr);
    }
  }
}

// === KHỞI CHẠY MODULE ===
document.addEventListener("DOMContentLoaded", initDetailModule);