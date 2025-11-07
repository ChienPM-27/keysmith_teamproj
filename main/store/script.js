// main/store/script.js — store behavior (single, cleaned version)
// This file wires product list, product detail, cart and table-mode add-to-cart.

// Global helpers
function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
try { window.formatCurrency = formatCurrency; } catch (e) {}

// ===== Load Store Products (có phân trang) =====
// load products from merged JSON
let allProducts = [];
try {
  allProducts = JSON.parse(localStorage.getItem('products')) || [];
  window.allProducts = allProducts;
} catch (e) {
  allProducts = [];
  window.allProducts = [];
}

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

const pro_container = document.getElementById("pro-container");
const storeView = document.getElementById("store-view");
const detailView = document.getElementById("product-detail");
const cartView = document.getElementById("cart-view");
const backBtn = document.getElementById("back-btn");

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let filteredProducts = [...allProducts];

// helpers
function parseNumber(text) {
  if (!text) return 0;
  const n = parseFloat(String(text).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function populateFilters(products) {
  const brands = new Set();
  const categories = new Set();
  const colors = new Set();

  products.forEach((p) => {
    const b = p.specs?.Brand;
    if (b) brands.add(b.trim());

    const catRaw = p.specs?.Category;
    if (catRaw) {
      const parts = catRaw.split("/").map((s) => s.trim());
      const last = parts[parts.length - 1];
      const normalized = last.replace(/Collection/i, "").trim();
      if (normalized) categories.add(normalized);
    }

    const colorRaw = p.specs?.Color;
    if (colorRaw) {
      const tokens = colorRaw.split(/\s*[–—,\-/]\s*/);
      tokens.forEach((t) => {
        const tok = t.trim();
        if (tok) colors.add(tok);
      });
    }
  });

  if (brandsSelect) {
    brandsSelect.innerHTML = `<option value="">Hãng sản xuất</option>`;
    Array.from(brands)
      .sort()
      .forEach((b) =>
        brandsSelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${b}">${b}</option>`
        )
      );
  }
  if (categorySelect) {
    categorySelect.innerHTML = `<option value="">Danh mục / Bộ sưu tập</option>`;
    Array.from(categories)
      .sort()
      .forEach((c) =>
        categorySelect.insertAdjacentHTML(
          "beforeend",
          `<option value="${c}">${c}</option>`
        )
      );
  }
  if (colorSelect) {
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
    if (q) {
      const hay = (p.title + " " + (p.shortDesc || "")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (status) {
      if ((p.status || "").toLowerCase() !== status.toLowerCase())
        return false;
    }
    if (brand) {
      if ((p.specs?.Brand || "") !== brand) return false;
    }
    if (category) {
      const catRaw = p.specs?.Category || "";
      const parts = catRaw.split("/").map((s) => s.trim());
      const last = parts[parts.length - 1] || "";
      const normalized = last.replace(/Collection/i, "").trim();
      if (normalized !== category) return false;
    }
    if (color) {
      const colorRaw = p.specs?.Color || "";
      const tokens = colorRaw.split(/\s*[–—,\-/]\s*/).map((t) => t.trim());
      if (!tokens.includes(color)) return false;
    }
    if (min && p.price < min) return false;
    if (max && max > 0 && p.price > max) return false;
    return true;
  });

  if (sort === "incre-price")
    filteredProducts.sort((a, b) => a.price - b.price);
  else if (sort === "decre-price")
    filteredProducts.sort((a, b) => b.price - a.price);

  currentPage = 1;
  renderPage(currentPage);
}

function renderPage(page) {
  if (!pro_container) return;
  pro_container.innerHTML = "";
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filteredProducts.slice(start, end);

  pageItems.forEach((product) => {
    const pro = document.createElement("div");
    pro.className = "pro";
    pro.dataset.productId = product.id;
    pro.innerHTML = `
      <img src="${product.mainImage}" alt="${product.title}">
      <div class="des">
        <span>${product.specs?.Category || ""}</span>
        <h4>${product.title}</h4>
        <h5>${formatCurrency(product.price)}</h5>
      </div>
      <a href="#" class="buy"><i class="fa-solid fa-cart-shopping"></i></a>
    `;
    pro.addEventListener("click", () => showProductDetail(product.id));
    const buyA = pro.querySelector(".buy");
    if (buyA) {
      buyA.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (
            storeView &&
            getComputedStyle(storeView).display === "block"
          ) {
            if (typeof window.addOrUpdateCartItem === "function")
              window.addOrUpdateCartItem(product.id, 1);
          }
        } catch (err) {}
      });
    }
    pro_container.appendChild(pro);
  });

  if (pagination) {
    pagination.innerHTML = "";
    // First page
    const first = document.createElement("a");
    first.href = "#";
    first.innerHTML = `&laquo;`;
    first.title = 'Trang đầu';
    first.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage !== 1) {
        currentPage = 1;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(first);

    // Previous
    const left = document.createElement("a");
    left.href = "#";
    left.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
    left.title = 'Trang trước';
    left.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(left);

    // Page numbers
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

    // Next
    const right = document.createElement("a");
    right.href = "#";
    right.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
    right.title = 'Trang sau';
    right.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(right);

    // Last page
    const last = document.createElement("a");
    last.href = "#";
    last.innerHTML = `&raquo;`;
    last.title = 'Trang cuối';
    last.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage !== totalPages) {
        currentPage = totalPages;
        renderPage(currentPage);
      }
    });
    pagination.appendChild(last);
  }
}

// initialize
filteredProducts = [...allProducts];
populateFilters(allProducts);
renderPage(currentPage);

// Event listeners for filters/search
if (searchButton)
  searchButton.addEventListener("click", () => applyFilters());
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyFilters();
  });
  // also filter as user types
  searchInput.addEventListener("input", () => applyFilters());
}
[
  statusSelect,
  brandsSelect,
  categorySelect,
  colorSelect,
  sortSelect,
].forEach((el) => {
  if (el) el.addEventListener("change", () => applyFilters());
});
[priceMinInput, priceMaxInput].forEach((el) => {
  if (el) el.addEventListener("change", () => applyFilters());
});

// wire back button
if (backBtn) {
  backBtn.addEventListener("click", () => {
    try {
      if (backBtn && backBtn.dataset.refreshOnEmpty === "1") {
        window.location.reload();
        return;
      }
    } catch (e) {}
    if (detailView) detailView.style.display = "none";
    if (storeView) storeView.style.display = "block";
    if (cartView) cartView.style.display = "none";
    if (backBtn) backBtn.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  backBtn.style.display = "none";
}

// ensure cart hidden on load
try {
  const cv = document.getElementById("cart-view");
  if (cv) cv.style.display = "none";
} catch (e) {}

// expose showCartView globally
window.showCartView = function () {
  if (!cartView) return;
  if (storeView) storeView.style.display = "none";
  if (detailView) detailView.style.display = "none";
  cartView.style.display = "block";
  if (backBtn) backBtn.style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
  try {
    if (typeof initCart === "function") initCart();
  } catch (e) {}
};

// expose showProductDetail
window.showProductDetail = function (id) {
  const p = allProducts.find((pp) => pp.id === id);
  if (!p) return alert("Không tìm thấy sản phẩm.");
  try {
    const cv = document.getElementById("cart-view");
    if (cv) cv.style.display = "none";
  } catch (e) {}
  if (storeView) storeView.style.display = "none";
  if (detailView) detailView.style.display = "block";
  if (backBtn) backBtn.style.display = "flex";

  document.getElementById("productTitle").textContent = p.title;
  document.getElementById("productDesc").textContent = p.shortDesc;
  document.getElementById("productRating").textContent = p.rating;
  document.getElementById("productPrice").textContent = formatCurrency(p.price);
  document.getElementById("productOldPrice").textContent = p.oldPrice ? formatCurrency(p.oldPrice) : "";
  document.getElementById(
    "productDiscount"
  ).textContent = `-${p.discount}%`;
  document.getElementById("productLongDesc").textContent = p.longDesc || "";

  // thumbnails
  const thumbContainer = document.querySelector(".thumbnail-list");
  if (thumbContainer) {
    thumbContainer.innerHTML = `<div class="image-slider" id="imageSlider"><div class="slides"></div><div class="slider-dots" id="sliderDots"></div></div>`;
    const slidesContainer = thumbContainer.querySelector(".slides");
    const dotsContainer = thumbContainer.querySelector("#sliderDots");
    const images = [p.mainImage, ...(p.thumbnails || [])].slice(0, 3);
    let currentIndex = 0;
    images.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      slidesContainer.appendChild(img);
      const dot = document.createElement("span");
      ["mouseenter", "click"].forEach((evt) =>
        dot.addEventListener(evt, () => {
          currentIndex = i;
          slidesContainer.style.transform = `translateX(-${
            currentIndex * 100
          }%)`;
          dotsContainer
            .querySelectorAll("span")
            .forEach((d, j) => d.classList.toggle("active", j === i));
        })
      );
      dotsContainer.appendChild(dot);
    });
    setInterval(() => {
      if (images.length) {
        currentIndex = (currentIndex + 1) % images.length;
        slidesContainer.style.transform = `translateX(-${
          currentIndex * 100
        }%)`;
      }
    }, 4000);
  }

  const specsTable = document.getElementById("productSpecs");
  if (specsTable) {
    specsTable.innerHTML = "";
    for (let [k, v] of Object.entries(p.specs || {}))
      specsTable.innerHTML += `<tr><td>${k}</td><td>${v}</td></tr>`;
  }

  // quantity
  const qty = document.getElementById("quantity");
  const inc = document.getElementById("increase");
  const dec = document.getElementById("decrease");
  if (inc)
    inc.onclick = () => {
      if (qty) qty.value = +qty.value + 1;
    };
  if (dec)
    dec.onclick = () => {
      if (qty) qty.value = Math.max(1, +qty.value - 1);
    };

  // wire add-cart and buy-now
  try {
    const addBtn = document.querySelector(".add-cart");
    const buyNowBtn = document.querySelector(".buy-now");
    if (addBtn)
      addBtn.onclick = (e) => {
        e.preventDefault();
        const q =
          parseInt(document.getElementById("quantity")?.value || 1, 10) ||
          1;
        if (typeof window.addOrUpdateCartItem === "function")
          window.addOrUpdateCartItem(p.id, q);
      };
    if (buyNowBtn)
      buyNowBtn.onclick = (e) => {
        e.preventDefault();
        const q =
          parseInt(document.getElementById("quantity")?.value || 1, 10) ||
          1;
        if (typeof window.addOrUpdateCartItem === "function")
          window.addOrUpdateCartItem(p.id, q);
        try {
          window.showCartView && window.showCartView();
        } catch (e) {}
      };
  } catch (e) {}
};

// ===== Cart initialization (merged from main/cart/script.js) =====
function initCart() {
  if (initCart._inited) return;
  if (!cartView) return;

  const containerUl = cartView.querySelector("#Container ul");
  const tfoot = cartView.querySelector("#cart-table tfoot");
  // Use table footer controls exclusively (migration complete)
  const deleteAllBtn = tfoot && tfoot.querySelector(".delete-icon");
  const checkoutBtn = tfoot && tfoot.querySelector(".checkout-visual");
  const totalMoney = tfoot && tfoot.querySelector(".money");
  const totalLabel = tfoot && tfoot.querySelector(".total");
  const selectAll = cartView.querySelector("#chooseALL");
  const popup = cartView.querySelector("#popup");
  const popupMessage = cartView.querySelector("#popup-message");
  const popupClose = cartView.querySelector("#popup-close");

  function parseNumberLocal(text) {
    if (!text) return 0;
    const n = parseFloat(String(text).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function updateProductTotal(product) {
    // support both legacy (lowercase classes) and table rows (capitalized classes)
    const priceEl = product.querySelector('.price, .Price');
    const qtyInput = product.querySelector('.quantity input, .Quantity input');
    if (!priceEl || !qtyInput) return;
    const price = parseNumberLocal(priceEl.textContent || priceEl.dataset?.value || '0');
    const quantity = parseInt(qtyInput.value, 10) || 0;
    const totalPrice = product.querySelector('.total-price, .TotalPrice');
    if (totalPrice) {
      // update cell content (prefer numeric only for table)
      totalPrice.innerHTML = price * quantity;
    }
  }

  function updateTotal() {
    let sum = 0;
    let count = 0;
    cartView.querySelectorAll(".Product").forEach((product) => {
      const checkbox = product.querySelector("input[type='checkbox']");
      if (!checkbox || checkbox.checked) {
        // support table cells (.Price/.Quantity) and legacy (.price/.quantity)
        const priceEl = product.querySelector('.Price, .price');
        const qtyInput = product.querySelector('.Quantity input, .quantity input');
        const price = parseNumberLocal(
          (priceEl && (priceEl.textContent || priceEl.dataset?.value)) || "0"
        );
        const quantity = parseInt(qtyInput?.value || "0", 10) || 0;
        sum += price * quantity;
        if (checkbox) count++;
      }
    });
    if (totalMoney) totalMoney.textContent = formatCurrency(sum);
    if (totalLabel)
      totalLabel.textContent = `Total (${count} item${
        count !== 1 ? "s" : ""
      }):`;
    // keep table footer (visual) in sync when available
    try {
      if (typeof window.__cart_syncFooter === "function")
        window.__cart_syncFooter(sum, count);
    } catch (e) {}
  }

  function attachEvent(product) {
    const increaseBtn = product.querySelector(".increase");
    const decreaseBtn = product.querySelector(".decrease");
    const quantityInput = product.querySelector(".quantity input");
    const deleteBtn = product.querySelector(".actions .delete");
    if (increaseBtn)
      increaseBtn.addEventListener("click", () => {
        quantityInput.value = parseInt(quantityInput.value || 0, 10) + 1;
        updateProductTotal(product);
        updateTotal();
      });
    if (decreaseBtn)
      decreaseBtn.addEventListener("click", () => {
        if ((parseInt(quantityInput.value || 0, 10) || 0) > 1) {
          quantityInput.value = parseInt(quantityInput.value || 0, 10) - 1;
          updateProductTotal(product);
          updateTotal();
        }
      });
    if (quantityInput)
      quantityInput.addEventListener("change", () => {
        if ((parseInt(quantityInput.value || 0, 10) || 0) < 1)
          quantityInput.value = 1;
        updateProductTotal(product);
        updateTotal();
      });
    if (deleteBtn)
      deleteBtn.addEventListener("click", () => {
        product.remove();
        checkEmptyCart();
        updateTotal();
        showPopup("❌ Đã xóa sản phẩm khỏi giỏ hàng!");
      });
    const cb = product.querySelector("input[type='checkbox']");
    if (cb) cb.addEventListener("change", updateTotal);
  }

  function checkEmptyCart() {
    const products = cartView.querySelectorAll(".Product");
    const tfoot = cartView.querySelector("#cart-table tfoot");
    const container = cartView.querySelector("#Container");
    if (products.length === 0) {
      if (container)
        container.innerHTML = `<div class="empty-cart"><p>🛒 Chưa có sản phẩm nào trong giỏ hàng</p></div>`;
      if (tfoot) tfoot.style.display = "none";
    } else {
      if (tfoot) tfoot.style.display = ""; // restore default table footer display
    }
  }

  function showPopup(message) {
    if (!popup || !popupMessage) return;
    popupMessage.textContent = message;
    popup.style.display = "flex";
    setTimeout(() => {
      if (popup) popup.style.display = "none";
    }, 2500);
  }

  if (popupClose)
    popupClose.addEventListener("click", () => {
      if (popup) popup.style.display = "none";
    });
  if (deleteAllBtn)
    deleteAllBtn.addEventListener("click", () => {
      const checkedProducts = cartView.querySelectorAll(
        '.Product input[type="checkbox"]:checked'
      );
      if (checkedProducts.length === 0) {
        showPopup("⚠️ Bạn chưa chọn sản phẩm nào để xóa!");
        return;
      }
      checkedProducts.forEach((chk) => chk.closest(".Product")?.remove());
      checkEmptyCart();
      updateTotal();
      showPopup("🧹 Đã xóa các sản phẩm đã chọn!");
    });

  if (checkoutBtn)
    checkoutBtn.addEventListener("click", async () => {
      const checkedProducts = cartView.querySelectorAll(
        '.Product input[type="checkbox"]:checked'
      );
      if (checkedProducts.length === 0) {
        showPopup("⚠️ Bạn chưa chọn sản phẩm nào để thanh toán!");
        return;
      }
      const logged = localStorage.getItem("loggedInUser");
      if (!logged) {
        alert("Lỗi: Chưa đăng nhập");
        window.location.href = "../../index.html?openLogin=1";
        return;
      }
      const items = [];
      checkedProducts.forEach((chk) => {
        const li = chk.closest(".Product");
        if (!li) return;
        const pid = li.getAttribute("data-product-id");
        const name = li.querySelector(".info .name")?.textContent || "";
        const price = parseNumberLocal(
          li.querySelector(".price")?.textContent || "0"
        );
        const qty =
          parseInt(li.querySelector(".quantity input")?.value || "0", 10) || 0;
        items.push({
          productId: Number(pid) || null,
          name,
          price,
          quantity: qty,
        });
      });
      if (items.length === 0) {
        showPopup("⚠️ Không có sản phẩm hợp lệ");
        return;
      }
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      try {
        if (
          window.dataManager &&
          typeof window.dataManager.addOrder === "function"
        )
          window.dataManager.addOrder({
            customerUsername: logged,
            status: "new",
            items,
            total,
          });
        else {
          const orders = JSON.parse(localStorage.getItem("orders") || "[]");
          orders.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            customerUsername: logged,
            status: "new",
            items,
            total,
          });
          localStorage.setItem("orders", JSON.stringify(orders));
        }
        checkedProducts.forEach((chk) => chk.closest(".Product")?.remove());
        updateTotal();
        checkEmptyCart();
        showPopup("✅ Đơn hàng đã được lưu!");
        try {
          if (window.dataManager) window.dataManager.notifyListeners("orders");
        } catch (e) {}
      } catch (e) {
        console.error(e);
        showPopup("❌ Lưu đơn hàng thất bại");
      }
    });

  if (selectAll)
    selectAll.addEventListener("change", () => {
      const allCheckboxes = cartView.querySelectorAll(
        '.Product input[type="checkbox"]'
      );
      allCheckboxes.forEach((cb) => (cb.checked = selectAll.checked));
      updateTotal();
    });

  cartView.querySelectorAll(".Product").forEach(attachEvent);
  updateTotal();

  try {
    window.__cart_attachEvent = attachEvent;
    window.__cart_updateTotal = updateTotal;
    window.__cart_checkEmptyCart = checkEmptyCart;
    window.__cart_showPopup = showPopup;
  // Sync the new table footer (tfoot) controls.
    window.__cart_syncFooter = function (sum, count) {
      try {
        const tfoot = cartView.querySelector("#cart-table tfoot");
        if (!tfoot) return;

        // visual elements we added in the tfoot
        const visualChooseAll = tfoot.querySelector("#chooseALL");
        const moneyVisual = tfoot.querySelector(".money");
        const footerTotalCell = tfoot.querySelector(".footer-total");
        const deleteIcon = tfoot.querySelector(".delete-icon");
        const checkoutVisual = tfoot.querySelector(".checkout-visual");

        // Mirror total amount
        if (moneyVisual) moneyVisual.textContent =
          (typeof sum === "number" ? sum : parseFloat(String(sum) || 0));
        if (footerTotalCell) {
          const totalEl = footerTotalCell.querySelector('.total');
          if (totalEl) totalEl.textContent = `Total (${count} item${count !== 1 ? 's' : ''}):`;
        }

        // Keep visual select-all checkbox in sync with real selectAll
        if (visualChooseAll && selectAll) {
          // update visual when internal selectAll changes
          visualChooseAll.checked = !!selectAll.checked;
          // when user clicks visual, update real control and trigger its change
          if (!visualChooseAll.__synced) {
            visualChooseAll.addEventListener('change', () => {
              try {
                selectAll.checked = visualChooseAll.checked;
                selectAll.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (e) {}
            });
            visualChooseAll.__synced = true;
          }
        }

        // Wire visual delete icon to the existing deleteAllBtn behavior
        if (deleteIcon && deleteAllBtn && !deleteIcon.__wired) {
          deleteIcon.addEventListener('click', () => deleteAllBtn.click());
          deleteIcon.__wired = true;
        }

        // Wire visual checkout button to real checkout button
        if (checkoutVisual && checkoutBtn && !checkoutVisual.__wired) {
          checkoutVisual.addEventListener('click', () => checkoutBtn.click());
          checkoutVisual.__wired = true;
        }
      } catch (e) {}
    };
    // ensure footer sync runs once now (updateTotal was called above before sync existed)
    try {
      window.__cart_updateTotal && window.__cart_updateTotal();
    } catch (e) {}
  } catch (e) {}
  initCart._inited = true;
}

(function () {
  "use strict";

  function parseNumber(text) {
    if (!text && text !== 0) return 0;
    const n = parseFloat(String(text).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function updateRowTotal(row) {
    if (!row) return;
    const priceEl = row.querySelector(".Price");
    const qtyInput = row.querySelector(".Quantity input");
    const totalEl = row.querySelector(".TotalPrice");
    const price = parseNumber(
      priceEl?.dataset?.value || priceEl?.textContent || "0"
    );
    const qty = parseInt(qtyInput?.value || 0, 10) || 0;
    if (totalEl) totalEl.textContent = formatCurrency(price * qty);
  }

  function attachEventsToRow(row) {
    if (!row) return;
    const inc = row.querySelector(".increase");
    const dec = row.querySelector(".decrease");
    const qtyInput = row.querySelector(".Quantity input");
    const del = row.querySelector(".Actions .delete");
    const cb = row.querySelector('input[type="checkbox"]');
    if (inc)
      inc.addEventListener("click", () => {
        qtyInput.value = parseInt(qtyInput.value || 1, 10) + 1;
        updateRowTotal(row);
        try {
          window.__cart_updateTotal && window.__cart_updateTotal();
        } catch (e) {}
      });
    if (dec)
      dec.addEventListener("click", () => {
        const v = Math.max(1, parseInt(qtyInput.value || 1, 10) - 1);
        qtyInput.value = v;
        updateRowTotal(row);
        try {
          window.__cart_updateTotal && window.__cart_updateTotal();
        } catch (e) {}
      });
    if (qtyInput)
      qtyInput.addEventListener("change", () => {
        if ((parseInt(qtyInput.value || 0, 10) || 0) < 1) qtyInput.value = 1;
        updateRowTotal(row);
        try {
          window.__cart_updateTotal && window.__cart_updateTotal();
        } catch (e) {}
      });
    if (del)
      del.addEventListener("click", () => {
        row.remove();
        try {
          window.__cart_checkEmptyCart && window.__cart_checkEmptyCart();
          window.__cart_updateTotal && window.__cart_updateTotal();
          window.__cart_showPopup &&
            window.__cart_showPopup("❌ Đã xóa sản phẩm khỏi giỏ hàng!");
        } catch (e) {}
      });
    if (cb)
      cb.addEventListener("change", () => {
        try {
          window.__cart_updateTotal && window.__cart_updateTotal();
        } catch (e) {}
      });
  }

  try {
    const originalInit = window.initCart;
    window.initCart = function () {
      try {
        originalInit && originalInit();
      } catch (e) {}
      if (!cartView) return;
      const tbody = cartView.querySelector("#cart-table tbody");
      if (!tbody) return;
      tbody.querySelectorAll("tr.Product").forEach((r) => attachEventsToRow(r));
      try {
        window.__cart_updateTotal && window.__cart_updateTotal();
        window.__cart_checkEmptyCart && window.__cart_checkEmptyCart();
      } catch (e) {}
    };
  } catch (e) {}

  async function newAddOrUpdateCartItem(productId, qty) {
    try {
      const pid = String(productId);
      if (!cartView) return;
      // ensure cart is initialized (popup, helpers, etc.) so notifications work
      try { if (typeof initCart === 'function') initCart(); } catch(e) {}
      const tbody = cartView.querySelector("#cart-table tbody");
      if (!tbody) return;

      let product = (window.allProducts || []).find(
        (p) => String(p.id) === pid
      );
      if (!product) {
        try {
            const res = await fetch("../../json/products.json");
            const list = await res.json();
            product = list.find((p) => String(p.id) === pid);
          } catch (e) {
            product = null;
          }
      }
      if (!product) return;

      const existing = tbody.querySelector(
        `tr.Product[data-product-id="${pid}"]`
      );
      if (existing) {
        const qtyInput = existing.querySelector(".Quantity input");
        const prev = parseInt(qtyInput.value || 0, 10) || 0;
        qtyInput.value = prev + qty;
        updateRowTotal(existing);
        try {
          window.__cart_updateTotal && window.__cart_updateTotal();
          window.__cart_showPopup &&
            window.__cart_showPopup("✅ Đã cập nhật giỏ hàng");
          window.showAddToCartToast &&
            window.showAddToCartToast(
              "Đã thêm sản phẩm vào giỏ hàng",
              1000,
              "success"
            );
        } catch (e) {}
        return;
      }

      const tr = document.createElement("tr");
      tr.setAttribute("data-product-id", pid);
      // mark row with Product class so existing selectors find it
      tr.className = "Product";
      tr.innerHTML = `
        <td class="Choose"><input type="checkbox" checked /></td>
        <td class="ProductInfo">
          <div class="product-info">
            <img src="${product.mainImage || ""}" alt="${product.title || ""}" />
            <div>
              <div class="product-name">${product.title || ""}</div>
              <div class="product-meta">${product.specs && product.specs.Brand ? product.specs.Brand : ""}</div>
            </div>
          </div>
        </td>
        <td class="Price" data-value="${product.price}">${formatCurrency(product.price)}</td>
        <td class="Quantity"><button class="decrease">-</button><input type="number" min="1" value="${qty}" /><button class="increase">+</button></td>
        <td class="TotalPrice">${formatCurrency(product.price * qty)}</td>
        <td class="Actions"><button class="delete">🗑</button></td>
      `;

      tbody.appendChild(tr);
      attachEventsToRow(tr);
      try {
        window.__cart_updateTotal && window.__cart_updateTotal();
        window.__cart_checkEmptyCart && window.__cart_checkEmptyCart();
        window.__cart_showPopup &&
          window.__cart_showPopup("✅ Đã thêm vào giỏ hàng");
        window.showAddToCartToast &&
          window.showAddToCartToast("Đã thêm sản phẩm vào giỏ hàng");
      } catch (e) {}
    } catch (e) {
      console.error("newAddOrUpdateCartItem error", e);
    }
  }

  try {
    if (!window.addOrUpdateCartItem_original && window.addOrUpdateCartItem)
      window.addOrUpdateCartItem_original = window.addOrUpdateCartItem;
  } catch (e) {}
  try {
    window.addOrUpdateCartItem = newAddOrUpdateCartItem;
  } catch (e) {}
})();

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

// Fallback toast helper: used when popup markup is not present in DOM.
// Creates a small toast container (#ks-toast-container) and shows a toast.
if (!window.showAddToCartToast) {
  window.showAddToCartToast = function (message, timeout = 1800, type = "success") {
    try {
      // If the cart popup markup exists, prefer using it.
      const popupEl = document.getElementById('popup');
      const popupMessageEl = document.getElementById('popup-message');
      if (popupEl && popupMessageEl && typeof window.__cart_showPopup === 'function') {
        try { window.__cart_showPopup(message); } catch (e) {}
        return;
      }

      // Fallback: create a lightweight toast container
      let container = document.getElementById("ks-toast-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "ks-toast-container";
        document.body.appendChild(container);
      }

      const toast = document.createElement("div");
      toast.className = `ks-toast ks-toast--${type || "success"}`;
      toast.innerHTML = `
        <div class="ks-toast-message">${String(message)}</div>
        <div class="ks-toast-progress"><div class="ks-toast-progress-bar"></div></div>
      `;
      container.appendChild(toast);

      const bar = toast.querySelector(".ks-toast-progress-bar");
      const start = Date.now();
      const dur = Number(timeout) || 1800;

      // animate progress
      const tick = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 100 - (elapsed / dur) * 100);
        if (bar) bar.style.width = pct + "%";
        if (elapsed >= dur) {
          clearInterval(tick);
          toast.style.opacity = "0";
          setTimeout(() => toast.remove(), 220);
        }
      }, 50);

      // allow click to dismiss
      toast.addEventListener("click", () => {
        clearInterval(tick);
        toast.remove();
      });
    } catch (e) {
      try { console.error(e); } catch (e2) {}
    }
  };
}

// ===== BACK TO TOP BUTTON =====
document.addEventListener("DOMContentLoaded", () => {
  const btnTop = document.getElementById("btn-top");
  if (btnTop) {
    // Show/hide button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        btnTop.style.display = "flex";
      } else {
        btnTop.style.display = "none";
      }
    });

    // Scroll to top when clicked
    btnTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});

