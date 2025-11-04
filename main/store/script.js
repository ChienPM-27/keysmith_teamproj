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
// load products from local detail JSON
fetch("./detail/product.json")
  .then((res) => res.json())
  .then((products) => {
    allProducts = products;

    // UI elements
    const pagination = document.getElementById("pagination");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const statusSelect = document.getElementById("status");
    const brandsSelect = document.getElementById("brands");
    const categorySelect = document.getElementById("category");
    const colorSelect = document.getElementById("color");
    const sortSelect = document.getElementById("sort");
    const priceMinInput = document.getElementById("price-min");
    const priceMaxInput = document.getElementById("price-max");

    // Pagination state
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredProducts = [...allProducts];

    // Populate filters from data
    function populateFilters(products) {
      const brands = new Set();
      const categories = new Set();
      const colors = new Set();

      products.forEach((p) => {
        const b = p.specs?.Brand;
        if (b) brands.add(b.trim());

        const catRaw = p.specs?.Category;
        if (catRaw) {
          // Category often like "Keycap / Attack On Titan Collection"
          const parts = catRaw.split("/").map((s) => s.trim());
          const last = parts[parts.length - 1];
          // remove 'Collection' suffix if present
          const normalized = last.replace(/Collection/i, "").trim();
          if (normalized) categories.add(normalized);
        }

        const colorRaw = p.specs?.Color;
        if (colorRaw) {
          // split by en-dash, em-dash, comma or slash
          const tokens = colorRaw.split(/\s*[–—,-/]\s*/);
          tokens.forEach((t) => {
            const tok = t.trim();
            if (tok) colors.add(tok);
          });
        }
      });

      // brands
      brandsSelect.innerHTML = `<option value="">Hãng sản xuất</option>`;
      Array.from(brands)
        .sort()
        .forEach((b) =>
          brandsSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${b}">${b}</option>`
          )
        );

      // categories
      categorySelect.innerHTML = `<option value="">Danh mục / Bộ sưu tập</option>`;
      Array.from(categories)
        .sort()
        .forEach((c) =>
          categorySelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${c}">${c}</option>`
          )
        );

      // colors
      colorSelect.innerHTML = `<option value="">Màu sắc</option>`;
      Array.from(colors)
        .sort()
        .forEach((c) =>
          colorSelect.insertAdjacentHTML(
            "beforeend",
            `<option value="${c}">${c}</option>`
          )
        );
    }

    function applyFilters() {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const status = statusSelect?.value || "";
      const brand = brandsSelect?.value || "";
      const category = categorySelect?.value || "";
      const color = colorSelect?.value || "";
      const sort = sortSelect?.value || "";
      const min = Number(priceMinInput?.value || 0) || 0;
      const max = Number(priceMaxInput?.value || 0) || 0;

      filteredProducts = allProducts.filter((p) => {
        // search text on title and shortDesc
        if (q) {
          const hay = (p.title + " " + (p.shortDesc || "")).toLowerCase();
          if (!hay.includes(q)) return false;
        }

        // status: products may not have 'status' field, ignore if missing
        if (status) {
          if ((p.status || "").toLowerCase() !== status.toLowerCase())
            return false;
        }

        // brand
        if (brand) {
          if ((p.specs?.Brand || "") !== brand) return false;
        }

        // category (we compare normalized as in populate)
        if (category) {
          const catRaw = p.specs?.Category || "";
          const parts = catRaw.split("/").map((s) => s.trim());
          const last = parts[parts.length - 1] || "";
          const normalized = last.replace(/Collection/i, "").trim();
          if (normalized !== category) return false;
        }

        // color
        if (color) {
          const colorRaw = p.specs?.Color || "";
          const tokens = colorRaw.split(/\s*[–—,-/]\s*/).map((t) => t.trim());
          if (!tokens.includes(color)) return false;
        }

        // price range
        if (min && p.price < min) return false;
        if (max && max > 0 && p.price > max) return false;

        return true;
      });

      // sorting
      if (sort === "incre-price") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sort === "decre-price") {
        filteredProducts.sort((a, b) => b.price - a.price);
      }

      // after filter, go to first page
      currentPage = 1;
      renderPage(currentPage);
    }

    function renderPage(page) {
      pro_container.innerHTML = "";
      const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = filteredProducts.slice(start, end);

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

      updatePagination(totalPages);
    }

    function updatePagination(totalPages) {
      if (!pagination) return;
      pagination.innerHTML = "";

      // left arrow
      const leftArrow = document.createElement("a");
      leftArrow.href = "#";
      leftArrow.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
      leftArrow.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
        }
      });
      pagination.appendChild(leftArrow);

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

      // right arrow
      const rightArrow = document.createElement("a");
      rightArrow.href = "#";
      rightArrow.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
      rightArrow.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage);
        }
      });
      pagination.appendChild(rightArrow);
    }

    // initialize
    filteredProducts = [...allProducts];
    populateFilters(allProducts);
    renderPage(currentPage);

    // Event listeners for filters/search
    if (searchButton) searchButton.addEventListener("click", () => applyFilters());
    if (searchInput) searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
    [statusSelect, brandsSelect, categorySelect, colorSelect, sortSelect].forEach((el) => {
      if (el) el.addEventListener("change", () => applyFilters());
    });
    [priceMinInput, priceMaxInput].forEach((el) => {
      if (el) el.addEventListener("change", () => applyFilters());
    });
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
