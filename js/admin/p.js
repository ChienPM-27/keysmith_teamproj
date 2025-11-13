function createProduct() {
	let shouldSeed = false;
	const stored = localStorage.getItem('products');

	if (!stored) {
		shouldSeed = true;
	} else {
		try {
			const parsed = JSON.parse(stored);
			if (!Array.isArray(parsed) || parsed.length === 0) {
				shouldSeed = true;
			}
		} catch (error) {
			console.warn('Invalid products data found in localStorage, resetting sample data.', error);
			shouldSeed = true;
		}
	}

	if (shouldSeed) {
		const products =
			[
		{
			"id": 1,
			"title": "Attack On Titan Artisan Keycap - Eren Yeager Edition",
			"shortDesc": "Bring the warrior spirit to your keyboard! Inspired by Eren Yeager from Attack On Titan, this artisan keycap is hand-crafted with premium resin and detailed design.",
			"longDesc": "Inspired by Eren Yeager from Attack On Titan, this artisan keycap captures his determination and rage. Each keycap is handmade with premium resin, creating a unique aesthetic for every piece. Perfect for mechanical keyboard enthusiasts and anime collectors alike.",
			"image": "/img/keycap/AttackOnTitan/Eren.jpg",
			"mainImage": "/img/keycap/AttackOnTitan/Eren.jpg",
			"thumbnails": ["/img/keycap/AttackOnTitan/Eren_blank.jpg"],
			"specs": { "category": "Attack On Titan", "brand": "KeySmith", "color": "Brown – Black – Silver" },
			"price": 75,
			"importPrice": 45,
			"stock": 9,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 2,
			"title": "Attack On Titan Artisan Keycap - Fight for Paradis Edition",
			"shortDesc": "Ignite the flames of resistance! Inspired by the epic battle to protect Paradis in Attack On Titan, this artisan keycap embodies courage and unyielding hope.",
			"longDesc": "Inspired by the fiery battlegrounds of humanity’s last stand, the Attack On Titan Artisan Keycap - Fight for Paradis Edition symbolizes the bravery and determination of the Survey Corps. Handcrafted with premium resin, every detail—from the blazing flames to the iconic Wings of Freedom emblem—is meticulously sculpted, bringing a powerful and artistic touch to your mechanical keyboard.",
			"image": "/img/keycap/AttackOnTitan/Fight_for_Paradis.webp",
			"mainImage": "/img/keycap/AttackOnTitan/Fight_for_Paradis.webp",
			"thumbnails": [],
			"specs": { "category": "Attack On Titan", "brand": "KeySmith", "color": "Red – Black – Silver" },
			"price": 68,
			"importPrice": 41,
			"stock": 7,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 3,
			"title": "Attack On Titan Artisan Keycap - Reiner Keycap",
			"shortDesc": "Unleash the storm within! Forged in the chaos of battle, this keycap channels the power of heroes who never surrender. Press it, and feel destiny move beneath your fingertips.",
			"longDesc": "Inspired by the fiery battlegrounds of humanity’s last stand, the Attack On Titan Artisan Keycap - Reiner Keycap symbolizes the bravery and determination of the Survey Corps. Handcrafted with premium resin, every detail—from the blazing flames to the iconic Wings of Freedom emblem—is meticulously sculpted, bringing a powerful and artistic touch to your mechanical keyboard.",
			"image": "/img/keycap/AttackOnTitan/Reiner.jpg",
			"mainImage": "/img/keycap/AttackOnTitan/Reiner.jpg",
			"thumbnails": ["/img/keycap/AttackOnTitan/Reiner_blank.jpg"],
			"specs": { "category": "Attack On Titan", "brand": "KeySmith", "color": "Red – Black – Silver" },
			"price": 72,
			"importPrice": 43,
			"stock": 10,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 4,
			"title": "Attack On Titan Artisan Keycap - Scout Keycap",
			"shortDesc": "Born from the heart of a dying star, this keycap burns with eternal fire. Each press ignites your spirit, reminding you that legends are not born—they’re forged.",
			"longDesc": "Set sail toward the Grand Line with the One Piece Artisan Keycap – King of the Pirates Edition. Featuring a detailed miniature of the iconic Straw Hat symbol, this handcrafted resin piece captures the spirit of freedom, adventure, and the unbreakable will to chase your dreams.",
			"image": "/img/keycap/AttackOnTitan/Scout.jpg",
			"mainImage": "/img/keycap/AttackOnTitan/Scout.jpg",
			"thumbnails": ["/img/keycap/AttackOnTitan/Scout_blank.jpg"],
			"specs": { "category": "One Piece", "brand": "KeySmith", "color": "Ocean Blue – Gold – Ivory" },
			"price": 65,
			"importPrice": 39,
			"stock": 6,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 5,
			"title": "Attack On Titan Artisan Keycap - Spacebar Keycap",
			"shortDesc": "No sound. No mercy. With every strike, thunder answers your call. Let the storm of your will reshape the battlefield.",
			"longDesc": "Dive into a world of neon lights and shattered reality with the Cyberpunk Neon Core Artisan Keycap. Designed for futurists and rebels alike, this glowing masterpiece fuses bold color contrasts with intricate resin sculpting for a truly electrifying typing experience.",
			"image": "/img/keycap/AttackOnTitan/spacebar.jpg",
			"mainImage": "/img/keycap/AttackOnTitan/Spacebar.jpg",
			"thumbnails": ["/img/keycap/AttackOnTitan/Spacebar_blank.jpg"],
			"specs": { "category": "Cyberpunk Neon Series", "brand": "KeySmith", "color": "Neon Pink – Electric Blue – Jet Black" },
			"price": 85,
			"importPrice": 51,
			"stock": 8,
			"sold": 0,
			"status": "outofstock"
		},
		{
			"id": 6,
			"title": "LOTR Artisan Keycap - Durin's Axe Keycap",
			"shortDesc": "From the depths of forgotten realms, this keycap rises — a relic of power and purpose. With each press, echoes of ancient warriors awaken, urging your fingers toward victory eternal.",
			"longDesc": "Forged in the heart of a dying star, the Stellar Forge Artisan Keycap captures the essence of cosmic creation. Each swirl of resin mirrors the birth of galaxies — luminous, infinite, and full of mystery. A statement piece for dreamers who type among the stars.",
			"image": "/img/keycap/LOTR/durin/durin's_axe.jpg",
			"mainImage": "/img/keycap/LOTR/durin/durin's_axe.jpg",
			"thumbnails": [],
			"specs": { "category": "Cosmic Odyssey", "brand": "KeySmith", "color": "Midnight Blue – Silver – Nebula Purple" },
			"price": 78,
			"importPrice": 47,
			"stock": 7,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 7,
			"title": "LOTR Artisan Keycap - Durin's Folk Keycap",
			"shortDesc": "Tempered in lightning and silence, this keycap crackles with untamed will. Touch it, and feel the pulse of storms long caged — waiting only for your command to break free.",
			"longDesc": "Born from the ashes of forgotten legends, the Phoenix Rebirth Artisan Keycap embodies renewal and undying spirit. Each fiery gradient is hand-blended, symbolizing the endless cycle of destruction and creation — a perfect harmony between flame and focus.",
			"image": "/img/keycap/LOTR/durin/durin's_folk.jpg",
			"mainImage": "/img/keycap/LOTR/durin/durin's_folk.jpg",
			"thumbnails": [],
			"specs": { "category": "Mythic Creatures", "brand": "KeySmith", "color": "Crimson – Amber – Obsidian" },
			"price": 82,
			"importPrice": 49,
			"stock": 9,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 8,
			"title": "LOTR Artisan Keycap - Durin's Helm Keycap",
			"shortDesc": "Beneath your fingertips lies the roar of a thousand battles. This keycap hums with defiance, daring you to press onward — for destiny bows only to those who never yield.",
			"longDesc": "Draw strength from the depths of darkness with the Shadow Reaver Artisan Keycap. Inspired by the mysterious warriors of the night, this piece fuses sleek obsidian tones with metallic accents — a tribute to precision, stealth, and silent power.",
			"image": "/img/keycap/LOTR/durin/durin's_helm.jpg",
			"mainImage": "/img/keycap/LOTR/durin/durin's_helm.jpg",
			"thumbnails": [],
			"specs": { "category": "Shadow Reaver Series", "brand": "KeySmith", "color": "Jet Black – Steel Gray – Scarlet" },
			"price": 76,
			"importPrice": 46,
			"stock": 10,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 9,
			"title": "LOTR Artisan Keycap - Horn of Gondor Keycap",
			"shortDesc": "Forged from shattered crowns and burning skies, this keycap bears the mark of conquerors. Each strike rekindles the flame of glory — a reminder that empires rise from a single press.",
			"longDesc": "Echoing the tranquility of ancient mountains, the Zen Wave Artisan Keycap captures the calm between chaos. Hand-poured with flowing resin patterns, it brings balance and serenity to every keystroke — a quiet reminder of focus and flow.",
			"image": "/img/keycap/LOTR/gondor/horn_of_gordor.jpg",
			"mainImage": "/img/keycap/LOTR/gondor/horn_of_gordor.jpg",
			"thumbnails": ["/img/keycap/LOTR/gondor/horn_of_gordor_1.jpg","/img/keycap/LOTR/gondor/horn_of_gordor_white.jpg"],
			"specs": { "category": "Zen Aesthetics", "brand": "KeySmith", "color": "Ivory – Ocean Blue – Stone Gray" },
			"price": 88,
			"importPrice": 53,
			"stock": 6,
			"sold": 0,
			"status": "outofstock"
		},
		{
			"id": 10,
			"title": "LOTR Artisan Keycap - Palantir Keycap",
			"shortDesc": "Bound by runes of triumph, this keycap sings of battles yet to come. Each press summons the echo of victory — a promise carved in the language of heroes.",
			"longDesc": "Awaken the frost within with the Glacial Spirit Artisan Keycap. Crafted to resemble ancient ice sealed in time, its crystalline surface refracts light like frozen magic — cool, sharp, and endlessly captivating on any keyboard setup.",
			"image": "/img/keycap/LOTR/gondor/palantir.jpg",
			"mainImage": "/img/keycap/LOTR/gondor/palantir.jpg",
			"thumbnails": ["/img/keycap/LOTR/gondor/palantir_1.jpg","/img/keycap/LOTR/gondor/palantir_white.jpg"],
			"specs": { "category": "Elemental Frost", "brand": "KeySmith", "color": "Arctic Blue – White – Silver" },
			"price": 95,
			"importPrice": 57,
			"stock": 9,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 11,
			"title": "LOTR Artisan Keycap - White Tree Keycap",
			"shortDesc": "Born from the heart of an ancient volcano, this keycap channels pure elemental power. Each press unleashes a surge of molten energy — crafted for those who thrive in the heat of creation.",
			"longDesc": "The Magmaheart Artisan Keycap is a masterpiece forged in flame. Layered resin mimics the glow of flowing lava, blending vivid orange veins with deep obsidian undertones. A statement of strength, transformation, and unstoppable momentum — for creators who burn bright.",
			"image": "/img/keycap/LOTR/gondor/white_tree.jpg",
			"mainImage": "/img/keycap/LOTR/gondor/white_tree.jpg",
			"thumbnails": ["/img/keycap/LOTR/gondor/white_tree_1.jpg","/img/keycap/LOTR/gondor/white_tree_white.jpg"],
			"specs": { "category": "Elemental Forge", "brand": "KeySmith", "color": "Molten Orange – Obsidian – Gold" },
			"price": 85,
			"importPrice": 51,
			"stock": 8,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 12,
			"title": "One Piece Artisan Keycap - One Piece Keycap 1",
			"shortDesc": "Glimmering like the first frost of winter, this keycap evokes quiet elegance and crisp clarity. Each press is a gentle whisper of serenity.",
			"longDesc": "The Frosted Peak Artisan Keycap reflects the delicate shimmer of morning frost on untouched snow. Crafted with icy blue and silver gradients, it brings a cool, calming presence to every keystroke.",
			"image": "/img/keycap/OnePiece/1.png",
			"mainImage": "/img/keycap/OnePiece/1.png",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Ice Blue – Silver – Pale Gray" },
			"price": 62,
			"importPrice": 37,
			"stock": 10,
			"sold": 0,
			"status": "outofstock"
		},
		{
			"id": 13,
			"title": "One Piece Artisan Keycap - One Piece Keycap 2",
			"shortDesc": "Bathed in the glow of twilight, this keycap carries the mystery of dusk and the calm before nightfall. Every touch feels like capturing the last light of day.",
			"longDesc": "The Twilight Ember Artisan Keycap mirrors the sky at sunset, blending soft purples and warm amber tones. Its luminous resin evokes reflection and tranquility as day transitions into night.",
			"image": "/img/keycap/OnePiece/2.png",
			"mainImage": "/img/keycap/OnePiece/2.png",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Purple – Amber – Rose Gold" },
			"price": 64,
			"importPrice": 38,
			"stock": 6,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 14,
			"title": "YuGiOh Artisan Keycap - Yu-Gi-Oh! Keycap 1",
			"shortDesc": "Radiating the gentle warmth of spring morning, this keycap brings freshness and optimism with every press. It’s a small celebration of new beginnings.",
			"longDesc": "The Spring Blossom Artisan Keycap evokes the tender hues of early flowers under soft sunlight. Crafted from pastel pinks and golden highlights, it’s a reminder of growth and renewal with each keystroke.",
			"image": "/img/keycap/Yugioh/1.jpg",
			"mainImage": "/img/keycap/Yugioh/1.jpg",
			"thumbnails": ["/img/keycap/Yugioh/YuGiOh-BEWDragon-5.webp"],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Pale Pink – Soft Gold – Cream" },
			"price": 70,
			"importPrice": 42,
			"stock": 8,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 15,
			"title": "YuGiOh Artisan Keycap - Yu-Gi-Oh! Keycap 2",
			"shortDesc": "Shimmering like starlight on a quiet night, this keycap carries calm and wonder with every press. A tiny piece of the cosmos at your fingertips.",
			"longDesc": "The Starlit Sky Artisan Keycap captures the magic of a clear night, blending deep navy with sparkling silver flecks. Each stroke evokes serenity and the infinite beauty of the cosmos.",
			"image": "/img/keycap/Yugioh/2.jpg",
			"mainImage": "/img/keycap/Yugioh/2.jpg",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Midnight Blue – Silver – Soft Black" },
			"price": 73,
			"importPrice": 44,
			"stock": 7,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 16,
			"title": "YuGiOh Artisan Keycap - YGOv3 Ra 11 Keycap",
			"shortDesc": "Like morning dew on a quiet meadow, this keycap brings freshness and subtle brilliance. Each press feels like a gentle touch of nature’s calm.",
			"longDesc": "The Dewy Meadow Artisan Keycap embodies the delicate beauty of early morning light on fresh greenery. Soft greens and pearlescent whites combine to inspire calm and renewal at every keystroke.",
			"image": "/img/keycap/Yugioh/YGOv3-Ra-11.webp",
			"mainImage": "/img/keycap/Yugioh/YGOv3-Ra-11.webp",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Soft Green – White – Pale Yellow" },
			"price": 80,
			"importPrice": 48,
			"stock": 9,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 17,
			"title": "YuGiOh Artisan Keycap - YuGiOh DarkMagicianGirl 5 Keycap",
			"shortDesc": "Bathed in the soft glow of moonlight, this keycap exudes calm and quiet elegance. Each press feels like a gentle embrace of night’s serenity.",
			"longDesc": "The Moonlit Silhouette Artisan Keycap captures the subtle radiance of moonlight against a tranquil sky. With gradients of silver and pale blue, it evokes reflection, calm, and quiet wonder with every keystroke.",
			"image": "/img/keycap/Yugioh/YuGiOh-DarkMagicianGirl-5.webp",
			"mainImage": "/img/keycap/Yugioh/YuGiOh-DarkMagicianGirl-5.webp",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Silver – Pale Blue – Soft Gray" },
			"price": 86,
			"importPrice": 52,
			"stock": 10,
			"sold": 0,
			"status": "outofstock"
		},
		{
			"id": 18,
			"title": "YuGiOh Artisan Keycap - YuGiOh V2 Concept 11-4 Keycap",
			"shortDesc": "Awash in the colors of a gentle sunrise, this keycap inspires hope and tranquility. Each press feels like the first breath of a new day.",
			"longDesc": "The Aurora Morning Artisan Keycap blends soft pinks, warm golds, and creamy whites to recreate the serene beauty of dawn. Its radiant resin encourages calm, optimism, and gentle focus with every keystroke.",
			"image": "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-4.webp",
			"mainImage": "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-4.webp",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Pale Pink – Warm Gold – Cream" },
			"price": 55,
			"importPrice": 33,
			"stock": 8,
			"sold": 0,
			"status": "ready"
		},
		{
			"id": 19,
			"title": "YuGiOh Artisan Keycap - YuGiOh V2 Concept 11-6 Keycap",
			"shortDesc": "Glinting with the soft glow of morning frost, this keycap exudes a crisp, refreshing calm. Each press feels like a spark of clarity at the start of the day.",
			"longDesc": "The Frosted Dawn Artisan Keycap captures the serene sparkle of frost-kissed mornings. Crafted with pale blues, soft whites, and subtle silver shimmer, it brings clarity, calm, and freshness to each keystroke.",
			"image": "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-6.webp",
			"mainImage": "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-6.webp",
			"thumbnails": [],
			"specs": { "category": "Aurora Dream", "brand": "KeySmith", "color": "Pale Blue – White – Silver" },
			"price": 58,
			"importPrice": 35,
			"stock": 7,
			"sold": 0,
			"status": "ready"
		}
	];
		localStorage.setItem('products', JSON.stringify(products));
	}
}

// get amount of products
function getAmoumtProducts() {
	let products = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];
	return products.length;
}

const productCountEl = document.getElementById('productCount');
if (productCountEl) productCountEl.innerText = getAmoumtProducts();
// doi dinh dang sang USD
function USD(num) {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
//paging
const PRODUCT_STORAGE_KEY = 'products';
const PRODUCT_IMAGE_FALLBACK = '/img/blank-image.png';
const VISIBLE_PRODUCT_STATUSES = ['ready', 'outofstock', 'active', 'inactive', 'deleted'];
const PRODUCT_STATUS_LABELS = {
	ready: 'Ready',
	outofstock: 'Out of stock',
	active: 'Active',
	inactive: 'Inactive',
	deleted: 'Deleted'
};

let perpage = 8;
let currentpage = 1;
let editingProductId = null;
let currentImageBase64 = PRODUCT_IMAGE_FALLBACK;

const productsection = document.getElementById('products-section');
const productListContainer = document.getElementById('show-product');
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

if (perPageSelect) {
	const parsed = parseInt(perPageSelect.value, 10);
	if (!Number.isNaN(parsed) && parsed > 0) {
		perpage = parsed;
	} else {
		perPageSelect.value = String(perpage);
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
	localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
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
	const categories = [...new Set(products.map(resolveCategory).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

	if (productFilterSelect) {
		const current = productFilterSelect.value;
		productFilterSelect.innerHTML = '<option value="">All</option>';
		categories.forEach(category => {
			const option = document.createElement('option');
			option.value = category;
			option.textContent = category;
			productFilterSelect.appendChild(option);
		});
		if (current && categories.includes(current)) {
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
		}
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
	addproducttypebtn.addEventListener('click', () => {
		if (modalAddProductType) {
			modalAddProductType.classList.add('active');
		}
	});
}

if (closeproducttypebtn) {
	closeproducttypebtn.addEventListener('click', () => {
		if (modalAddProductType) {
			modalAddProductType.classList.remove('active');
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

function ProductType() {
	let productTypes = localStorage.getItem('catagories') ? JSON.parse(localStorage.getItem('catagories')) : [];
	if (productTypes.length === 0) {
		productTypes = [
			"Attack On Titan",
		"LOTR",
		"One Piece",
		"YuGiOh",
		"Cyberpunk Neon Series",
		"Cosmic Odyssey",
		"Mythic Creatures",
		"Shadow Reaver Series",
		"Zen Aesthetics",
		"Elemental Frost",
		"Aurora Dream",
		];
		localStorage.setItem('catagories', JSON.stringify(productTypes));
	}
	return productTypes;
}

function createNewProductType()
{
	const ptName = document.getElementById('pt-form-name').value;
	if (!ptName) {
		alert('Vui lòng nhập tên thể loại sản phẩm.');
		return;
	}
	const ptDesc = document.getElementById('pt-form-description').value;
	let productTypes = localStorage.getItem('catagories') ? JSON.parse(localStorage.getItem('catagories')) : [];
	productTypes.push(ptName);
	localStorage.setItem('catagories', JSON.stringify(productTypes));
	alert('Thêm thể loại sản phẩm thành công!');
	document.getElementById('pt-form-name').value = '';
	document.getElementById('pt-form-description').value = '';
}

function showproductArr(arr)
{
	let producttypehtml = '';
	if(arr.length === 0)
	{
		producttypehtml = '<div class="no-result">Không có thể loại sản phẩm để hiển thị</div>';
	}
	else {
		
	}
}