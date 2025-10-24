async function includeHTML(id, filePath) {
  const element = document.getElementById(id);
  if (!element) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    element.innerHTML = html;
  } catch (error) {
    console.error("Lỗi khi load file:", filePath, error);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  includeHTML("dashboard-section", "./components/dashboard.html");
  includeHTML("products-section", "./components/products.html");
  includeHTML("customer-section", "./components/customers.html");
  includeHTML("orders-section", "./components/orders.html");
  includeHTML("analytics-section", "./components/analytics.html");
  includeHTML("warehouse-section", "./components/warehouse.html");
});