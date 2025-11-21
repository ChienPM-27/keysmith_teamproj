import { dataManager } from './DatabaseManager.js';
import { sampleData } from '../sampledata/sampleData.js';

// ================================================================
// 1. CONSTANTS & CONFIG
// ================================================================
const CONFIG = {
    KEYS: {
        PRODUCTS: 'products',
        CATEGORIES: 'catagories'
    },
    STATUS: {
        HIDDEN: new Set(['inactive', 'deleted']),
        LABELS: {
            ready: 'Ready',
            outofstock: 'Out of stock',
            active: 'Active',
            inactive: 'Inactive',
            deleted: 'Deleted'
        }
    },
    DEFAULTS: {
        IMAGE: '/img/blank-image.png',
        CATEGORIES: ['Attack On Titan', 'One Piece', 'YuGiOh']
    }
};

// ================================================================
// 2. STATE MANAGEMENT (Quản lý trạng thái)
// ================================================================
const AppState = {
    products: {
        page: 1,
        perPage: 8,
        editingId: null,
        filter: { category: '', search: '' },
        currentImage: CONFIG.DEFAULTS.IMAGE
    },
    types: {
        page: 1,
        perPage: 8,
        editingId: null,
        filter: { search: '' }
    }
};

// ================================================================
// 3. UTILITIES (Hàm tiện ích)
// ================================================================
const Utils = {
    USD(num) {
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },

    notify(type, message) {
        if (typeof toast === 'function') {
            const toastType = type === 'error' ? 'warning' : type;
            toast({
                title: toastType === 'success' ? 'Success' : 'Thông báo',
                message,
                type: toastType,
                duration: 3000
            });
        } else if (type === 'error') {
            alert(message);
        } else {
            console.log(message);
        }
    },

    createId(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return 1;
        return Math.max(...arr.map(item => Number(item.id) || 0)) + 1;
    },

    slugify(value) {
        if (!value) return '';
        return value.toString()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    clone(source) {
        try {
            return JSON.parse(JSON.stringify(source));
        } catch (e) {
            return [];
        }
    },
    
    // Đồng bộ dữ liệu với DatabaseManager
    syncToDB(key, data) {
        if (!dataManager || typeof dataManager !== 'object') return;
        try {
            const snapshot = Utils.clone(data);
            if (!dataManager.data) dataManager.data = {};
            dataManager.data[key] = snapshot;
            if (typeof dataManager.save === 'function') dataManager.save();
        } catch (error) {
            console.warn(`Sync error for ${key}`, error);
        }
    }
};

// ================================================================
// 4. PRODUCT MANAGER (Quản lý Sản phẩm)
// ================================================================
const ProductManager = {
    elements: {
        section: document.getElementById('products-section'),
        listContainer: document.querySelector('.show-product'),
        addBtn: document.querySelector('#btn-add-product'),
        refreshBtn: document.querySelector('#btn-refresh-product'),
        perPageSelect: document.querySelector('#products-section #per-page'),
        modal: document.getElementById('modal__add_product'),
        modalCloseBtn: document.querySelector('.modal-close.product-form'),
        form: document.querySelector('.add-product-form'),
        imagePreview: document.querySelector('.upload-image-preview'),
        imageInput: document.getElementById('up-hinh-anh'),
        inputs: {
            name: document.getElementById('ten-mon'),
            category: document.getElementById('chon-the-loai'),
            price: document.getElementById('gia-moi'),
            desc: document.getElementById('mo-ta')
        },
        filters: {
            category: document.getElementById('the-loai'),
            search: document.getElementById('form-search-product')
        },
        pagination: document.querySelector('#products-section .page-nav-list'),
        actionBtns: {
            add: document.getElementById('add-product-button'),
            update: document.getElementById('update-product-button')
        },
        countLabel: document.getElementById('productCount'),
        errorProductMsg: document.getElementById('p-form-error')
    },

    init() {
        if (!this.elements.section) return;
        this.seedData();
        this.bindEvents();
        this.populateFilters();
        this.render();
    },

    seedData() {
        const dbProducts = dataManager?.getAll(CONFIG.KEYS.PRODUCTS) || [];
        if (dbProducts.length > 0) {
            this.save(dbProducts);
        } else {
            const local = localStorage.getItem(CONFIG.KEYS.PRODUCTS);
            if (!local && sampleData?.products) {
                this.save(sampleData.products);
            }
        }
    },

    load() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.KEYS.PRODUCTS)) || [];
        } catch { return []; }
    },

    save(data) {
        const cleanData = Utils.clone(data);
        localStorage.setItem(CONFIG.KEYS.PRODUCTS, JSON.stringify(cleanData));
        Utils.syncToDB(CONFIG.KEYS.PRODUCTS, cleanData);
    },

    getFiltered() {
        const products = this.load();
        const { category, search } = AppState.products.filter;
        const keyword = search.toLowerCase().trim();

        return products.filter(p => {
            const status = (p.status || '').toLowerCase();
            // Lọc trạng thái ẩn/xóa
            if (!['ready', 'outofstock', 'active'].includes(status) && !CONFIG.STATUS.LABELS[status]) return false;
            
            // Lọc theo danh mục
            const pCat = (p.category || p.specs?.category || '').toString();
            if (category && pCat !== category) return false;

            // Lọc theo từ khóa
            if (keyword) {
                const matchTitle = p.title?.toLowerCase().includes(keyword);
                const matchId = p.id?.toString().includes(keyword);
                if (!matchTitle && !matchId) return false;
            }
            return true;
        }).sort((a, b) => Number(a.id) - Number(b.id));
    },

    render() {
        const filtered = this.getFiltered();
        this.updateCount();
        
        // Pagination Logic
        const total = filtered.length;
        const totalPages = Math.ceil(total / AppState.products.perPage) || 1;
        if (AppState.products.page > totalPages) AppState.products.page = totalPages;
        if (AppState.products.page < 1) AppState.products.page = 1;

        const start = (AppState.products.page - 1) * AppState.products.perPage;
        const pagedData = filtered.slice(start, start + AppState.products.perPage);

        // Render List
        if (pagedData.length === 0) {
            this.elements.listContainer.innerHTML = '<div class="no-result">Không có sản phẩm để hiển thị</div>';
        } else {
            this.elements.listContainer.innerHTML = pagedData.map(p => this.createRowHTML(p)).join('');
        }

        // Render Pagination
        this.renderPagination(totalPages);
    },

    createRowHTML(product) {
        const img = product.mainImage || product.image || CONFIG.DEFAULTS.IMAGE;
        const status = (product.status || '').toLowerCase();
        const statusLabel = CONFIG.STATUS.LABELS[status] || status;
        const overlay = status === 'ready' ? '' : ' overlay';
        
        return `
            <div class="product-item${overlay}" data-id="${product.id}">
                <div class="product-info">
                    <div class="product-img">
                        <img src="${img}" alt="${product.title}" onerror="this.src='${CONFIG.DEFAULTS.IMAGE}'" />
                    </div>
                    <div class="info">
                        <h3 class="product-name">#${product.id} ${product.title}</h3>
                        <p class="product-category">${product.category || product.specs?.category || ''}</p>
                        <p class="product-description">${product.shortDesc || '...'}</p>
                    </div>
                    <div class="product-price">${Utils.USD(Number(product.price))}</div>
                </div>
                <div class="product-info-right">
                    <div class="product-status">${statusLabel}</div>
                    <div class="btn-items">
                        <button type="button" class="btn-edit-product" data-id="${product.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button type="button" class="btn-view-product" data-id="${product.id}"><i class="fa-solid fa-eye"></i></button>
                        <button type="button" class="btn-delete-product" data-id="${product.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    renderPagination(totalPages) {
        if (!this.elements.pagination) return;
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            const active = i === AppState.products.page ? 'active' : '';
            html += `<li class="page-nav-item ${active}"><a href="#" data-page="${i}">${i}</a></li>`;
        }
        this.elements.pagination.innerHTML = html;
    },

    populateFilters() {
        const products = this.load();
        // Lấy danh sách Category unique
        const categories = [...new Set(products.map(p => p.category || p.specs?.category).filter(Boolean))].sort();
        
        // Populate filter dropdown
        if (this.elements.filters.category) {
            const current = this.elements.filters.category.value;
            this.elements.filters.category.innerHTML = '<option value="">All</option>' + 
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
            this.elements.filters.category.value = current;
        }

        // Populate form dropdown
        if (this.elements.inputs.category) {
            this.elements.inputs.category.innerHTML = '<option value="">-- Chọn thể loại --</option>' + 
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    },

    openModal(mode, id = null) {
        const { modal, inputs, actionBtns, imagePreview, imageInput } = this.elements;
        if (!modal) return;

        // Toggle UI Mode
        const isAdd = mode === 'add';
        document.querySelectorAll('.add-product-e').forEach(el => el.classList.toggle('hidden', !isAdd));
        document.querySelectorAll('.edit-product-e').forEach(el => el.classList.toggle('hidden', isAdd));

        // Reset Form
        if (isAdd) {
            AppState.products.editingId = null;
            AppState.products.currentImage = CONFIG.DEFAULTS.IMAGE;
            Object.values(inputs).forEach(inp => inp.value = '');
            imagePreview.src = CONFIG.DEFAULTS.IMAGE;
            imageInput.value = '';
        } else {
            // Load Data for Edit
            const product = this.load().find(p => Number(p.id) === Number(id));
            if (!product) return Utils.notify('error', 'Không tìm thấy sản phẩm');
            
            AppState.products.editingId = id;
            AppState.products.currentImage = product.mainImage || product.image || CONFIG.DEFAULTS.IMAGE;
            
            inputs.name.value = product.title || '';
            inputs.category.value = product.category || product.specs?.category || '';
            inputs.price.value = product.price || 0;
            inputs.desc.value = product.shortDesc || '';
            imagePreview.src = AppState.products.currentImage;
        }
        modal.classList.add('active');
    },

    closeModal() {
        this.elements.modal.classList.remove('active');
    },

    handleSave(isUpdate = false) {
        const { name, category, price, desc } = this.elements.inputs;
        const title = name.value.trim(); // Lấy tên sản phẩm đã nhập

        if (!title || !category.value || !price.value) {
            return Utils.notify('error', 'Vui lòng nhập đủ thông tin (Tên, Loại, Giá)');
        }

        const products = this.load();

        // --- MỚI: Kiểm tra trùng tên sản phẩm ---
        const isDuplicate = products.some(p => {
            // So sánh tên (không phân biệt hoa thường)
            const isSameName = p.title.toLowerCase() === title.toLowerCase();
            
            // Nếu đang ở chế độ Sửa (Update), bỏ qua chính sản phẩm đang sửa
            if (isUpdate && AppState.products.editingId !== null) {
                return isSameName && Number(p.id) !== Number(AppState.products.editingId);
            }
            
            // Nếu đang ở chế độ Thêm mới (Add), chỉ cần trùng tên là báo lỗi
            return isSameName;
        });

        if (isDuplicate) {
            return this.elements.errorProductMsg.textContent = 'Sản phẩm đã tồn tại';
        }
        // ----------------------------------------

        const newProductData = {
            title: title,
            category: category.value,
            specs: { category: category.value, brand: 'KeySmith' },
            price: Number(price.value),
            shortDesc: desc.value.trim(),
            longDesc: desc.value.trim(),
            image: AppState.products.currentImage,
            mainImage: AppState.products.currentImage
        };

        if (isUpdate && AppState.products.editingId !== null) {
            const idx = products.findIndex(p => Number(p.id) === Number(AppState.products.editingId));
            if (idx > -1) {
                products[idx] = { ...products[idx], ...newProductData };
                Utils.notify('success', 'Cập nhật thành công');
            }
        } else {
            newProductData.id = Utils.createId(products);
            newProductData.status = 'ready';
            newProductData.stock = 0;
            newProductData.sold = 0;
            products.push(newProductData);
            Utils.notify('success', 'Thêm mới thành công');
        }

        this.save(products);
        this.populateFilters();
        this.render();
        this.closeModal();
    },

    handleDelete(id) {
        if (!confirm('Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?')) return;
        const products = this.load().filter(p => Number(p.id) !== Number(id));
        this.save(products);
        Utils.notify('success', 'Đã xóa sản phẩm');
        this.populateFilters();
        this.render();
    },

    toggleStatus(id) {
        const products = this.load();
        const product = products.find(p => Number(p.id) === Number(id));
        if (!product) return;

        const isHidden = product.status === 'inactive';
        product.status = isHidden ? 'ready' : 'inactive';
        
        this.save(products);
        Utils.notify('success', isHidden ? 'Đã hiện sản phẩm' : 'Đã ẩn sản phẩm');
        this.render();
    },

    handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) return Utils.notify('error', 'File không hợp lệ');
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.products.currentImage = e.target.result;
            this.elements.imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    updateCount() {
        const count = this.load().filter(p => !CONFIG.STATUS.HIDDEN.has(p.status)).length;
        if (this.elements.countLabel) this.elements.countLabel.innerText = count;
    },

    bindEvents() {
        const E = this.elements;

        // Modal Controls
        E.addBtn?.addEventListener('click', () => this.openModal('add'));
        E.modalCloseBtn?.addEventListener('click', () => this.closeModal());
        E.modal?.addEventListener('click', (e) => { if (e.target === E.modal) this.closeModal(); });

        // Form Actions
        E.actionBtns.add?.addEventListener('click', () => this.handleSave(false));
        E.actionBtns.update?.addEventListener('click', () => this.handleSave(true));
        
        // Image Upload
        E.imageInput?.addEventListener('change', (e) => this.handleImageUpload(e.target.files[0]));

        // Filters & Pagination
        E.filters.search?.addEventListener('input', (e) => {
            AppState.products.filter.search = e.target.value;
            AppState.products.page = 1;
            this.render();
        });
        E.filters.category?.addEventListener('change', (e) => {
            AppState.products.filter.category = e.target.value;
            AppState.products.page = 1;
            this.render();
        });
        E.refreshBtn?.addEventListener('click', () => {
            AppState.products.filter = { category: '', search: '' };
            E.filters.search.value = '';
            E.filters.category.value = '';
            this.render();
        });
        E.perPageSelect?.addEventListener('change', (e) => {
            AppState.products.perPage = Number(e.target.value);
            this.render();
        });

        // Table Delegation (Edit/View/Delete buttons)
        E.pagination?.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                AppState.products.page = Number(e.target.dataset.page);
                this.render();
            }
        });

        E.listContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('btn-edit-product')) this.openModal('edit', id);
            if (btn.classList.contains('btn-delete-product')) this.handleDelete(id);
            if (btn.classList.contains('btn-view-product')) this.toggleStatus(id);
        });
    }
};

// ================================================================
// 5. PRODUCT TYPE MANAGER (Quản lý Loại sản phẩm)
// ================================================================
const ProductTypeManager = {
    elements: {
        section: document.getElementById('product-types-section'),
        listContainer: document.querySelector('.show-product-types'),
        search: document.getElementById('pt-category-filter'),
        addBtn: document.getElementById('pt-add-btn'),
        refreshBtn: document.getElementById('pt-refresh-btn'),
        pagination: document.querySelector('#product-types-section .page-nav-list'),
        perPageSelect: document.querySelector('#product-types-section #per-page'),
        modal: document.getElementById('pt-modal'),
        modalClose: document.getElementById('pt-modal-close'),
        form: document.getElementById('pt-form'),
        inputs: {
            name: document.getElementById('pt-form-name'),
            desc: document.getElementById('pt-form-description'),
            active: document.getElementById('pt-form-active')
        },
        submitBtn: document.getElementById('pt-form-submit'),
        modalTitle: document.querySelector('.pt-modal__title'),
        errorMsg: document.getElementById('pt-form-error'),
       
    },

    init() {
        if (!this.elements.section) return;
        this.ensureData();
        this.bindEvents();
        this.render();
    },

    load() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.KEYS.CATEGORIES)) || [];
        } catch { return []; }
    },

    save(data) {
        localStorage.setItem(CONFIG.KEYS.CATEGORIES, JSON.stringify(data));
    },

    ensureData() {
        // Tự động tạo Category từ danh sách Product nếu chưa có
        const types = this.load();
        const products = ProductManager.load();
        const pCategories = [...new Set(products.map(p => p.category || p.specs?.category).filter(Boolean))];
        
        let changed = false;
        pCategories.forEach(catName => {
            const id = Utils.slugify(catName);
            if (!types.find(t => t.id === id)) {
                types.push({ id, name: catName, description: '', status: 'active' });
                changed = true;
            }
        });

        if (changed) this.save(types);
    },

    getFiltered() {
        const types = this.load();
        const keyword = AppState.types.filter.search.toLowerCase().trim();
        return types.filter(t => 
            t.name.toLowerCase().includes(keyword) || 
            t.id.toLowerCase().includes(keyword)
        ).sort((a, b) => a.name.localeCompare(b.name));
    },

    render() {
        const filtered = this.getFiltered();
        const { page, perPage } = AppState.types;
        const total = filtered.length;
        const totalPages = Math.ceil(total / perPage) || 1;
        
        if (AppState.types.page > totalPages) AppState.types.page = totalPages;

        const start = (AppState.types.page - 1) * perPage;
        const pagedData = filtered.slice(start, start + perPage);

        // Render List
        if (pagedData.length === 0) {
            this.elements.listContainer.innerHTML = '<div class="no-result">Không có dữ liệu</div>';
        } else {
            this.elements.listContainer.innerHTML = pagedData.map(t => this.createRowHTML(t)).join('');
        }

        // Render Pagination
        if (this.elements.pagination) {
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                const active = i === AppState.types.page ? 'active' : '';
                html += `<li class="page-nav-item ${active}"><a href="#" data-page="${i}">${i}</a></li>`;
            }
            this.elements.pagination.innerHTML = html;
        }
    },

    createRowHTML(type) {
        const status = type.status === 'inactive' ? 'inactive' : 'active';
        const label = CONFIG.STATUS.LABELS[status];
        const overlay = status === 'inactive' ? ' overlay' : '';

        return `
            <div class="product-type-item${overlay}" data-id="${type.id}">
                <div class="product-type-left">
                    <div class="catagory">#${type.id}</div>
                    <div class="name">${type.name}</div>
                </div>
                <div class="product-type-right">
                    <div class="Description">${type.description || ''}</div>
                    <div class="status status--${status}">${label}</div>
                    <div class="actions">
                        <button type="button" class="edit-btn" data-id="${type.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button type="button" class="view-btn" data-id="${type.id}"><i class="fa-solid fa-eye"></i></button>
                        <button type="button" class="delete-btn" data-id="${type.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    openModal(mode, id = null) {
        const E = this.elements;
        if (!E.modal) return;
        
        E.errorMsg.textContent = '';
        if (mode === 'edit') {
            const type = this.load().find(t => t.id === id);
            if (!type) return Utils.notify('error', 'Không tìm thấy');
            AppState.types.editingId = id;
            E.inputs.name.value = type.name;
            E.inputs.desc.value = type.description;
            E.inputs.active.checked = type.status !== 'inactive';
            E.modalTitle.textContent = 'Chỉnh sửa loại sản phẩm';
            E.submitBtn.textContent = 'Cập nhật';
        } else {
            AppState.types.editingId = null;
            E.form.reset();
            E.modalTitle.textContent = 'Thêm loại sản phẩm';
            E.submitBtn.textContent = 'Lưu';
        }
        E.modal.classList.add('active');
    },

    closeModal() {
        this.elements.modal.classList.remove('active');
    },

    handleSave(e) {
        e.preventDefault();
        const name = this.elements.inputs.name.value.trim();
        if (!name) return (this.elements.errorMsg.textContent = 'Vui lòng nhập tên');

        const id = Utils.slugify(name);
        const types = this.load();
        const newData = {
            id, 
            name, 
            description: this.elements.inputs.desc.value.trim(),
            status: this.elements.inputs.active.checked ? 'active' : 'inactive'
        };

        if (AppState.types.editingId) {
            const idx = types.findIndex(t => t.id === AppState.types.editingId);
            if (idx > -1) types[idx] = { ...types[idx], ...newData }; // Update
        } else {
            if (types.some(t => t.id === id)) return (this.elements.errorMsg.textContent = 'Tên đã tồn tại');
            types.push(newData);
        }

        this.save(types);
        this.render();
        this.closeModal();
        ProductManager.populateFilters(); // Refresh filter bên product
        Utils.notify('success', 'Lưu thành công');
    },

    handleDelete(id) {
        if (!confirm('Xóa loại sản phẩm này?')) return;
        const types = this.load().filter(t => t.id !== id);
        this.save(types);
        this.render();
        ProductManager.populateFilters();
        Utils.notify('success', 'Đã xóa');
    },

    toggleStatus(id) {
        const types = this.load();
        const type = types.find(t => t.id === id);
        if (type) {
            type.status = type.status === 'active' ? 'inactive' : 'active';
            this.save(types);
            this.render();
            Utils.notify('success', 'Đã cập nhật trạng thái');
        }
    },

    bindEvents() {
        const E = this.elements;
        E.addBtn?.addEventListener('click', () => this.openModal('add'));
        E.refreshBtn?.addEventListener('click', () => {
            AppState.types.filter.search = '';
            E.search.value = '';
            this.render();
        });
        E.search?.addEventListener('input', (e) => {
            AppState.types.filter.search = e.target.value;
            AppState.types.page = 1;
            this.render();
        });
        E.modalClose?.addEventListener('click', () => this.closeModal());
        E.form?.addEventListener('submit', (e) => this.handleSave(e));
        E.perPageSelect?.addEventListener('change', (e) => {
            AppState.types.perPage = Number(e.target.value);
            this.render();
        });
        E.pagination?.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                AppState.types.page = Number(e.target.dataset.page);
                this.render();
            }
        });
        E.listContainer?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('edit-btn')) this.openModal('edit', id);
            if (btn.classList.contains('delete-btn')) this.handleDelete(id);
            if (btn.classList.contains('view-btn')) this.toggleStatus(id);
        });
    }
};

// ================================================================
// 6. APP INITIALIZATION
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    ProductManager.init();
    ProductTypeManager.init();
});

// Expose global functions for compatibility (nếu có file khác gọi hàm này)
window.createProduct = () => ProductManager.seedData();
window.uploadImage = (input) => ProductManager.handleImageUpload(input.files[0]);
window.showProduct = () => ProductManager.render(); // Cho onchange ở html cũ

//responsive
const menuIconBtn = document.querySelector('.menu-icon-btn');
const adminSidebarLabels = Array.from(document.querySelectorAll('.admin-sidebar__label'));
const adminSideBar = document.querySelector('#adminSidebar');
function toggleSidebar() {
    if (!menuIconBtn || !adminSideBar) {
        return;
    }


    menuIconBtn.addEventListener('click', () => {
        adminSideBar.classList.toggle('open');
        if (adminSidebarLabels.length) {
            adminSidebarLabels.forEach(label => label.classList.toggle('hide-label'));
        }
    });
}
toggleSidebar();