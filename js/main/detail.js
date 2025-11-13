import { dataManager } from "../admin/DatabaseManager.js";
import { addToCart } from "./store.js";
import { updateCartCount, formatCurrency}  from "./utils.js";

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
  if (detailAddToCartBtn) {
    detailAddToCartBtn.addEventListener("click", handleAddToCart);
  }
  
  // === GẮN SỰ KIỆN CHO SHARE ICONS ===
  setupShareIcons();
}

/**
 * Thiết lập các link mạng xã hội
 */
function setupShareIcons() {
  const shareIcons = document.querySelectorAll('#product-detail .share-icons a');
  
  shareIcons.forEach(icon => {
    // Xóa href mặc định nếu có
    icon.removeAttribute('href');
    
    // Thêm sự kiện click
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!currentProduct) return;
      
      const productUrl = window.location.href;
      const productTitle = currentProduct.title || 'Check out this product';
      
      // Lấy class của icon để xác định loại mạng xã hội
      const iconClass = this.querySelector('i').className;
      
      let shareUrl = '';
      
      if (iconClass.includes('facebook')) {
        // Facebook Share
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
      } else if (iconClass.includes('pinterest')) {
        // Pinterest Share
        const imageUrl = currentProduct.mainImage || '';
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(productTitle)}`;
      } else if (iconClass.includes('tiktok')) {
        // TikTok (mở trang chính vì TikTok không có share URL trực tiếp)
        shareUrl = 'https://www.tiktok.com/';
      } else if (iconClass.includes('twitter')) {
        // Twitter/X Share
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`;
      } else if (iconClass.includes('instagram')) {
        // Instagram (mở trang chính vì Instagram không có share URL trực tiếp)
        shareUrl = 'https://www.instagram.com/';
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    });
  });
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

  // --- 3. Render Slider Ảnh và Bảng Specs ---
  renderImageSlider(currentProduct);
  renderSpecsTable(currentProduct.specs);
  
  // --- 4. Cập nhật lại share icons với sản phẩm mới ---
  setupShareIcons();

  // --- 5. Cuộn lên đầu trang ---
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
  
  if (currentQty < 1) {
    currentQty = 1;
  }
  
  quantityInput.value = currentQty;
}

function handleAddToCart() {
  if (!currentProduct) return;
  
  const quantity = parseInt(quantityInput.value, 10) || 1;
  
  // Gọi hàm addToCart đã import từ store.js
  addToCart(currentProduct.id, quantity);
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

  slidesContainer.style.transform = `translateX(-${index * 100}%)`;

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

const buyNowBtn = document.querySelector('#product-detail .buy-now');

if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {

        const addToCartBtn = document.querySelector('#product-detail .add-cart');
        if (addToCartBtn) addToCartBtn.click(); 

        document.getElementById('store-view').style.display = 'none';
        document.getElementById('product-detail').style.display = 'none';
        
        // Hiện màn hình giỏ hàng
        const cartView = document.getElementById('cart-view');
        if (cartView) {
            cartView.style.display = 'flex'; 
            window.scrollTo(0, 0); 
        }
    });
}

// === KHỞI CHẠY MODULE ===
document.addEventListener("DOMContentLoaded", initDetailModule);