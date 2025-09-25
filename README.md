# KeySmith – Artisan Keycap Ecommerce 🎹  

**KeySmith** là dự án web thương mại điện tử bán **keycap artisan** – các phím trang trí, mỹ nghệ, dành cho cộng đồng đam mê bàn phím cơ.  
Dự án thực hiện trong khuôn khổ học kỳ tại **Saigon University (SGU)**.  

---

## 🎯 Mục tiêu & Tầm nhìn  

- Platform bán keycap cho thương hiệu **KeySmith**  
- Giao diện đẹp, thân thiện, dễ sử dụng cho người mua & người bán  
- Tối ưu trải nghiệm mua sắm, giỏ hàng, thanh toán  
- Hỗ trợ quản lý đơn hàng, xác thực người dùng, quản trị backend  

---

## 📂 Cấu trúc dự án  

keysmith_teamproj/
├── img/ # Hình ảnh, assets (keycap, banner, icon…)
├── index.html # Trang chủ (front-end)
├── style.css # CSS chính
├── script.js # JavaScript front-end
└── lythuyet.docx # Tài liệu lý thuyết / báo cáo


⚠️ Dự án hiện chỉ chứa **bản front-end (HTML / CSS / JS)**.  
Bạn hoặc nhóm có thể bổ sung backend (ví dụ: Node.js, Python, PHP, v.v.) nếu cần.  

---

## 🛠 Công nghệ & Tools sử dụng  

- **HTML5 / CSS3** – xây dựng giao diện  
- **JavaScript (vanilla / có thể dùng thư viện nếu mở rộng)**  
- **Responsive design** – hiển thị tốt trên cả desktop & mobile  
- **Git / GitHub** – quản lý phiên bản  

_(Nếu có backend)_:  
- Node.js / Express / Django / PHP  
- MySQL / MongoDB  

---

## ✅ Tính năng chính  

- Trang danh sách sản phẩm & chi tiết sản phẩm  
- Tìm kiếm & lọc keycap theo chủ đề, màu sắc, kiểu dáng  
- Giỏ hàng + cập nhật số lượng  
- Thanh toán (mô phỏng hoặc tích hợp cổng thanh toán nếu mở rộng)  
- Đăng ký / đăng nhập người dùng  
- Dashboard quản trị (quản lý sản phẩm, đơn hàng, người dùng)  

---

## 🚀 Hướng dẫn cài đặt & chạy  

Giả sử bạn muốn chạy bản front-end tĩnh hoặc phát triển thêm backend:  

1. Clone repo về máy:  

   ```bash
   git clone https://github.com/ChienPM-27/keysmith_teamproj.git
   cd keysmith_teamproj
2. Mở index.html bằng trình duyệt (hoặc dùng Live Server extension trong VS Code)

3. Nếu có backend:
  Cài dependencies & cấu hình (ví dụ: npm install, thiết lập database, file .env)
  Chạy server backend:
  npm start
  # hoặc
  python manage.py runserver
4. Truy cập http://localhost:PORT để xem website
