import { dataManager } from "./DatabaseManager.js";

// ============================================================
// 1. KHỞI TẠO & TIỆN ÍCH CHUNG
// ============================================================

// Đảm bảo bảng productTypes tồn tại trong DB nếu chưa có
if (!dataManager.getAll("productTypes") || dataManager.getAll("productTypes").length === 0) {
    // Tạo dữ liệu mẫu cho loại sản phẩm từ danh mục sản phẩm hiện có
    const initialCategories = [
        { id: 1, name: "Attack On Titan", description: "Keycap chủ đề AOT", createdDate: "2023-01-01", status: "active" },
        { id: 2, name: "One Piece", description: "Keycap chủ đề One Piece", createdDate: "2023-01-02", status: "active" },
        { id: 3, name: "The Lord of the Rings", description: "Keycap chủ đề LOTR", createdDate: "2023-01-03", status: "active" },
        { id: 4, name: "Yu-Gi-Oh!", description: "Keycap chủ đề Yu-Gi-Oh", createdDate: "2023-01-04", status: "active" },
        { id: 5, name: "Cyberpunk Neon Series", description: "Keycap phong cách Cyberpunk", createdDate: "2023-01-05", status: "active" },
        { id: 6, name: "Aurora Dream", description: "Keycap chủ đề Aurora", createdDate: "2023-01-06", status: "active" }
    ];
    // Lưu vào localStorage thông qua dataManager (cần mở rộng dataManager một chút hoặc set thủ công)
    // Ở đây ta giả định dataManager.add hoạt động tốt cho bảng mới
    initialCategories.forEach(cat => dataManager.add("productTypes", cat));
}

// Định dạng tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Biến lưu ảnh Base64 tạm thời khi upload
let currentImageBase64 = "/img/blank-image.png";

// ============================================================
// 2. QUẢN LÝ LOẠI SẢN PHẨM (PRODUCT TYPES)
// ============================================================

const ptSection = {
    init: function() {
        this.renderTable();
        this.bindEvents();
    },

    // Render danh sách loại sản phẩm
    renderTable: function() {
        const list = dataManager.getAll("productTypes");
        const container = document.querySelector(".show-product-types");
        
        if (!container) return;

        let html = '';
        list.forEach(item => {
            // Kiểm tra trạng thái để thêm class 'item-hidden' (hiện xám/đỏ)
            const isHidden = item.status === 'hidden';
            const rowClass = isHidden ? 'product-type-item item-hidden' : 'product-type-item';
            const statusBadge = isHidden 
                ? '<span class="status" style="background:#ff4d4d; color:white;">Đã ẩn</span>' 
                : '<span class="status">Hoạt động</span>';
            
            const toggleIcon = isHidden ? 'fa-eye-slash' : 'fa-trash';
            const toggleTitle = isHidden ? 'Hiện lại' : 'Ẩn đi';

            html += `
            <div class="${rowClass}" data-id="${item.id}">
                <div class="product-type-left">
                    <div class="id">#${item.id}</div>
                    <div class="name">${item.name}</div>
                    <div class="date">${item.createdDate}</div>
                    <div class="Description">${item.description || 'Chưa có mô tả'}</div>
                </div>
                <div class="product-type-right">
                    ${statusBadge}
                    <div class="actions">
                        <button class="edit-btn" onclick="window.editProductType(${item.id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="delete-btn" title="${toggleTitle}" onclick="window.toggleProductTypeStatus(${item.id})">
                            <i class="fa-solid ${toggleIcon}"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });

        container.innerHTML = html;
    },

    bindEvents: function() {
        // Nút mở modal thêm mới
        const addBtn = document.getElementById('pt-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                document.getElementById('pt-form').reset();
                document.getElementById('pt-form').dataset.mode = 'add';
                document.querySelector('.pt-modal__title').textContent = 'Thêm loại sản phẩm';
                document.getElementById('pt-modal').classList.add('open');
            });
        }

        // Nút đóng modal
        const closeBtn = document.querySelector('[data-pt-close]');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('pt-modal').classList.remove('open');
            });
        }

        // Submit form
        const form = document.getElementById('pt-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Tìm kiếm
        const searchInput = document.getElementById('pt-category-filter');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.product-type-item');
                items.forEach(item => {
                    const name = item.querySelector('.name').textContent.toLowerCase();
                    item.style.display = name.includes(keyword) ? 'flex' : 'none';
                });
            });
        }
    },

    handleFormSubmit: function() {
        const form = document.getElementById('pt-form');
        const name = document.getElementById('pt-form-name').value.trim();
        const desc = document.getElementById('pt-form-description').value.trim();
        const isActive = document.getElementById('pt-form-active').checked;
        const mode = form.dataset.mode;

        if (!name) {
            alert("Vui lòng nhập tên loại sản phẩm");
            return;
        }

        if (mode === 'add') {
            const newType = {
                id: Date.now(), // ID đơn giản bằng timestamp
                name: name,
                description: desc,
                createdDate: new Date().toISOString().split('T')[0],
                status: isActive ? 'active' : 'hidden'
            };
            dataManager.add("productTypes", newType);
            alert("Thêm loại sản phẩm thành công!");
        } else if (mode === 'edit') {
            const id = parseInt(form.dataset.id);
            dataManager.updateById("productTypes", id, {
                name: name,
                description: desc,
                status: isActive ? 'active' : 'hidden'
            });
            alert("Cập nhật thành công!");
        }

        document.getElementById('pt-modal').classList.remove('open');
        this.renderTable();
        // Sau khi sửa loại sản phẩm, cần render lại dropdown ở trang Products
        productSection.populateCategoryDropdown();
        productSection.renderList(); // Re-render products để cập nhật màu xám nếu loại bị ẩn
    }
};

// Hàm global để gọi từ HTML (onclick)
window.editProductType = function(id) {
    const item = dataManager.getById("productTypes", id);
    if (!item) return;

    document.getElementById('pt-form-name').value = item.name;
    document.getElementById('pt-form-description').value = item.description;
    document.getElementById('pt-form-active').checked = item.status === 'active';
    
    const form = document.getElementById('pt-form');
    form.dataset.mode = 'edit';
    form.dataset.id = id;
    
    document.querySelector('.pt-modal__title').textContent = 'Chỉnh sửa loại sản phẩm';
    document.getElementById('pt-modal').classList.add('open');
};

window.toggleProductTypeStatus = function(id) {
    const item = dataManager.getById("productTypes", id);
    if (!item) return;

    const newStatus = item.status === 'active' ? 'hidden' : 'active';
    const confirmMsg = newStatus === 'hidden' 
        ? 'Bạn có chắc muốn ẩn loại này? Các sản phẩm thuộc loại này cũng sẽ bị ảnh hưởng hiển thị.' 
        : 'Bạn muốn kích hoạt lại loại này?';

    if (confirm(confirmMsg)) {
        dataManager.updateById("productTypes", id, { status: newStatus });
        ptSection.renderTable();
        productSection.renderList(); // Cập nhật lại list sản phẩm để tô xám nếu cần
    }
};


// ============================================================
// 3. QUẢN LÝ SẢN PHẨM (PRODUCTS)
// ============================================================

const productSection = {
    init: function() {
        this.populateCategoryDropdown();
        this.renderList();
        this.bindEvents();
    },

    // Đổ dữ liệu vào dropdown Category trong modal thêm/sửa sản phẩm & thanh filter
    populateCategoryDropdown: function() {
        const types = dataManager.getAll("productTypes") || [];
        // Chỉ lấy các loại đang active cho form thêm mới
        const activeTypes = types.filter(t => t.status === 'active');
        
        // Dropdown trong Form Modal
        const select = document.getElementById('chon-the-loai');
        if (select) {
            select.innerHTML = '<option value="">-- Chọn thể loại --</option>';
            activeTypes.forEach(t => {
                select.innerHTML += `<option value="${t.name}">${t.name}</option>`;
            });
        }

        // Dropdown Filter ở trang danh sách
        const filterSelect = document.getElementById('the-loai');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Tất cả thể loại</option>';
            types.forEach(t => {
                filterSelect.innerHTML += `<option value="${t.name}">${t.name}</option>`;
            });
        }
    },

    renderList: function() {
        const container = document.querySelector('.show-product');
        if (!container) return;

        // Lấy filters
        const filterCategory = document.getElementById('the-loai')?.value || '';
        const filterSearch = document.getElementById('form-search-product')?.value.toLowerCase() || '';

        let products = dataManager.getAll("products");
        const productTypes = dataManager.getAll("productTypes");

        // Filter
        if (filterCategory) {
            products = products.filter(p => p.specs?.category === filterCategory);
        }
        if (filterSearch) {
            products = products.filter(p => p.title.toLowerCase().includes(filterSearch));
        }

        let html = '';
        if(products.length === 0) {
            html = '<p style="text-align:center; padding:20px;">Không tìm thấy sản phẩm nào.</p>';
        } else {
            products.forEach(p => {
                // Kiểm tra xem danh mục của sản phẩm này có bị ẩn không
                const catObj = productTypes.find(t => t.name === p.specs?.category);
                const isCatHidden = catObj && catObj.status === 'hidden';
                
                // Sản phẩm bị ẩn (soft delete) hoặc danh mục bị ẩn
                const isProductHidden = p.status === 'hidden';
                const isRowHidden = isProductHidden || isCatHidden;
                
                const rowClass = isRowHidden ? 'product-item item-hidden' : 'product-item';
                
                // Badge trạng thái
                let statusText = 'Active';
                let statusStyle = '';
                
                if (isProductHidden) {
                    statusText = 'Hidden (Soft Deleted)';
                    statusStyle = 'background:#ff4d4d; color:white; border-color:#ff4d4d;';
                } else if (isCatHidden) {
                    statusText = 'Category Hidden';
                    statusStyle = 'background:#ccc; color:#333; border-color:#999;';
                }

                // Ảnh: dùng mainImage hoặc placeholder
                const imgSrc = p.mainImage || '/img/blank-image.png';

                html += `
                <div class="${rowClass}" data-id="${p.id}">
                    <div class="product-img">
                        <img src="${imgSrc}" alt="${p.title}" />
                    </div>
                    <div class="product-info">
                        <div class="info">
                            <h3 class="product-name">#${p.id} - ${p.title}</h3>
                            <p class="product-category">
                                <i class="fa-solid fa-tag"></i> ${p.specs?.category || 'N/A'} 
                                ${isCatHidden ? '<i class="fa-solid fa-eye-slash" title="Danh mục này đang bị ẩn"></i>' : ''}
                            </p>
                            <p class="product-description">${p.shortDesc || ''}</p>
                        </div>
                        <div class="product-price">${formatCurrency(p.price)}</div>
                    </div>
                    <div class="product-info-right">
                        <div class="product-status" style="${statusStyle}">${statusText}</div>
                        <div class="btn-items">
                            <button class="btn-edit-product" onclick="window.editProduct(${p.id})">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-delete-product" onclick="window.toggleProductStatus(${p.id})">
                                <i class="fa-solid ${isProductHidden ? 'fa-trash-arrow-up' : 'fa-trash'}"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
        container.innerHTML = html;
    },

    bindEvents: function() {
        const modal = document.querySelector('.modal.add-product');
        const btnAdd = document.getElementById('btn-add-product');
        const btnClose = document.querySelector('.modal-close.product-form');
        
        // Open Modal Add
        if (btnAdd) {
            btnAdd.addEventListener('click', () => {
                this.resetForm();
                this.toggleModalMode('add');
                modal.style.display = 'flex';
            });
        }

        // Close Modal
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Upload Image Preview
        const fileInput = document.getElementById('up-hinh-anh');
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        document.querySelector('.upload-image-preview').src = evt.target.result;
                        currentImageBase64 = evt.target.result; // Lưu chuỗi base64
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        // Button Save (Add)
        const btnSaveAdd = document.getElementById('add-product-button');
        if (btnSaveAdd) {
            btnSaveAdd.addEventListener('click', () => {
                this.saveProduct('add');
            });
        }

        // Button Save (Update)
        const btnSaveEdit = document.getElementById('update-product-button');
        if (btnSaveEdit) {
            btnSaveEdit.addEventListener('click', () => {
                this.saveProduct('edit');
            });
        }
        
        // Refresh button
        document.getElementById('btn-refresh-product')?.addEventListener('click', () => {
            this.renderList();
        });
    },

    resetForm: function() {
        document.getElementById('ten-mon').value = '';
        document.getElementById('chon-the-loai').value = '';
        document.getElementById('gia-moi').value = '';
        document.getElementById('mo-ta').value = '';
        document.querySelector('.upload-image-preview').src = '/img/blank-image.png';
        currentImageBase64 = '/img/blank-image.png';
        document.querySelector('.add-product-form').removeAttribute('data-id');
    },

    toggleModalMode: function(mode) {
        const titleAdd = document.querySelector('.modal-container-title.add-product-e');
        const titleEdit = document.querySelector('.modal-container-title.edit-product-e');
        const btnAdd = document.querySelector('.btn-add-product-form');
        const btnEdit = document.querySelector('.btn-update-product-form');

        if (mode === 'add') {
            titleAdd.style.display = 'flex';
            titleEdit.style.display = 'none';
            btnAdd.style.display = 'flex';
            btnEdit.style.display = 'none';
        } else {
            titleAdd.style.display = 'none';
            titleEdit.style.display = 'flex';
            btnAdd.style.display = 'none';
            btnEdit.style.display = 'flex';
        }
    },

    saveProduct: function(mode) {
        const name = document.getElementById('ten-mon').value.trim();
        const category = document.getElementById('chon-the-loai').value;
        const price = parseFloat(document.getElementById('gia-moi').value);
        const desc = document.getElementById('mo-ta').value.trim();
        const form = document.querySelector('.add-product-form');

        if (!name || !category || isNaN(price)) {
            alert("Vui lòng nhập đầy đủ thông tin: Tên, Thể loại, Giá.");
            return;
        }

        const productData = {
            title: name,
            price: price,
            shortDesc: desc,
            image: currentImageBase64,
            mainImage: currentImageBase64, // Dùng chung cho đơn giản
            specs: {
                category: category,
                brand: "KeySmith",
                color: "Custom"
            }
        };

        if (mode === 'add') {
            productData.id = Date.now(); // Simple ID
            productData.status = 'ready';
            productData.stock = 10; // Mặc định
            productData.sold = 0;
            
            dataManager.add("products", productData);
            alert("Thêm sản phẩm thành công!");
        } else {
            const id = parseInt(form.dataset.id);
            dataManager.updateById("products", id, productData);
            alert("Cập nhật sản phẩm thành công!");
        }

        document.querySelector('.modal.add-product').style.display = 'none';
        this.renderList();
    }
};

// Hàm global cho Product (để gọi onclick từ HTML)
window.showProduct = function() {
    // Hàm này được gọi khi search/filter change trong HTML cũ
    productSection.renderList();
};

window.editProduct = function(id) {
    const p = dataManager.getById("products", id);
    if (!p) return;

    // Fill data
    document.getElementById('ten-mon').value = p.title;
    
    // Cần đảm bảo dropdown có value này, nếu loại sp bị ẩn thì có thể add tạm option
    const select = document.getElementById('chon-the-loai');
    if (!select.querySelector(`option[value="${p.specs?.category}"]`)) {
        const opt = document.createElement('option');
        opt.value = p.specs?.category;
        opt.text = p.specs?.category + ' (Hidden)';
        select.add(opt);
    }
    select.value = p.specs?.category;

    document.getElementById('gia-moi').value = p.price;
    document.getElementById('mo-ta').value = p.shortDesc || '';
    
    // Image
    const imgPreview = document.querySelector('.upload-image-preview');
    imgPreview.src = p.mainImage || '/img/blank-image.png';
    currentImageBase64 = p.mainImage || '/img/blank-image.png';

    // Set ID
    document.querySelector('.add-product-form').dataset.id = id;

    // Show modal edit mode
    productSection.toggleModalMode('edit');
    document.querySelector('.modal.add-product').style.display = 'flex';
};

window.toggleProductStatus = function(id) {
    const p = dataManager.getById("products", id);
    if (!p) return;

    const newStatus = p.status === 'hidden' ? 'ready' : 'hidden';
    const msg = newStatus === 'hidden' ? 'Bạn muốn XÓA (ẩn) sản phẩm này?' : 'Bạn muốn KHÔI PHỤC sản phẩm này?';

    if (confirm(msg)) {
        dataManager.updateById("products", id, { status: newStatus });
        productSection.renderList();
    }
};

// Upload image handler global (vì HTML cũ dùng onchange="uploadImage(this)")
window.uploadImage = function(input) {
    // Hàm này đã được xử lý trong bindEvents ('change'), 
    // nhưng giữ lại để tương thích nếu HTML gọi trực tiếp
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.upload-image-preview').src = e.target.result;
            currentImageBase64 = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// ============================================================
// 4. KHỞI CHAY KHI DOCUMENT READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    ptSection.init();
    productSection.init();
});