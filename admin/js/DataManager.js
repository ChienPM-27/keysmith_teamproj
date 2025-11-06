// ==================== SYNCHRONIZED DATA MANAGER v2.0 ====================
// Đồng bộ toàn bộ: Products, Warehouse, Analytics

class DataManager {
    static async loadProductsFromJSON() {
        try {
            const response = await fetch('../json/products.json');
            if (!response.ok) throw new Error('Failed to load products.json');
            const products = await response.json();
            
            localStorage.setItem('products', JSON.stringify(products));
            console.log('Products synced from JSON:', products.length);
            
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            return this.getProducts();
        }
    }


    
    static getProducts() {
        try {
            return JSON.parse(localStorage.getItem('products')) || [];
        } catch {
            return [];
        }
    }
    
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    static addProduct(product) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        product.id = newId;
        product.stock = product.stock || 0;
        product.sold = product.sold || 0;
        products.push(product);
        this.saveProducts(products);
        return product;
    }
    
    static updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct, id };
            this.saveProducts(products);
            return true;
        }
        return false;
    }
    
    static deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        this.saveProducts(filtered);
        return filtered.length < products.length;
    }
    
    static getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    }
    
    static getUsers() {
        try {
            return JSON.parse(localStorage.getItem('users')) || [];
        } catch {
            return [];
        }
    }
    
    static getOrders() {
        try {
            return JSON.parse(localStorage.getItem('orders')) || [];
        } catch {
            return [];
        }
    }
    constructor() {
        this.data = {
            products: [],
            customers: [],
            orders: [],
            warehouse: {
                inventory: [],
                importOrders: [],
                transactions: [],
                categoryMargins: []
            },
            analytics: {
                lastUpdated: null,
                salesCache: {},
                customerCache: {}
            }
        };
        this.listeners = {};
        this.initialized = false;
    }

    // ==================== KHỞI TẠO ====================
    
    async initialize() {
        if (this.initialized) return;
        
        try {
            await Promise.all([
                this.loadProducts(),
                this.loadCustomers(),
                this.loadOrders(),
                this.loadWarehouse()
            ]);
            
            // Đồng bộ warehouse với products
            this.syncWarehouseWithProducts();
            
            // Cache analytics
            this.updateAnalyticsCache();
            
            this.initialized = true;
            console.log('DataManager initialized successfully');
            this.notifyListeners('initialized');
        } catch (error) {
            console.error('DataManager initialization failed:', error);
        }
    }

    // ==================== LOAD DỮ LIỆU ====================
    
    async loadProducts() {
        try {
            const response = await fetch('../json/products.json');
            const products = await response.json();
            
            const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
            
            this.data.products = products.map(product => {
                const saved = savedProducts.find(p => p.id === product.id);
                return {
                    ...product,
                    stock: saved?.stock ?? product.stock ?? Math.floor(Math.random() * 100) + 50,
                    sold: saved?.sold ?? product.sold ?? Math.floor(Math.random() * 200),
                    cost: saved?.cost ?? product.price * 0.6, // 60% of price as default cost
                    minStock: saved?.minStock ?? 20
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
            // Migration: Thêm status 'active' cho customers cũ không có status
            let needsSave = false;
            this.data.customers = this.data.customers.map(customer => {
                if (!customer.status) {
                    needsSave = true;
                    return { ...customer, status: 'active' };
                }
                return customer;
            });
            if (needsSave) {
                this.saveCustomers();
            }
        } else {
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
            this.data.orders = this.generateSampleOrders();
            this.saveOrders();
        }
        this.notifyListeners('orders');
    }

    async loadWarehouse() {
        // Import Orders
        const savedOrders = localStorage.getItem('warehouseImportOrders');
        if (savedOrders) {
            this.data.warehouse.importOrders = JSON.parse(savedOrders);
        } else {
            this.data.warehouse.importOrders = this.generateSampleImportOrders();
        }

        // Transactions
        const savedTransactions = localStorage.getItem('warehouseTransactions');
        this.data.warehouse.transactions = savedTransactions ? JSON.parse(savedTransactions) : [];

        // Category Margins
        const savedMargins = localStorage.getItem('categoryMargins');
        if (savedMargins) {
            this.data.warehouse.categoryMargins = JSON.parse(savedMargins);
        } else {
            this.data.warehouse.categoryMargins = [
                { category: 'Attack on Titan', margin: 25 },
                { category: 'The Lord of the Rings', margin: 30 },
                { category: 'One Piece', margin: 22 },
                { category: 'Yu-Gi-Oh!', margin: 28 }
            ];
        }

        this.saveWarehouse();
        this.notifyListeners('warehouse');
    }

    // ==================== ĐỒNG BỘ WAREHOUSE VỚI PRODUCTS ====================
    
    syncWarehouseWithProducts() {
        // Warehouse inventory = Products với thêm thông tin warehouse
        this.data.warehouse.inventory = this.data.products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            stock: product.stock,
            minStock: product.minStock,
            cost: product.cost,
            price: product.price,
            lastUpdated: new Date().toISOString()
        }));
        
        console.log('✅ Warehouse synced with products');
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

    // Warehouse getters
    getWarehouseInventory() {
        return [...this.data.warehouse.inventory];
    }

    getImportOrders() {
        return [...this.data.warehouse.importOrders];
    }

    getTransactions() {
        return [...this.data.warehouse.transactions];
    }

    getCategoryMargins() {
        return [...this.data.warehouse.categoryMargins];
    }

    getLowStockItems() {
        return this.data.warehouse.inventory.filter(item => item.stock < item.minStock);
    }

    // ==================== ANALYTICS METHODS (CACHED) ====================
    
    updateAnalyticsCache() {
        this.data.analytics.lastUpdated = new Date().toISOString();
        this.data.analytics.salesCache = this.calculateSalesAnalytics();
        this.data.analytics.customerCache = this.calculateCustomerAnalytics();
        console.log('✅ Analytics cache updated');
    }

    getSalesAnalytics(dateFrom = null, dateTo = null, forceRefresh = false) {
        // Nếu có filter date hoặc force refresh, tính lại
        if (dateFrom || dateTo || forceRefresh) {
            return this.calculateSalesAnalytics(dateFrom, dateTo);
        }
        
        // Return cached data
        return this.data.analytics.salesCache;
    }

    calculateSalesAnalytics(dateFrom = null, dateTo = null) {
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

        // Tính profit từ warehouse cost
        let totalProfit = 0;
        orders.forEach(order => {
            if (order.status !== 'cancelled') {
                order.items.forEach(item => {
                    const product = this.getProduct(item.productId);
                    if (product) {
                        const profit = (item.price - product.cost) * item.quantity;
                        totalProfit += profit;
                    }
                });
            }
        });

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
            profit: totalProfit,
            statusBreakdown,
            topProducts,
            profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0
        };
    }

    getCustomerAnalytics(forceRefresh = false) {
        if (forceRefresh) {
            return this.calculateCustomerAnalytics();
        }
        return this.data.analytics.customerCache;
    }

    calculateCustomerAnalytics() {
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

        // Customer growth - FIX: Sử dụng dữ liệu thật từ customers
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset về đầu ngày để so sánh chính xác
        
        const todayStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        console.log('🔍 Checking customer growth for date:', todayStr);
        
        const newCustomersToday = this.data.customers.filter(c => {
            if (!c.joinDate) return false;
            
            // Chuẩn hóa joinDate về dạng YYYY-MM-DD
            const joinDate = new Date(c.joinDate);
            joinDate.setHours(0, 0, 0, 0);
            const joinDateStr = joinDate.toISOString().split('T')[0];
            
            const isToday = joinDateStr === todayStr;
            if (isToday) {
                console.log('✅ Customer joined today:', c.username, joinDateStr);
            }
            return isToday;
        }).length;

        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newCustomersThisWeek = this.data.customers.filter(c => {
            if (!c.joinDate) return false;
            const joinDate = new Date(c.joinDate);
            joinDate.setHours(0, 0, 0, 0);
            return joinDate >= weekAgo && joinDate <= today;
        }).length;

        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const newCustomersThisMonth = this.data.customers.filter(c => {
            if (!c.joinDate) return false;
            const joinDate = new Date(c.joinDate);
            joinDate.setHours(0, 0, 0, 0);
            return joinDate >= monthAgo && joinDate <= today;
        }).length;

        console.log('📊 Customer growth stats:', {
            today: newCustomersToday,
            thisWeek: newCustomersThisWeek,
            thisMonth: newCustomersThisMonth,
            totalCustomers: this.data.customers.length
        });

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

    // ==================== UPDATE METHODS (TỰ ĐỘNG SYNC) ====================
    
    updateProduct(id, updates) {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.products[index] = { ...this.data.products[index], ...updates };
            
            // Sync to warehouse
            const warehouseIndex = this.data.warehouse.inventory.findIndex(i => i.id === id);
            if (warehouseIndex !== -1) {
                this.data.warehouse.inventory[warehouseIndex] = {
                    ...this.data.warehouse.inventory[warehouseIndex],
                    stock: this.data.products[index].stock,
                    price: this.data.products[index].price,
                    cost: this.data.products[index].cost,
                    lastUpdated: new Date().toISOString()
                };
            }
            
            this.saveProducts();
            this.saveWarehouse();
            this.updateAnalyticsCache();
            this.notifyListeners('products');
            this.notifyListeners('warehouse');
            return true;
        }
        return false;
    }

    updateProductStock(productId, quantity, type = 'import', notes = '') {
        const product = this.getProduct(productId);
        if (!product) return false;

        const oldStock = product.stock;
        const newStock = oldStock + quantity;

        // Update product
        this.updateProduct(productId, { stock: newStock });

        // Add transaction
        this.data.warehouse.transactions.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            productId: productId,
            productName: product.name,
            type: type,
            quantity: quantity,
            oldStock: oldStock,
            newStock: newStock,
            notes: notes || `${type === 'import' ? 'Import' : 'Export'} order`
        });

        this.saveWarehouse();
        this.notifyListeners('warehouse');
        return true;
    }

    addOrder(order) {
        const newOrder = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...order
        };
        this.data.orders.unshift(newOrder);
        
        // Update product sold count và stock
        order.items.forEach(item => {
            const product = this.getProduct(item.productId);
            if (product) {
                this.updateProduct(item.productId, {
                    sold: product.sold + item.quantity,
                    stock: product.stock - item.quantity
                });
                
                // Add transaction
                this.updateProductStock(item.productId, -item.quantity, 'export', `Order #${newOrder.id}`);
            }
        });
        
        this.saveOrders();
        this.updateAnalyticsCache();
        this.notifyListeners('orders');
        return newOrder;
    }

    updateOrder(id, updates) {
        const index = this.data.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.data.orders[index] = { ...this.data.orders[index], ...updates };
            this.saveOrders();
            this.updateAnalyticsCache();
            this.notifyListeners('orders');
            return true;
        }
        return false;
    }

    // ==================== WAREHOUSE OPERATIONS ====================
    
    addImportOrder(orderData) {
        const newOrder = {
            id: Date.now(),
            date: orderData.date,
            status: orderData.status || 'pending',
            items: orderData.items,
            total: orderData.total,
            createdAt: new Date().toISOString()
        };
    }


addCustomer(customer) {
    const newCustomer = {
        username: customer.username,
        email: customer.email,
        joinDate: customer.joinDate || new Date().toISOString(),
        phone: customer.phone || '',
        address: customer.address || '',
        status: customer.status || 'active'
    };

    // Kiểm tra username đã tồn tại chưa
    const existingCustomer = this.data.customers.find(c => c.username === newCustomer.username);
    if (existingCustomer) {
        return false;
    }

    // Thêm customer mới
    this.data.customers.push(newCustomer);
    this.saveCustomers();
    this.updateAnalyticsCache();
    this.notifyListeners('customers');
    return newCustomer;
}


updateCustomer(username, updates) {
    const index = this.data.customers.findIndex(c => c.username === username);
    if (index !== -1) {
        this.data.customers[index] = { 
            ...this.data.customers[index], 
            ...updates 
        };
        this.saveCustomers();
        this.updateAnalyticsCache();
        this.notifyListeners('customers');
        return true;
    }
    return false;
}

deleteCustomer(username) {
    const filtered = this.data.customers.filter(c => c.username !== username);
    if (filtered.length < this.data.customers.length) {
        this.data.customers = filtered;
        this.saveCustomers();
        this.updateAnalyticsCache();
        this.notifyListeners('customers');
        return true;
    }
    return false;
}

    updateImportOrder(orderId, orderData) {
        const index = this.data.warehouse.importOrders.findIndex(o => o.id === orderId);
        if (index === -1) return false;

        const order = this.data.warehouse.importOrders[index];
        if (order.status === 'completed') return false;

        order.date = orderData.date;
        order.items = orderData.items;
        order.total = orderData.total;
        order.status = orderData.status;

        this.saveWarehouse();
        this.notifyListeners('warehouse');
        return true;
    }

    completeImportOrder(orderId) {
        const order = this.data.warehouse.importOrders.find(o => o.id === orderId);
        if (!order || order.status === 'completed') return false;

        // Update inventory for each product
        order.items.forEach(item => {
            const product = this.getProduct(item.productId);
            if (product) {
                // Update cost and stock
                this.updateProduct(item.productId, {
                    cost: item.cost,
                    stock: product.stock + item.quantity
                });
                
                // Add transaction
                this.updateProductStock(item.productId, item.quantity, 'import', `Import Order #${orderId}`);
            }
        });

        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        
        this.saveWarehouse();
        this.updateAnalyticsCache();
        this.notifyListeners('warehouse');
        return true;
    }

    deleteImportOrder(orderId) {
        const order = this.data.warehouse.importOrders.find(o => o.id === orderId);
        if (!order || order.status === 'completed') return false;

        this.data.warehouse.importOrders = this.data.warehouse.importOrders.filter(o => o.id !== orderId);
        this.saveWarehouse();
        this.notifyListeners('warehouse');
        return true;
    }

    updateCategoryMargin(category, marginPercent) {
        const margin = parseFloat(marginPercent);
        
        // Update category margin
        const categoryData = this.data.warehouse.categoryMargins.find(c => c.category === category);
        if (categoryData) {
            categoryData.margin = margin;
        }

        // Update all products in this category
        this.data.products.forEach(product => {
            if (product.category === category) {
                const newPrice = product.cost * (1 + margin / 100);
                this.updateProduct(product.id, {
                    price: parseFloat(newPrice.toFixed(2))
                });
            }
        });

        this.saveWarehouse();
        this.updateAnalyticsCache();
        this.notifyListeners('warehouse');
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
        localStorage.setItem('warehouseInventory', JSON.stringify(this.data.warehouse.inventory));
        localStorage.setItem('warehouseImportOrders', JSON.stringify(this.data.warehouse.importOrders));
        localStorage.setItem('warehouseTransactions', JSON.stringify(this.data.warehouse.transactions));
        localStorage.setItem('categoryMargins', JSON.stringify(this.data.warehouse.categoryMargins));
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
        // Tạo ngày joinDate với format chuẩn ISO
        const getDateAgo = (daysAgo) => {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return date.toISOString();
        };

        const customers = [
            { 
                username: 'nguyenvana', 
                email: 'nguyenvana@email.com', 
                joinDate: getDateAgo(180), // ~6 months ago
                phone: '0901234567', 
                address: 'TPHCM', 
                status: 'active' 
            },
            { 
                username: 'tranthib', 
                email: 'tranthib@email.com', 
                joinDate: getDateAgo(150), // ~5 months ago
                phone: '0902345678', 
                address: 'Hà Nội', 
                status: 'active' 
            },
            { 
                username: 'levanc', 
                email: 'levanc@email.com', 
                joinDate: getDateAgo(120), // ~4 months ago
                phone: '0903456789', 
                address: 'Đà Nẵng', 
                status: 'active' 
            },
            { 
                username: 'phamthid', 
                email: 'phamthid@email.com', 
                joinDate: getDateAgo(90), // ~3 months ago
                phone: '0904567890', 
                address: 'TPHCM', 
                status: 'active' 
            },
            { 
                username: 'hoangvane', 
                email: 'hoangvane@email.com', 
                joinDate: getDateAgo(60), // ~2 months ago
                phone: '0905678901', 
                address: 'Hà Nội', 
                status: 'active' 
            }
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

    generateSampleImportOrders() {
        const today = new Date();
        const orders = [];
        
        // 3 pending orders
        for (let i = 0; i < 3; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const randomProducts = [];
            const productCount = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < productCount; j++) {
                const product = this.data.products[Math.floor(Math.random() * this.data.products.length)];
                randomProducts.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: Math.floor(Math.random() * 50) + 10,
                    cost: product.cost
                });
            }
            
            const total = randomProducts.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
            
            orders.push({
                id: Date.now() + i,
                date: date.toISOString().split('T')[0],
                status: 'pending',
                items: randomProducts,
                total: total,
                createdAt: date.toISOString()
            });
        }
        
        return orders;
    }
}

// ==================== GLOBAL INSTANCE ====================

window.dataManager = new DataManager();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataManager.initialize();
    });
} else {
    window.dataManager.initialize();
}

console.log('🚀 Synchronized DataManager v2.0 loaded!');

function updateCustomerGrowth(growth) {
    const growthItems = document.querySelectorAll('.growth-item .growth-number');
    
    if (growthItems[0]) {
        growthItems[0].innerHTML = `${growth.today} <span>khách hàng</span>`;
    }
    if (growthItems[1]) {
        growthItems[1].innerHTML = `${growth.thisWeek} <span>khách hàng</span>`;
    }
    if (growthItems[2]) {
        growthItems[2].innerHTML = `${growth.thisMonth} <span>khách hàng</span>`;
    }
    
    console.log('📈 Customer growth updated:', {
        today: growth.today,
        thisWeek: growth.thisWeek,
        thisMonth: growth.thisMonth
    });
}

function handleAddCustomer(e) {
    e.preventDefault();
    
    const username = document.getElementById('customer-username').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    
    if (!username || !email) {
        alert('Vui lòng nhập tên người dùng và email!');
        return;
    }

    // ensure username uniqueness in local customers (or users)
    try {
        const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (Array.isArray(localCustomers) && localCustomers.some(c => c.username === username)) {
            alert('Tên người dùng đã tồn tại!');
            return;
        }
        // also check users list to avoid collisions if desired
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (Array.isArray(users) && users.some(u => u.username === username)) {
            // username exists as a user; still allow adding customer but warn
            if (!confirm('Tên người dùng tồn tại trong hệ thống users. Bạn vẫn muốn thêm thông tin khách hàng?')) return;
        }
    } catch (err) {
        console.error('Error reading local storage for uniqueness check', err);
    }

    // Tạo joinDate với định dạng ISO chuẩn (YYYY-MM-DD)
    const today = new Date();
    const joinDate = today.toISOString(); // ISO format đầy đủ
    
    console.log('🆕 Creating new customer:', {
        username,
        joinDate,
        dateString: today.toISOString().split('T')[0]
    });

    const newCustomer = {
        username,
        email,
        phone,
        address,
        joinDate: joinDate, // Lưu dạng ISO string
        status: 'active'
    };

    // Save to localStorage.customers
    try {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // Cập nhật DataManager và force refresh analytics cache
        if (window.dataManager && window.dataManager.data) {
            window.dataManager.data.customers = customers;
            // Force update analytics cache ngay lập tức
            window.dataManager.updateAnalyticsCache();
            console.log('✅ Analytics cache updated after adding customer');
        }

        alert('Đã thêm khách hàng thành công!');
        closeCustomerModal();
        showCustomers();
        
        // Trigger analytics refresh nếu đang ở tab customer stats
        if (document.getElementById('customer-stats')?.classList.contains('active')) {
            setTimeout(() => {
                if (typeof loadCustomerStats === 'function') {
                    loadCustomerStats(true); // Force refresh
                }
            }, 100);
        }
        
        return;
    } catch (err) {
        console.error('Lỗi khi lưu khách hàng vào localStorage:', err);
        alert('Không thể lưu khách hàng. Xem console để biết chi tiết.');
    }
}