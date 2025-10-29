// ==================== DATA MANAGER - QUẢN LÝ DỮ LIỆU TẬP TRUNG ====================

class DataManager {
    constructor() {
        this.data = {
            products: [],
            customers: [],
            orders: [],
            warehouse: []
        };
        this.listeners = {};
        this.initialized = false;
    }

    // Khởi tạo và load tất cả dữ liệu
    async initialize() {
        if (this.initialized) return;
        
        try {
            await Promise.all([
                this.loadProducts(),
                this.loadCustomers(),
                this.loadOrders(),
                this.loadWarehouse()
            ]);
            this.initialized = true;
            console.log('✅ DataManager initialized successfully');
            this.notifyListeners('initialized');
        } catch (error) {
            console.error('❌ DataManager initialization failed:', error);
        }
    }

    // ==================== LOAD DỮ LIỆU ====================
    
    async loadProducts() {
        try {
            const response = await fetch('../json/products.json');
            const products = await response.json();
            
            // Lấy dữ liệu stock và sold từ localStorage
            const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
            
            this.data.products = products.map(product => {
                const saved = savedProducts.find(p => p.id === product.id);
                return {
                    ...product,
                    stock: saved?.stock || Math.floor(Math.random() * 100) + 50,
                    sold: saved?.sold || Math.floor(Math.random() * 200)
                };
            });

            this.saveProducts();
            this.notifyListeners('products');
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    async loadCustomers() {
        const saved = localStorage.getItem('customers');
        if (saved) {
            this.data.customers = JSON.parse(saved);
        } else {
            // Dữ liệu mẫu ban đầu
            this.data.customers = this.generateSampleCustomers();
            this.saveCustomers();
        }
        this.notifyListeners('customers');
    }

    async loadOrders() {
        const saved = localStorage.getItem('orders');
        if (saved) {
            this.data.orders = JSON.parse(saved);
        } else {
            // Dữ liệu mẫu ban đầu
            this.data.orders = this.generateSampleOrders();
            this.saveOrders();
        }
        this.notifyListeners('orders');
    }

    async loadWarehouse() {
        const saved = localStorage.getItem('warehouse');
        if (saved) {
            this.data.warehouse = JSON.parse(saved);
        } else {
            this.data.warehouse = [];
            this.saveWarehouse();
        }
        this.notifyListeners('warehouse');
    }

    // ==================== GETTERS ====================
    
    getProducts() {
        return [...this.data.products];
    }

    getProduct(id) {
        return this.data.products.find(p => p.id === id);
    }

    getCustomers() {
        return [...this.data.customers];
    }

    getCustomer(username) {
        return this.data.customers.find(c => c.username === username);
    }

    getOrders() {
        return [...this.data.orders];
    }

    getOrder(id) {
        return this.data.orders.find(o => o.id === id);
    }

    getWarehouse() {
        return [...this.data.warehouse];
    }

    // ==================== ANALYTICS METHODS ====================
    
    getSalesAnalytics(dateFrom = null, dateTo = null) {
        let orders = this.data.orders;

        // Filter by date range
        if (dateFrom || dateTo) {
            orders = orders.filter(order => {
                const orderDate = new Date(order.date);
                if (dateFrom && orderDate < new Date(dateFrom)) return false;
                if (dateTo && orderDate > new Date(dateTo)) return false;
                return true;
            });
        }

        const totalRevenue = orders.reduce((sum, order) => 
            order.status !== 'cancelled' ? sum + order.total : sum, 0);
        
        const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
        
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Tính profit (giả sử margin 28%)
        const profit = totalRevenue * 0.28;

        // Status breakdown
        const statusBreakdown = {
            new: orders.filter(o => o.status === 'new').length,
            processing: orders.filter(o => o.status === 'processing').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };

        // Top products
        const productSales = {};
        orders.forEach(order => {
            if (order.status !== 'cancelled') {
                order.items.forEach(item => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.productId].quantity += item.quantity;
                    productSales[item.productId].revenue += item.price * item.quantity;
                });
            }
        });

        const topProducts = Object.entries(productSales)
            .map(([productId, data]) => {
                const product = this.getProduct(parseInt(productId));
                return {
                    ...product,
                    soldQuantity: data.quantity,
                    revenue: data.revenue
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            profit,
            statusBreakdown,
            topProducts
        };
    }

    getCustomerAnalytics() {
        // Top customers by spending
        const customerSpending = {};
        
        this.data.orders.forEach(order => {
            if (order.status !== 'cancelled') {
                if (!customerSpending[order.customerUsername]) {
                    customerSpending[order.customerUsername] = {
                        totalSpent: 0,
                        orderCount: 0
                    };
                }
                customerSpending[order.customerUsername].totalSpent += order.total;
                customerSpending[order.customerUsername].orderCount += 1;
            }
        });

        const topCustomers = Object.entries(customerSpending)
            .map(([username, data]) => {
                const customer = this.getCustomer(username);
                return {
                    username,
                    email: customer?.email || '',
                    totalSpent: data.totalSpent,
                    orderCount: data.orderCount
                };
            })
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);

        // Customer growth
        const today = new Date();
        const newCustomersToday = this.data.customers.filter(c => {
            const joinDate = new Date(c.joinDate);
            return joinDate.toDateString() === today.toDateString();
        }).length;

        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newCustomersThisWeek = this.data.customers.filter(c => {
            const joinDate = new Date(c.joinDate);
            return joinDate >= weekAgo;
        }).length;

        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const newCustomersThisMonth = this.data.customers.filter(c => {
            const joinDate = new Date(c.joinDate);
            return joinDate >= monthAgo;
        }).length;

        // Customer retention
        const loyalCustomers = Object.values(customerSpending).filter(c => c.orderCount >= 3).length;
        const returningCustomers = Object.values(customerSpending).filter(c => c.orderCount === 2).length;
        const newCustomers = Object.values(customerSpending).filter(c => c.orderCount === 1).length;
        const totalCustomersWithOrders = Object.keys(customerSpending).length;

        return {
            topCustomers,
            growth: {
                today: newCustomersToday,
                thisWeek: newCustomersThisWeek,
                thisMonth: newCustomersThisMonth
            },
            retention: {
                loyal: {
                    count: loyalCustomers,
                    percentage: totalCustomersWithOrders > 0 ? (loyalCustomers / totalCustomersWithOrders * 100).toFixed(1) : 0
                },
                returning: {
                    count: returningCustomers,
                    percentage: totalCustomersWithOrders > 0 ? (returningCustomers / totalCustomersWithOrders * 100).toFixed(1) : 0
                },
                new: {
                    count: newCustomers,
                    percentage: totalCustomersWithOrders > 0 ? (newCustomers / totalCustomersWithOrders * 100).toFixed(1) : 0
                }
            }
        };
    }

    // ==================== UPDATE METHODS ====================
    
    updateProduct(id, updates) {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.products[index] = { ...this.data.products[index], ...updates };
            this.saveProducts();
            this.notifyListeners('products');
            return true;
        }
        return false;
    }

    addOrder(order) {
        const newOrder = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...order
        };
        this.data.orders.unshift(newOrder);
        this.saveOrders();
        this.notifyListeners('orders');
        return newOrder;
    }

    updateOrder(id, updates) {
        const index = this.data.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.data.orders[index] = { ...this.data.orders[index], ...updates };
            this.saveOrders();
            this.notifyListeners('orders');
            return true;
        }
        return false;
    }

    addCustomer(customer) {
        const newCustomer = {
            username: customer.username,
            email: customer.email,
            joinDate: new Date().toISOString(),
            phone: customer.phone || '',
            address: customer.address || ''
        };
        this.data.customers.push(newCustomer);
        this.saveCustomers();
        this.notifyListeners('customers');
        return newCustomer;
    }

    // ==================== SAVE TO LOCALSTORAGE ====================
    
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.data.products));
    }

    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.data.customers));
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.data.orders));
    }

    saveWarehouse() {
        localStorage.setItem('warehouse', JSON.stringify(this.data.warehouse));
    }

    // ==================== EVENT LISTENERS ====================
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    notifyListeners(event) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(this.data));
        }
    }

    // ==================== SAMPLE DATA GENERATORS ====================
    
    generateSampleCustomers() {
        const customers = [
            { username: 'nguyenvana', email: 'nguyenvana@email.com', joinDate: '2024-01-15', phone: '0901234567', address: 'TPHCM' },
            { username: 'tranthib', email: 'tranthib@email.com', joinDate: '2024-02-20', phone: '0902345678', address: 'Hà Nội' },
            { username: 'levanc', email: 'levanc@email.com', joinDate: '2024-03-10', phone: '0903456789', address: 'Đà Nẵng' },
            { username: 'phamthid', email: 'phamthid@email.com', joinDate: '2024-04-05', phone: '0904567890', address: 'TPHCM' },
            { username: 'hoangvane', email: 'hoangvane@email.com', joinDate: '2024-05-12', phone: '0905678901', address: 'Hà Nội' }
        ];
        return customers;
    }

    generateSampleOrders() {
        const statuses = ['new', 'processing', 'delivered', 'cancelled'];
        const orders = [];
        
        for (let i = 0; i < 50; i++) {
            const randomDate = new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1);
            const randomProducts = this.getRandomProducts(1, 3);
            const total = randomProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            orders.push({
                id: 1000 + i,
                customerUsername: ['nguyenvana', 'tranthib', 'levanc', 'phamthid', 'hoangvane'][Math.floor(Math.random() * 5)],
                date: randomDate.toISOString(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                items: randomProducts,
                total: total,
                shippingAddress: 'Sample Address ' + i
            });
        }
        
        return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getRandomProducts(min, max) {
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        const products = [];
        const availableProducts = [...this.data.products];
        
        for (let i = 0; i < count && availableProducts.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const product = availableProducts.splice(randomIndex, 1)[0];
            products.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: Math.floor(Math.random() * 3) + 1
            });
        }
        
        return products;
    }
}

// Tạo instance global
window.dataManager = new DataManager();

// Auto-initialize khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataManager.initialize();
    });
} else {
    window.dataManager.initialize();
}