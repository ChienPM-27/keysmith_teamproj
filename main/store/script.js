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

// ===== Load Store Products =====
fetch("../store/detail/product.json")
  .then((res) => res.json())
  .then((products) => {
    pro_container.innerHTML = "";
    products.forEach((product) => {
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
  })
  .catch((err) => console.error("Lỗi đọc JSON:", err));

// ===== Show Product Detail =====
function showProductDetail(id) {
  fetch("../store/detail/product.json")
    .then((res) => res.json())
    .then((data) => {
      const p = data.find((p) => p.id === id);
      if (!p) return alert("Không tìm thấy sản phẩm.");

      // Hiện phần chi tiết
      storeView.style.display = "none";
      detailView.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
      backBtn.style.display = "flex"; // hiện nút Back

      // Gán dữ liệu
      document.getElementById("mainProductImg").src = p.mainImage;
      document.getElementById("productTitle").textContent = p.title;
      document.getElementById("productDesc").textContent = p.shortDesc;
      document.getElementById("productRating").textContent = p.rating;
      document.getElementById("productPrice").textContent = `$${p.price}`;
      document.getElementById("productOldPrice").textContent = `$${p.oldPrice}`;
      document.getElementById("productDiscount").textContent = `-${p.discount}%`;
      document.getElementById("productLongDesc").textContent = p.longDesc;

      // thumbnails
      const thumbContainer = document.querySelector(".thumbnail-list");
      thumbContainer.innerHTML = "";
      if (p.thumbnails && p.thumbnails.length) {
        p.thumbnails.forEach((imgSrc) => {
          const img = document.createElement("img");
          img.src = imgSrc;
          img.className = "thumb";
          img.addEventListener("click", () => {
            const main = document.getElementById("mainProductImg");
            [main.src, img.src] = [img.src, main.src];
          });
          thumbContainer.appendChild(img);
        });
      }

      // specs
      const specsTable = document.getElementById("productSpecs");
      specsTable.innerHTML = "";
      for (let [k, v] of Object.entries(p.specs)) {
        specsTable.innerHTML += `<tr><td>${k}</td><td>${v}</td></tr>`;
      }

      // quantity
      const qty = document.getElementById("quantity");
      document.getElementById("increase").onclick = () =>
        (qty.value = +qty.value + 1);
      document.getElementById("decrease").onclick = () =>
        (qty.value = Math.max(1, +qty.value - 1));
    });
}

// ===== Back to Store =====
if (backBtn) {
  backBtn.addEventListener("click", () => {
    detailView.style.display = "none";
    storeView.style.display = "block";
    backBtn.style.display = "none"; // ẩn lại nút Back khi quay về
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Ẩn nút Back mặc định khi đang ở store view
if (backBtn) backBtn.style.display = "none";
// ===== Dynamic Share Links =====
document.addEventListener("DOMContentLoaded", () => {
  const currentURL = window.location.href;
  const title = document.getElementById("productTitle")?.textContent || "KeySmith Product";

  const setShareLink = (selector, url) => {
    const el = document.querySelector(selector);
    if (el) el.href = url;
  };

  setShareLink(".share-fb", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`);
  setShareLink(".share-pinterest", `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentURL)}&description=${encodeURIComponent(title)}`);
  setShareLink(".share-tiktok", `https://www.tiktok.com/share?url=${encodeURIComponent(currentURL)}`);
  setShareLink(".share-twitter", `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent(title)}`);
  setShareLink(".share-instagram", `https://www.instagram.com/?url=${encodeURIComponent(currentURL)}`);
});
