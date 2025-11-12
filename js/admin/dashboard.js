// Nếu bạn dùng ES6 modules thì giữ import, nếu không thì dùng window.dataManager
// import { dataManager } from "./DatabaseManager.js"; 

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatCurrency(v) {
  return fmtCurrency.format(Number(v) || 0);
}

// Helper để lấy data an toàn (từ window hoặc import)
function getData(collection) {
  if (window.dataManager && typeof window.dataManager.getAll === "function") {
    return window.dataManager.getAll(collection) || [];
  }
  // Fallback nếu dùng import
  // return dataManager.getAll(collection) || [];
  return window.dataManager?.data?.[collection] || [];
}

const el = {
  userCount: () => document.getElementById("userCount"), // ID bên HTML phải trùng
  productCount: () => document.getElementById("productCount"),
  revenueTotal: () => document.getElementById("revenueTotal"),
  stockTotal: () => document.getElementById("stockTotal"),
  topProductsContainer: () => document.querySelector(".top-products .product-list"),
  // Lưu ý: HTML phải có class .status-card và class con (new, processing...)
  orderStatusCards: () => document.querySelectorAll(".order-status-grid .status-card"),
  completedOrders: () => document.getElementById("completedOrders"),
  pendingOrders: () => document.getElementById("pendingOrders"),
  totalImportValue: () => document.getElementById("totalImportValue")
};

function populateDashboard() {
  try {
    const products = getData("products");
    const customers = getData("customers");
    const orders = getData("orders");
    const importOrders = getData("importOrders");

    // 1. Customers & Products Count
    if (el.userCount()) el.userCount().textContent = customers.length;
    if (el.productCount()) el.productCount().textContent = products.length;

    // 2. Revenue Calculation (Sửa lại logic lấy totalPrice)
    let revenue = 0;
    orders.forEach(o => {
      // Chỉ tính đơn hàng đã giao thành công (nếu muốn)
      if (o.status === 'delivered') {
        // SỬA: Dùng totalPrice thay vì total
        revenue += Number(o.totalPrice || 0); 
      }
    });
    if (el.revenueTotal()) el.revenueTotal().textContent = formatCurrency(revenue);

    // 3. Stock Total
    const totalStock = products.reduce((s, p) => s + (Number(p.stock || 0)), 0);
    if (el.stockTotal()) el.stockTotal().textContent = totalStock;

    // 4. Top Products
    renderTopProducts(products);

    // 5. Order Status Counts
    const statusCounts = orders.reduce((acc, o) => {
      const st = (o.status || "new").toLowerCase();
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    const cards = el.orderStatusCards();
    if (cards && cards.length) {
      cards.forEach(card => {
        // Tìm class định danh status trong thẻ card
        const cls = Array.from(card.classList).find(c => ["new", "processing", "delivered", "cancelled"].includes(c));
        if (cls) {
          const count = statusCounts[cls] || 0;
          const countEl = card.querySelector(".status-count"); // HTML cần có class này trong card
          if (countEl) countEl.textContent = count;
        }
      });
    }

    // 6. Import / Warehouse Stats (Sửa lại Status và Tên biến)
    // Warehouse dùng 'delivered' cho đã nhập xong, 'processing' cho đang chờ
    if (el.completedOrders()) {
        // SỬA: status 'completed' -> 'delivered'
        el.completedOrders().textContent = (importOrders.filter(io => io.status === "delivered").length || 0);
    }
    if (el.pendingOrders()) {
        el.pendingOrders().textContent = (importOrders.filter(io => io.status === "processing").length || 0);
    }

    const totalImportValue = (importOrders || []).reduce((s, io) => {
        // SỬA: io.total -> io.amountPrice (dựa theo code warehouse)
        return s + (Number(io.amountPrice || 0));
    }, 0);
    
    if (el.totalImportValue()) el.totalImportValue().textContent = formatCurrency(totalImportValue);

  } catch (err) {
    console.error("Dashboard populate failed:", err);
  }
}

function renderTopProducts(products = []) {
  const container = el.topProductsContainer();
  if (!container) return;

  // Map dữ liệu
  const arr = products.map(p => ({
    id: p.id,
    title: p.title || p.name || "Untitled",
    sold: Number(p.sold || 0), // Đảm bảo trong Products có trường 'sold', nếu chưa có thì mặc định 0
    price: Number(p.price || 0),
    image: p.mainImage || p.image || "/img/blank-image.png",
  }));

  // Sort: Ưu tiên số lượng bán, nếu bằng nhau thì xếp theo giá
  arr.sort((a, b) => {
      if (b.sold !== a.sold) return b.sold - a.sold;
      return b.price - a.price;
  });

  // Tính revenue riêng cho từng sản phẩm (Sold * Price)
  const top5 = arr.slice(0, 5);
  
  container.innerHTML = "";
  top5.forEach((p, idx) => {
    const productRevenue = p.sold * p.price;
    
    const div = document.createElement("div");
    div.className = "product-item";
    // CSS inline cho nhanh, nên đưa vào file .css
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "12px";
    div.style.marginBottom = "12px";
    div.style.paddingBottom = "8px";
    div.style.borderBottom = "1px solid #333";

    div.innerHTML = `
      <div class="product-rank" style="min-width:30px; text-align:center; font-weight:bold; color: #ffa500;">#${idx + 1}</div>
      <img src="${p.image}" alt="${p.title}" style="width:48px; height:48px; object-fit:cover; border-radius:6px; background:#fff;" />
      <div class="product-details" style="flex:1; overflow:hidden;">
        <h4 style="margin:0; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</h4>
        <p style="margin:2px 0 0; font-size:12px; color:#888">Sold: <strong style="color:#eee">${p.sold}</strong></p>
      </div>
      <div class="product-revenue" style="font-weight:600; font-size:13px;">${formatCurrency(productRevenue)}</div>
    `;
    container.appendChild(div);
  });
}

function wireDashboardInteractions() {
  // Mapping giữa Card trên Dashboard và Index của Sidebar
  // Giả sử thứ tự Sidebar: 0:Dashboard, 1:Products, 2:Customers, 3:Orders, ..., 5:Warehouse
  // Bạn cần kiểm tra lại thứ tự sidebar trong HTML thực tế để điền index đúng
  const navMap = [
    { cardSelector: "#card-customers", sidebarIndex: 2 }, // Ví dụ Customers là tab thứ 3 (index 2)
    { cardSelector: "#card-products", sidebarIndex: 1 },
    { cardSelector: "#card-orders", sidebarIndex: 3 },
    { cardSelector: "#card-warehouse", sidebarIndex: 5 }, // Warehouse
  ];

  const sidebarItems = document.querySelectorAll(".sidebar .middle-sidebar .sidebar-list .sidebar-list-item");

  navMap.forEach(map => {
    // Sửa lại selector cho đúng với ID bạn đặt trong HTML Dashboard
    // Ví dụ HTML: <div class="card-single" id="card-customers">...</div>
    const card = document.querySelector(map.cardSelector) || document.querySelector(`.card-single:nth-child(${navMap.indexOf(map) + 1})`); 
    
    if (card && sidebarItems[map.sidebarIndex]) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        // Kích hoạt sự kiện click vào sidebar để logic admin.js xử lý active class
        sidebarItems[map.sidebarIndex].click();
      });
    }
  });
}

// Export hàm init để admin.js gọi
export function initDashboardModule() {
  console.log("Dashboard Module Loaded");
  populateDashboard();
  wireDashboardInteractions();
}

// Tự động chạy nếu file này được nhúng riêng lẻ
document.addEventListener("DOMContentLoaded", () => {
    if(!window._dashboardModuleInited) {
        initDashboardModule();
        window._dashboardModuleInited = true;
    }
});