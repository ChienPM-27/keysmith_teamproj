let currentEditingId = null;
let productsLoaded = false;
let currentPage = 1;
const itemsPerPage = 10;

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

async function initializeProducts() {
    await DataManager.loadProductsFromJSON();
    productsLoaded = true;
    updateCategoryFilter();
    showProduct();
}

function updateCategoryFilter() {
    const categorySelect = document.getElementById('the-loai');
    if (!categorySelect) return;
    
    const products = DataManager.getProducts();
    const categories = [...new Set(products.map(p => p.category))];
    
    const currentValue = categorySelect.value;
    categorySelect.innerHTML = '<option value="">Tất cả</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    if (currentValue && categories.includes(currentValue)) {
        categorySelect.value = currentValue;
    }
}

function showProduct(searchTerm = '', category = '') {
    if (!productsLoaded) {
        console.log('Products not loaded yet, waiting...');
        return;
    }

    const products = DataManager.getProducts();
    const productContainer = document.querySelector('.show-product');
    
    if (!productContainer) return;

    const searchInput = document.getElementById('form-search-product');
    const categorySelect = document.getElementById('the-loai');
    
    const search = searchTerm || (searchInput ? searchInput.value.toLowerCase() : '');
    const selectedCategory = category || (categorySelect ? categorySelect.value : '');

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search) || 
                            (product.description && product.description.toLowerCase().includes(search));
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        productContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No products found</p>';
        updatePagination(0);
        return;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Đảm bảo currentPage không vượt quá totalPages
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    // Hiển thị sản phẩm
    productContainer.innerHTML = productsToShow.map(product => `
        <div class="list" data-id="${product.id}">
            <div class="list-left">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='../../img/keycap/default.jpg'">
                <div class="list-info">
                    <h4>${product.name}</h4>
                    <p class="list-note">${product.description || ''}</p>
                    <span class="list-category">${product.category}</span>
                </div>
            </div>
            <div class="list-right">
                <div class="list-price">
                    <span class="list-current-price">${formatCurrency(product.price)}</span>
                </div>
                <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-view" onclick="viewProduct(${product.id})"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Cập nhật phân trang
    updatePagination(filteredProducts.length);
}

function updatePagination(totalItems) {
    const pageNavList = document.querySelector('.page-nav-list');
    
    if (!pageNavList) return;

    if (totalItems === 0) {
        pageNavList.innerHTML = '<li class="page-nav-item"><a href="#">0</a></li>';
        return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        pageNavList.innerHTML = '<li class="page-nav-item active"><a href="#" onclick="return false;">1</a></li>';
        return;
    }

    let paginationHTML = '';
    
    // Nút Previous
    if (currentPage > 1) {
        paginationHTML += `<li class="page-nav-item"><a href="#" onclick="changePage(${currentPage - 1}); return false;">«</a></li>`;
    }
    
    // Logic hiển thị số trang
    if (totalPages <= 7) {
        // Hiển thị tất cả nếu ít hơn hoặc bằng 7 trang
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-nav-item ${i === currentPage ? 'active' : ''}">
                    <a href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        }
    } else {
        // Hiển thị với dấu ...
        // Trang đầu
        paginationHTML += `
            <li class="page-nav-item ${1 === currentPage ? 'active' : ''}">
                <a href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        
        // Dấu ... đầu
        if (currentPage > 3) {
            paginationHTML += `<li class="page-nav-item"><a href="#" onclick="return false;">...</a></li>`;
        }
        
        // Các trang ở giữa
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-nav-item ${i === currentPage ? 'active' : ''}">
                    <a href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        // Dấu ... cuối
        if (currentPage < totalPages - 2) {
            paginationHTML += `<li class="page-nav-item"><a href="#" onclick="return false;">...</a></li>`;
        }
        
        // Trang cuối
        paginationHTML += `
            <li class="page-nav-item ${totalPages === currentPage ? 'active' : ''}">
                <a href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Nút Next
    if (currentPage < totalPages) {
        paginationHTML += `<li class="page-nav-item"><a href="#" onclick="changePage(${currentPage + 1}); return false;">»</a></li>`;
    }
    
    pageNavList.innerHTML = paginationHTML;
}

function changePage(page) {
    const products = DataManager.getProducts();
    const searchInput = document.getElementById('form-search-product');
    const categorySelect = document.getElementById('the-loai');
    
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categorySelect ? categorySelect.value : '';

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search) || 
                            (product.description && product.description.toLowerCase().includes(search));
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    showProduct();
    
    // Scroll lên đầu danh sách sản phẩm
    const productContainer = document.querySelector('.show-product');
    if (productContainer) {
        productContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function openAddProductModal() {
    const modal = document.querySelector('.modal.add-product');
    if (!modal) {
        // Fallback: create modal if missing (shouldn't happen because markup exists in admin.html)
        createProductModal();
        return;
    }
    currentEditingId = null;
    // Ensure hidden base64 input exists
    try { if (typeof ensureBase64Field === 'function') ensureBase64Field(); } catch {}
    // Use existing field IDs from admin.html
    const nameEl = document.getElementById('ten-mon');
    const catEl = document.getElementById('chon-the-loai');
    const priceEl = document.getElementById('gia-moi');
    const descEl = document.getElementById('mo-ta');
    if (nameEl) nameEl.value = '';
    if (catEl) catEl.selectedIndex = 0;
    if (priceEl) priceEl.value = '';
    if (descEl) descEl.value = '';
    const preview = document.querySelector('.upload-image-preview');
    if (preview) preview.src = './assets/img/blank-image.png';
    // clear hidden base64 field if exists
    const imgBase64Field = document.getElementById('product-image-base64');
    if (imgBase64Field) imgBase64Field.value = '';
    // Toggle add/update controls (match existing classes in admin.html)
    const addEls = document.querySelectorAll('.add-product-e');
    const editEls = document.querySelectorAll('.edit-product-e');
    addEls.forEach(el => el.style.display = '');
    editEls.forEach(el => el.style.display = 'none');
    modal.style.display = 'flex';
}

function createProductModal() {
    const modalHTML = `
        <div class="modal add-product" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title">Quản lý sản phẩm</h3>
                    <button class="modal-close product-form" onclick="closeProductModal()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form class="product-form" id="product-form">
                        <div class="form-group">
                            <label for="product-name">Tên sản phẩm <span style="color: red;">*</span></label>
                            <input type="text" id="product-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Thể loại <span style="color: red;">*</span></label>
                            <select id="product-category" name="category" required>
                                <option value="">Chọn thể loại</option>
                                <option value="Attack on Titan">Attack on Titan</option>
                                <option value="The Lord of the Rings">The Lord of the Rings</option>
                                <option value="One Piece">One Piece</option>
                                <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Giá <span style="color: red;">*</span></label>
                            <input type="number" id="product-price" name="price" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Mô tả</label>
                            <textarea id="product-description" name="description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-image">Hình ảnh</label>
                            <input type="file" id="product-image" name="image" accept="image/*" onchange="uploadImage(this)">
                            <img class="upload-image-preview" src="./assets/img/blank-image.png" style="max-width: 120px; margin-top: 10px; border-radius: 8px; border: 1px solid #ccc;" />
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="submit" id="add-product-button" class="btn-primary" style="padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fa-solid fa-plus"></i> Thêm sản phẩm
                            </button>
                            <button type="submit" id="update-product-button" class="btn-primary" style="padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 5px; cursor: pointer; display: none;">
                                <i class="fa-solid fa-save"></i> Cập nhật
                            </button>
                            <button type="button" class="btn-secondary" onclick="closeProductModal()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fa-solid fa-xmark"></i> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const addBtn = document.getElementById('add-product-button');
            if (addBtn && addBtn.style.display !== 'none') {
                handleAddProduct(e);
            } else {
                handleUpdateProduct(e);
            }
        });
    }
    const modal = document.querySelector('.modal.add-product');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
}

function closeProductModal() {
    const modal = document.querySelector('.modal.add-product');
    if (modal) modal.style.display = 'none';
    currentEditingId = null;
}

function editProduct(id) {
    const product = DataManager.getProductById(id);
    if (!product) return;

    currentEditingId = id;
    
    const modal = document.querySelector('.modal.add-product');
    if (!modal) return;

    const addElements = document.querySelectorAll('.add-product-e');
    const editElements = document.querySelectorAll('.edit-product-e');
    addElements.forEach(el => el.style.display = 'none');
    editElements.forEach(el => el.style.display = 'block');
    
    document.getElementById('ten-mon').value = product.name;
    document.getElementById('chon-the-loai').value = product.category;
    document.getElementById('gia-moi').value = product.price;
    document.getElementById('mo-ta').value = product.description || '';
    
    const preview = document.querySelector('.upload-image-preview');
    if (preview && product.image) preview.src = product.image;
    // Clear hidden base64 so a new upload overrides
    const imgBase64Field = document.getElementById('product-image-base64');
    if (imgBase64Field) imgBase64Field.value = '';
    
    modal.style.display = 'flex';
}

function viewProduct(id) {
    const product = DataManager.getProductById(id);
    if (!product) return;

    alert(`Product Details:\n\nName: ${product.name}\nCategory: ${product.category}\nPrice: ${formatCurrency(product.price)}\nStock: ${product.stock || 0}\nSold: ${product.sold || 0}\nDescription: ${product.description || 'N/A'}`);
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    if (DataManager.deleteProduct(id)) {
        alert('Product deleted successfully!');
        updateCategoryFilter();
        showProduct();
    } else {
        alert('Failed to delete product');
    }
}

function uploadImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.querySelector('.upload-image-preview');
            if (preview) preview.src = e.target.result;
            // Save base64 string to a hidden field for later use
            const imgBase64Field = document.getElementById('product-image-base64');
            if (imgBase64Field) imgBase64Field.value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Simple refresh helper used by the Refresh button
function refreshProducts() {
    updateCategoryFilter();
    currentPage = 1;
    showProduct();
}

// In handleAddProduct, use base64 if available
function handleAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai').value;
    const price = parseFloat(document.getElementById('gia-moi').value);
    const description = document.getElementById('mo-ta').value.trim();
    let imagePreview = document.querySelector('.upload-image-preview').src;
    const imgBase64Field = document.getElementById('product-image-base64');
    if (imgBase64Field && imgBase64Field.value) {
        imagePreview = imgBase64Field.value;
    }
    if (!name || !category || !price || isNaN(price)) {
        alert('Please fill in all required fields with valid data');
        return;
    }
    // Store both image and mainImage for store compatibility
    const mainImage = imagePreview.includes('blank-image.png') ? '../../img/keycap/default.jpg' : imagePreview;
    const newProduct = {
        name,
        category,
        price,
        description,
        image: mainImage,
        mainImage,
        stock: 0,
        sold: 0
    };
    DataManager.addProduct(newProduct);
    alert('Product added successfully!');
    closeProductModal();
    updateCategoryFilter();
    currentPage = 1;
    showProduct();
}

// Update handler prefers hidden base64 image when available
function handleUpdateProduct(e) {
    e.preventDefault();
    if (!currentEditingId) {
        alert('No product selected for update');
        return;
    }

    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai').value;
    const price = parseFloat(document.getElementById('gia-moi').value);
    const description = document.getElementById('mo-ta').value.trim();

    let imagePreview = document.querySelector('.upload-image-preview').src;
    const imgBase64Field = document.getElementById('product-image-base64');
    if (imgBase64Field && imgBase64Field.value) {
        imagePreview = imgBase64Field.value;
    }

    if (!name || !category || !price || isNaN(price)) {
        alert('Please fill in all required fields with valid data');
        return;
    }

    // Fallback if preview is blank-image
    if (imagePreview && imagePreview.includes('blank-image.png')) {
        const existing = typeof DataManager.getProductById === 'function' ? DataManager.getProductById(currentEditingId) : null;
        imagePreview = (existing && existing.image) ? existing.image : '../../img/keycap/default.jpg';
    }

    // Store both image and mainImage for store compatibility
    const mainImage = imagePreview;
    const updatedProduct = {
        name,
        category,
        price,
        description,
        image: mainImage,
        mainImage
    };

    const ok = typeof DataManager.updateProduct === 'function' ? DataManager.updateProduct(currentEditingId, updatedProduct) : false;
    if (ok) {
        alert('Product updated successfully!');
        closeProductModal();
        updateCategoryFilter();
        showProduct();
    } else {
        alert('Failed to update product');
    }

    if (imgBase64Field) imgBase64Field.value = '';
}

// Add a hidden input for base64 image in modal if not present
function ensureBase64Field() {
    const form = document.querySelector('.add-product-form');
    if (form && !document.getElementById('product-image-base64')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'product-image-base64';
        form.appendChild(input);
    }
}
document.addEventListener('DOMContentLoaded', ensureBase64Field);

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        await initializeProducts();
        const addBtn = document.getElementById('btn-add-product');
        if (addBtn) {
            addBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openAddProductModal();
            });
        }

        const refreshBtn = document.getElementById('btn-refresh-product');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshProducts);
        }

        const closeModalBtn = document.querySelector('.modal-close.product-form');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeProductModal);
        }

        const addProductBtn = document.getElementById('add-product-button');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', handleAddProduct);
        }

        const updateProductBtn = document.getElementById('update-product-button');
        if (updateProductBtn) {
            updateProductBtn.addEventListener('click', handleUpdateProduct);
        }

        // Prevent default submit and route to correct handler
        const productForm = document.querySelector('.add-product-form');
        if (productForm) {
            productForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const addBtn = document.getElementById('add-product-button');
                const addVisible = addBtn && getComputedStyle(addBtn).display !== 'none';
                if (addVisible) {
                    handleAddProduct(e);
                } else {
                    handleUpdateProduct(e);
                }
            });
        }

        const modal = document.querySelector('.modal.add-product');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeProductModal();
            });
        }

        // Thêm event listener cho search và filter để reset về trang 1
        const searchInput = document.getElementById('form-search-product');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentPage = 1;
                showProduct();
            });
        }

        const categorySelect = document.getElementById('the-loai');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                currentPage = 1;
                showProduct();
            });
        }
    }, 500);
});

window.showProduct = showProduct;
window.editProduct = editProduct;
window.viewProduct = viewProduct;
window.deleteProduct = deleteProduct;
window.uploadImage = uploadImage;
window.refreshProducts = refreshProducts;
window.changePage = changePage;