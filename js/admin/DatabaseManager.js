// DatabaseManager: Quản lý dữ liệu tạm thời trong localStorage
/*
 * ===============================
 * 📦 CẤU TRÚC DỮ LIỆU TRONG localStorage (đã cập nhật)
 * ===============================
 *
 * {
 *   products: [
 *     {
 *       id: Number,                // Mã sản phẩm duy nhất
 *       title: String,             // Tên sản phẩm
 *       shortDesc: String,         // Mô tả ngắn
 *       longDesc: String,          // Mô tả chi tiết
 *       image: String,             // Ảnh chính
 *       mainImage: String,         // Ảnh lớn hiển thị chính
 *       thumbnails: [String],      // Danh sách ảnh phụ
 *       specs: {                   // Thông tin chi tiết
 *         category: String,        // Danh mục (Thời trang, Điện tử,...)
 *         brand: String,           // Thương hiệu
 *         color: String            // Màu sắc
 *       },
 *       price: Number,             // Giá bán
 *       importPrice: Number,       // Giá nhập
 *       stock: Number,             // Số lượng tồn kho
 *       sold: Number,              // Số lượng đã bán
 *       status: String             // Trạng thái: "available", "out of stock", ...
 *     },
 *     ...
 *   ],
 *
 *   customers: [
 *      {
 *           username: String,          // Tên đăng nhập
 *           password: String,          // Mật khẩu
 *           img: String,               // Ảnh đại diện (data URL hoặc đường dẫn)
 *           firstName: String,         // Tên
 *           lastName: String,          // Họ
 *           email: String,             // Email
 *           phone: String,             // Số điện thoại
 *           address: String,           // Địa chỉ
 *           dateOfBirth: String,       // Ngày sinh (yyyy-mm-dd)
 *           status: String             // "active" hoặc "inactive"
 *       },
 *       ...
 *   ],
 *
 *   orders: [
 *     {
 *       idOrder: Number,          // Mã đơn hàng (numeric id)
 *       username: String,         // Người mua (tham chiếu đến customers.username)
 *       items: [                  // Danh sách sản phẩm trong đơn
 *         { id: Number, quantity: Number, unitPrice: Number, amountPrice: Number }
 *       ],
 *       totalPrice: Number,       // Tổng tiền đơn hàng
 *       date: String,             // Ngày tạo đơn hàng (ISO string)
 *       status: String,           // Trạng thái: "new", "processing", "delivered", "cancelled"
 *       userDeliveryPhone: String,   // Số điện thoại nhận hàng (tồn tại trên từng order)
 *       userDeliveryAdress: String,  // Địa chỉ nhận hàng (tồn tại trên từng order)
 *     }
 *   ],
 *
 *   importOrders: [
 *     {
 *       idImportOrders: Number,   // Mã phiếu nhập (chuỗi số, không ký tự đặc biệt)
 *       id: Number,               // ID sản phẩm được nhập (tham chiếu products.id)
 *       date: String,             // Ngày tạo phiếu nhập (ISO string)
 *       quantity: Number,         // Số lượng nhập
 *       unitImportPrice: Number,  // Giá nhập mỗi sản phẩm
 *       amountPrice: Number,      // Thành tiền nhập
 *       status: String            // "processing", "delivered", "canceled"
 *     }
 *   ]
 * }
 *
 * ===============================
 * 💡 CÁCH SỬ DỤNG:
 * ===============================
 *
 * Khai báo trong file JS:
 * import { dataManager } from "./js/admin/DatabaseManager.js";
 *
 * Khai báo trong file HTML (chỉ khi trong file JS chưa import dòng trên):
 * <script type="module">
 *   import { dataManager } from "./js/admin/DatabaseManager.js";
 * </script>
 *
 * Khai báo trong file HTML (tất cả file JS đã import dòng trên cùng):
 * <script type="module" src="<Đường dẫn tới file JS>"></script>
 *
 * Ví dụ sử dụng:
 * Trong store.js:
 * import { dataManager } from "./DatabaseManager.js";
 * const allProducts = dataManager.getAll("products");
 * console.log(allProducts); // Lúc này sẽ hiện vào console danh sách products
 *
 * Trong admin.html:
 * <script type="module" src="./store.js"></script> // Là file JS sẽ hoạt đông? (chắc vậy)
 *
 * LƯU Ý:
 * - Trường định danh cho orders là `idOrder`.
 * - Trường định danh cho importOrders là `idImportOrders` (trong khi `id` trong importOrders được giữ
 *   để tham chiếu tới mã sản phẩm nếu trước đây dữ liệu dùng `id` cho mục đích đó).
 */

class DatabaseManager {
  constructor(initialData = {}) {
    this.storageKey = "database";
    this.data = this.load() || initialData;

    // Đảm bảo có đủ 4 bảng
    this.data.products = this.data.products || [];
    this.data.customers = this.data.customers || [];
    this.data.orders = this.data.orders || [];
    this.data.importOrders = this.data.importOrders || [];

    this.save();
  }

  // ===============================
  // 🔹 Lưu / Tải dữ liệu
  // ===============================

  /**
   * Lưu dữ liệu hiện tại xuống localStorage
   * @example
   * dataManager.save();
   */
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  /**
   * Đọc dữ liệu từ localStorage (nếu có)
   * @returns {Object|null}
   * @example
   * const savedData = dataManager.load();
   */
  load() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Xóa toàn bộ dữ liệu trong localStorage và đặt lại cấu trúc rỗng
   * @example
   * dataManager.clearStorage();
   */
  clearStorage() {
    localStorage.removeItem(this.storageKey);
    this.data = { products: [], customers: [], orders: [], importOrders: [] };
  }

  // ===============================
  // 🔹 CRUD cơ bản
  // ===============================

  /**
   * Lấy toàn bộ dữ liệu trong một bảng (table)
   * @param {string} table - "products", "customers", "orders" hoặc "importOrders"
   * @returns {Array}
   * @example
   * const products = dataManager.getAll("products");
   */
  getAll(table) {
    return this.data[table] || [];
  }

  /**
   * Lấy bản ghi theo ID trong bảng
   * @param {string} table
   * @param {number} id
   * @returns {Object|null}
   * @example
   * const product = dataManager.getById("products", 1);
   */
  getById(table, id) {
    if (!this.data[table]) return null;
    if (table === "orders") {
      return (
        this.data.orders.find((obj) => obj.idOrder == id || obj.id == id) ||
        null
      );
    }
    if (table === "importOrders") {
      // prefer idImportOrders; fallback to id if needed
      return (
        this.data.importOrders.find(
          (obj) => obj.idImportOrders == id || obj.id == id
        ) || null
      );
    }
    return this.data[table].find((obj) => obj.id === id) || null;
  }

  /**
   * Thêm một bản ghi mới vào bảng
   * Nếu là orders hoặc importOrders thì tự động xử lý logic liên quan
   * @param {string} table
   * @param {Object} item
   * @returns {Object} item vừa thêm
   * @example
   * dataManager.add("products", { id: 3, name: "Giày Nike", specs: {brand: "Nike"}, stock: 5, sold: 0 });
   */
  add(table, item) {
    if (!this.data[table]) this.data[table] = [];

    // Nếu là order hoặc importOrder → xử lý đặc biệt
    if (table === "orders") {
      this.#handleNewOrder(item);
    } else if (table === "importOrders") {
      this.#handleNewImportOrder(item);
    } else {
      this.data[table].push(item);
    }

    this.save();
    return item;
  }

  /**
   * Cập nhật bản ghi theo ID
   * @param {string} table
   * @param {number} id
   * @param {Object} newData
   * @returns {Object|null} bản ghi sau khi cập nhật
   * @example
   * dataManager.updateById("products", 1, { stock: 8 });
   */
  updateById(table, id, newData) {
    const list = this.data[table];
    if (!list) return null;
    let index = -1;
    if (table === "orders")
      index = list.findIndex((obj) => obj.idOrder == id || obj.id == id);
    else if (table === "importOrders")
      index = list.findIndex((obj) => obj.idImportOrders == id || obj.id == id);
    else index = list.findIndex((obj) => obj.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...newData };
      this.save();
      return list[index];
    }
    return null;
  }

  /**
   * Xóa bản ghi theo ID
   * @param {string} table
   * @param {number} id
   * @returns {Object|null} bản ghi đã xóa
   * @example
   * dataManager.deleteById("customers", 2);
   */
  deleteById(table, id) {
    const list = this.data[table];
    if (!list) return null;
    let index = -1;
    if (table === "orders")
      index = list.findIndex((obj) => obj.idOrder == id || obj.id == id);
    else if (table === "importOrders")
      index = list.findIndex((obj) => obj.idImportOrders == id || obj.id == id);
    else index = list.findIndex((obj) => obj.id === id);
    if (index !== -1) {
      const removed = list.splice(index, 1);
      this.save();
      return removed[0];
    }
    return null;
  }

  // ===============================
  // 🔹 Getter / Setter thuộc tính cụ thể
  // ===============================

  /**
   * Lấy giá trị thuộc tính cụ thể của một bản ghi
   * @param {string} table
   * @param {number} id
   * @param {string} prop
   * @returns {*}
   * @example
   * const stock = dataManager.getProperty("products", 1, "stock");
   */
  getProperty(table, id, prop) {
    const obj = this.getById(table, id);
    return obj ? obj[prop] : undefined;
  }

  /**
   * Gán giá trị cho thuộc tính cụ thể của một bản ghi
   * @param {string} table
   * @param {number} id
   * @param {string} prop
   * @param {*} value
   * @returns {Object|null}
   * @example
   * dataManager.setProperty("customers", 1, "status", "inactive");
   */
  setProperty(table, id, prop, value) {
    const obj = this.getById(table, id);
    if (obj) {
      obj[prop] = value;
      this.save();
      return obj;
    }
    return null;
  }

  // ===============================
  // 🔹 PRODUCTS
  // ===============================

  /**
   * Lấy tất cả danh mục sản phẩm duy nhất
   * @returns {Array<string>}
   * @example
   * const categories = dataManager.getAllCategories();
   */
  getAllCategories() {
    return [
      ...new Set(
        this.data.products.map((p) => p.specs?.category).filter(Boolean)
      ),
    ];
  }

  /**
   * Lấy tất cả thương hiệu sản phẩm duy nhất
   * @returns {Array<string>}
   * @example
   * const brands = dataManager.getAllBrands();
   */
  getAllBrands() {
    return [
      ...new Set(this.data.products.map((p) => p.specs?.brand).filter(Boolean)),
    ];
  }

  /**
   * Lấy tất cả màu sắc sản phẩm duy nhất
   * @returns {Array<string>}
   * @example
   * const colors = dataManager.getAllColors();
   */
  getAllColors() {
    return [
      ...new Set(this.data.products.map((p) => p.specs?.color).filter(Boolean)),
    ];
  }

  // ===============================
  // 🔹 CUSTOMERS
  // ===============================

  /**
   * Lấy khách hàng theo username
   * @param {string} username
   * @returns {Object|null}
   * @example
   * const user = dataManager.getCustomerByUsername("hoai01");
   */
  getCustomerByUsername(username) {
    return this.data.customers.find((c) => c.username === username);
  }

  // ===============================
  // 🔹 ORDERS
  // ===============================

  /**
   * Lấy tất cả đơn hàng theo username (của khách hàng)
   * @param {string} username
   * @returns {Array<Object>}
   * @example
   * const orders = dataManager.getOrdersByUsername("hoai01");
   */
  getOrdersByUsername(username) {
    return this.data.orders.filter((o) => o.username === username);
  }

  /**
   * Lấy tất cả đơn hàng theo trạng thái
   * @param {string} status
   * @returns {Array<Object>}
   * @example
   * const pending = dataManager.getOrdersByStatus("new");
   */
  getOrdersByStatus(status) {
    return this.data.orders.filter((o) => o.status === status);
  }

  // ===============================
  // 🔹 IMPORT ORDERS
  // ===============================

  /**
   * Lấy tất cả đơn nhập hàng theo trạng thái
   * @param {string} status
   * @returns {Array<Object>}
   * @example
   * const waitingImports = dataManager.getImportOrdersByStatus("processing");
   */
  getImportOrdersByStatus(status) {
    return this.data.importOrders.filter((io) => io.status === status);
  }

  // ===============================
  // 🔹 Cập nhật trạng thái đơn hàng / nhập hàng
  // ===============================

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {number} orderId
   * @param {string} status - "new", "processing", "delivered", "cancelled"
   * @returns {Object|null}
   * @example
   * dataManager.updateOrderStatus(1, "cancelled");
   */
  updateOrderStatus(orderId, status) {
    const order = this.getById("orders", orderId);
    if (!order) return null;

    if (status === "cancelled" && order.status !== "cancelled") {
      order.items.forEach((item) => {
        const product = this.getById("products", item.id);
        if (product) {
          product.stock += item.quantity;
          product.sold = Math.max(0, product.sold - item.quantity);
        }
      });
    }

    order.status = status;
    this.save();
    return order;
  }

  /**
   * Cập nhật trạng thái đơn nhập hàng
   * @param {number} importOrderId
   * @param {string} status - "processing", "delivered", "cancelled"
   * @returns {Object|null}
   * @example
   * dataManager.updateImportOrderStatus(2, "cancelled");
   */
  updateImportOrderStatus(importOrderId, status) {
    const imp = this.getById("importOrders", importOrderId);
    if (!imp) return null;

    if (status === "cancelled" && imp.status !== "cancelled") {
      // product reference may be in productId (preferred) or legacy id
      const prodRef = imp.productId || imp.id;
      const product = this.getById("products", prodRef);
      if (product) {
        product.stock = Math.max(0, product.stock - imp.quantity);
      }
    }

    imp.status = status;
    this.save();
    return imp;
  }

  // ===============================
  // 🔹 Xử lý đơn hàng (private)
  // ===============================

  /**
   * Xử lý logic khi thêm đơn hàng mới:
   * - Tính tổng tiền
   * - Trừ tồn kho
   * - Cộng số lượng sold
   * @param {Object} order
   * @private
   */
  #handleNewOrder(order) {
    order.items = (order.items || []).map((item) => {
      const amountPrice = (item.quantity || 0) * (item.unitPrice || 0);
      return { ...item, amountPrice };
    });

    order.totalPrice = order.items.reduce(
      (sum, it) => sum + (it.amountPrice || 0),
      0
    );
    order.status = order.status || "new";

    const maxId = this.data.orders.reduce(
      (m, x) => Math.max(m, Number(x.idOrder) || 0),
      0
    );
    if (
      typeof order.idOrder === "undefined" ||
      order.idOrder === null ||
      order.idOrder === ""
    ) {
      order.idOrder = maxId + 1;
    } else {
      const parsed = Number(order.idOrder);
      if (!Number.isNaN(parsed)) order.idOrder = parsed;
    }

    if (!order.date) order.date = new Date().toISOString();

    order.items.forEach((item) => {
      const product = this.getById("products", item.id);
      if (product) {
        product.stock = Math.max(
          0,
          (product.stock || 0) - (item.quantity || 0)
        );
        product.sold = (product.sold || 0) + (item.quantity || 0);
      }
    });

    this.data.orders.push(order);
  }

  /**
   * Xử lý logic khi thêm đơn nhập hàng mới:
   * - Tính tổng tiền nhập
   * - Cộng tồn kho
   * @param {Object} importOrder
   * @private
   */
  #handleNewImportOrder(importOrder) {
    importOrder.amountPrice =
      (importOrder.quantity || 0) * (importOrder.unitImportPrice || 0);
    importOrder.status = importOrder.status || "processing";

    let productIdRef = null;
    if (typeof importOrder.productId !== "undefined") {
      productIdRef = importOrder.productId;
    } else if (
      typeof importOrder.id !== "undefined" &&
      this.getById("products", importOrder.id)
    ) {
      productIdRef = importOrder.id;
    }

    const maxImpId = this.data.importOrders.reduce(
      (m, x) => Math.max(m, Number(x.idImportOrders) || 0),
      0
    );
    if (
      typeof importOrder.idImportOrders === "undefined" ||
      importOrder.idImportOrders === null ||
      importOrder.idImportOrders === ""
    ) {
      importOrder.idImportOrders = maxImpId + 1;
    } else {
      const p = Number(importOrder.idImportOrders);
      if (!Number.isNaN(p)) importOrder.idImportOrders = p;
      else importOrder.idImportOrders = maxImpId + 1;
    }

    if (productIdRef) importOrder.productId = productIdRef;

    const prodRef = importOrder.productId || importOrder.id;
    if (prodRef) {
      const product = this.getById("products", prodRef);
      if (product) {
        product.stock = (product.stock || 0) + (importOrder.quantity || 0);
      }
    }

    if (!importOrder.date) importOrder.date = new Date().toISOString();

    this.data.importOrders.push(importOrder);
  }
}

// ===============================
// 🔹 Khởi tạo và xuất đối tượng
// ===============================
import { sampleData } from "../sampledata/sampleData.js";

export const dataManager = new DatabaseManager(sampleData);
window.dataManager = dataManager; // Truy cập từ console

