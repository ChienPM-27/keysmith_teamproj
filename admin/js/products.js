// ============================================
// PRODUCTS MANAGEMENT
// ============================================

// Product data
let productsData = [];
const PRODUCTS_PER_PAGE = 10;
let currentPage = 1;
let editingProductId = null;

// Categories from the select element
const categories = ['', 'Attack on Titan', 'The Lord of the Rings', 'One Piece', 'Yu-Gi-Oh!'];

// ============================================
// INITIALIZATION
// ============================================

async function initializeProducts() {
    // Check if DOM elements exist
    const productsSection = document.getElementById('products-section');
    if (!productsSection) {
        console.warn('Products section not found');
        return;
    }
    
    await loadProducts();
    setupEventListeners();
    // Populate category dropdown
    populateCategoryDropdown();
}

function setupEventListeners() {
    // Add product button
    const addBtn = document.getElementById('btn-add-product');
    if (addBtn) {
        addBtn.addEventListener('click', openAddProductModal);
    }

    // Refresh button
    const refreshBtn = document.getElementById('btn-refresh-product');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadProducts();
            alert('Danh sách đã được làm mới');
        });
    }

    // Add product form submit
    const addProductBtn = document.getElementById('add-product-button');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', handleAddProduct);
    }

    // Update product form submit
    const updateProductBtn = document.getElementById('update-product-button');
    if (updateProductBtn) {
        updateProductBtn.addEventListener('click', handleUpdateProduct);
    }

    // Close modal
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // Click outside modal to close
    const modal = document.querySelector('.modal.add-product');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Attach product button event delegation (only once)
    attachProductButtonListeners();
    setupPaginationListener();
}

function populateCategoryDropdown() {
    // Categories are already hardcoded in HTML
    // This function can be used for future dynamic category loading
}

// ============================================
// DATA MANAGEMENT
// ============================================

async function loadProducts() {
    try {
        // Try to load from localStorage first
        const stored = localStorage.getItem('products');
        if (stored) {
            productsData = JSON.parse(stored);
        } else {
            // Load from JSON file
            const response = await fetch('../json/products.json');
            if (response.ok) {
                productsData = await response.json();
                localStorage.setItem('products', JSON.stringify(productsData));
            } else {
                console.error('Failed to load products.json');
                productsData = [];
            }
        }
        
        // Sort products by name
        productsData.sort((a, b) => a.name.localeCompare(b.name));
        
        // Update UI
        showProduct();
    } catch (error) { 
        console.error('Error loading products:', error);
        productsData = [];
        showProduct();
    }
}

// ============================================
// DISPLAY PRODUCTS
// ============================================

function showProduct() {
    const searchTerm = document.getElementById('form-search-product')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('the-loai')?.value || '';
    
    // Reset to page 1 when filtering
    currentPage = 1;
    
    // Filter products
    const filteredProducts = productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    // Display products
    displayProducts(filteredProducts);
    
    // Update pagination
    updatePagination(filteredProducts.length);
}

function displayProducts(filteredProducts) {
    const container = document.querySelector('.show-product');
    if (!container) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        container.innerHTML = '<div class="list" style="text-align: center; padding: 40px;"><p>Không tìm thấy sản phẩm nào</p></div>';
        return;
    }
    
    container.innerHTML = productsToShow.map(product => `
        <div class="list" data-product-id="${product.id}">
            <div class="list-left">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='../img/logo/logo.png'">
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
                        <button class="btn-edit" data-action="edit" data-id="${product.id}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-view" data-action="view" data-id="${product.id}">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-delete" data-action="delete" data-id="${product.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let buttonListenersAttached = false;
let paginationListenerAttached = false;

function attachProductButtonListeners() {
    const container = document.querySelector('.show-product');
    if (!container || buttonListenersAttached) return;
    
    container.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-edit, .btn-view, .btn-delete');
        if (!btn) return;
        
        const action = btn.getAttribute('data-action');
        const id = parseInt(btn.getAttribute('data-id'));
        
        if (!id) return;
        
        switch(action) {
            case 'edit':
                editProduct(id);
                break;
            case 'view':
                viewProduct(id);
                break;
            case 'delete':
                deleteProduct(id);
                break;
        }
    });
    
    buttonListenersAttached = true;
}

function setupPaginationListener() {
    const pagination = document.querySelector('.page-nav');
    if (!pagination || paginationListenerAttached) return;
    
    pagination.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute('data-page'));
            if (page) {
                changePage(page);
            }
        }
    });
    
    paginationListenerAttached = true;
}

function updatePagination(totalItems) {
    const pagination = document.querySelector('.page-nav ul.page-nav-list');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-nav-item ${i === currentPage ? 'active' : ''}">
                <a href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    showProduct();
    // Scroll to top
    document.querySelector('.show-product').scrollIntoView({ behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function openAddProductModal() {
    const modal = document.querySelector('.modal.add-product');
    const addTitle = document.querySelector('.add-product-e');
    const editTitle = document.querySelector('.edit-product-e');
    const addBtn = document.getElementById('add-product-button');
    const updateBtn = document.getElementById('update-product-button');
    
    if (modal) {
        modal.classList.add('open');
        if (addTitle) addTitle.style.display = 'block';
        if (editTitle) editTitle.style.display = 'none';
        if (addBtn) addBtn.style.display = 'flex';
        if (updateBtn) updateBtn.style.display = 'none';
    }
    
    // Reset form
    document.getElementById('ten-mon').value = '';
    document.getElementById('chon-the-loai-modal').value = '';
    document.getElementById('gia-moi').value = '';
    document.getElementById('mo-ta').value = '';
    document.querySelector('.upload-image-preview').src = '../img/logo/logo.png';
    editingProductId = null;
}

function openEditProductModal(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.querySelector('.modal.add-product');
    const addTitle = document.querySelector('.add-product-e');
    const editTitle = document.querySelector('.edit-product-e');
    const addBtn = document.getElementById('add-product-button');
    const updateBtn = document.getElementById('update-product-button');
    
    if (modal) {
        modal.classList.add('open');
        if (addTitle) addTitle.style.display = 'none';
        if (editTitle) editTitle.style.display = 'block';
        if (addBtn) addBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'flex';
    }
    
    // Fill form with product data
    editingProductId = productId;
    document.getElementById('ten-mon').value = product.name;
    document.getElementById('chon-the-loai-modal').value = product.category;
    document.getElementById('gia-moi').value = product.price;
    document.getElementById('mo-ta').value = product.description || '';
    document.querySelector('.upload-image-preview').src = product.image;
}

function closeProductModal() {
    const modal = document.querySelector('.modal.add-product');
    if (modal) {
        modal.classList.remove('open');
    }
}
// ============================================
// PRODUCT ACTIONS
// ============================================

function editProduct(id) {
    openEditProductModal(id);
}

function viewProduct(id) {
    const product = productsData.find(p => p.id === id);
    if (!product) return;
    
    alert(`Product Details:\n\nName: ${product.name}\nCategory: ${product.category}\nPrice: ${formatCurrency(product.price)}\nDescription: ${product.description || 'No description'}`);
}

function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    const index = productsData.findIndex(p => p.id === id);
    if (index !== -1) {
        productsData.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(productsData));
        showProduct();
        alert('Sản phẩm đã được xóa!');
    }
}

function handleAddProduct() {
    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai-modal').value;
    const price = document.getElementById('gia-moi').value.trim();
    const description = document.getElementById('mo-ta').value.trim();
    const image = document.querySelector('.upload-image-preview').src;
    
    // Validation
    if (!name || !category || !price) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    if (isNaN(price) || parseFloat(price) <= 0) {
        alert('Giá bán phải là số dương!');
        return;
    }
    
    // Create new product
    const newProduct = {
        id: productsData.length > 0 ? Math.max(...productsData.map(p => p.id)) + 1 : 1,
        name,
        category,
        price: parseFloat(price),
        description,
        image,
        stock: 0,
        sold: 0
    };
    
    productsData.push(newProduct);
    localStorage.setItem('products', JSON.stringify(productsData));
    
    closeProductModal();
    showProduct();
    alert('Sản phẩm đã được thêm thành công!');
}


function handleUpdateProduct() {
    if (!editingProductId) return;
    
    const name = document.getElementById('ten-mon').value.trim();
    const category = document.getElementById('chon-the-loai-modal').value;
    const price = document.getElementById('gia-moi').value.trim();
    const description = document.getElementById('mo-ta').value.trim();
    const image = document.querySelector('.upload-image-preview').src;

    // Validation
    if (!name || !category || !price) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
        alert('Giá bán phải là số dương!');
        return;
    }

    // Update product
    const index = productsData.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
        productsData[index] = {
            ...productsData[index],
            name,
            category,
            price: parseFloat(price),
            description,
            image
        };
        
        localStorage.setItem('products', JSON.stringify(productsData));
        closeProductModal();
        showProduct();
        alert('Sản phẩm đã được cập nhật thành công!');
    }
}

// Make uploadImage globally accessible for HTML inline calls
window.uploadImage = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.upload-image-preview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ============================================
// MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// This section is executed after all functions are defined
// ============================================

(function() {
    // Export all necessary functions to global scope
    window.showProduct = showProduct;
    window.changePage = changePage;
    window.editProduct = editProduct;
    window.viewProduct = viewProduct;
    window.deleteProduct = deleteProduct;
})();

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

// Initialize when products section is loaded via include.js callback
// This is called from include.js when the products section HTML is loaded

// Also initialize when the products section becomes active
document.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar-list-item.tab-content')) {
        setTimeout(() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection && productsSection.classList.contains('active')) {
                if (productsData.length === 0) {
                    initializeProducts();
                } else {
                    // Just refresh the display
                    showProduct();
                }
            }
        }, 50);
    }
});
