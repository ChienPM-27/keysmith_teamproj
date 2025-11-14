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
  return window.dataManager?.data?.[collection] || [];
}

const el = {
  userCount: () => document.getElementById("userCount"),
  productCount: () => document.getElementById("productCount"),
  revenueTotal: () => document.getElementById("revenueTotal"),
  stockTotal: () => document.getElementById("stockTotal"),
  topProductsContainer: () => document.querySelector(".top-products .product-list"),
  orderStatusCards: () => document.querySelectorAll(".order-status-grid .status-card"),
  completedOrders: () => document.getElementById("completedOrders"),
  pendingOrders: () => document.getElementById("pendingOrders"),
  totalImportValue: () => document.getElementById("totalImportValue")
};

function populateDashboard() {
  try {
    const products = dataManager.getAll("products") || [];
    const customers = dataManager.getAll("customers") || [];
    const orders = dataManager.getAll("orders") || [];
    const importOrders = dataManager.getAll("importOrders") || [];

    // 1. Customers & Products Count
    const userCount = customers.length || 0;
    const productCount = products.length || 0;
    if (el.userCount()) el.userCount().textContent = userCount;
    if (el.productCount()) el.productCount().textContent = productCount;

    // --- 2. REVENUE CALCULATION ---
    let revenue = 0;
    orders.forEach(o => {
      const status = (o.status || "").toLowerCase();
      
      // Chỉ tính revenue cho các đơn không bị hủy
      if (status !== 'cancelled' && status !== 'canceled') {
        // Lấy giá trị an toàn (totalPrice, total, hoặc amountPrice)
        const val = Number(o.totalPrice) || Number(o.total) || Number(o.amountPrice) || 0;
        revenue += val;
      }
    });
    if (el.revenueTotal()) el.revenueTotal().textContent = formatCurrency(revenue);

    // 3. Stock Total - tổng số lượng tồn kho
    const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
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
        const cls = Array.from(card.classList).find(c => ["new", "processing", "delivered", "cancelled"].includes(c));
        if (cls) {
          const count = statusCounts[cls] || 0;
          const countEl = card.querySelector(".status-count");
          if (countEl) countEl.textContent = count;
        }
      });
    }

    // 6. Import / Warehouse Stats
    if (el.completedOrders()) {
        el.completedOrders().textContent = (importOrders.filter(io => io.status === "delivered").length || 0);
    }
    if (el.pendingOrders()) {
        el.pendingOrders().textContent = (importOrders.filter(io => io.status === "processing").length || 0);
    }

    const totalImportValue = (importOrders || []).reduce((s, io) => {
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

  const arr = products.map(p => ({
    id: p.id,
    title: p.title || p.name || "Untitled",
    sold: Number(p.sold || 0),
    price: Number(p.price || 0),
    image: p.mainImage || p.image || "/img/blank-image.png",
  }));

  arr.sort((a, b) => {
      if (b.sold !== a.sold) return b.sold - a.sold;
      return b.price - a.price;
  });

  const top5 = arr.slice(0, 5);
  
  container.innerHTML = "";
  top5.forEach((p, idx) => {
    const productRevenue = p.sold * p.price;
    
    const div = document.createElement("div");
    div.className = "product-item";
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
  const navMap = [
    { cardSelector: "#card-customers", sidebarIndex: 2 },
    { cardSelector: "#card-products", sidebarIndex: 1 },
    { cardSelector: "#card-orders", sidebarIndex: 3 },
    { cardSelector: "#card-warehouse", sidebarIndex: 5 },
  ];

  const sidebarItems = document.querySelectorAll(".sidebar .middle-sidebar .sidebar-list .sidebar-list-item");

  navMap.forEach(map => {
    const card = document.querySelector(map.cardSelector) || document.querySelector(`.card-single:nth-child(${navMap.indexOf(map) + 1})`); 
    
    if (card && sidebarItems[map.sidebarIndex]) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        sidebarItems[map.sidebarIndex].click();
      });
    }
  });
}

export function initDashboardModule() {
  console.log("Dashboard Module Loaded");
  populateDashboard();
  wireDashboardInteractions();
}

document.addEventListener("DOMContentLoaded", () => {
    if(!window._dashboardModuleInited) {
        initDashboardModule();
        window._dashboardModuleInited = true;
    }
});