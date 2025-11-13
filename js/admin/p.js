import { dataManager } from './DatabaseManager.js';
import { sampleData } from '../sampledata/sampleData.js';
const PRODUCT_STORAGE_KEY = 'products';
const HIDDEN_PRODUCT_STATUSES = new Set(['inactive', 'deleted']);
function createProduct() {
	let shouldSeed = false;
	const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);

	if (!stored) {
		shouldSeed = true;
	} else {
		try {
			const parsed = JSON.parse(stored);
			if (!Array.isArray(parsed) || parsed.length === 0) {
				shouldSeed = true;
			} else {
				syncProductsToDatabase(parsed);
				return;
			}
		} catch (error) {
			console.warn('Invalid products data found in localStorage, resetting sample data.', error);
			shouldSeed = true;
		}
	}

	const databaseProducts = getDatabaseProductsSnapshot();
	if (Array.isArray(databaseProducts) && databaseProducts.length > 0) {
		saveProducts(databaseProducts);
		return;
	}

	if (shouldSeed) {
		const fallbackProducts = cloneProductsList(FALLBACK_PRODUCTS);
		saveProducts(fallbackProducts);
	}
}

function cloneProductsList(source) {
	if (!Array.isArray(source)) {
		return [];
	}
	try {
		return JSON.parse(JSON.stringify(source));
	} catch (error) {
		console.warn('Unable to clone product list.', error);
		return source.map(item => ({ ...item }));
	}
}

function getDatabaseProductsSnapshot() {
	if (dataManager && typeof dataManager.getAll === 'function') {
		const snapshot = dataManager.getAll('products') || [];
		return cloneProductsList(snapshot);
	}
	return [];
}

function persistProductsToDatabase(products) {
	if (!dataManager || typeof dataManager !== 'object') {
		return;
	}
	try {
		const snapshot = cloneProductsList(products);
		if (!dataManager.data || typeof dataManager.data !== 'object') {
			dataManager.data = { products: [], customers: [], orders: [], importOrders: [] };
		}
		dataManager.data.products = snapshot;
		if (typeof dataManager.save === 'function') {
			dataManager.save();
		}
	} catch (error) {
		console.warn('Unable to sync products to shared database.', error);
	}
}

function syncProductsToDatabase(localProducts) {
	persistProductsToDatabase(localProducts);
}

function isProductVisible(product) {
	if (!product) {
		return false;
	}
	const status = (product.status || '').toLowerCase();
	return !HIDDEN_PRODUCT_STATUSES.has(status);
}

// get amount of products
function getAmoumtProducts() {
	const products = loadProducts();
	return products.filter(isProductVisible).length;
}

const productCountEl = document.getElementById('productCount');
if (productCountEl) productCountEl.innerText = getAmoumtProducts();
// doi dinh dang sang USD
function USD(num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
//paging

const PRODUCT_IMAGE_FALLBACK = '/img/blank-image.png';
const VISIBLE_PRODUCT_STATUSES = ['ready', 'outofstock', 'active', 'inactive', 'deleted'];
const PRODUCT_STATUS_LABELS = {
	ready: 'Ready',
	outofstock: 'Out of stock',
	active: 'Active',
	inactive: 'Inactive',
	deleted: 'Deleted'
};
const PRODUCT_TYPE_STORAGE_KEY = 'catagories';
const PRODUCT_TYPE_STATUS_LABELS = {
	active: 'Active',
	inactive: 'Inactive'
};
const DEFAULT_PRODUCT_TYPE_NAMES = [
	'Attack On Titan',
	'One Piece',
	'YuGiOh',
];
const FALLBACK_PRODUCTS = Array.isArray(sampleData?.products) ? sampleData.products : [];


let perpage = 8;
let currentpage = 1;
let editingProductId = null;
let editingProductTypeId = null;
let currentImageBase64 = PRODUCT_IMAGE_FALLBACK;
let productTypePerPage = 8;
let productTypeCurrentPage = 1;

const productsection = document.getElementById('products-section');
const productListContainer = productsection ? productsection.querySelector('.show-product') : null;
const addproductBtn = productsection ? productsection.querySelector('#btn-add-product.btn-control') : null;
const refreshProductBtn = productsection ? productsection.querySelector('#btn-refresh-product') : null;
const perPageSelect = productsection ? productsection.querySelector('#page-control #per-page') : null;
const modalAddProduct = document.getElementById('modal__add_product');
const addModeElements = productsection ? Array.from(productsection.querySelectorAll('.add-product-e')) : [];
const editModeElements = productsection ? Array.from(productsection.querySelectorAll('.edit-product-e')) : [];
const addProductActionBtn = document.getElementById('add-product-button');
const updateProductBtn = productsection ? productsection.querySelector('#update-product-button') : null;
const modalclosebtn = productsection ? productsection.querySelector('.modal-close.product-form') : null;
const productForm = productsection ? productsection.querySelector('.add-product-form') : null;
const productImagePreview = productsection ? productsection.querySelector('.upload-image-preview') : null;
const productImageInput = document.getElementById('up-hinh-anh');
const productFormNameInput = document.getElementById('ten-mon');
const productFormCategorySelect = document.getElementById('chon-the-loai');
const productFormPriceInput = document.getElementById('gia-moi');
const productFormDescriptionInput = document.getElementById('mo-ta');
const productFilterSelect = document.getElementById('the-loai');
const productSearchInput = document.getElementById('form-search-product');
const paginationList = productsection ? productsection.querySelector('.page-nav-list') : null;
const producttypesection = document.getElementById('product-types-section');
const addproducttypebtn = document.getElementById('pt-add-btn');
const modalAddProductType = document.getElementById('pt-modal');
const closeproducttypebtn = document.querySelector('#pt-modal-close');
const productTypeListContainer = producttypesection ? producttypesection.querySelector('.show-product-types') : null;
const productTypeSearchInput = document.getElementById('pt-category-filter');
const productTypeRefreshBtn = document.getElementById('pt-refresh-btn');
const productTypeForm = document.getElementById('pt-form');
const productTypeFormNameInput = document.getElementById('pt-form-name');
const productTypeFormDescriptionInput = document.getElementById('pt-form-description');
const productTypeFormActiveCheckbox = document.getElementById('pt-form-active');
const productTypeFormError = document.getElementById('pt-form-error');
const productTypeModalTitle = producttypesection ? producttypesection.querySelector('.pt-modal__title') : null;
const productTypeFormSubmitBtn = document.getElementById('pt-form-submit');
const productTypePerPageSelect = producttypesection ? producttypesection.querySelector('#page-control #per-page') : null;
const productTypePaginationList = producttypesection ? producttypesection.querySelector('.page-nav-list') : null;

if (perPageSelect) {
	const parsed = parseInt(perPageSelect.value, 10);
	if (!Number.isNaN(parsed) && parsed > 0) {
		perpage = parsed;
	} else {
		perPageSelect.value = String(perpage);
	}
}

if (productTypePerPageSelect) {
	const parsed = parseInt(productTypePerPageSelect.value, 10);
	if (!Number.isNaN(parsed) && parsed > 0) {
		productTypePerPage = parsed;
	} else {
		productTypePerPageSelect.value = String(productTypePerPage);
	}
}

function loadProducts() {
	const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.warn('Unable to parse products from storage.', error);
		return [];
	}
}

function saveProducts(products) {
	const normalized = cloneProductsList(products);
	localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(normalized));
	persistProductsToDatabase(normalized);
}

function resolveCategory(product) {
	return product.category || product.specs?.category || '';
}

function resolveImage(product) {
	return product.mainImage || product.image || product.img || PRODUCT_IMAGE_FALLBACK;
}

function resolveStatusLabel(status) {
	const normalized = (status || '').toLowerCase();
	return PRODUCT_STATUS_LABELS[normalized] || normalized || 'Unknown';
}

function slugifyProductTypeId(value) {
	if (value === undefined || value === null) {
		return '';
	}
	return value
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function createProductTypeFromName(name) {
	const trimmed = (name || '').toString().trim();
	if (!trimmed) {
		return null;
	}
	return {
		id: slugifyProductTypeId(trimmed),
		name: trimmed,
		description: '',
		status: 'active'
	};
}

function normalizeProductType(raw) {
	if (typeof raw === 'string') {
		return createProductTypeFromName(raw);
	}
	if (!raw || typeof raw !== 'object') {
		return null;
	}
	const nameSource = (raw.name || raw.title || raw.id || '').toString().trim();
	if (!nameSource) {
		return null;
	}
	const idSource = raw.id ? raw.id.toString() : nameSource;
	const normalizedId = slugifyProductTypeId(idSource);
	if (!normalizedId) {
		return null;
	}
	return {
		id: normalizedId,
		name: nameSource,
		description: raw.description != null ? raw.description.toString().trim() : '',
		status: raw.status === 'inactive' ? 'inactive' : 'active'
	};
}

function getDefaultProductTypes() {
	return DEFAULT_PRODUCT_TYPE_NAMES.map(createProductTypeFromName).filter(Boolean);
}

function loadProductTypes() {
	const raw = localStorage.getItem(PRODUCT_TYPE_STORAGE_KEY);
	if (!raw) {
		const defaults = getDefaultProductTypes();
		saveProductTypes(defaults);
		return defaults;
	}
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			const normalized = parsed.map(normalizeProductType).filter(Boolean);
			if (normalized.length === 0) {
				const defaults = getDefaultProductTypes();
				saveProductTypes(defaults);
				return defaults;
			}
			const allNormalized = parsed.every(item => item && typeof item === 'object' && item.id && item.name && item.status);
			if (!allNormalized) {
				saveProductTypes(normalized);
			}
			return normalized;
		}
	} catch (error) {
		console.error('Không thể đọc danh sách loại sản phẩm.', error);
	}
	const defaults = getDefaultProductTypes();
	saveProductTypes(defaults);
	return defaults;
}

function saveProductTypes(productTypes) {
	localStorage.setItem(PRODUCT_TYPE_STORAGE_KEY, JSON.stringify(productTypes));
}

function getProductTypeStatusLabel(status) {
	const normalized = (status || '').toLowerCase();
	return PRODUCT_TYPE_STATUS_LABELS[normalized] || 'Unknown';
}

function ensureProductTypesForProductCategories(productTypes = loadProductTypes()) {
	const map = new Map();
	productTypes.forEach(type => {
		if (type && type.id) {
			map.set(type.id, { ...type });
		}
	});
	let changed = false;
	const products = loadProducts();
	products.forEach(product => {
		if (!isProductVisible(product)) {
			return;
		}
		const category = resolveCategory(product);
		if (!category) {
			return;
		}
		const id = slugifyProductTypeId(category);
		if (!id) {
			return;
		}
		if (!map.has(id)) {
			map.set(id, {
				id,
				name: category,
				description: '',
				status: 'active'
			});
			changed = true;
		} else {
			const existing = map.get(id);
			if (existing && existing.name !== category) {
				map.set(id, {
					...existing,
					name: category
				});
				changed = true;
			}
		}
	});
	const list = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
	if (changed) {
		saveProductTypes(list);
	}
	return { list, changed };
}

function applyProductTypeStatusToProducts(productTypeId, nextStatus) {
	const normalizedTypeId = slugifyProductTypeId(productTypeId);
	if (!normalizedTypeId) {
		return false;
	}
	const products = loadProducts();
	let changed = false;
	const targetStatus = (nextStatus || '').toLowerCase();
	products.forEach(product => {
		const categoryId = slugifyProductTypeId(resolveCategory(product));
		if (categoryId !== normalizedTypeId) {
			return;
		}
		let desiredStatus = product.status || 'ready';
		if (targetStatus === 'inactive') {
			desiredStatus = 'inactive';
		} else {
			desiredStatus = Number(product.stock) > 0 ? 'ready' : 'outofstock';
		}
		if (product.status !== desiredStatus) {
			product.status = desiredStatus;
			changed = true;
		}
	});
	if (changed) {
		saveProducts(products);
		updateProductCount();
		renderProducts({ resetPage: true });
	}
	return changed;
}

function notify(type, message) {
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
}

function createId(arr) {
	if (!Array.isArray(arr) || arr.length === 0) {
		return 1;
	}
	const maxId = arr.reduce((max, item) => {
		const current = Number(item.id) || 0;
		return current > max ? current : max;
	}, 0);
	return maxId + 1;
}

function updateProductCount() {
	if (!productCountEl) return;
	productCountEl.innerText = getAmoumtProducts();
}

function populateCategoryFilters() {
	const products = loadProducts();
	const { list: productTypes, changed: productTypesChanged } = ensureProductTypesForProductCategories();
	const productCategories = products.filter(isProductVisible).map(resolveCategory).filter(Boolean);
	const activeTypeNames = productTypes
		.filter(type => type.status !== 'inactive')
		.map(type => type.name);
	const categories = [...new Set([...activeTypeNames, ...productCategories])]
		.filter(Boolean)
		.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

	if (productFilterSelect) {
		const current = productFilterSelect.value;
		productFilterSelect.innerHTML = '<option value="">All</option>';
		categories.forEach(category => {
			const option = document.createElement('option');
			option.value = category;
			option.textContent = category;
			productFilterSelect.appendChild(option);
		});
		if (current) {
			if (!categories.includes(current)) {
				const option = document.createElement('option');
				option.value = current;
				option.textContent = current;
				productFilterSelect.appendChild(option);
			}
			productFilterSelect.value = current;
		} else {
			productFilterSelect.value = '';
		}
	}

	if (productFormCategorySelect) {
		const current = productFormCategorySelect.value;
		productFormCategorySelect.innerHTML = '<option value="">-- Chọn thể loại --</option>';
		categories.forEach(category => {
			const option = document.createElement('option');
			option.value = category;
			option.textContent = category;
			productFormCategorySelect.appendChild(option);
		});
		if (current && categories.includes(current)) {
			productFormCategorySelect.value = current;
		} else if (current && current !== '') {
			const option = document.createElement('option');
			option.value = current;
			option.textContent = current;
			productFormCategorySelect.appendChild(option);
			productFormCategorySelect.value = current;
		}
	}

	if (productTypesChanged) {
		renderProductTypes({ list: productTypes, resetPage: true });
	}
}

function computeFilteredProducts() {
	const selectedCategory = (productFilterSelect?.value || '').trim();
	const keyword = (productSearchInput?.value || '').trim().toLowerCase();
	return loadProducts()
		.filter(product => {
			const status = (product.status || '').toLowerCase();
			if (!VISIBLE_PRODUCT_STATUSES.includes(status)) {
				return false;
			}
			if (selectedCategory && resolveCategory(product) !== selectedCategory) {
				return false;
			}
			if (keyword) {
				const titleMatches = product.title?.toLowerCase().includes(keyword);
				const idMatches = product.id?.toString().includes(keyword);
				if (!titleMatches && !idMatches) {
					return false;
				}
			}
			return true;
		})
		.sort((a, b) => Number(a.id) - Number(b.id));
}

function renderPagination(totalItems, totalPages) {
	if (!paginationList) return;
	paginationList.innerHTML = '';
	if (totalItems === 0 || totalPages <= 1) {
		return;
	}
	for (let page = 1; page <= totalPages; page++) {
		const listItem = document.createElement('li');
		listItem.className = 'page-nav-item';
		if (page === currentpage) {
			listItem.classList.add('active');
		}
		const anchor = document.createElement('a');
		anchor.href = '#';
		anchor.textContent = String(page);
		anchor.addEventListener('click', event => {
			event.preventDefault();
			if (currentpage !== page) {
				currentpage = page;
				renderProducts();
			}
		});
		listItem.appendChild(anchor);
		paginationList.appendChild(listItem);
	}
}

function showProductArr(arr) {
	if (!productListContainer) return;
	if (!Array.isArray(arr) || arr.length === 0) {
		productListContainer.innerHTML = '<div class="no-result">Không có sản phẩm để hiển thị</div>';
		return;
	}
	const markup = arr.map(product => {
		const imageSrc = resolveImage(product);
		const category = resolveCategory(product) || 'Chưa phân loại';
		const description = product.shortDesc || product.longDesc || 'Chưa có mô tả';
		const priceValue = Number(product.price);
		const formattedPrice = Number.isFinite(priceValue) ? USD(priceValue) : USD(0);
		const status = (product.status || '').toLowerCase();
		const statusLabel = resolveStatusLabel(status);
		const overlayClass = status === 'ready' ? '' : ' overlay';
		return `
			<div class="product-item${overlayClass}" data-id="${product.id}">
				<div class="product-info">
					<div class="product-img">
						<img src="${imageSrc}" alt="Product Image" onerror="this.src='${PRODUCT_IMAGE_FALLBACK}'" />
					</div>
					<div class="info">
						<h3 class="product-name">#${product.id} ${product.title || ''}</h3>
						<p class="product-category">${category}</p>
						<p class="product-description">${description}</p>
					</div>
					<div class="product-price">${formattedPrice}</div>
				</div>
				<div class="product-info-right">
					<div class="product-status">${statusLabel}</div>
					<div class="btn-items">
						<button type="button" class="btn-edit-product" data-id="${product.id}">
							<i class="fa-solid fa-pen-to-square"></i>
						</button>
						<button type="button" class="btn-view-product" data-id="${product.id}">
							<i class="fa-solid fa-eye"></i>
						</button>
						<button type="button" class="btn-delete-product" data-id="${product.id}">
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				</div>
			</div>
		`;
	}).join('');
	productListContainer.innerHTML = markup;
}

function renderProducts(options = {}) {
	const { resetPage = false } = options;
	const filteredProducts = computeFilteredProducts();
	if (resetPage) {
		currentpage = 1;
	}
	const totalItems = filteredProducts.length;
	const totalPages = Math.ceil(totalItems / perpage) || 1;
	if (totalItems === 0) {
		currentpage = 1;
	}
	if (currentpage > totalPages) {
		currentpage = totalPages;
	}
	const start = (currentpage - 1) * perpage;
	const pagedProducts = filteredProducts.slice(start, start + perpage);
	showProductArr(pagedProducts);
	renderPagination(totalItems, totalPages);
}

function resetProductFilters() {
	if (productFilterSelect) {
		productFilterSelect.value = '';
	}
	if (productSearchInput) {
		productSearchInput.value = '';
	}
	currentpage = 1;
}

function toggleProductModalMode(mode) {
	const showAdd = mode === 'add';
	addModeElements.forEach(element => element.classList.toggle('hidden', !showAdd));
	editModeElements.forEach(element => element.classList.toggle('hidden', showAdd));
}

function resetProductForm() {
	if (productForm) {
		productForm.reset();
	}
	if (productImagePreview) {
		productImagePreview.src = PRODUCT_IMAGE_FALLBACK;
	}
	if (productImageInput) {
		productImageInput.value = '';
	}
	currentImageBase64 = PRODUCT_IMAGE_FALLBACK;
}

function fillProductForm(product) {
	if (productFormNameInput) {
		productFormNameInput.value = product.title || '';
	}
	if (productFormPriceInput) {
		productFormPriceInput.value = product.price != null ? product.price : '';
	}
	if (productFormDescriptionInput) {
		productFormDescriptionInput.value = product.shortDesc || product.longDesc || '';
	}
	const category = resolveCategory(product);
	if (productFormCategorySelect) {
		if (category && !Array.from(productFormCategorySelect.options).some(option => option.value === category)) {
			const option = document.createElement('option');
			option.value = category;
			option.textContent = category;
			productFormCategorySelect.appendChild(option);
		}
		productFormCategorySelect.value = category;
	}
	const imageSrc = resolveImage(product);
	if (productImagePreview) {
		productImagePreview.src = imageSrc;
	}
	currentImageBase64 = imageSrc;
	if (productImageInput) {
		productImageInput.value = '';
	}
}

function openProductModal(mode, productId) {
	if (!modalAddProduct) return;
	toggleProductModalMode(mode);
	if (mode === 'add') {
		editingProductId = null;
		resetProductForm();
	} else if (mode === 'edit') {
		const product = loadProducts().find(item => Number(item.id) === Number(productId));
		if (!product) {
			notify('error', 'Không tìm thấy sản phẩm để chỉnh sửa.');
			return;
		}
		editingProductId = Number(productId);
		fillProductForm(product);
	}
	modalAddProduct.classList.add('active');
}

function closeProductModal() {
	if (!modalAddProduct) return;
	modalAddProduct.classList.remove('active');
	editingProductId = null;
	resetProductForm();
	toggleProductModalMode('add');
}

function parsePriceInput(value) {
	if (value === undefined || value === null) return NaN;
	const normalized = value.toString().replace(/[^0-9.,]/g, '').replace(',', '.');
	return parseFloat(normalized);
}

function readProductFormData() {
	if (!productFormNameInput || !productFormCategorySelect || !productFormPriceInput) {
		return null;
	}
	const title = productFormNameInput.value.trim();
	const category = productFormCategorySelect.value.trim();
	const price = parsePriceInput(productFormPriceInput.value);
	const description = productFormDescriptionInput ? productFormDescriptionInput.value.trim() : '';

	if (!title) {
		notify('error', 'Vui lòng nhập tên sản phẩm.');
		productFormNameInput.focus();
		return null;
	}
	if (!category) {
		notify('error', 'Vui lòng chọn thể loại.');
		productFormCategorySelect.focus();
		return null;
	}
	if (Number.isNaN(price) || price <= 0) {
		notify('error', 'Vui lòng nhập giá bán hợp lệ.');
		productFormPriceInput.focus();
		return null;
	}

	return {
		title,
		category,
		price: Math.round(price),
		description
	};
}

function handleAddProduct() {
	const formData = readProductFormData();
	if (!formData) return;
	const products = loadProducts();
	const newProduct = {
		id: createId(products),
		title: formData.title,
		shortDesc: formData.description,
		longDesc: formData.description,
		image: currentImageBase64,
		mainImage: currentImageBase64,
		thumbnails: [],
		specs: {
			category: formData.category,
			brand: 'KeySmith',
			color: 'Custom'
		},
		category: formData.category,
		price: formData.price,
		importPrice: formData.price,
		stock: 0,
		sold: 0,
		status: 'ready'
	};
	products.push(newProduct);
	saveProducts(products);
	notify('success', 'Thêm sản phẩm thành công!');
	updateProductCount();
	populateCategoryFilters();
	renderProducts({ resetPage: true });
	closeProductModal();
}

function handleUpdateProduct() {
	if (!Number.isFinite(editingProductId)) {
		notify('error', 'Không xác định được sản phẩm cần chỉnh sửa.');
		return;
	}
	const formData = readProductFormData();
	if (!formData) return;
	const products = loadProducts();
	const index = products.findIndex(item => Number(item.id) === Number(editingProductId));
	if (index === -1) {
		notify('error', 'Không tìm thấy sản phẩm để chỉnh sửa.');
		return;
	}
	const original = products[index];
	const updatedProduct = {
		...original,
		title: formData.title,
		shortDesc: formData.description,
		longDesc: formData.description,
		category: formData.category,
		specs: {
			...original.specs,
			category: formData.category
		},
		price: formData.price,
		image: currentImageBase64 || resolveImage(original),
		mainImage: currentImageBase64 || resolveImage(original)
	};
	products[index] = updatedProduct;
	saveProducts(products);
	notify('success', 'Đã cập nhật sản phẩm.');
	updateProductCount();
	populateCategoryFilters();
	renderProducts();
	closeProductModal();
}

function setProductStatus(id, status) {
	const products = loadProducts();
	const index = products.findIndex(item => Number(item.id) === Number(id));
	if (index === -1) {
		return false;
	}
	products[index].status = status;
	saveProducts(products);
	return true;
}

function toggleProductStatus(id) {
	const products = loadProducts();
	const index = products.findIndex(item => Number(item.id) === Number(id));
	if (index === -1) {
		notify('error', 'Không tìm thấy sản phẩm để cập nhật trạng thái.');
		return;
	}
	const currentStatus = (products[index].status || '').toLowerCase();
	const nextStatus = currentStatus === 'inactive' || currentStatus === 'deleted' ? 'ready' : 'inactive';
	const confirmMessage = nextStatus === 'inactive' ? 'Bạn có chắc muốn ẩn sản phẩm này?' : 'Bạn có muốn khôi phục sản phẩm này?';
	if (!confirm(confirmMessage)) {
		return;
	}
	products[index].status = nextStatus;
	saveProducts(products);
	notify('success', nextStatus === 'inactive' ? 'Đã ẩn sản phẩm.' : 'Đã khôi phục sản phẩm.');
	updateProductCount();
	renderProducts();
}



function viewProductDetail(id) {
	const products = loadProducts();
	const index = products.findIndex(item => Number(item.id) === Number(id));
	if (index === -1) {
		notify('error', 'Không tìm thấy sản phẩm.');
		return null;
	}

	const currentStatus = (products[index].status || '').toLowerCase();
	const nextStatus = currentStatus === 'ready' ? 'inactive' : 'ready';
	products[index].status = nextStatus;
	saveProducts(products);

	const message = nextStatus === 'ready' ? 'Sản phẩm đã được hiển thị.' : 'Sản phẩm đã được chuyển sang trạng thái ẩn.';
	notify('success', message);
	updateProductCount();
	renderProducts();
	return nextStatus;
}

function view(id) {
	const nextStatus = viewProductDetail(id);
	if (!nextStatus) return;
	const item = productListContainer?.querySelector(`.product-item[data-id="${id}"]`);
	if (!item) return;
	item.classList.toggle('overlay', nextStatus !== 'ready');
}

function uploadImage(input) {
	const file = input?.files ? input.files[0] : null;
	if (!file) return;
	if (!file.type.startsWith('image/')) {
		notify('error', 'Vui lòng chọn tệp hình ảnh hợp lệ.');
		input.value = '';
		return;
	}
	const reader = new FileReader();
	reader.onload = event => {
		const result = event.target?.result;
		if (typeof result === 'string') {
			currentImageBase64 = result;
			if (productImagePreview) {
				productImagePreview.src = result;
			}
		}
	};
	reader.onerror = () => {
		notify('error', 'Không thể đọc tệp hình ảnh.');
	};
	reader.readAsDataURL(file);
}

function initializeProductManagement() {
	populateCategoryFilters();
	updateProductCount();
	renderProducts({ resetPage: true });
	if (productImagePreview) {
		productImagePreview.src = PRODUCT_IMAGE_FALLBACK;
	}
	currentImageBase64 = PRODUCT_IMAGE_FALLBACK;
}

function showProduct() {
	renderProducts({ resetPage: true });
}

function cancelSearchProduct() {
	resetProductFilters();
	renderProducts({ resetPage: true });
}

// Xóa sản phẩm vĩnh viễn
function deleteProduct(id) {
	const products = loadProducts();
	const index = products.findIndex(item => Number(item.id) === Number(id));
	if (index === -1) {
		notify('error', 'Không tìm thấy sản phẩm để xóa.');
		return;
	}
	if (!confirm('Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?')) {
		return;
	}
	const [removed] = products.splice(index, 1);
	saveProducts(products);
	notify('success', `Đã xóa sản phẩm #${removed?.id || ''} thành công.`);
	updateProductCount();
	populateCategoryFilters();
	renderProducts({ resetPage: true });
}

function changeStatusProduct(id) {
	const numericId = Number(id);
	if (!Number.isFinite(numericId)) {
		notify('error', 'Không xác định được sản phẩm cần khôi phục.');
		return;
	}
	if (!setProductStatus(numericId, 'ready')) {
		notify('error', 'Không tìm thấy sản phẩm.');
		return;
	}
	notify('success', 'Đã hiển thị sản phẩm.');
	updateProductCount();
	renderProducts();
}

if (addproductBtn) {
	addproductBtn.addEventListener('click', () => openProductModal('add'));
}

if (modalclosebtn) {
	modalclosebtn.addEventListener('click', () => closeProductModal());
}

if (refreshProductBtn) {
	refreshProductBtn.addEventListener('click', () => {
		resetProductFilters();
		renderProducts({ resetPage: true });
	});
}

if (addProductActionBtn) {
	addProductActionBtn.addEventListener('click', () => handleAddProduct());
}

if (updateProductBtn) {
	updateProductBtn.addEventListener('click', () => handleUpdateProduct());
}

if (addproducttypebtn) {
	addproducttypebtn.addEventListener('click', () => openProductTypeModal('add'));
}

if (closeproducttypebtn) {
	closeproducttypebtn.addEventListener('click', () => closeProductTypeModal());
}

if (modalAddProductType) {
	modalAddProductType.addEventListener('click', event => {
		if (event.target === modalAddProductType) {
			closeProductTypeModal();
		}
	});
}

if (productTypeForm) {
	productTypeForm.addEventListener('submit', handleProductTypeFormSubmit);
}

if (productTypeSearchInput) {
	productTypeSearchInput.addEventListener('input', () => renderProductTypes({ resetPage: true }));
}

if (productTypeRefreshBtn) {
	productTypeRefreshBtn.addEventListener('click', () => {
		resetProductTypeFilters();
		renderProductTypes({ resetPage: true });
	});
}

if (productTypeListContainer) {
	productTypeListContainer.addEventListener('click', event => {
		const button = event.target.closest('button');
		if (!button) return;
		const { id } = button.dataset;
		if (!id) return;
		if (button.classList.contains('edit-btn')) {
			openProductTypeModal('edit', id);
		} else if (button.classList.contains('delete-btn')) {
			handleDeleteProductType(id);
		} else if (button.classList.contains('view-btn')) {
			handleToggleProductTypeStatus(id);
		}
	});
}

if (productTypePerPageSelect) {
	productTypePerPageSelect.addEventListener('change', event => {
		const value = parseInt(event.target.value, 10);
		if (!Number.isNaN(value) && value > 0) {
			productTypePerPage = value;
			productTypeCurrentPage = 1;
			renderProductTypes({ resetPage: true });
		} else {
			event.target.value = String(productTypePerPage);
		}
	});
}

if (perPageSelect) {
	perPageSelect.addEventListener('change', event => {
		const value = parseInt(event.target.value, 10);
		if (!Number.isNaN(value) && value > 0) {
			perpage = value;
			currentpage = 1;
			renderProducts({ resetPage: true });
		} else {
			event.target.value = String(perpage);
		}
	});
}

if (productListContainer) {
	productListContainer.addEventListener('click', event => {
		const button = event.target.closest('button');
		if (!button) return;
		const productId = Number(button.dataset.id);
		if (!Number.isFinite(productId)) return;
		if (button.classList.contains('btn-edit-product')) {
			openProductModal('edit', productId);
		} else if (button.classList.contains('btn-delete-product')) {
			deleteProduct(productId);
		} else if (button.classList.contains('btn-view-product')) {
			view(productId);
		}
	});
}

window.addEventListener('load', () => {
	createProduct();
	initializeProductTypeManagement();
	initializeProductManagement();
});

if (typeof window !== 'undefined') {
	window.showProduct = showProduct;
	window.cancelSearchProduct = cancelSearchProduct;
	window.createProduct = createProduct;
	window.uploadImage = uploadImage;
	window.deleteProduct = deleteProduct;
	window.changeStatusProduct = changeStatusProduct;
	window.toggleProductStatus = toggleProductStatus;
}

//product type section 

function setProductTypeFormError(message) {
	if (!productTypeFormError) return;
	productTypeFormError.textContent = message || '';
}

function resetProductTypeForm() {
	if (productTypeForm) {
		productTypeForm.reset();
	}
	if (productTypeFormNameInput) {
		productTypeFormNameInput.value = '';
	}
	if (productTypeFormDescriptionInput) {
		productTypeFormDescriptionInput.value = '';
	}
	if (productTypeFormActiveCheckbox) {
		productTypeFormActiveCheckbox.checked = true;
	}
	setProductTypeFormError('');
}

function fillProductTypeForm(productType) {
	if (productTypeFormNameInput) {
		productTypeFormNameInput.value = productType.name || '';
	}
	if (productTypeFormDescriptionInput) {
		productTypeFormDescriptionInput.value = productType.description || '';
	}
	if (productTypeFormActiveCheckbox) {
		productTypeFormActiveCheckbox.checked = productType.status !== 'inactive';
	}
}

function openProductTypeModal(mode, productTypeId) {
	if (!modalAddProductType) return;
	setProductTypeFormError('');
	if (mode === 'edit') {
		const productTypes = loadProductTypes();
		const target = productTypes.find(type => type.id === productTypeId);
		if (!target) {
			notify('error', 'Không tìm thấy loại sản phẩm.');
			return;
		}
		fillProductTypeForm(target);
		editingProductTypeId = target.id;
		if (productTypeModalTitle) {
			productTypeModalTitle.textContent = 'Chỉnh sửa loại sản phẩm';
		}
		if (productTypeFormSubmitBtn) {
			productTypeFormSubmitBtn.textContent = 'Cập nhật';
		}
	} else {
		resetProductTypeForm();
		editingProductTypeId = null;
		if (productTypeModalTitle) {
			productTypeModalTitle.textContent = 'Thêm loại sản phẩm';
		}
		if (productTypeFormSubmitBtn) {
			productTypeFormSubmitBtn.textContent = 'Lưu';
		}
	}
	modalAddProductType.classList.add('active');
	if (productTypeFormNameInput) {
		productTypeFormNameInput.focus();
	}
}

function closeProductTypeModal() {
	if (!modalAddProductType) return;
	modalAddProductType.classList.remove('active');
	editingProductTypeId = null;
	resetProductTypeForm();
	if (productTypeModalTitle) {
		productTypeModalTitle.textContent = 'Thêm loại sản phẩm';
	}
	if (productTypeFormSubmitBtn) {
		productTypeFormSubmitBtn.textContent = 'Lưu';
	}
}

function readProductTypeFormData() {
	if (!productTypeFormNameInput) {
		return null;
	}
	const name = productTypeFormNameInput.value.trim();
	if (!name) {
		setProductTypeFormError('Vui lòng nhập tên loại sản phẩm.');
		return null;
	}
	const id = slugifyProductTypeId(name);
	if (!id) {
		setProductTypeFormError('Tên loại sản phẩm không hợp lệ.');
		return null;
	}
	const description = productTypeFormDescriptionInput ? productTypeFormDescriptionInput.value.trim() : '';
	const status = productTypeFormActiveCheckbox && !productTypeFormActiveCheckbox.checked ? 'inactive' : 'active';
	return { id, name, description, status };
}

function computeFilteredProductTypes(baseList) {
	const keyword = (productTypeSearchInput?.value || '').trim().toLowerCase();
	return baseList
		.filter(type => {
			if (!keyword) {
				return true;
			}
			const nameMatches = type.name.toLowerCase().includes(keyword);
			const idMatches = type.id.toLowerCase().includes(keyword);
			const descMatches = (type.description || '').toLowerCase().includes(keyword);
			return nameMatches || idMatches || descMatches;
		})
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function renderProductTypePagination(totalItems, totalPages) {
	if (!productTypePaginationList) return;
	productTypePaginationList.innerHTML = '';
	if (totalItems === 0 || totalPages <= 1) {
		return;
	}
	for (let page = 1; page <= totalPages; page++) {
		const listItem = document.createElement('li');
		listItem.className = 'page-nav-item';
		if (page === productTypeCurrentPage) {
			listItem.classList.add('active');
		}
		const anchor = document.createElement('a');
		anchor.href = '#';
		anchor.textContent = String(page);
		anchor.addEventListener('click', event => {
			event.preventDefault();
			if (productTypeCurrentPage !== page) {
				productTypeCurrentPage = page;
				renderProductTypes();
			}
		});
		listItem.appendChild(anchor);
		productTypePaginationList.appendChild(listItem);
	}
}

function renderProductTypes(options = {}) {
	if (!productTypeListContainer) return;
	const { list: providedList, resetPage = false } = options;
	const baseList = Array.isArray(providedList)
		? providedList
		: ensureProductTypesForProductCategories().list;
	const filtered = computeFilteredProductTypes(baseList);
	if (resetPage) {
		productTypeCurrentPage = 1;
	}
	const totalItems = filtered.length;
	const totalPages = Math.ceil(totalItems / productTypePerPage) || 1;
	if (totalItems === 0) {
		productTypeCurrentPage = 1;
		productTypeListContainer.innerHTML = '<div class="no-result">Không có loại sản phẩm để hiển thị</div>';
		renderProductTypePagination(0, 0);
		return;
	}
	if (productTypeCurrentPage > totalPages) {
		productTypeCurrentPage = totalPages;
	}
	const start = (productTypeCurrentPage - 1) * productTypePerPage;
	const pagedProductTypes = filtered.slice(start, start + productTypePerPage);
	const markup = pagedProductTypes.map(type => {
		const status = type.status === 'inactive' ? 'inactive' : 'active';
		const statusLabel = getProductTypeStatusLabel(status);
		const overlayClass = status === 'inactive' ? ' overlay' : '';
		const descriptionMarkup = type.description ? `<div class="Description">${type.description}</div>` : '';
		return `
			<div class="product-type-item${overlayClass}" data-id="${type.id}">
				<div class="product-type-left">
					<div class="catagory">#${type.id}</div>
					<div class="name">${type.name}</div>
				</div>
				<div class="product-type-right">
					${descriptionMarkup}
					<div class="status status--${status}">${statusLabel}</div>
					<div class="actions">
						<button type="button" class="edit-btn" data-id="${type.id}">
							<i class="fa-solid fa-pen-to-square"></i>
						</button>
						<button type="button" class="view-btn" data-id="${type.id}">
							<i class="fa-solid fa-eye"></i>
						</button>
						<button type="button" class="delete-btn" data-id="${type.id}">
							<i class="fa-solid fa-trash"></i>
						</button>
					</div>
				</div>
			</div>
		`;
	}).join('');
	productTypeListContainer.innerHTML = markup;
	renderProductTypePagination(totalItems, totalPages);
}

function handleProductTypeFormSubmit(event) {
	if (event) {
		event.preventDefault();
	}
	const formData = readProductTypeFormData();
	if (!formData) {
		return;
	}
	const existingTypes = loadProductTypes();
	const updatedTypes = [...existingTypes];
	if (editingProductTypeId) {
		const index = updatedTypes.findIndex(type => type.id === editingProductTypeId);
		if (index === -1) {
			notify('error', 'Không tìm thấy loại sản phẩm để cập nhật.');
			return;
		}
		const duplicateIndex = updatedTypes.findIndex(type => type.id === formData.id);
		if (duplicateIndex !== -1 && duplicateIndex !== index) {
			setProductTypeFormError('Tên loại sản phẩm đã tồn tại.');
			return;
		}
		updatedTypes[index] = {
			...updatedTypes[index],
			id: formData.id,
			name: formData.name,
			description: formData.description,
			status: formData.status
		};
		saveProductTypes(updatedTypes);
		notify('success', 'Đã cập nhật loại sản phẩm.');
	} else {
		const exists = updatedTypes.some(type => type.id === formData.id);
		if (exists) {
			setProductTypeFormError('Tên loại sản phẩm đã tồn tại.');
			return;
		}
		updatedTypes.push({
			id: formData.id,
			name: formData.name,
			description: formData.description,
			status: formData.status
		});
		saveProductTypes(updatedTypes);
		notify('success', 'Thêm loại sản phẩm thành công!');
	}
	populateCategoryFilters();
	renderProductTypes({ resetPage: !editingProductTypeId });
	closeProductTypeModal();
}

function handleDeleteProductType(id) {
	const existingTypes = loadProductTypes();
	const index = existingTypes.findIndex(type => type.id === id);
	if (index === -1) {
		notify('error', 'Không tìm thấy loại sản phẩm để xóa.');
		return;
	}
	if (!confirm('Bạn có chắc muốn xóa loại sản phẩm này?')) {
		return;
	}
	const updatedTypes = [...existingTypes];
	const [removed] = updatedTypes.splice(index, 1);
	saveProductTypes(updatedTypes);
	if (editingProductTypeId === id) {
		closeProductTypeModal();
	}
	applyProductTypeStatusToProducts(id, 'inactive');
	notify('success', `Đã xóa loại sản phẩm "${removed.name}".`);
	populateCategoryFilters();
	renderProductTypes({ resetPage: true });
}

function handleToggleProductTypeStatus(id) {
	const existingTypes = loadProductTypes();
	const index = existingTypes.findIndex(type => type.id === id);
	if (index === -1) {
		notify('error', 'Không tìm thấy loại sản phẩm.');
		return;
	}
	const currentStatus = existingTypes[index].status === 'inactive' ? 'inactive' : 'active';
	const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
	const confirmMessage = nextStatus === 'inactive'
		? 'Bạn có chắc muốn ẩn loại sản phẩm này?'
		: 'Bạn có muốn hiển thị lại loại sản phẩm này?';
	if (!confirm(confirmMessage)) {
		return;
	}
	const updatedTypes = [...existingTypes];
	updatedTypes[index] = {
		...updatedTypes[index],
		status: nextStatus
	};
	saveProductTypes(updatedTypes);
	const message = nextStatus === 'inactive' ? 'Đã ẩn loại sản phẩm.' : 'Đã hiển thị loại sản phẩm.';
	notify('success', message);
	applyProductTypeStatusToProducts(id, nextStatus);
	populateCategoryFilters();
	renderProductTypes();
}

function resetProductTypeFilters() {
	if (productTypeSearchInput) {
		productTypeSearchInput.value = '';
	}
	productTypeCurrentPage = 1;
}

function initializeProductTypeManagement() {
	const { list: ensuredTypes } = ensureProductTypesForProductCategories();
	resetProductTypeFilters();
	resetProductTypeForm();
	renderProductTypes({ list: ensuredTypes, resetPage: true });
}
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