KeySmith – Artisan Keycap Ecommerce




KeySmith là dự án web thương mại điện tử bán keycap artisan – các phím trang trí, mỹ nghệ, dành cho cộng đồng đam mê bàn phím cơ. Dự án thực hiện trong khuôn khổ học kỳ tại Saigon University (SGU).

🎯 Mục tiêu & Tầm nhìn

Cung cấp platform cho các nghệ nhân (artisan) trưng bày và bán keycap thiết kế thủ công

Giao diện đẹp, thân thiện, dễ sử dụng cho người mua & người bán

Tối ưu trải nghiệm mua sắm, giỏ hàng, thanh toán

Hỗ trợ quản lý đơn hàng, xác thực người dùng, quản trị backend

📂 Cấu trúc dự án
keysmith_teamproj/
├── img/                  # Hình ảnh, assets (keycap, banner, icon…)
├── index.html            # Trang chủ (front-end)
├── style.css             # CSS chính
├── script.js             # JavaScript front-end
└── lythuyet.docx          # Tài liệu lý thuyết / báo cáo


⚠️ Dự án hiện chỉ chứa bản front-end (HTML / CSS / JS). Bạn hoặc nhóm có thể bổ sung backend (ví dụ: Node.js, Python, PHP, v.v.) nếu cần.

🛠 Công nghệ & Tools sử dụng

HTML5 / CSS3 – xây dựng giao diện

JavaScript (vanilla / có thể dùng thư viện nếu mở rộng)

Responsive design – để trang web hiển thị tốt trên cả desktop & mobile

Git / GitHub – quản lý phiên bản

(Nếu có backend) Node.js / Express / Django / PHP / MySQL / MongoDB (tùy nhóm)

✅ Tính năng chính

Trang danh sách sản phẩm & chi tiết sản phẩm

Tìm kiếm & lọc keycap theo chủ đề, màu sắc, kiểu dáng

Giỏ hàng + cập nhật số lượng

Thanh toán (mô phỏng hoặc tích hợp cổng thanh toán nếu mở rộng)

Đăng ký / đăng nhập người dùng

Dashboard quản trị (quản lý sản phẩm, đơn hàng, người dùng)

🚀 Hướng dẫn cài đặt & chạy

Giả sử bạn muốn chạy bản front-end tĩnh hoặc phát triển thêm backend:

Clone repo về máy:

git clone https://github.com/ChienPM-27/keysmith_teamproj.git
cd keysmith_teamproj


Mở index.html bằng trình duyệt (hoặc dùng live server extension trong VS Code)

Nếu có backend, cài dependencies & cấu hình (ví dụ npm install, thiết lập database, file .env)

Chạy server backend (ví dụ npm start hoặc python manage.py runserver)

Truy cập http://localhost:PORT để xem trang web

📌 Hướng phát triển mở rộng (gợi ý)

Xây backend (API, database) để lưu dữ liệu sản phẩm, đơn hàng, người dùng

Tích hợp xác thực JWT, bảo mật (hash mật khẩu, xác minh email)

Tích hợp cổng thanh toán (PayPal, Stripe, VNPAY, v.v.)

Upload hình ảnh sản phẩm, quản lý hình ảnh (resize, thumbnail)

Dashboard đẹp & phân quyền admin / user

Giao diện đa ngôn ngữ

👥 Đóng góp

Các thành viên trong nhóm có thể làm branch riêng cho tính năng mới

Mỗi pull request nên kèm mô tả & ảnh minh họa (nếu có)

Kiểm tra kỹ trước khi merge

Tuân theo style guide chung (indent, đặt tên biến, comment)

📝 Quyền sở hữu & Giấy phép

Project này được thực hiện trong khuôn khổ học tập tại Saigon University. Bạn có thể đặt giấy phép như MIT hoặc GPL tùy lựa chọn.
