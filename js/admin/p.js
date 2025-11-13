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
      id: 1,
      title: "Attack On Titan Artisan Keycap - Eren Yeager Edition",
      shortDesc:
        "Bring the warrior spirit to your keyboard! Inspired by Eren Yeager from Attack On Titan, this artisan keycap is hand-crafted with premium resin and detailed design.",
      longDesc:
        "Inspired by Eren Yeager from Attack On Titan, this artisan keycap captures his determination and rage. Each keycap is handmade with premium resin, creating a unique aesthetic for every piece. Perfect for mechanical keyboard enthusiasts and anime collectors alike.",
      image: "/img/keycap/AttackOnTitan/Eren.jpg",
      mainImage: "/img/keycap/AttackOnTitan/Eren.jpg",
      thumbnails: ["/img/keycap/AttackOnTitan/Eren_blank.jpg"],
      specs: {
        category: "Attack On Titan",
        brand: "KeySmith",
        color: "Brown – Black – Silver",
      },
      price: 75,
      importPrice: 45,
      stock: 9,
      sold: 0,
      status: "ready",
    },
    {
      id: 2,
      title: "Attack On Titan Artisan Keycap - Fight for Paradis Edition",
      shortDesc:
        "Ignite the flames of resistance! Inspired by the epic battle to protect Paradis in Attack On Titan, this artisan keycap embodies courage and unyielding hope.",
      longDesc:
        "Inspired by the fiery battlegrounds of humanity’s last stand, the Attack On Titan Artisan Keycap - Fight for Paradis Edition symbolizes the bravery and determination of the Survey Corps. Handcrafted with premium resin, every detail—from the blazing flames to the iconic Wings of Freedom emblem—is meticulously sculpted, bringing a powerful and artistic touch to your mechanical keyboard.",
      image: "/img/keycap/AttackOnTitan/Fight_for_Paradis.webp",
      mainImage: "/img/keycap/AttackOnTitan/Fight_for_Paradis.webp",
      thumbnails: [],
      specs: {
        category: "Attack On Titan",
        brand: "KeySmith",
        color: "Red – Black – Silver",
      },
      price: 68,
      importPrice: 41,
      stock: 7,
      sold: 0,
      status: "ready",
    },
    {
      id: 3,
      title: "Attack On Titan Artisan Keycap - Reiner Keycap",
      shortDesc:
        "Unleash the storm within! Forged in the chaos of battle, this keycap channels the power of heroes who never surrender. Press it, and feel destiny move beneath your fingertips.",
      longDesc:
        "Inspired by the fiery battlegrounds of humanity’s last stand, the Attack On Titan Artisan Keycap - Reiner Keycap symbolizes the bravery and determination of the Survey Corps. Handcrafted with premium resin, every detail—from the blazing flames to the iconic Wings of Freedom emblem—is meticulously sculpted, bringing a powerful and artistic touch to your mechanical keyboard.",
      image: "/img/keycap/AttackOnTitan/Reiner.jpg",
      mainImage: "/img/keycap/AttackOnTitan/Reiner.jpg",
      thumbnails: ["/img/keycap/AttackOnTitan/Reiner_blank.jpg"],
      specs: {
        category: "Attack On Titan",
        brand: "KeySmith",
        color: "Red – Black – Silver",
      },
      price: 72,
      importPrice: 43,
      stock: 10,
      sold: 0,
      status: "ready",
    },
    {
      id: 4,
      title: "Attack On Titan Artisan Keycap - Scout Keycap",
      shortDesc:
        "Born from the heart of a dying star, this keycap burns with eternal fire. Each press ignites your spirit, reminding you that legends are not born—they’re forged.",
      longDesc:
        "Set sail toward the Grand Line with the One Piece Artisan Keycap – King of the Pirates Edition. Featuring a detailed miniature of the iconic Straw Hat symbol, this handcrafted resin piece captures the spirit of freedom, adventure, and the unbreakable will to chase your dreams.",
      image: "/img/keycap/AttackOnTitan/Scout.jpg",
      mainImage: "/img/keycap/AttackOnTitan/Scout.jpg",
      thumbnails: ["/img/keycap/AttackOnTitan/Scout_blank.jpg"],
      specs: {
        category: "Attack On Titan",
        brand: "KeySmith",
        color: "Ocean Blue – Gold – Ivory",
      },
      price: 65,
      importPrice: 39,
      stock: 6,
      sold: 0,
      status: "ready",
    },
    {
      id: 5,
      title: "Attack On Titan Artisan Keycap - Spacebar Keycap",
      shortDesc:
        "No sound. No mercy. With every strike, thunder answers your call. Let the storm of your will reshape the battlefield.",
      longDesc:
        "Dive into a world of neon lights and shattered reality with the Cyberpunk Neon Core Artisan Keycap. Designed for futurists and rebels alike, this glowing masterpiece fuses bold color contrasts with intricate resin sculpting for a truly electrifying typing experience.",
      image: "/img/keycap/AttackOnTitan/spacebar.jpg",
      mainImage: "/img/keycap/AttackOnTitan/Spacebar.jpg",
      thumbnails: ["/img/keycap/AttackOnTitan/Spacebar_blank.jpg"],
      specs: {
        category: "Attack On Titan",
        brand: "KeySmith",
        color: "Neon Pink – Electric Blue – Jet Black",
      },
      price: 85,
      importPrice: 51,
      stock: 8,
      sold: 0,
      status: "outofstock",
    },
    {
      id: 6,
      title: "LOTR Artisan Keycap - Durin's Axe Keycap",
      shortDesc:
        "From the depths of forgotten realms, this keycap rises — a relic of power and purpose. With each press, echoes of ancient warriors awaken, urging your fingers toward victory eternal.",
      longDesc:
        "Forged in the heart of a dying star, the Stellar Forge Artisan Keycap captures the essence of cosmic creation. Each swirl of resin mirrors the birth of galaxies — luminous, infinite, and full of mystery. A statement piece for dreamers who type among the stars.",
      image: "/img/keycap/LOTR/durin/durin's_axe.jpg",
      mainImage: "/img/keycap/LOTR/durin/durin's_axe.jpg",
      thumbnails: [],
      specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Midnight Blue – Silver – Nebula Purple",
      },
      price: 78,
      importPrice: 47,
      stock: 7,
      sold: 0,
      status: "ready",
    },
    {
      id: 7,
      title: "LOTR Artisan Keycap - Durin's Folk Keycap",
      shortDesc:
        "Tempered in lightning and silence, this keycap crackles with untamed will. Touch it, and feel the pulse of storms long caged — waiting only for your command to break free.",
      longDesc:
        "Born from the ashes of forgotten legends, the Phoenix Rebirth Artisan Keycap embodies renewal and undying spirit. Each fiery gradient is hand-blended, symbolizing the endless cycle of destruction and creation — a perfect harmony between flame and focus.",
      image: "/img/keycap/LOTR/durin/durin's_folk.jpg",
      mainImage: "/img/keycap/LOTR/durin/durin's_folk.jpg",
      thumbnails: [],
      specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Crimson – Amber – Obsidian",
    },
    price: 82,
    importPrice: 49,
    stock: 9,
    sold: 0,
    status: "ready",
    },
    {
    id: 8,
    title: "LOTR Artisan Keycap - Durin's Helm Keycap",
    shortDesc:
        "Beneath your fingertips lies the roar of a thousand battles. This keycap hums with defiance, daring you to press onward — for destiny bows only to those who never yield.",
    longDesc:
        "Draw strength from the depths of darkness with the Shadow Reaver Artisan Keycap. Inspired by the mysterious warriors of the night, this piece fuses sleek obsidian tones with metallic accents — a tribute to precision, stealth, and silent power.",
    image: "/img/keycap/LOTR/durin/durin's_helm.jpg",
    mainImage: "/img/keycap/LOTR/durin/durin's_helm.jpg",
    thumbnails: [],
    specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Jet Black – Steel Gray – Scarlet",
    },
    price: 76,
    importPrice: 46,
    stock: 10,
    sold: 0,
    status: "ready",
    },
    {
    id: 9,
    title: "LOTR Artisan Keycap - Horn of Gondor Keycap",
    shortDesc:
        "Forged from shattered crowns and burning skies, this keycap bears the mark of conquerors. Each strike rekindles the flame of glory — a reminder that empires rise from a single press.",
    longDesc:
        "Echoing the tranquility of ancient mountains, the Zen Wave Artisan Keycap captures the calm between chaos. Hand-poured with flowing resin patterns, it brings balance and serenity to every keystroke — a quiet reminder of focus and flow.",
    image: "/img/keycap/LOTR/gondor/horn_of_gordor.jpg",
    mainImage: "/img/keycap/LOTR/gondor/horn_of_gordor.jpg",
    thumbnails: [
        "/img/keycap/LOTR/gondor/horn_of_gordor_1.jpg",
        "/img/keycap/LOTR/gondor/horn_of_gordor_white.jpg",
    ],
    specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Ivory – Ocean Blue – Stone Gray",
    },
    price: 88,
    importPrice: 53,
    stock: 6,
    sold: 0,
    status: "outofstock",
    },
    {
    id: 10,
    title: "LOTR Artisan Keycap - Palantir Keycap",
    shortDesc:
        "Bound by runes of triumph, this keycap sings of battles yet to come. Each press summons the echo of victory — a promise carved in the language of heroes.",
    longDesc:
        "Awaken the frost within with the Glacial Spirit Artisan Keycap. Crafted to resemble ancient ice sealed in time, its crystalline surface refracts light like frozen magic — cool, sharp, and endlessly captivating on any keyboard setup.",
    image: "/img/keycap/LOTR/gondor/palantir.jpg",
    mainImage: "/img/keycap/LOTR/gondor/palantir.jpg",
    thumbnails: [
        "/img/keycap/LOTR/gondor/palantir_1.jpg",
        "/img/keycap/LOTR/gondor/palantir_white.jpg",
    ],
    specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Arctic Blue – White – Silver",
    },
    price: 95,
    importPrice: 57,
    stock: 9,
    sold: 0,
    status: "ready",
    },
    {
    id: 11,
    title: "LOTR Artisan Keycap - White Tree Keycap",
    shortDesc:
        "Born from the heart of an ancient volcano, this keycap channels pure elemental power. Each press unleashes a surge of molten energy — crafted for those who thrive in the heat of creation.",
    longDesc:
        "The Magmaheart Artisan Keycap is a masterpiece forged in flame. Layered resin mimics the glow of flowing lava, blending vivid orange veins with deep obsidian undertones. A statement of strength, transformation, and unstoppable momentum — for creators who burn bright.",
    image: "/img/keycap/LOTR/gondor/white_tree.jpg",
    mainImage: "/img/keycap/LOTR/gondor/white_tree.jpg",
    thumbnails: [
        "/img/keycap/LOTR/gondor/white_tree_1.jpg",
        "/img/keycap/LOTR/gondor/white_tree_white.jpg",
    ],
    specs: {
        category: "Lord Of the Ring",
        brand: "KeySmith",
        color: "Molten Orange – Obsidian – Gold",
    },
    price: 85,
    importPrice: 51,
    stock: 8,
    sold: 0,
    status: "ready",
    },
    {
    id: 12,
    title: "One Piece Artisan Keycap - One Piece Keycap 1",
    shortDesc:
        "Glimmering like the first frost of winter, this keycap evokes quiet elegance and crisp clarity. Each press is a gentle whisper of serenity.",
    longDesc:
        "The Frosted Peak Artisan Keycap reflects the delicate shimmer of morning frost on untouched snow. Crafted with icy blue and silver gradients, it brings a cool, calming presence to every keystroke.",
    image: "/img/keycap/OnePiece/1.png",
    mainImage: "/img/keycap/OnePiece/1.png",
    thumbnails: [],
    specs: {
        category: "One Piece",
        brand: "KeySmith",
        color: "Ice Blue – Silver – Pale Gray",
    },
    price: 62,
    importPrice: 37,
    stock: 10,
    sold: 0,
    status: "outofstock",
    },
    {
      id: 13,
      title: "One Piece Artisan Keycap - One Piece Keycap 2",
      shortDesc:
        "Bathed in the glow of twilight, this keycap carries the mystery of dusk and the calm before nightfall. Every touch feels like capturing the last light of day.",
      longDesc:
        "The Twilight Ember Artisan Keycap mirrors the sky at sunset, blending soft purples and warm amber tones. Its luminous resin evokes reflection and tranquility as day transitions into night.",
      image: "/img/keycap/OnePiece/2.png",
      mainImage: "/img/keycap/OnePiece/2.png",
      thumbnails: [],
      specs: {
        category: "One Piece",
        brand: "KeySmith",
        color: "Purple – Amber – Rose Gold",
      },
      price: 64,
      importPrice: 38,
      stock: 6,
      sold: 0,
      status: "ready",
    },
    {
      id: 14,
      title: "YuGiOh Artisan Keycap - Yu-Gi-Oh! Keycap 1",
      shortDesc:
        "Radiating the gentle warmth of spring morning, this keycap brings freshness and optimism with every press. It’s a small celebration of new beginnings.",
      longDesc:
        "The Spring Blossom Artisan Keycap evokes the tender hues of early flowers under soft sunlight. Crafted from pastel pinks and golden highlights, it’s a reminder of growth and renewal with each keystroke.",
      image: "/img/keycap/Yugioh/1.jpg",
      mainImage: "/img/keycap/Yugioh/1.jpg",
      thumbnails: ["/img/keycap/Yugioh/YuGiOh-BEWDragon-5.webp"],
      specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Pale Pink – Soft Gold – Cream",
      },
      price: 70,
      importPrice: 42,
      stock: 8,
      sold: 0,
      status: "ready",
    },
    {
      id: 15,
      title: "YuGiOh Artisan Keycap - Yu-Gi-Oh! Keycap 2",
      shortDesc:
        "Shimmering like starlight on a quiet night, this keycap carries calm and wonder with every press. A tiny piece of the cosmos at your fingertips.",
      longDesc:
        "The Starlit Sky Artisan Keycap captures the magic of a clear night, blending deep navy with sparkling silver flecks. Each stroke evokes serenity and the infinite beauty of the cosmos.",
      image: "/img/keycap/Yugioh/2.jpg",
      mainImage: "/img/keycap/Yugioh/2.jpg",
      thumbnails: [],
      specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Midnight Blue – Silver – Soft Black",
      },
      price: 73,
      importPrice: 44,
      stock: 7,
      sold: 0,
      status: "ready",
    },
    {
      id: 16,
      title: "YuGiOh Artisan Keycap - YGOv3 Ra 11 Keycap",
      shortDesc:
        "Like morning dew on a quiet meadow, this keycap brings freshness and subtle brilliance. Each press feels like a gentle touch of nature’s calm.",
      longDesc:
        "The Dewy Meadow Artisan Keycap embodies the delicate beauty of early morning light on fresh greenery. Soft greens and pearlescent whites combine to inspire calm and renewal at every keystroke.",
      image: "/img/keycap/Yugioh/YGOv3-Ra-11.webp",
      mainImage: "/img/keycap/Yugioh/YGOv3-Ra-11.webp",
      thumbnails: [],
      specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Soft Green – White – Pale Yellow",
      },
      price: 80,
      importPrice: 48,
      stock: 9,
      sold: 0,
      status: "ready",
    },
    {
      id: 17,
      title: "YuGiOh Artisan Keycap - YuGiOh DarkMagicianGirl 5 Keycap",
      shortDesc:
        "Bathed in the soft glow of moonlight, this keycap exudes calm and quiet elegance. Each press feels like a gentle embrace of night’s serenity.",
      longDesc:
        "The Moonlit Silhouette Artisan Keycap captures the subtle radiance of moonlight against a tranquil sky. With gradients of silver and pale blue, it evokes reflection, calm, and quiet wonder with every keystroke.",
      image: "/img/keycap/Yugioh/YuGiOh-DarkMagicianGirl-5.webp",
      mainImage: "/img/keycap/Yugioh/YuGiOh-DarkMagicianGirl-5.webp",
      thumbnails: [],
      specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Silver – Pale Blue – Soft Gray",
      },
      price: 86,
      importPrice: 52,
      stock: 10,
      sold: 0,
      status: "outofstock",
    },
    {
      id: 18,
      title: "YuGiOh Artisan Keycap - YuGiOh V2 Concept 11-4 Keycap",
      shortDesc:
        "Awash in the colors of a gentle sunrise, this keycap inspires hope and tranquility. Each press feels like the first breath of a new day.",
      longDesc:
        "The Aurora Morning Artisan Keycap blends soft pinks, warm golds, and creamy whites to recreate the serene beauty of dawn. Its radiant resin encourages calm, optimism, and gentle focus with every keystroke.",
      image: "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-4.webp",
      mainImage: "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-4.webp",
      thumbnails: [],
      specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Pale Pink – Warm Gold – Cream",
    },
    price: 55,
    importPrice: 33,
    stock: 8,
    sold: 0,
    status: "ready",
    },
    {
    id: 19,
    title: "YuGiOh Artisan Keycap - YuGiOh V2 Concept 11-6 Keycap",
    shortDesc:
        "Glinting with the soft glow of morning frost, this keycap exudes a crisp, refreshing calm. Each press feels like a spark of clarity at the start of the day.",
    longDesc:
        "The Frosted Dawn Artisan Keycap captures the serene sparkle of frost-kissed mornings. Crafted with pale blues, soft whites, and subtle silver shimmer, it brings clarity, calm, and freshness to each keystroke.",
    image: "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-6.webp",
    mainImage: "/img/keycap/Yugioh/YuGiOh-V2-Concept-11-6.webp",
    thumbnails: [],
    specs: {
        category: "Yugioh",
        brand: "KeySmith",
        color: "Pale Blue – White – Silver",
    },
    price: 58,
    importPrice: 35,
    stock: 7,
    sold: 0,
    status: "ready",
    },
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

let perpage = 8;
let currentpage = 1;
let editingProductId = null;
let editingProductTypeId = null;
let currentImageBase64 = PRODUCT_IMAGE_FALLBACK;
let productTypePerPage = 8;
let productTypeCurrentPage = 1;

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
	const productCategories = products.map(resolveCategory).filter(Boolean);
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