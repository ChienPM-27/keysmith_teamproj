// // ============================================================
// // DATABASE MANAGER - Quản lý localStorage
// // ============================================================

// /**
//  * DatabaseManager đơn giản để tương tác với localStorage
//  * Thay thế cho việc import module phức tạp
//  */
// const dataManager = {
//     /**
//      * Lấy tất cả items từ localStorage theo key
//      */
//     getAll: function(storeName) {
//         const data = localStorage.getItem(storeName);
//         return data ? JSON.parse(data) : [];
//     },

//     /**
//      * Lấy một item theo ID
//      */
//     getById: function(storeName, id) {
//         const items = this.getAll(storeName);
//         return items.find(item => item.id === id);
//     },

//     /**
//      * Thêm item mới
//      */
//     add: function(storeName, item) {
//         const items = this.getAll(storeName);
//         items.push(item);
//         localStorage.setItem(storeName, JSON.stringify(items));
//         return item;
//     },

//     /**
//      * Cập nhật item theo ID
//      */
//     updateById: function(storeName, id, updates) {
//         const items = this.getAll(storeName);
//         const index = items.findIndex(item => item.id === id);
        
//         if (index !== -1) {
//             // Merge updates vào item hiện tại
//             items[index] = { ...items[index], ...updates };
//             localStorage.setItem(storeName, JSON.stringify(items));
//             return items[index];
//         }
//         return null;
//     },

//     /**
//      * Xóa item theo ID (không dùng trong hệ thống xóa mềm)
//      */
//     deleteById: function(storeName, id) {
//         const items = this.getAll(storeName);
//         const filtered = items.filter(item => item.id !== id);
//         localStorage.setItem(storeName, JSON.stringify(filtered));
//     }
// };

// // ============================================================
// // TIỆN ÍCH CHUNG
// // ============================================================

// /**
//  * Format tiền tệ USD
//  * Ví dụ: vnd(100) => "$100.00"
//  */
// function vnd(price) {
//     return price.toLocaleString('vi-VN', { 
//         style: 'currency', 
//         currency: 'USD' 
//     }).replace('US', '');
// }

// /**
//  * Biến global lưu ảnh Base64 tạm thời
//  * Khi người dùng chọn ảnh, nó sẽ được convert sang Base64 và lưu vào đây
//  */
// let currentImageBase64 = "/img/blank-image.png";

// /**
//  * Khởi tạo dữ liệu Product Types từ Products hiện có
//  * Chỉ chạy 1 lần khi lần đầu vào trang admin
//  */
// function initProductTypes() {
//     let types = dataManager.getAll("productTypes");
    
//     // Nếu chưa có dữ liệu productTypes, tạo từ categories trong products
//     if (!types || types.length === 0) {
//         const existingProducts = dataManager.getAll("products");
        
//         // Lấy danh sách category duy nhất (loại bỏ trùng lặp)
//         const categories = [...new Set(
//             existingProducts
//                 .map(p => p.category || p.specs?.category)
//                 .filter(Boolean) // Loại bỏ undefined/null
//         )];
        
//         // Tạo productType cho mỗi category
//         categories.forEach((catName, index) => {
//             dataManager.add("productTypes", {
//                 id: Date.now() + index, // ID unique
//                 name: catName,
//                 description: `Mô tả cho ${catName}`,
//                 createdDate: new Date().toISOString().split('T')[0],
//                 status: 'active'
//             });
//         });
        
//         console.log("✅ Đã khởi tạo", categories.length, "loại sản phẩm");
//     }
// }

// // ============================================================
// // QUẢN LÝ LOẠI SẢN PHẨM (PRODUCT TYPES)
// // ============================================================

// const TypeManager = {
//     /**
//      * Render danh sách loại sản phẩm
//      * Hiển thị với trạng thái active/hidden khác nhau
//      */
//     render: function() {
//         const list = dataManager.getAll("productTypes");
//         const container = document.querySelector(".show-product-types");
//         const filterVal = document.getElementById('pt-category-filter')?.value.toLowerCase() || '';

//         if (!container) {
//             console.warn("⚠️ Không tìm thấy container .show-product-types");
//             return;
//         }

//         // Lọc theo từ khóa tìm kiếm
//         const filteredList = list.filter(item => 
//             item.name.toLowerCase().includes(filterVal)
//         );

//         // Nếu không có kết quả
//         if (filteredList.length === 0) {
//             container.innerHTML = `
//                 <div class="no-result" style="text-align:center; padding:40px; color:#999;">
//                     <i class="fa-regular fa-folder-open" style="font-size:64px; margin-bottom:16px;"></i>
//                     <p style="font-size:16px;">Không tìm thấy loại sản phẩm nào</p>
//                 </div>`;
//             return;
//         }

//         let html = '';
        
//         filteredList.forEach(item => {
//             const isHidden = item.status === 'hidden';
            
//             html += `
//             <div class="product-type-item">
//               <div class="product-type-left">
//                 <div class="id">${item.id}</div>
//                 <div class="name">${item.name}</div>
//                 <div class="date">${item.createdDate}</div>
//                 <div class="Description">${item.description || 'Chưa có mô tả'}</div>
//               </div>
//               <div class="product-type-right">
//                 <div class="status">${isHidden ? 'hidden' : 'active'}</div>
//                 <div class="actions">
//                   <button class="edit-btn" onclick="editType(${item.id})">
//                     <i class="fa-solid fa-pen-to-square"></i>
//                   </button>
//                   <button class="view-btn" onclick="toggleTypeStatus(${item.id})">
//                     <i class="fa-solid ${isHidden ? 'fa-eye' : 'fa-eye-slash'}"></i>
//                   </button>
//                   <button class="delete-btn" onclick="deleteType(${item.id})">
//                     <i class="fa-solid fa-trash"></i>
//                   </button>
//                 </div>
//               </div>
//             </div>`;
//         });
        
//         container.innerHTML = html;
//         console.log("✅ Đã render", filteredList.length, "loại sản phẩm");
//     },

//     /**
//      * Xử lý lưu dữ liệu (Thêm/Sửa)
//      */
//     handleSave: function() {
//         const form = document.getElementById('pt-form');
//         const name = document.getElementById('pt-form-name').value.trim();
//         const desc = document.getElementById('pt-form-description').value.trim();
//         const isActive = document.getElementById('pt-form-active').checked;
//         const mode = form.dataset.mode; // 'add' or 'edit'

//         // Validation
//         if (!name) {
//             alert("⚠️ Vui lòng nhập tên loại sản phẩm!");
//             document.getElementById('pt-form-name').focus();
//             return;
//         }

//         // Kiểm tra trùng tên
//         const allTypes = dataManager.getAll("productTypes");
//         const isDuplicate = allTypes.some(t => {
//             if (mode === 'edit') {
//                 const currentId = parseInt(form.dataset.id);
//                 return t.name.toLowerCase() === name.toLowerCase() && t.id !== currentId;
//             }
//             return t.name.toLowerCase() === name.toLowerCase();
//         });

//         if (isDuplicate) {
//             alert("⚠️ Tên loại sản phẩm đã tồn tại!\nVui lòng chọn tên khác.");
//             document.getElementById('pt-form-name').focus();
//             return;
//         }

//         if (mode === 'add') {
//             // Thêm mới
//             const newType = {
//                 id: Date.now(),
//                 name: name,
//                 description: desc,
//                 createdDate: new Date().toISOString().split('T')[0],
//                 status: isActive ? 'active' : 'hidden'
//             };
            
//             dataManager.add("productTypes", newType);
//             console.log("✅ Đã thêm loại:", newType);
//             alert("✅ Thêm loại sản phẩm thành công!");
            
//         } else if (mode === 'edit') {
//             // Cập nhật
//             const id = parseInt(form.dataset.id);
//             const updated = dataManager.updateById("productTypes", id, {
//                 name: name,
//                 description: desc,
//                 status: isActive ? 'active' : 'hidden'
//             });
            
//             console.log("✅ Đã cập nhật loại:", updated);
//             alert("✅ Cập nhật thành công!");
//         }

//         // Đóng modal và refresh
//         this.closeModal();
//         this.render();
        
//         // Cập nhật dropdown và render lại products
//         ProductManager.fillCategoryDropdown();
//         ProductManager.render();
//     },

//     /**
//      * Mở modal thêm mới
//      */
//     openAddModal: function() {
//         const modal = document.getElementById('pt-modal');
//         const form = document.getElementById('pt-form');
        
//         // Reset form
//         form.reset();
//         form.dataset.mode = 'add';
//         delete form.dataset.id;
        
//         // Mặc định checked
//         document.getElementById('pt-form-active').checked = true;
        
//         // Đổi title
//         document.querySelector('.pt-modal__title').textContent = 'THÊM LOẠI SẢN PHẨM MỚI';
        
//         // Hiện modal
//         modal.classList.add('open');
//         modal.style.display = 'flex';
        
//         console.log("📝 Mở modal thêm loại sản phẩm");
//     },

//     /**
//      * Đóng modal
//      */
//     closeModal: function() {
//         const modal = document.getElementById('pt-modal');
//         modal.classList.remove('open');
//         modal.style.display = 'none';
//     }
// };

// /**
//  * Mở modal chỉnh sửa loại sản phẩm
//  * Được gọi từ HTML onclick
//  */
// function editType(id) {
//     const item = dataManager.getById("productTypes", id);
    
//     if (!item) {
//         alert("❌ Không tìm thấy loại sản phẩm!");
//         return;
//     }

//     console.log("✏️ Chỉnh sửa loại:", item);

//     // Fill dữ liệu vào form
//     document.getElementById('pt-form-name').value = item.name;
//     document.getElementById('pt-form-description').value = item.description || '';
//     document.getElementById('pt-form-active').checked = (item.status === 'active');

//     // Set mode edit
//     const form = document.getElementById('pt-form');
//     form.dataset.mode = 'edit';
//     form.dataset.id = id;
    
//     // Đổi title
//     document.querySelector('.pt-modal__title').textContent = 'CHỈNH SỬA LOẠI SẢN PHẨM';

//     // Hiện modal
//     const modal = document.getElementById('pt-modal');
//     modal.classList.add('open');
//     modal.style.display = 'flex';
// }

// /**
//  * Xóa loại sản phẩm THẬT (không phải ẩn)
//  * Được gọi từ HTML onclick
//  */
// function deleteType(id) {
//     const item = dataManager.getById("productTypes", id);
    
//     if (!item) {
//         alert("❌ Không tìm thấy loại sản phẩm!");
//         return;
//     }

//     // Kiểm tra xem có sản phẩm nào đang dùng loại này không
//     const products = dataManager.getAll("products");
//     const productsUsingType = products.filter(p => {
//         const cat = p.category || p.specs?.category;
//         return cat === item.name;
//     });

//     if (productsUsingType.length > 0) {
//         alert(`⚠️ Không thể xóa loại "${item.name}"!\n\nCó ${productsUsingType.length} sản phẩm đang sử dụng loại này.\nVui lòng xóa hoặc chuyển các sản phẩm sang loại khác trước.`);
//         return;
//     }

//     if (confirm(`🗑️ Bạn có chắc muốn XÓA VĨNH VIỄN loại "${item.name}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
//         dataManager.deleteById("productTypes", id);
        
//         console.log("🗑️ Đã xóa loại:", item.name);
//         alert("✅ Đã xóa loại sản phẩm!");
        
//         // Render lại
//         TypeManager.render();
//         ProductManager.fillCategoryDropdown();
//         ProductManager.render();
//     }
// }

// /**
//  * Toggle trạng thái loại sản phẩm (Ẩn ⇄ Hiện)
//  * Được gọi từ HTML onclick
//  */
// function toggleTypeStatus(id) {
//     const item = dataManager.getById("productTypes", id);
    
//     if (!item) {
//         alert("❌ Không tìm thấy loại sản phẩm!");
//         return;
//     }

//     const newStatus = item.status === 'active' ? 'hidden' : 'active';
    
//     const msg = newStatus === 'hidden' 
//         ? `⚠️ Bạn muốn ẩn loại "${item.name}"?\n\n` +
//           `LƯU Ý: Các sản phẩm thuộc loại này sẽ bị đánh dấu cảnh báo.\n` +
//           `Người dùng không thể thêm sản phẩm mới vào loại này.`
//         : `✅ Bạn muốn kích hoạt lại loại "${item.name}"?`;

//     if (confirm(msg)) {
//         dataManager.updateById("productTypes", id, { status: newStatus });
        
//         console.log(`🔄 Đã ${newStatus === 'hidden' ? 'ẩn' : 'kích hoạt'} loại:`, item.name);
        
//         // Render lại
//         TypeManager.render();
//         ProductManager.render();
//     }
// }

// // ============================================================
// // QUẢN LÝ SẢN PHẨM (PRODUCTS)
// // ============================================================

// const ProductManager = {
//     /**
//      * Fill dropdown "Thể loại"
//      * Filter dropdown: hiển thị tất cả (kể cả đã ẩn)
//      * Form dropdown: chỉ hiển thị loại active
//      */
//     fillCategoryDropdown: function() {
//         const types = dataManager.getAll("productTypes");
//         const activeTypes = types.filter(t => t.status === 'active');

//         // 1. Dropdown lọc (hiển thị tất cả)
//         const filterSelect = document.getElementById('the-loai');
//         if (filterSelect) {
//             const currentVal = filterSelect.value;
//             filterSelect.innerHTML = '<option value="">Tất cả thể loại</option>';
            
//             types.forEach(t => {
//                 const label = t.status === 'hidden' ? `${t.name} (Đã ẩn)` : t.name;
//                 filterSelect.innerHTML += `<option value="${t.name}">${label}</option>`;
//             });
            
//             filterSelect.value = currentVal;
//         }

//         // 2. Dropdown trong Form (chỉ hiển thị active)
//         const formSelect = document.getElementById('chon-the-loai');
//         if (formSelect) {
//             const currentVal = formSelect.value;
//             formSelect.innerHTML = '<option value="">-- Chọn thể loại --</option>';
            
//             activeTypes.forEach(t => {
//                 formSelect.innerHTML += `<option value="${t.name}">${t.name}</option>`;
//             });
            
//             if (currentVal) formSelect.value = currentVal;
//         }

//         console.log("📋 Đã cập nhật dropdown:", activeTypes.length, "loại active");
//     },

//     /**
//      * Render danh sách sản phẩm
//      */
//     render: function() {
//         const container = document.querySelector('.show-product');
        
//         if (!container) {
//             console.warn("⚠️ Không tìm thấy container .show-product");
//             return;
//         }

//         // Lấy filter
//         const filterCat = document.getElementById('the-loai')?.value || '';
//         const keyword = document.getElementById('form-search-product')?.value.toLowerCase() || '';

//         let products = dataManager.getAll("products");
//         const types = dataManager.getAll("productTypes");

//         // Áp dụng filter
//         if (filterCat) {
//             products = products.filter(p => {
//                 const cat = p.category || p.specs?.category;
//                 return cat === filterCat;
//             });
//         }
        
//         if (keyword) {
//             products = products.filter(p => 
//                 p.title.toLowerCase().includes(keyword) ||
//                 p.id.toString().includes(keyword)
//             );
//         }

//         let html = '';
        
//         if (products.length === 0) {
//             html = `
//                 <div class="no-result" style="text-align:center; padding:60px; color:#999;">
//                     <i class="fa-regular fa-box-open" style="font-size:64px; margin-bottom:16px;"></i>
//                     <p style="font-size:16px;">Không tìm thấy sản phẩm nào</p>
//                 </div>`;
//         } else {
//             products.forEach(p => {
//                 // Xác định category
//                 const productCat = p.category || p.specs?.category;
                
//                 // Kiểm tra trạng thái
//                 const isProductHidden = (p.status === 'hidden' || p.status === 'deleted' || p.status === 0);
                
//                 // Tìm loại sản phẩm
//                 const typeObj = types.find(t => t.name === productCat);
//                 const isTypeHidden = typeObj && typeObj.status === 'hidden';

//                 // Xác định class và badge
//                 let rowClass = 'product-item';
//                 let statusBadge = '';
                
//                 if (isProductHidden) {
//                     statusBadge = `<div class="product-status">Đã ẩn</div>`;
//                 } else if (isTypeHidden) {
//                     statusBadge = `<div class="product-status">Loại bị ẩn</div>`;
//                 } else {
//                     statusBadge = `<div class="product-status">Hoạt động</div>`;
//                 }

//                 const iconDelete = isProductHidden ? 'fa-trash-arrow-up' : 'fa-trash';
//                 const deleteClass = 'btn-delete-product';

//                 // Hình ảnh
//                 const imgSrc = p.mainImage || p.img || p.image || '/img/blank-image.png';

//                 html += `
//                 <div class="${rowClass}">
//                     <div class="product-img">
//                         <img src="${imgSrc}" alt="${p.title}" onerror="this.src='/img/blank-image.png'">
//                     </div>
//                     <div class="product-info">
//                         <div class="info">
//                             <h3 class="product-name">#${p.id} ${p.title}</h3>
//                             <p class="product-category">${productCat || 'Chưa phân loại'}</p>
//                             <p class="product-description">${p.desc || p.shortDesc || 'Chưa có mô tả'}</p>
//                         </div>
//                         <div class="product-price">${vnd(p.price)}</div>
//                     </div>
//                     <div class="product-info-right">
//                         ${statusBadge}
//                         <div class="btn-items">
//                             <button class="btn-edit-product" onclick="editProduct(${p.id})">
//                                 <i class="fa-solid fa-pen-to-square"></i>
//                             </button>
//                             <button class="btn-view-product">
//                                 <i class="fa-solid fa-eye"></i>
//                             </button>
//                             <button class="${deleteClass}" onclick="toggleProductStatus(${p.id})">
//                                 <i class="fa-solid ${iconDelete}"></i>
//                             </button>
//                         </div>
//                     </div>
//                 </div>`;
//             });
//         }
        
//         container.innerHTML = html;
//         console.log("✅ Đã render", products.length, "sản phẩm");
//     },

//     /**
//      * Xử lý lưu sản phẩm
//      */
//     handleSave: function(mode) {
//         const name = document.getElementById('ten-mon').value.trim();
//         const cat = document.getElementById('chon-the-loai').value;
//         const price = parseFloat(document.getElementById('gia-moi').value);
//         const desc = document.getElementById('mo-ta').value.trim();
//         const form = document.querySelector('.add-product-form');

//         // Validation
//         if (!name) {
//             alert("⚠️ Vui lòng nhập tên sản phẩm!");
//             document.getElementById('ten-mon').focus();
//             return;
//         }
        
//         if (!cat) {
//             alert("⚠️ Vui lòng chọn thể loại!");
//             document.getElementById('chon-the-loai').focus();
//             return;
//         }
        
//         if (isNaN(price) || price <= 0) {
//             alert("⚠️ Vui lòng nhập giá hợp lệ (lớn hơn 0)!");
//             document.getElementById('gia-moi').focus();
//             return;
//         }

//         if (mode === 'add') {
//             // Thêm mới
//             const newProduct = {
//                 id: Date.now(),
//                 title: name,
//                 price: price,
//                 desc: desc,
//                 shortDesc: desc,
//                 img: currentImageBase64,
//                 image: currentImageBase64,
//                 mainImage: currentImageBase64,
//                 category: cat,
//                 specs: {
//                     category: cat,
//                     brand: "KeySmith",
//                     color: "Custom"
//                 },
//                 stock: 10,
//                 sold: 0,
//                 status: 1 // Hoặc 'ready' tùy hệ thống cũ của bạn
//             };
            
//             dataManager.add("products", newProduct);
//             console.log("✅ Đã thêm sản phẩm:", newProduct);
//             alert("✅ Thêm sản phẩm thành công!");
            
//         } else {
//             // Cập nhật
//             const id = parseInt(form.dataset.id);
//             const updated = dataManager.updateById("products", id, {
//                 title: name,
//                 price: price,
//                 desc: desc,
//                 shortDesc: desc,
//                 img: currentImageBase64,
//                 image: currentImageBase64,
//                 mainImage: currentImageBase64,
//                 category: cat,
//                 specs: {
//                     category: cat,
//                     brand: "KeySmith",
//                     color: "Custom"
//                 }
//             });
            
//             console.log("✅ Đã cập nhật sản phẩm:", updated);
//             alert("✅ Cập nhật sản phẩm thành công!");
//         }

//         // Đóng modal và refresh
//         this.closeModal();
//         this.render();
//     },

//     /**
//      * Mở modal thêm mới
//      */
//     openAddModal: function() {
//         this.resetForm();
        
//         // Điều chỉnh UI
//         document.querySelector('.add-product-e').style.display = 'flex';
//         document.querySelector('.edit-product-e').style.display = 'none';
//         document.querySelector('.btn-add-product-form').style.display = 'flex';
//         document.querySelector('.btn-update-product-form').style.display = 'none';
        
//         // Xóa dataset id
//         const form = document.querySelector('.add-product-form');
//         delete form.dataset.id;
        
//         // Mở modal
//         const modal = document.querySelector('.modal.add-product');
//         modal.style.display = 'flex';
//         modal.classList.add('open');
        
//         console.log("📝 Mở modal thêm sản phẩm");
//     },

//     /**
//      * Đóng modal
//      */
//     closeModal: function() {
//         const modal = document.querySelector('.modal.add-product');
//         modal.classList.remove('open');
//         modal.style.display = 'none';
//         this.resetForm();
//     },

//     /**
//      * Reset form
//      */
//     resetForm: function() {
//         document.getElementById('ten-mon').value = '';
//         document.getElementById('gia-moi').value = '';
//         document.getElementById('mo-ta').value = '';
//         document.getElementById('chon-the-loai').value = '';
        
//         const fileInput = document.getElementById('up-hinh-anh');
//         if (fileInput) fileInput.value = '';
        
//         document.querySelector('.upload-image-preview').src = '/img/blank-image.png';
//         currentImageBase64 = '/img/blank-image.png';
//     }
// };

// /**
//  * Hàm gọi khi filter thay đổi
//  */
// function showProduct() {
//     ProductManager.render();
// }

// /**
//  * Mở modal Edit sản phẩm
//  */
// function editProduct(id) {
//     const p = dataManager.getById("products", id);
    
//     if (!p) {
//         alert("❌ Không tìm thấy sản phẩm!");
//         return;
//     }

//     console.log("✏️ Chỉnh sửa sản phẩm:", p);

//     // Fill dữ liệu
//     document.getElementById('ten-mon').value = p.title;
//     document.getElementById('gia-moi').value = p.price;
//     document.getElementById('mo-ta').value = p.desc || p.shortDesc || '';
    
//     // Category
//     const productCat = p.category || p.specs?.category;
//     const select = document.getElementById('chon-the-loai');
//     const typeObj = dataManager.getAll("productTypes").find(t => t.name === productCat);
    
//     // Nếu loại bị ẩn, thêm tạm option
//     if (typeObj && typeObj.status === 'hidden') {
//         if (!select.querySelector(`option[value="${productCat}"]`)) {
//             const opt = document.createElement('option');
//             opt.value = productCat;
//             opt.text = productCat + " (Loại đã bị ẩn)";
//             opt.style.color = '#ff9800';
//             select.add(opt);
//         }
//     }
//     select.value = productCat;

//     // Ảnh
//     const imgSrc = p.mainImage || p.img || p.image || '/img/blank-image.png';
//     document.querySelector('.upload-image-preview').src = imgSrc;
//     currentImageBase64 = imgSrc;

//     // Điều chỉnh UI
//     document.querySelector('.add-product-e').style.display = 'none';
//     document.querySelector('.edit-product-e').style.display = 'flex';
//     document.querySelector('.btn-add-product-form').style.display = 'none';
//     document.querySelector('.btn-update-product-form').style.display = 'flex';

//     // Lưu ID
//     document.querySelector('.add-product-form').dataset.id = id;

//     // Mở modal
//     const modal = document.querySelector('.modal.add-product');
//     modal.style.display = 'flex';
//     modal.classList.add('open');
// }

// /**
//  * Toggle trạng thái sản phẩm
//  */
// function toggleProductStatus(id) {
//     const p = dataManager.getById("products", id);
    
//     if (!p) {
//         alert("❌ Không tìm thấy sản phẩm!");
//         return;
//     }

//     // Xử lý cả status number (0/1) và string ('hidden'/'ready')
//     const isHidden = (p.status === 'hidden' || p.status === 0 || p.status === 'deleted');
//     const newStatus = isHidden ? 1 : 'hidden'; // Sử dụng 1 hoặc 'ready' tùy hệ thống
//     const actionName = isHidden ? 'KHÔI PHỤC' : 'XÓA (ẨN)';

//     if (confirm(`${isHidden ? '✅' : '⚠️'} Bạn có chắc muốn ${actionName} sản phẩm "${p.title}" không?`)) {
//         dataManager.updateById("products", id, { status: newStatus });
        
//         console.log(`🔄 Đã ${isHidden ? 'khôi phục' : 'ẩn'} sản phẩm:`, p.title);
        
//         ProductManager.render();
//     }
// }

// /**
//  * Upload và preview ảnh
//  */
// function uploadImage(el) {
//     const file = el.files[0];
    
//     if (!file) return;
    
//     // Kiểm tra file type
//     if (!file.type.startsWith('image/')) {
//         alert("⚠️ Vui lòng chọn file ảnh!");
//         el.value = '';
//         return;
//     }
    
//     // Kiểm tra kích thước (2MB)
//     if (file.size > 2 * 1024 * 1024) {
//         alert("⚠️ Kích thước ảnh không được vượt quá 2MB!");
//         el.value = '';
//         return;
//     }
    
//     const reader = new FileReader();
    
//     reader.onload = function(e) {
//         const imgSrc = e.target.result;
//         document.querySelector('.upload-image-preview').src = imgSrc;
//         currentImageBase64 = imgSrc;
//         console.log("📷 Đã load ảnh");
//     };
    
//     reader.onerror = function() {
//         alert("❌ Lỗi khi đọc file ảnh!");
//     };
    
//     reader.readAsDataURL(file);
// }

// // ============================================================
// // KHỞI TẠO KHI TRANG LOAD
// // ============================================================

// document.addEventListener("DOMContentLoaded", () => {
//     console.log("🚀 Khởi động Admin Product Manager...");
    
//     // Khởi tạo dữ liệu
//     initProductTypes();
    
//     // Render lần đầu
//     TypeManager.render();
//     ProductManager.fillCategoryDropdown();
//     ProductManager.render();

//     console.log("✅ Hệ thống đã sẵn sàng!");

//     // ========== EVENT LISTENERS ==========
    
//     // === PRODUCT TYPES ===
    
//     // Nút thêm loại
//     const ptAddBtn = document.getElementById('pt-add-btn');
//     if (ptAddBtn) {
//         ptAddBtn.addEventListener('click', () => TypeManager.openAddModal());
//     }

//     // Nút đóng modal loại
//     const ptCloseBtn = document.querySelector('[data-pt-close]');
//     if (ptCloseBtn) {
//         ptCloseBtn.addEventListener('click', () => TypeManager.closeModal());
//     }

//     // Submit form loại
//     const ptForm = document.getElementById('pt-form');
//     if (ptForm) {
//         ptForm.addEventListener('submit', (e) => {
//             e.preventDefault();
//             TypeManager.handleSave();
//         });
//     }

//     // Tìm kiếm loại
//     const ptFilter = document.getElementById('pt-category-filter');
//     if (ptFilter) {
//         ptFilter.addEventListener('input', () => TypeManager.render());
//     }
    
//     // Refresh loại
//     const ptRefreshBtn = document.getElementById('pt-refresh-btn');
//     if (ptRefreshBtn) {
//         ptRefreshBtn.addEventListener('click', () => {
//             document.getElementById('pt-category-filter').value = '';
//             TypeManager.render();
//         });
//     }

//     // === PRODUCTS ===
    
//     // Nút thêm sản phẩm
//     const btnAddProduct = document.getElementById('btn-add-product');
//     if (btnAddProduct) {
//         btnAddProduct.addEventListener('click', () => ProductManager.openAddModal());
//     }

//     // Nút đóng modal sản phẩm
//     const modalCloseProduct = document.querySelector('.modal-close.product-form');
//     if (modalCloseProduct) {
//         modalCloseProduct.addEventListener('click', () => ProductManager.closeModal());
//     }

//     // Nút Lưu (Thêm mới)
//     const addProductBtn = document.getElementById('add-product-button');
//     if (addProductBtn) {
//         addProductBtn.addEventListener('click', () => ProductManager.handleSave('add'));
//     }

//     // Nút Lưu (Cập nhật)
//     const updateProductBtn = document.getElementById('update-product-button');
//     if (updateProductBtn) {
//         updateProductBtn.addEventListener('click', () => ProductManager.handleSave('edit'));
//     }

//     // Nút Refresh sản phẩm
//     const btnRefreshProduct = document.getElementById('btn-refresh-product');
//     if (btnRefreshProduct) {
//         btnRefreshProduct.addEventListener('click', () => {
//             document.getElementById('form-search-product').value = '';
//             document.getElementById('the-loai').value = '';
//             ProductManager.render();
//         });
//     }

//     // Tìm kiếm sản phẩm
//     const searchProduct = document.getElementById('form-search-product');
//     if (searchProduct) {
//         searchProduct.addEventListener('input', () => ProductManager.render());
//     }

//     // Lọc theo thể loại
//     const theLoai = document.getElementById('the-loai');
//     if (theLoai) {
//         theLoai.addEventListener('change', () => ProductManager.render());
//     }

//     console.log("✅ Đã gắn tất cả event listeners");
// });