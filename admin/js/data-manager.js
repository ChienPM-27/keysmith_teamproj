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
}

window.DataManager = DataManager;
