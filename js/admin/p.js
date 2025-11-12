function createproduct() {
    if(localStorage.getItem('products') == null) {
        {
            let products = 
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
let perpage =10;
let currentpage = 1;
let totalpage = 0;
let perproducts =[];

function showproductsArr() {
    let productsHtml = '';
    
}
// add button
const productsection = document.getElementById('products-section');
const addproductBtn = document.getElementById('btn-add-product');
const modalAddProduct = document.getElementById('modal__add_product');

// title modal
const modalAddProductTitle = productsection.querySelector('.add-product-e');
const modalEditProductTitle = productsection.querySelector('.edit-product-e');

//nut luu sanpham
const saveProductBtn = productsection.querySelector('#update-product-button');
if (addproductBtn) {
	addproductBtn.addEventListener('click', () => {
		if (modalAddProduct) {
			modalAddProduct.classList.add('active');
		}
		modalEditProductTitle.classList.add('hidden');
		saveProductBtn.classList.add('hidden');

	});
}
// close modal
const modalclosebtn = productsection.querySelector('.modal-close.product-form');
if (modalclosebtn) {
	modalclosebtn.addEventListener('click', () => {
		if (modalAddProduct) {
			modalAddProduct.classList.remove('active');
		}
		modalEditProductTitle.classList.remove('hidden');
		saveProductBtn.classList.remove('hidden');
	});
}

// product type 
const producttypesection = document.getElementById('product-types-section');
const addproducttypebtn = document.getElementById('pt-add-btn');
const modalAddProductType = document.getElementById('pt-modal');

const closeproducttypebtn = document.querySelector('#pt-modal-close');
console.log(closeproducttypebtn);
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


function createId(arr) {
    let id = arr.length;
    let check = arr.find((item) => item.id == id);
    while (check != null) {
        id++;
        check = arr.find((item) => item.id == id);
    }
    return id;
}

// xóa sản phẩm
function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let index = products.findIndex(item => {
        return item.id == id;
    })
    if (confirm("Bạn có chắc muốn xóa?") == true) {
        products[index].status = 0;
        toast({ title: 'Success', message: 'Xóa sản phẩm thành công !', type: 'success', duration: 3000 });
    }
    localStorage.setItem("products", JSON.stringify(products));
    showProduct();
}