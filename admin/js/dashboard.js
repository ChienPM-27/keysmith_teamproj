// ...existing code...
const viewdetailsBtn = document.querySelector('#view-details');

// Utility: read arrays from localStorage safely
function readArray(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}

// Compute metrics from localStorage keys: 'products', 'users', 'orders'
function getMetrics() {
    const products = readArray('products');
    const users = readArray('users');
    const orders = readArray('orders');

    const productCount = products.length;
    const userCount = users.length;
    const ordersCount = orders.length;

    // stock sum: support multiple field names (stock, qty, quantity)
    const stockTotal = products.reduce((sum, p) => {
        const qty = Number(p.stock ?? p.qty ?? p.quantity ?? 0);
        return sum + (isNaN(qty) ? 0 : qty);
    }, 0);

    // revenue: prefer order.total, otherwise compute from order.items (price * qty)
    const revenueTotal = orders.reduce((sum, o) => {
        if (typeof o.total === 'number') return sum + o.total;
        if (Array.isArray(o.items)) {
            return sum + o.items.reduce((s, it) => {
                const price = Number(it.price ?? it.unitPrice ?? 0);
                const qty = Number(it.qty ?? it.quantity ?? 0);
                return s + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
            }, 0);
        }
        return sum;
    }, 0);

    return { productCount, userCount, ordersCount, stockTotal, revenueTotal };
}
window.getMetrics = getMetrics; // expose for console/testing

function formatCurrency(n) {
    return n.toLocaleString(undefined, { style: 'currency', currency: 'VND', maximumFractionDigits: 2 });
}

// Update DOM placeholders (IDs must exist in your dashboard HTML)
function updateDashboard() {
    const { productCount, userCount, ordersCount, stockTotal, revenueTotal } = getMetrics();

    const el = (id) => document.getElementById(id);
    if (el('productCount')) el('productCount').textContent = productCount;
    if (el('userCount')) el('userCount').textContent = userCount;
    if (el('ordersCount')) el('ordersCount').textContent = ordersCount;
    if (el('stockTotal')) el('stockTotal').textContent = stockTotal;
    if (el('revenueTotal')) el('revenueTotal').textContent = formatCurrency(revenueTotal);
}

// init on load and refresh periodically
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    // refresh every 1s in case data changes elsewhere
    setInterval(updateDashboard, 1000);
});