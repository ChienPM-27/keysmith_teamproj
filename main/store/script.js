// ===== Scroll to top =====
const btn_top = document.getElementById("btn-top");
if (btn_top) {
  btn_top.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
}

// ===== Elements =====
const storeView = document.getElementById("store-view");
const detailView = document.getElementById("product-detail");
const pro_container = document.getElementById("pro-container");
const backBtn = document.getElementById("back-btn");

let allProducts = [];

// ===== Load Store Products (có phân trang) =====
fetch("../store/detail/product.json")
  .then((res) => res.json())
  .then((products) => {
    allProducts = products;
    const pagination = document.getElementById("pagination");

    let currentPage = 1;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    function renderPage(page) {
      pro_container.innerHTML = "";
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = products.slice(start, end);

      pageItems.forEach((product) => {
        const pro = document.createElement("div");
        pro.className = "pro";
        pro.innerHTML = `
          <img src="${product.mainImage}" alt="${product.title}">
          <div class="des">
            <span>${product.specs?.Category || ""}</span>
            <h4>${product.title}</h4>
            <h5>$${product.price}</h5>
          </div>
          <a href="#" class="buy"><i class="fa-solid fa-cart-shopping"></i></a>
        `;
        pro.addEventListener("click", () => showProductDetail(product.id));
        pro_container.appendChild(pro);
      });

      updatePagination();
    }

    function updatePagination() {
      if (!pagination) return;
      pagination.innerHTML = "";

      // Nút mũi tên trái
      const leftArrow = document.createElement("a");
      leftArrow.href = "#";
      leftArrow.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
      leftArrow.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
        } else {
          alert("Bạn đang ở trang đầu tiên!");
        }
      });
      pagination.appendChild(leftArrow);

      // Nút số trang
      for (let i = 1; i <= totalPages; i++) {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = i;
        if (i === currentPage) a.classList.add("active-page");
        a.addEventListener("click", (e) => {
          e.preventDefault();
          currentPage = i;
          renderPage(currentPage);
        });
        pagination.appendChild(a);
      }

      // Nút mũi tên phải
      const rightArrow = document.createElement("a");
      rightArrow.href = "#";
      rightArrow.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
      rightArrow.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage);
        } else {
          alert("Bạn đang ở trang cuối cùng!");
        }
      });
      pagination.appendChild(rightArrow);
    }

    renderPage(currentPage);
  })
  .catch((err) => console.error("Lỗi đọc JSON:", err));


// ===== Show Product Detail =====
function showProductDetail(id) {
  const p = allProducts.find((p) => p.id === id);
  if (!p) return alert("Không tìm thấy sản phẩm.");

  storeView.style.display = "none";
  detailView.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  backBtn.style.display = "flex";

  document.getElementById("productTitle").textContent = p.title;
  document.getElementById("productDesc").textContent = p.shortDesc;
  document.getElementById("productRating").textContent = p.rating;
  document.getElementById("productPrice").textContent = `$${p.price}`;
  document.getElementById("productOldPrice").textContent = `$${p.oldPrice}`;
  document.getElementById("productDiscount").textContent = `-${p.discount}%`;
  document.getElementById("productLongDesc").textContent = p.longDesc;

  // ===== IMAGE SLIDER =====
  const thumbContainer = document.querySelector(".thumbnail-list");
  thumbContainer.innerHTML = `
    <div class="image-slider" id="imageSlider">
      <div class="slides"></div>
      <div class="slider-dots" id="sliderDots"></div>
    </div>
  `;

  const slidesContainer = thumbContainer.querySelector(".slides");
  const dotsContainer = thumbContainer.querySelector("#sliderDots");

  const images = [p.mainImage, ...(p.thumbnails || [])].slice(0, 3);
  let currentIndex = 0;

  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    slidesContainer.appendChild(img);

    const dot = document.createElement("span");
    ["mouseenter", "click"].forEach(evt =>
      dot.addEventListener(evt, () => goToSlide(i))
    );
    dotsContainer.appendChild(dot);
  });

  function updateSlider() {
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    dotsContainer.querySelectorAll("span").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  // Auto slide
  setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
  }, 4000);

  updateSlider();

  // ===== SPECS =====
  const specsTable = document.getElementById("productSpecs");
  specsTable.innerHTML = "";
  for (let [k, v] of Object.entries(p.specs)) {
    specsTable.innerHTML += `<tr><td>${k}</td><td>${v}</td></tr>`;
  }

  // ===== QUANTITY =====
  const qty = document.getElementById("quantity");
  document.getElementById("increase").onclick = () =>
    (qty.value = +qty.value + 1);
  document.getElementById("decrease").onclick = () =>
    (qty.value = Math.max(1, +qty.value - 1));
}

// ===== Back to Store =====
if (backBtn) {
  backBtn.addEventListener("click", () => {
    detailView.style.display = "none";
    storeView.style.display = "block";
    backBtn.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Ẩn nút Back mặc định khi đang ở store view
if (backBtn) backBtn.style.display = "none";

// ===== Dynamic Share Links =====
document.addEventListener("DOMContentLoaded", () => {
  const currentURL = window.location.href;
  const title =
    document.getElementById("productTitle")?.textContent || "KeySmith Product";

  const setShareLink = (selector, url) => {
    const el = document.querySelector(selector);
    if (el) el.href = url;
  };

  setShareLink(
    ".share-fb",
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentURL
    )}`
  );
  setShareLink(
    ".share-pinterest",
    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      currentURL
    )}&description=${encodeURIComponent(title)}`
  );
  setShareLink(
    ".share-tiktok",
    `https://www.tiktok.com/share?url=${encodeURIComponent(currentURL)}`
  );
  setShareLink(
    ".share-twitter",
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      currentURL
    )}&text=${encodeURIComponent(title)}`
  );
  setShareLink(
    ".share-instagram",
    `https://www.instagram.com/?url=${encodeURIComponent(currentURL)}`
  );
});
