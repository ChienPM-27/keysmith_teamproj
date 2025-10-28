let currentEditingId = null;
let productsLoaded = false;

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
        return;
    }

    productContainer.innerHTML = filteredProducts.map(product => `
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
}

function openAddProductModal() {
    const modal = document.querySelector('.modal.add-product');
    if (!modal) return;

    currentEditingId = null;
    
    const addElements = document.querySelectorAll('.add-product-e');
    const editElements = document.querySelectorAll('.edit-product-e');
    addElements.forEach(el => el.style.display = 'block');
    editElements.forEach(el => el.style.display = 'none');
    
    document.getElementById('ten-mon').value = '';
    document.getElementById('chon-the-loai').selectedIndex = 0;
    document.getElementById('gia-moi').value = '';
    document.getElementById('mo-ta').value = '';
    
    const preview = document.querySelector('.upload-image-preview');
    if (preview) preview.src = './assets/img/blank-image.png';
    
    modal.style.display = 'flex';
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
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai').value;
    const price = parseFloat(document.getElementById('gia-moi').value);
    const description = document.getElementById('mo-ta').value.trim();
    const imagePreview = document.querySelector('.upload-image-preview').src;
    
    if (!name || !category || !price || isNaN(price)) {
        alert('Please fill in all required fields with valid data');
        return;
    }

    const newProduct = {
        name,
        category,
        price,
        description,
        image: imagePreview.includes('blank-image.png') ? '../../img/keycap/default.jpg' : imagePreview,
        stock: 0,
        sold: 0
    };

    DataManager.addProduct(newProduct);
    alert('Product added successfully!');
    closeProductModal();
    updateCategoryFilter();
    showProduct();
}

function handleUpdateProduct(e) {
    e.preventDefault();
    
    if (!currentEditingId) return;

    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai').value;
    const price = parseFloat(document.getElementById('gia-moi').value);
    const description = document.getElementById('mo-ta').value.trim();
    const imagePreview = document.querySelector('.upload-image-preview').src;
    
    if (!name || !category || !price || isNaN(price)) {
        alert('Please fill in all required fields with valid data');
        return;
    }

    const updatedProduct = {
        name,
        category,
        price,
        description,
        image: imagePreview
    };

    if (DataManager.updateProduct(currentEditingId, updatedProduct)) {
        alert('Product updated successfully!');
        closeProductModal();
        updateCategoryFilter();
        showProduct();
    } else {
        alert('Failed to update product');
    }
}

async function refreshProducts() {
    await DataManager.loadProductsFromJSON();
    updateCategoryFilter();
    showProduct();
    alert('Products refreshed from JSON!');
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        await initializeProducts();

        const addBtn = document.getElementById('btn-add-product');
        if (addBtn) {
            addBtn.addEventListener('click', openAddProductModal);
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

        const modal = document.querySelector('.modal.add-product');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeProductModal();
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
