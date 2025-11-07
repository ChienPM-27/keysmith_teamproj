// main/store/script.js — scoped, optimized, DOM-ready
// Exposes only window.showCartView and window.addOrUpdateCartItem

(function () {
  "use strict";

  // Small helper for safe query
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Page state
  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  let filteredProducts = [];

  // Elements (initialized on DOMContentLoaded)
  let btn_top, storeView, detailView, pro_container, backBtn;

  // ----- Utilities -----
  function safe(fn) {
    try { fn(); } catch (e) { /* ignore */ }
  }

  function parseNumber(text) {
    if (!text) return 0;
    const n = parseFloat(String(text).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  // ----- Cross-module helpers (login + order persistence) -----
  function getLoggedInUser() {
    return localStorage.getItem('loggedInUser') || null;
  }

  function openLoginUI() {
    // try to open existing modal (index-style modalOverlay or .login). If not present, redirect to index.
    const modalOverlay = document.getElementById('modalOverlay') || document.getElementById('registerOverlay');
    const legacyLogin = document.querySelector('.login');
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      return;
    }
    if (legacyLogin) {
      legacyLogin.style.display = 'flex';
      return;
    }
    window.location.href = '../../index.html?openLogin=1';
  }

  async function saveOrderForUser(username, orderData) {
    try {
      if (window.dataManager && typeof window.dataManager.addOrder === 'function') {
        return window.dataManager.addOrder({ customerUsername: username, status: 'new', items: orderData.items, total: orderData.total, shippingAddress: orderData.shippingAddress });
      } else {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const newOrder = { id: Date.now(), date: new Date().toISOString(), customerUsername: username, status: 'new', items: orderData.items, total: orderData.total, shippingAddress: orderData.shippingAddress };
        orders.unshift(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
      }
    } catch (e) {
      console.error('saveOrder error', e);
      return null;
    }
  }

  // ----- Cart API (scoped to this file) -----
  function initCart() {
    if (initCart._inited) return;
    const cartView = $('#cart-view');
    if (!cartView) return;

    const containerUl = $('#Container ul', cartView);
    const deleteAllBtn = $('#finalization .delete', cartView);
    const checkoutBtn = $('#finalization .checkout', cartView);
    const totalMoney = $('#finalization .money', cartView);
    const totalLabel = $('#finalization .total', cartView);
    const selectAll = $('#chooseALL', cartView);
    const popup = $('#popup', cartView);
    const popupMessage = $('#popup-message', cartView);
    const popupClose = $('#popup-close', cartView);

    function updateProductTotal(product) {
      const priceEl = $('.price', product);
      const qtyInput = product.querySelector('.quantity input');
      if (!priceEl || !qtyInput) return;
      const price = parseNumber(priceEl.textContent);
      const quantity = parseInt(qtyInput.value, 10) || 0;
      const totalPrice = product.querySelector('.total-price');
      if (totalPrice) totalPrice.innerHTML = (price * quantity) + '<i class="fa-solid fa-dollar-sign"></i>';
    }

    function updateTotal() {
      let sum = 0;
      const products = $$('.Product', cartView);
      let count = 0;
      products.forEach(product => {
        const checkbox = product.querySelector("input[type='checkbox']");
        if (!checkbox || checkbox.checked) {
          const price = parseNumber(product.querySelector('.price')?.textContent);
          const quantity = parseInt(product.querySelector('.quantity input')?.value) || 0;
          sum += price * quantity;
          if (checkbox) count++;
        }
      });
      if (totalMoney) totalMoney.textContent = sum;
      if (totalLabel) totalLabel.textContent = `Total (${count} item${count !== 1 ? "s" : ""}):`;
    }

    function attachEvent(product) {
      const increaseBtn = product.querySelector('.increase');
      const decreaseBtn = product.querySelector('.decrease');
      const quantityInput = product.querySelector('.quantity input');
      const deleteBtn = product.querySelector('.actions .delete');

      if (increaseBtn) increaseBtn.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value || 0, 10) + 1;
        updateProductTotal(product);
        updateTotal();
      });

      if (decreaseBtn) decreaseBtn.addEventListener('click', () => {
        if ((parseInt(quantityInput.value, 10) || 0) > 1) {
          quantityInput.value = parseInt(quantityInput.value || 0, 10) - 1;
          updateProductTotal(product);
          updateTotal();
        }
      });

      if (quantityInput) quantityInput.addEventListener('change', () => {
        if ((parseInt(quantityInput.value, 10) || 0) < 1) quantityInput.value = 1;
        updateProductTotal(product);
        updateTotal();
      });

      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        product.remove();
        checkEmptyCart();
        updateTotal();
        showPopup('❌ Đã xóa sản phẩm khỏi giỏ hàng!');
      });

      const cb = product.querySelector("input[type='checkbox']");
      if (cb) cb.addEventListener('change', updateTotal);
    }

    function checkEmptyCart() {
      const products = $$('.Product', cartView);
      const finalization = $('#finalization', cartView);
      const container = $('#Container', cartView);
      if (products.length === 0) {
        if (container) container.innerHTML = `\n        <div class="empty-cart">\n          <p>🛒 Chưa có sản phẩm nào trong giỏ hàng</p>\n        </div>\n      `;
        if (finalization) finalization.style.display = 'none';
        // when cart becomes empty, mark back button so it can refresh the page
        try { if (backBtn) backBtn.dataset.refreshOnEmpty = '1'; } catch (e) {}
      } else {
        if (finalization) finalization.style.display = 'flex';
        try { if (backBtn) delete backBtn.dataset.refreshOnEmpty; } catch (e) {}
      }
    }

    function showPopup(message) {
      if (!popup || !popupMessage) return;
      popupMessage.textContent = message;
      popup.style.display = 'flex';
      setTimeout(() => { if (popup) popup.style.display = 'none'; }, 2500);
    }

    function gatherCheckedItems() {
      const checked = cartView.querySelectorAll('.Product input[type="checkbox"]:checked');
      const items = [];
      checked.forEach(chk => {
        const li = chk.closest('.Product');
        if (!li) return;
        const pid = li.getAttribute('data-product-id');
        const name = li.querySelector('.info .name')?.textContent || '';
        const price = parseNumber(li.querySelector('.price')?.textContent || '0');
        const qty = parseInt(li.querySelector('.quantity input')?.value || '0', 10) || 0;
        items.push({ productId: Number(pid) || null, name, price, quantity: qty });
      });
      return items;
    }

    async function handleCheckout() {
      const checkedProducts = cartView.querySelectorAll('.Product input[type="checkbox"]:checked');
      if (checkedProducts.length === 0) {
        showPopup('⚠️ Bạn chưa chọn sản phẩm nào để thanh toán!');
        return;
      }

      const logged = getLoggedInUser();
      if (!logged) {
        try { window.alert('Lỗi: Chưa đăng nhập'); } catch(e){}
        // redirect user to index/login page after acknowledging
        window.location.href = '../../index.html?openLogin=1';
        return;
      }

      const items = gatherCheckedItems();
      if (items.length === 0) { showPopup('⚠️ Không có sản phẩm hợp lệ'); return; }

      const total = items.reduce((s,i) => s + (i.price * i.quantity), 0);
      // try to get shipping/address from dataManager customers or localStorage
      let shippingAddress = '';
      try {
        if (window.dataManager) {
          const cust = window.dataManager.getCustomer(logged);
          if (cust) shippingAddress = cust.address || '';
        } else {
          const customers = JSON.parse(localStorage.getItem('customers') || '[]');
          const cust = customers.find(c=>c.username===logged);
          if (cust) shippingAddress = cust.address || '';
        }
      } catch(e){}

      const orderData = { items, total, shippingAddress };
      const created = await saveOrderForUser(logged, orderData);
      if (created) {
        // remove checked items from cart
        checkedProducts.forEach(chk => chk.closest('.Product')?.remove());
        safe(() => window.__cart_updateTotal && window.__cart_updateTotal());
        safe(() => window.__cart_checkEmptyCart && window.__cart_checkEmptyCart());
        safe(() => window.__cart_showPopup && window.__cart_showPopup('✅ Đơn hàng đã được lưu!'));
        safe(() => window.showAddToCartToast && window.showAddToCartToast('✅ Đã gửi đơn hàng', 1200, 'success'));
        // if admin panel open, signal reload
        try { if (window.dataManager) window.dataManager.notifyListeners('orders'); } catch(e){}
      } else {
        showPopup('❌ Lưu đơn hàng thất bại');
      }
    }

    if (popupClose) popupClose.addEventListener('click', () => { if (popup) popup.style.display = 'none'; });

    if (deleteAllBtn) deleteAllBtn.addEventListener('click', () => {
      const checkedProducts = cartView.querySelectorAll('.Product input[type="checkbox"]:checked');
      if (checkedProducts.length === 0) { showPopup('⚠️ Bạn chưa chọn sản phẩm nào để xóa!'); return; }
      checkedProducts.forEach(chk => chk.closest('.Product')?.remove());
      checkEmptyCart();
      updateTotal();
      showPopup('🧹 Đã xóa các sản phẩm đã chọn!');
    });

    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
      safe(handleCheckout);
    });

    if (selectAll) selectAll.addEventListener('change', () => {
      const allCheckboxes = cartView.querySelectorAll('.Product input[type="checkbox"]');
      allCheckboxes.forEach(cb => (cb.checked = selectAll.checked));
      updateTotal();
    });

    // attach events to existing products
    $$('.Product', cartView).forEach(attachEvent);
    updateTotal();

    // expose helpers so dynamically added items can be wired
    try {
      window.__cart_attachEvent = attachEvent;
      window.__cart_updateTotal = updateTotal;
      window.__cart_checkEmptyCart = checkEmptyCart;
      window.__cart_showPopup = showPopup;
    } catch (e) {}

    initCart._inited = true;
  }

  function closeCartView() {
    const cartView = $('#cart-view');
    if (!cartView) return;
    cartView.style.display = 'none';
  }

  function showCartView() {
    const cartView = $('#cart-view');
    if (!cartView) return;
    // hide other page views
    if (storeView) storeView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    cartView.style.display = 'block';
    if (backBtn) backBtn.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    safe(initCart);
  }

  // add or update cart item (exposed)
  function addOrUpdateCartItem(productId, qty) {
    const p = allProducts.find(px => px.id === productId);
    if (!p) return;

    const cartView = $('#cart-view');
    if (!cartView) return;
    const ul = $('#Container ul', cartView);
    if (!ul) return;

    safe(initCart);

    const existing = ul.querySelector(`.Product[data-product-id="${productId}"]`);
    if (existing) {
      const qtyInput = existing.querySelector('.quantity input');
      const prev = parseInt(qtyInput.value, 10) || 0;
      qtyInput.value = prev + qty;
      const price = Number(p.price) || 0;
      const totalPriceEl = existing.querySelector('.total-price');
      if (totalPriceEl) totalPriceEl.innerHTML = (price * (prev + qty)) + '<i class="fa-solid fa-dollar-sign"></i>';
      safe(() => window.__cart_updateTotal && window.__cart_updateTotal());
      safe(() => window.__cart_showPopup && window.__cart_showPopup('✅ Đã cập nhật giỏ hàng'));
      // also show bottom-right toast even when updating existing item
      safe(() => window.showAddToCartToast && window.showAddToCartToast('Đã thêm sản phẩm vào giỏ hàng', 1000, 'success'));
      try { if (backBtn) delete backBtn.dataset.refreshOnEmpty; } catch (e) {}
      return;
    }

    const li = document.createElement('li');
    li.className = 'Product';
    li.setAttribute('data-product-id', productId);
    li.innerHTML = `
      <input type="checkbox" />
      <img src="${p.mainImage || ''}" alt="${p.title || ''}" />
      <div class="info">
        <h3 class="name">${p.title || ''}</h3>
      </div>
      <div class="price">${p.price}<i class="fa-solid fa-dollar-sign"></i></div>
      <div class="quantity">
        <button class="decrease">-</button>
        <input type="number" value="${qty}" min="1" />
        <button class="increase">+</button>
      </div>
      <div class="total-price">${p.price * qty}<i class="fa-solid fa-dollar-sign"></i></div>
      <div class="actions">
        <button class="delete">🗑</button>
      </div>
    `;

    ul.appendChild(li);
    safe(() => window.__cart_attachEvent && window.__cart_attachEvent(li));
    safe(() => window.__cart_updateTotal && window.__cart_updateTotal());
    safe(() => window.__cart_checkEmptyCart && window.__cart_checkEmptyCart());
    safe(() => window.__cart_showPopup && window.__cart_showPopup('✅ Đã thêm vào giỏ hàng'));
    // also show bottom-right toast for quick feedback
    safe(() => window.showAddToCartToast && window.showAddToCartToast('Đã thêm sản phẩm vào giỏ hàng'));
    // adding an item should clear the "refresh on empty" flag
    try { if (backBtn) delete backBtn.dataset.refreshOnEmpty; } catch (e) {}
  }

  // ----- Store / Product list -----
  // ----- Toast / Notification (bottom-right) -----
  // Creates a container+styles once and shows short toasts with progress bar
  function _ensureToastContainer() {
    if ($('#ks-toast-container')) return;
    // create only the container; styles moved to `main/store/style.css`
    const container = document.createElement('div');
    container.id = 'ks-toast-container';
    document.body.appendChild(container);
  }

  // message: text to show
  // duration: ms to show before auto-dismiss
  // type: 'success' | 'info' | 'error' — controls accent color
  function showAddToCartToast(message = 'Đã thêm sản phẩm vào giỏ hàng', duration = 1000, type = 'success') {
    try {
      _ensureToastContainer();
      const container = $('#ks-toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'ks-toast ks-toast--' + (type || 'success');
      toast.innerHTML = `
        <div class="ks-toast-message">${message}</div>
        <div class="ks-toast-progress"><div class="ks-toast-progress-bar"></div></div>
      `;

      // show multiple toasts: put newest at the top
      container.prepend(toast);

      // animate progress bar from 100% to 0% over duration
      const bar = toast.querySelector('.ks-toast-progress-bar');
      // force style calculation then set width to 0 to animate
      requestAnimationFrame(() => {
        if (bar) {
          bar.style.transition = `width ${duration}ms linear`;
          bar.style.width = '0%';
        }
      });

      // remove after duration + small buffer
      const removeAfter = duration + 150;
      setTimeout(() => {
        toast.style.transition = 'opacity 180ms ease';
        toast.style.opacity = '0';
        setTimeout(() => {
          try { container.removeChild(toast); } catch (e) {}
        }, 200);
      }, removeAfter);
    } catch (e) {
      // swallow errors to keep add-to-cart flow safe
      console.warn('toast error', e);
    }
  }

  // expose for manual use or testing
  try { window.showAddToCartToast = showAddToCartToast; } catch (e) {}
  function populateFilters(products, els) {
    const { brandsSelect, categorySelect, colorSelect } = els;
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
        const tokens = colorRaw.split(/\s*[–—,-/]\s*/);
        tokens.forEach((t) => { const tok = t.trim(); if (tok) colors.add(tok); });
      }
    });

    if (brandsSelect) {
      brandsSelect.innerHTML = `<option value="">Hãng sản xuất</option>`;
      Array.from(brands).sort().forEach(b => brandsSelect.insertAdjacentHTML('beforeend', `<option value="${b}">${b}</option>`));
    }
    if (categorySelect) {
      categorySelect.innerHTML = `<option value="">Danh mục / Bộ sưu tập</option>`;
      Array.from(categories).sort().forEach(c => categorySelect.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    }
    if (colorSelect) {
      colorSelect.innerHTML = `<option value="">Màu sắc</option>`;
      Array.from(colors).sort().forEach(c => colorSelect.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
    }
  }

  function applyFilters(els) {
    const { searchInput, statusSelect, brandsSelect, categorySelect, colorSelect, sortSelect, priceMinInput, priceMaxInput } = els;
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
        if ((p.status || "").toLowerCase() !== status.toLowerCase()) return false;
      }
      if (brand) {
        if ((p.specs?.Brand || "") !== brand) return false;
      }
      if (category) {
        const catRaw = p.specs?.Category || "";
        const parts = catRaw.split("/").map(s => s.trim());
        const last = parts[parts.length - 1] || "";
        const normalized = last.replace(/Collection/i, "").trim();
        if (normalized !== category) return false;
      }
      if (color) {
        const colorRaw = p.specs?.Color || "";
        const tokens = colorRaw.split(/\s*[–—,-/]\s*/).map(t => t.trim());
        if (!tokens.includes(color)) return false;
      }
      if (min && p.price < min) return false;
      if (max && max > 0 && p.price > max) return false;
      return true;
    });

    if (sort === 'incre-price') filteredProducts.sort((a,b) => a.price - b.price);
    else if (sort === 'decre-price') filteredProducts.sort((a,b) => b.price - a.price);

    currentPage = 1;
    renderPage(currentPage, els);
  }

  function renderPage(page, els) {
    const { pro_container, pagination } = els;
    if (!pro_container) return;
    pro_container.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredProducts.slice(start, end);

    pageItems.forEach((product) => {
      const pro = document.createElement('div');
      pro.className = 'pro';
      // attach product id so delegation can use it
      pro.dataset.productId = product.id;
      pro.innerHTML = `
        <img src="${product.mainImage}" alt="${product.title}">
        <div class="des">
          <span>${product.specs?.Category || ''}</span>
          <h4>${product.title}</h4>
          <h5>$${product.price}</h5>
        </div>
        <a href="#" class="buy"><i class="fa-solid fa-cart-shopping"></i></a>
      `;
  pro.addEventListener('click', () => showProductDetail(product.id));
      // per-item buy handler may exist but we also use container delegation (see initStore)
      const buyA = pro.querySelector('.buy');
      if (buyA) {
        buyA.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          try { if (storeView && getComputedStyle(storeView).display === 'block') addOrUpdateCartItem(product.id, 1); } catch (err) {}
        });
      }
      pro_container.appendChild(pro);
    });

    // pagination
    if (pagination) {
      pagination.innerHTML = '';
      const left = document.createElement('a');
      left.href = '#'; left.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
      left.addEventListener('click', (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; renderPage(currentPage, els); } });
      pagination.appendChild(left);

      for (let i = 1; i <= totalPages; i++) {
        const a = document.createElement('a'); a.href = '#'; a.textContent = i; if (i === currentPage) a.classList.add('active-page');
        a.addEventListener('click', (e) => { e.preventDefault(); currentPage = i; renderPage(currentPage, els); });
        pagination.appendChild(a);
      }

      const right = document.createElement('a'); right.href = '#'; right.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
      right.addEventListener('click', (e) => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; renderPage(currentPage, els); } });
      pagination.appendChild(right);
    }
  }

  // ----- Product detail -----
  function showProductDetail(id) {
    const p = allProducts.find(pp => pp.id === id);
    if (!p) return alert('Không tìm thấy sản phẩm.');
    // hide cart if open
    safe(closeCartView);

    if (storeView) storeView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';
    if (backBtn) backBtn.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    $('#productTitle').textContent = p.title;
    $('#productDesc').textContent = p.shortDesc;
    $('#productRating').textContent = p.rating;
    $('#productPrice').textContent = `$${p.price}`;
    $('#productOldPrice').textContent = `$${p.oldPrice}`;
    $('#productDiscount').textContent = `-${p.discount}%`;
    $('#productLongDesc').textContent = p.longDesc;

    // thumbnails / slider
    const thumbContainer = $('.thumbnail-list');
    if (thumbContainer) {
      thumbContainer.innerHTML = `
        <div class="image-slider" id="imageSlider">
          <div class="slides"></div>
          <div class="slider-dots" id="sliderDots"></div>
        </div>
      `;
      const slidesContainer = $('.slides', thumbContainer);
      const dotsContainer = $('#sliderDots', thumbContainer);
      const images = [p.mainImage, ...(p.thumbnails || [])].slice(0, 3);
      let currentIndex = 0;
      images.forEach((src, i) => {
        const img = document.createElement('img'); img.src = src; slidesContainer.appendChild(img);
        const dot = document.createElement('span'); ['mouseenter','click'].forEach(evt => dot.addEventListener(evt, () => goToSlide(i)));
        dotsContainer.appendChild(dot);
      });
      function updateSlider() { slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`; $$('#sliderDots span', thumbContainer).forEach((dot,i)=>dot.classList.toggle('active', i===currentIndex)); }
      function goToSlide(index){ currentIndex = index; updateSlider(); }
      setInterval(()=>{ currentIndex = (currentIndex + 1) % images.length; updateSlider(); }, 4000);
      updateSlider();
    }

    // specs
    const specsTable = $('#productSpecs');
    if (specsTable) {
      specsTable.innerHTML = '';
      for (let [k,v] of Object.entries(p.specs || {})) specsTable.innerHTML += `<tr><td>${k}</td><td>${v}</td></tr>`;
    }

    // quantity
    const qty = $('#quantity');
    const inc = $('#increase');
    const dec = $('#decrease');
    if (inc) inc.onclick = () => { if (qty) qty.value = +qty.value + 1; };
    if (dec) dec.onclick = () => { if (qty) qty.value = Math.max(1, +qty.value - 1); };

    // wire add-cart and buy-now inside detail
    try {
      const addBtn = document.querySelector('.add-cart');
      const buyNowBtn = document.querySelector('.buy-now');
      if (addBtn) addBtn.onclick = (e) => { e.preventDefault(); const q = parseInt($('#quantity')?.value || 1, 10) || 1; addOrUpdateCartItem(p.id, q); };
      if (buyNowBtn) buyNowBtn.onclick = (e) => { e.preventDefault(); const q = parseInt($('#quantity')?.value || 1, 10) || 1; addOrUpdateCartItem(p.id, q); safe(showCartView); };
    } catch (err) {}
  }

  // ----- Back button and startup wiring -----
  function wireBackButton() {
    if (!backBtn) return;
    backBtn.addEventListener('click', () => {
      // if the cart was emptied and we've flagged the back button, refresh the page
      try { if (backBtn && backBtn.dataset.refreshOnEmpty === '1') { window.location.reload(); return; } } catch (e) {}
      const cartOverlay = document.getElementById('cart-overlay');
      if (cartOverlay) {
        cartOverlay.remove();
        Array.from(document.querySelectorAll('script[src]')).forEach(s => {
          try { const src = s.getAttribute('src') || ''; if (src.includes('/main/cart/') || src.includes('/cart/')) s.remove(); } catch(e){}
        });
        safe(closeCartView);
        if (storeView) storeView.style.display = 'block';
        backBtn.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // normal: close detail, ensure cart closed, go to store
      if (detailView) detailView.style.display = 'none';
      safe(closeCartView);
      if (storeView) storeView.style.display = 'block';
      backBtn.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----- Dynamic share links -----
  function wireShareLinks() {
    const currentURL = window.location.href;
    const title = $('#productTitle')?.textContent || 'KeySmith Product';
    const setShareLink = (selector, url) => { const el = document.querySelector(selector); if (el) el.href = url; };
    setShareLink('.share-fb', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`);
    setShareLink('.share-pinterest', `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentURL)}&description=${encodeURIComponent(title)}`);
    setShareLink('.share-tiktok', `https://www.tiktok.com/share?url=${encodeURIComponent(currentURL)}`);
    setShareLink('.share-twitter', `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent(title)}`);
    setShareLink('.share-instagram', `https://www.instagram.com/?url=${encodeURIComponent(currentURL)}`);
  }

  // ----- Initialize store (fetch + wire controls) -----
  function initStore() {
    // anchor elements
    btn_top = $('#btn-top');
    storeView = $('#store-view');
    detailView = $('#product-detail');
    pro_container = $('#pro-container');
    backBtn = $('#back-btn');

    // Ensure navbar login/profile icon opens login UI (like index.html)
    try {
      const profileIcon = document.querySelector('.profile');
      if (profileIcon) {
        profileIcon.addEventListener('click', (e) => {
          // if it's a link, prevent navigation and open login UI
          try { e.preventDefault(); } catch (err) {}
          openLoginUI();
        });
      }
    } catch (e) {}

    if (btn_top) btn_top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // fetch products
    fetch('./detail/product.json').then(res => res.json()).then(products => {
      allProducts = products || [];
      filteredProducts = [...allProducts];

      // UI elements
      const pagination = $('#pagination');
      const searchInput = $('#search-input');
      const searchButton = $('#search-button');
      const statusSelect = $('#status');
      const brandsSelect = $('#brands');
      const categorySelect = $('#category');
      const colorSelect = $('#color');
      const sortSelect = $('#sort');
      const priceMinInput = $('#price-min');
      const priceMaxInput = $('#price-max');

      const els = { pro_container, pagination, searchInput, searchButton, statusSelect, brandsSelect, categorySelect, colorSelect, sortSelect, priceMinInput, priceMaxInput };

      // Event delegation for buy buttons: ensures the buy button works reliably even after re-renders
      try {
        if (pro_container && !pro_container.__buyDelegation) {
          pro_container.addEventListener('click', (e) => {
            const buy = e.target.closest('.buy');
            if (!buy) return;
            e.preventDefault();
            e.stopPropagation();
            const pro = buy.closest('.pro');
            const pid = pro?.dataset?.productId || null;
            if (!pid) return;
            try { if (storeView && getComputedStyle(storeView).display === 'block') addOrUpdateCartItem(pid, 1); } catch (err) {}
          });
          pro_container.__buyDelegation = true;
        }
      } catch (e) { }

      populateFilters(allProducts, { brandsSelect, categorySelect, colorSelect });
      renderPage(currentPage, els);

      if (searchButton) searchButton.addEventListener('click', () => applyFilters(els));
      if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFilters(els); });
      [statusSelect, brandsSelect, categorySelect, colorSelect, sortSelect].forEach(el => { if (el) el.addEventListener('change', () => applyFilters(els)); });
      [priceMinInput, priceMaxInput].forEach(el => { if (el) el.addEventListener('change', () => applyFilters(els)); });

    }).catch(err => console.error('Lỗi đọc JSON:', err));

    // back button and initial hide
    wireBackButton();
    if (backBtn) backBtn.style.display = 'none';
    safe(closeCartView);

    // attach share links
    wireShareLinks();

    // expose minimal API for inline handlers
    try { window.showCartView = showCartView; window.addOrUpdateCartItem = addOrUpdateCartItem; } catch (e) {}
  }

  // run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStore);
  } else {
    initStore();
  }

})();

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
            <h5>$${product.price}</h5>
          </div>
          <a href="#" class="buy"><i class="fa-solid fa-cart-shopping"></i></a>
        `;
        // clicking the product container opens detail
        pro.addEventListener("click", () => showProductDetail(product.id));
        // clicking the buy button adds to cart (only when store view is visible)
        const buyA = pro.querySelector('.buy');
        if (buyA) {
          buyA.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // only act when store view is active
            try {
              const sv = storeView;
              if (sv && getComputedStyle(sv).display === 'block') {
                addOrUpdateCartItem(product.id, 1);
              }
            } catch (err) {}
          });
        }
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
    if (searchButton)
      searchButton.addEventListener("click", () => applyFilters());
    if (searchInput)
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyFilters();
      });
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
  })
  .catch((err) => console.error("Lỗi đọc JSON:", err));

// ===== Show Product Detail =====
function showProductDetail(id) {
  const p = allProducts.find((p) => p.id === id);
  if (!p) return alert("Không tìm thấy sản phẩm.");
  // ensure cart is hidden when opening product detail
  try { closeCartView(); } catch (e) {}

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
    ["mouseenter", "click"].forEach((evt) =>
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

  // wire detail page add-cart and buy-now buttons
  try {
    const addBtn = document.querySelector('.add-cart');
    const buyNowBtn = document.querySelector('.buy-now');
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        const q = parseInt(document.getElementById('quantity')?.value) || 1;
        addOrUpdateCartItem(p.id, q);
      };
    }
    if (buyNowBtn) {
      buyNowBtn.onclick = (e) => {
        e.preventDefault();
        const q = parseInt(document.getElementById('quantity')?.value) || 1;
        addOrUpdateCartItem(p.id, q);
        // show cart view after adding
        try { showCartView(); } catch (err) {}
      };
    }
  } catch (err) {}
}

// Show Cart View (called from header navbar onclick="showCartView()")
function showCartView() {
  const cartView = document.getElementById("cart-view");
  if (!cartView) return; // nothing to do if cart view not present

  // Hide other views
  if (storeView) storeView.style.display = "none";
  if (detailView) detailView.style.display = "none";

  // Show cart
  cartView.style.display = "block";
  if (backBtn) backBtn.style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
  // initialize cart behavior when first shown
  try { initCart(); } catch (e) { /* ignore init errors */ }
}

// Expose as global for inline onclick handlers
try {
  window.showCartView = showCartView;
} catch (e) {}

// ===== Cart initialization (merged from main/cart/script.js) =====
function initCart() {
  if (initCart._inited) return;
  const cartView = document.getElementById('cart-view');
  if (!cartView) return;

  // scoped selectors inside cart view
  const containerBox = cartView.querySelector('#Container ul');
  const deleteAllBtn = cartView.querySelector('#finalization .delete');
  const checkoutBtn = cartView.querySelector('#finalization .checkout');
  const totalMoney = cartView.querySelector('#finalization .money');
  const totalLabel = cartView.querySelector('#finalization .total');
  const selectAll = cartView.querySelector('#chooseALL');
  const popup = cartView.querySelector('#popup');
  const popupMessage = cartView.querySelector('#popup-message');
  const popupClose = cartView.querySelector('#popup-close');

  // helper: safe parse float from text
  function parseNumber(text) {
    if (!text) return 0;
    const n = parseFloat(text.toString().replace(/[^0-9.-]+/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function updateProductTotal(product) {
    const priceEl = product.querySelector('.price');
    const qtyInput = product.querySelector('.quantity input');
    if (!priceEl || !qtyInput) return;
    const price = parseNumber(priceEl.textContent);
    const quantity = parseInt(qtyInput.value) || 0;
    const totalPrice = product.querySelector('.total-price');
    if (totalPrice) totalPrice.innerHTML = (price * quantity) + '<i class="fa-solid fa-dollar-sign"></i>';
  }

  function updateTotal() {
    let sum = 0;
    const products = cartView.querySelectorAll('.Product');
    let count = 0;
    products.forEach(product => {
      const checkbox = product.querySelector("input[type='checkbox']");
      if (!checkbox || checkbox.checked) {
        const price = parseNumber(product.querySelector('.price')?.textContent);
        const quantity = parseInt(product.querySelector('.quantity input')?.value) || 0;
        sum += price * quantity;
        if (checkbox) count++;
      }
    });
    if (totalMoney) totalMoney.textContent = sum;
    if (totalLabel) totalLabel.textContent = `Total (${count} item${count !== 1 ? "s" : ""}):`;
  }

  function attachEvent(product) {
    const increaseBtn = product.querySelector('.increase');
    const decreaseBtn = product.querySelector('.decrease');
    const quantityInput = product.querySelector('.quantity input');
    const deleteBtn = product.querySelector('.actions .delete');

    if (increaseBtn) increaseBtn.addEventListener('click', () => {
      quantityInput.value = parseInt(quantityInput.value) + 1;
      updateProductTotal(product);
      updateTotal();
    });

    if (decreaseBtn) decreaseBtn.addEventListener('click', () => {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        updateProductTotal(product);
        updateTotal();
      }
    });

    if (quantityInput) quantityInput.addEventListener('change', () => {
      if (quantityInput.value < 1) quantityInput.value = 1;
      updateProductTotal(product);
      updateTotal();
    });

    if (deleteBtn) deleteBtn.addEventListener('click', () => {
      product.remove();
      checkEmptyCart();
      updateTotal();
      showPopup('❌ Đã xóa sản phẩm khỏi giỏ hàng!');
    });

    const cb = product.querySelector("input[type='checkbox']");
    if (cb) cb.addEventListener('change', updateTotal);
  }

  const checkEmptyCart = () => {
    const products = cartView.querySelectorAll('.Product');
    const finalization = cartView.querySelector('#finalization');
    const container = cartView.querySelector('#Container');
    if (products.length === 0) {
      if (container) container.innerHTML = `\n        <div class="empty-cart">\n          <p>🛒 Chưa có sản phẩm nào trong giỏ hàng</p>\n        </div>\n      `;
      if (finalization) finalization.style.display = 'none';
      try { if (backBtn) backBtn.dataset.refreshOnEmpty = '1'; } catch (e) {}
    } else {
      if (finalization) finalization.style.display = 'flex';
      try { if (backBtn) delete backBtn.dataset.refreshOnEmpty; } catch (e) {}
    }
  };

  function showPopup(message) {
    if (!popup || !popupMessage) return;
    popupMessage.textContent = message;
    popup.style.display = 'flex';
    setTimeout(() => { if (popup) popup.style.display = 'none'; }, 2500);
  }

  if (popupClose) popupClose.addEventListener('click', () => { if (popup) popup.style.display = 'none'; });

  // delete all
  if (deleteAllBtn) deleteAllBtn.addEventListener('click', () => {
    const checkedProducts = cartView.querySelectorAll('.Product input[type="checkbox"]:checked');
    if (checkedProducts.length === 0) { showPopup('⚠️ Bạn chưa chọn sản phẩm nào để xóa!'); return; }
    checkedProducts.forEach(chk => chk.closest('.Product')?.remove());
    checkEmptyCart();
    updateTotal();
    showPopup('🧹 Đã xóa các sản phẩm đã chọn!');
  });

  if (checkoutBtn) checkoutBtn.addEventListener('click', async () => {
    const checkedProducts = cartView.querySelectorAll('.Product input[type="checkbox"]:checked');
    if (checkedProducts.length === 0) { showPopup('⚠️ Bạn chưa chọn sản phẩm nào để thanh toán!'); return; }

    const logged = localStorage.getItem('loggedInUser');
    if (!logged) {
      try { window.alert('Lỗi: Chưa đăng nhập'); } catch(e){}
      window.location.href = '../../index.html?openLogin=1';
      return;
    }

    // gather items
    const items = [];
    checkedProducts.forEach(chk => {
      const li = chk.closest('.Product'); if (!li) return;
      const pid = li.getAttribute('data-product-id');
      const name = li.querySelector('.info .name')?.textContent || '';
      const price = parseNumber(li.querySelector('.price')?.textContent || '0');
      const qty = parseInt(li.querySelector('.quantity input')?.value || '0', 10) || 0;
      items.push({ productId: Number(pid) || null, name, price, quantity: qty });
    });
    if (items.length === 0) { showPopup('⚠️ Không có sản phẩm hợp lệ'); return; }

    const total = items.reduce((s,i) => s + (i.price * i.quantity), 0);
    // try to get shipping address
    let shippingAddress = '';
    try { const customers = JSON.parse(localStorage.getItem('customers') || '[]'); const cust = customers.find(c=>c.username===logged); if (cust) shippingAddress = cust.address || ''; } catch(e){}

    try {
      if (window.dataManager && typeof window.dataManager.addOrder === 'function') {
        window.dataManager.addOrder({ customerUsername: logged, status: 'new', items, total, shippingAddress });
      } else {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.unshift({ id: Date.now(), date: new Date().toISOString(), customerUsername: logged, status: 'new', items, total, shippingAddress });
        localStorage.setItem('orders', JSON.stringify(orders));
      }

      // remove checked items
      checkedProducts.forEach(chk => chk.closest('.Product')?.remove());
      updateTotal();
      checkEmptyCart();
      showPopup('✅ Đơn hàng đã được lưu!');
      try { if (window.dataManager) window.dataManager.notifyListeners('orders'); } catch(e){}
    } catch (e) {
      console.error('checkout error', e);
      showPopup('❌ Lưu đơn hàng thất bại');
    }
  });

  if (selectAll) selectAll.addEventListener('change', () => {
    const allCheckboxes = cartView.querySelectorAll('.Product input[type="checkbox"]');
    allCheckboxes.forEach(cb => (cb.checked = selectAll.checked));
    updateTotal();
  });

  // attach events to existing products
  cartView.querySelectorAll('.Product').forEach(attachEvent);
  // initial total
  updateTotal();

  // expose helpers so newly appended items can be wired later
  try {
    window.__cart_attachEvent = attachEvent;
    window.__cart_updateTotal = updateTotal;
    window.__cart_checkEmptyCart = checkEmptyCart;
    window.__cart_showPopup = showPopup;
  } catch (e) {}

  initCart._inited = true;
}


// ===== Back to Store =====
if (backBtn) {
  backBtn.addEventListener("click", () => {
    // if cart was emptied and we've flagged the back button, refresh the page
    try { if (backBtn && backBtn.dataset.refreshOnEmpty === '1') { window.location.reload(); return; } } catch (e) {}
    // If cart overlay is open, close it first
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) {
      cartOverlay.remove();
      // remove cart-injected scripts if any (only those from ../cart/)
      Array.from(document.querySelectorAll("script[src]")).forEach((s) => {
        try {
          const src = s.getAttribute("src") || "";
          if (src.includes("/main/cart/") || src.includes("/cart/")) {
            s.remove();
          }
        } catch (e) {}
      });
      // don't remove cart styles globally since they may be shared; optional: keep them
      try { closeCartView(); } catch (e) {}
      storeView.style.display = "block";
      backBtn.style.display = "none";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Otherwise, behave as before (close product detail)
    detailView.style.display = "none";
    try { closeCartView(); } catch (e) {}
    storeView.style.display = "block";
    backBtn.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Ẩn nút Back mặc định khi đang ở store view
if (backBtn) backBtn.style.display = "none";
// ensure cart is hidden on initial load
try { closeCartView(); } catch (e) {}

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
