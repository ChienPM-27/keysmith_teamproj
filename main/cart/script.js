document.addEventListener("DOMContentLoaded", function () {
  const containerBox = document.querySelector("#Container ul");
  const deleteAllBtn = document.querySelector("#finalization .delete");
  const checkoutBtn = document.querySelector("#finalization .checkout");
  const totalMoney = document.querySelector("#finalization .money");
  const totalLabel = document.querySelector("#finalization .total");
  const selectAll = document.querySelector("#chooseALL");

  // 🧮 Cập nhật tổng tiền từng sản phẩm
  function updateProductTotal(product) {
    const price = parseFloat(product.querySelector(".price").textContent);
    const quantity = parseInt(product.querySelector(".quantity input").value);
    const totalPrice = product.querySelector(".total-price");
    totalPrice.innerHTML = (price * quantity) + '<i class="fa-solid fa-dollar-sign"></i>';
  }

  // 💰 Cập nhật tổng tiền toàn bộ giỏ hàng
  function updateTotal() {
    let sum = 0;
    const products = document.querySelectorAll(".Product");
    let count = 0;

    products.forEach(product => {
      const checkbox = product.querySelector("input[type='checkbox']");
      if (checkbox.checked) {
        const price = parseFloat(product.querySelector(".price").textContent);
        const quantity = parseInt(product.querySelector(".quantity input").value);
        sum += price * quantity;
        count++;
      }
    });

    totalMoney.textContent = sum;
    totalLabel.textContent = `Total (${count} item${count !== 1 ? "s" : ""}):`;
  }

  // ⚙️ Gắn sự kiện cho mỗi sản phẩm
  function attachEvent(product) {
    const increaseBtn = product.querySelector(".increase");
    const decreaseBtn = product.querySelector(".decrease");
    const quantityInput = product.querySelector(".quantity input");
    const deleteBtn = product.querySelector(".actions .delete");

    increaseBtn.addEventListener("click", () => {
      quantityInput.value = parseInt(quantityInput.value) + 1;
      updateProductTotal(product);
      updateTotal();
    });

    decreaseBtn.addEventListener("click", () => {
      if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        updateProductTotal(product);
        updateTotal();
      }
    });

    quantityInput.addEventListener("change", () => {
      if (quantityInput.value < 1) quantityInput.value = 1;
      updateProductTotal(product);
      updateTotal();
    });

    deleteBtn.addEventListener("click", () => {
      product.remove();
      checkEmptyCart();
      updateTotal();
      showPopup("❌ Đã xóa sản phẩm khỏi giỏ hàng!");
    });

    product.querySelector("input[type='checkbox']").addEventListener("change", updateTotal);
  }

  // 🗑️ Xóa nhiều sản phẩm cùng lúc
  deleteAllBtn.addEventListener("click", () => {
    const checkedProducts = document.querySelectorAll(".Product input[type='checkbox']:checked");
    if (checkedProducts.length === 0) {
      showPopup("⚠️ Bạn chưa chọn sản phẩm nào để xóa!");
      return;
    }
    checkedProducts.forEach(chk => chk.closest(".Product").remove());
    checkEmptyCart();
    updateTotal();
    showPopup("🧹 Đã xóa các sản phẩm đã chọn!");
  });

  // 💳 Thanh toán (Check Out)
  checkoutBtn.addEventListener("click", () => {
    const checkedProducts = document.querySelectorAll(".Product input[type='checkbox']:checked");
    if (checkedProducts.length === 0) {
      showPopup("⚠️ Bạn chưa chọn sản phẩm nào để thanh toán!");
    } else {
      checkedProducts.forEach(chk => chk.closest(".Product").remove());
      updateTotal();
      checkEmptyCart();
      showPopup("✅ Thanh toán thành công!");
    }
  });

  // ✅ Chọn tất cả
  selectAll.addEventListener("change", () => {
    const allCheckboxes = document.querySelectorAll(".Product input[type='checkbox']");
    allCheckboxes.forEach(cb => (cb.checked = selectAll.checked));
    updateTotal();
  });

  // 🛒 Kiểm tra giỏ hàng trống
  function checkEmptyCart() {
    const products = document.querySelectorAll(".Product");
    const finalization = document.getElementById("finalization");

    if (products.length === 0) {
      const container = document.getElementById("Container");
      container.innerHTML = `
        <div class="empty-cart">
          <p>🛒 Chưa có sản phẩm nào trong giỏ hàng</p>
        </div>
      `;
      if (finalization) finalization.style.display = "none";
    } else {
      if (finalization) finalization.style.display = "flex";
    }
  }

  // 🎯 Gắn sự kiện cho toàn bộ sản phẩm ban đầu
  document.querySelectorAll(".Product").forEach(attachEvent);

  // 🧾 Cập nhật lần đầu
  updateTotal();

  // --------------------------
  // 🎉 PHẦN POPUP THÔNG BÁO
  // --------------------------
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popup-message");
  const popupClose = document.getElementById("popup-close");

  // Hiển thị popup
  function showPopup(message) {
    popupMessage.textContent = message;
    popup.style.display = "flex";
    setTimeout(() => {
      popup.style.display = "none";
    }, 2500);
  }

  // Đóng popup thủ công
  popupClose.addEventListener("click", () => {
    popup.style.display = "none";
  });
});
