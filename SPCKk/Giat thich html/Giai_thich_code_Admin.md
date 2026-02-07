# Giải Thích Chi Tiết Code Trang Admin (Quản Trị)

Tài liệu này giải thích chi tiết từng phần code của trang Admin Dashboard (`admin.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`admin.html`)

Trang Admin được thiết kế theo layout Dashboard cổ điển: Sidebar bên trái (cố định) và Main Content bên phải.

### 1.1. Phần `head` (Dòng 1-12)

- **CSS:**
  - `css/styles.css`: Style nền tảng.
  - `css/admin.css`: Style riêng cho giao diện admin.
- **Script:**
  - Cloudinary Widget (`https://upload-widget.cloudinary.com/global/all.js`): Thư viện JS để hỗ trợ upload ảnh sản phẩm lên server của Cloudinary.

### 1.2. Admin Layout (Dòng 18-331)

Sử dụng Grid/Flexbox để chia bố cục:

- **Sidebar (`.admin-sidebar`):**
  - Chứa logo và Menu điều hướng (Dashboard, Products, Orders, Users, Settings...).
  - Dùng thẻ `<a>` với `data-section` để JS biết cần hiển thị phần nào khi click.
  - Nút Đăng xuất ở dưới cùng.
- **Main Content (`.admin-main`):**
  - **Topbar (`.admin-topbar`):** Thanh ngang trên cùng, chứa nút Hamburger (cho mobile), ô tìm kiếm và thông tin Profile admin.
  - **Content Area (`.admin-content`):** Nơi hiển thị nội dung chính.
    - Các section (`#dashboardSection`, `#productsSection`...) được ẩn/hiện bằng JS (`.active`).
    - **Dashboard:** Hiển thị 4 thẻ thống kê (Doanh thu, Đơn hàng...) và Bảng đơn hàng gần đây.
    - **Products:** Bảng quản lý sản phẩm + nút "Thêm Sản Phẩm".
    - **Orders:** Bảng quản lý đơn hàng + bộ lọc trạng thái.
    - **Users:** Bảng quản lý người dùng.
    - **Categories:** Grid hiển thị danh mục.
    - **Settings:** Form cài đặt cửa hàng.

### 1.3. Modal Thêm/Sửa Sản Phẩm (Dòng 337-388)

- Một Popup (`.modal`) mặc định ẩn (`.hidden`).
- Chứa form nhập thông tin sản phẩm (Tên, Giá, Kho...).
- **Upload Ảnh:** Khu vực upload ảnh tích hợp Cloudinary, có preview ảnh trước khi lưu.

---

## 2. Định Dạng Giao Diện (`css/admin.css`)

### 2.1. Layout & Sidebar

- `.admin-layout`: `display: grid; grid-template-columns: 250px 1fr;`. Cột trái 250px cố định, cột phải tự co giãn.
- `.admin-sidebar`: `position: fixed`. Luôn đứng yên khi cuộn trang. Background màu gradient tối tạo cảm giác chuyên nghiệp.
- `.sidebar-link.active`: Đánh dấu mục đang chọn bằng background sáng hơn và border trái.

### 2.2. Cards & Stats

- `.stat-card`: Card thống kê với Icon bên trái, số liệu bên phải. Có hiệu ứng hover nổi lên (`box-shadow`).
- `.stat-icon`: Các icon có màu nền nhạt tương ứng (ví dụ: Doanh thu màu xanh dương, Sản phẩm màu cam).

### 2.3. Data Tables

- `.data-table`: Bảng dữ liệu chiếm 100% chiều rộng. Header có nền xám nhạt (`var(--bg-secondary)`).
- `.status-badge`: Nhãn trạng thái đơn hàng với màu sắc riêng biệt (Pending: Vàng, Delivered: Xanh lá...).

### 2.4. Responsive (Mobile/Tablet)

- **Tablet (< 1024px):** Sidebar thu nhỏ còn 200px.
- **Mobile (< 768px):**
  - Sidebar ẩn đi (`left: -250px`). Hiện nút Hamburger để mở.
  - Layout chuyển về 1 cột.
  - Bảng dữ liệu có thể cuộn ngang (`overflow-x: auto`).

---

## 3. Logic Xử Lý (`js/admin.js`)

Đây là trung tâm điều khiển của trang Admin.

### 3.1. Xác Thực Admin (`checkAdminAuth`)

- Kiểm tra user đã đăng nhập chưa (`onAuthStateChanged`).
- Nếu đã đăng nhập, kiểm tra trong Firestore xem `role` có phải là `"admin"` không.
- Nếu không phải admin -> Đá về trang chủ (`index.html`) hoặc trang login.

### 3.2. Điều Hướng Sidebar (`setupSidebar`)

- Bắt sự kiện click vào các link sidebar.
- Ẩn tất cả các section, chỉ hiện section tương ứng với `data-section` của link được click.
- Trên mobile, tự động đóng sidebar sau khi chọn.

### 3.3. Quản Lý Sản Phẩm (CRUD)

- **Xem (`loadProductsFromFirestore`):** Lấy dữ liệu từ collection `products` và render ra bảng.
- **Thêm/Sửa (`setupProductModal`, `editProduct`):**
  - Mở modal form.
  - Nếu là Sửa: Điền sẵn dữ liệu cũ vào form.
  - Nếu là Thêm: Reset form.
  - Tích hợp **Cloudinary Widget** để upload ảnh lấy URL.
  - Lưu vào Firestore (`addDoc` hoặc `updateDoc`).
- **Xóa (`deleteProduct`):** Xác nhận `confirm` rồi xóa document khỏi Firestore (`deleteDoc`).

### 3.4. Quản Lý Đơn Hàng & Người Dùng

- Hiện tại sử dụng dữ liệu giả (`mockOrders`, `mockUsers`) để demo giao diện.
- **Filter Đơn Hàng:** Lọc danh sách theo trạng thái (Pending, Delivered...).
- **Cập Nhật Trạng Thái:** Demo chức năng đổi trạng thái đơn hàng khi click nút "Cập nhật".

### 3.5. Upload Ảnh (Cloudinary)

- Sử dụng `cloudinary.createUploadWidget`.
- Khi upload thành công (`event === "success"`), lấy URL ảnh (`result.info.secure_url`) gán vào input ẩn và hiện ảnh preview.
- Giúp giảm tải cho server vì ảnh được host bên thứ 3.

---

**Tổng kết:** Trang Admin này là một Single Page Application (SPA) thu nhỏ, xử lý nhiều nghiệp vụ quản lý phức tạp trên một giao diện thống nhất. Việc phân quyền chặt chẽ (Check Role) đảm bảo chỉ người quản trị mới có thể tác động vào dữ liệu hệ thống.
