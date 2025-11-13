// ========================================
// 🛠️ SHARED UTILITIES - Các hàm tiện ích dùng chung
// ========================================

// ========== IMPORTS ==========
import { dataManager } from "../admin/DatabaseManager.js";

// ========== CONSTANTS ==========
/**
 * Formatter tiền tệ USD
 */
export const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ========== UTILITY FUNCTIONS ==========
/**
 * Format số tiền thành chuỗi tiền tệ
 * @param {number} value - Giá trị số
 * @returns {string} Chuỗi tiền tệ đã format
 */
export function formatCurrency(value) {
  return CURRENCY_FORMATTER.format(value || 0);
}

/**
 * Escape HTML để tránh XSS
 * @param {string} text - Chuỗi cần escape
 * @returns {string} Chuỗi đã escape
 */
export function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Cập nhật số lượng items trong giỏ hàng trên header
 */
export function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartIcon = document.querySelector(".header-icons .cart");

  if (cartIcon) {
    let badge = cartIcon.querySelector(".cart-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "cart-badge";
      cartIcon.appendChild(badge);
    }
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "inline" : "none";
  }
}
