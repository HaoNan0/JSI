# Giải Thích Chi Tiết Code Trang Chi Tiết Sản Phẩm (Detail Page)

Tài liệu này giải thích chi tiết từng phần code của trang chi tiết sản phẩm (`detail.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`detail.html`)

Trang này hiển thị thông tin đầy đủ của một sản phẩm cụ thể và cho phép người dùng thêm vào giỏ hàng.

### 1.1. Phần `head` (Dòng 1-11)

- **CSS Links:**
  - `css/styles.css`: Style chung.
  - `css/home.css`: Style cho Header/Footer (dùng lại).
  - `css/detail.css`: Style riêng cho trang chi tiết.

### 1.2. Main Layout (Dòng 59-199)

Sử dụng Layout 2 cột (`.product-detail-wrapper`):

#### A. Cột Trái: Thư Viện Ảnh (`.product-gallery`)

- **Main Image (`.gallery-main`):** Hiển thị ảnh lớn. Có hiệu ứng zoom khi hover.
- **Thumbnails (`.gallery-thumbnails`):** Danh sách các ảnh nhỏ. Click vào sẽ thay đổi ảnh lớn.

#### B. Cột Phải: Thông Tin Sản Phẩm (`.product-details`)

- **Header:** Tên sản phẩm, Đánh giá (Sao + số lượng review).
- **Price Section:** Giá tiền, Trạng thái (Còn hàng/Hết hàng), Số tiền tiết kiệm được.
- **Short Description:** Mô tả ngắn gọn.
- **Quantity Selector:** Bộ chọn số lượng với nút tăng/giảm (`-`, `+`) và input số.
- **Action Buttons:**
  - **Thêm vào giỏ hàng:** Nút chính (Primary).
  - **Mua ngay:** Nút phụ (Outline).
- **Accordion (Nội dung mở rộng):**
  - Mô tả chi tiết.
  - Thông số kỹ thuật.
  - Chính sách đổi trả.
    _(Dùng Accordion để tiết kiệm không gian, người dùng click mới hiện ra)_.

### 1.3. Sản Phẩm Liên Quan (Dòng 205-212)

- Section `.related-products`.
- Grid chứa các sản phẩm khác cùng danh mục (được render bằng JS).

---

## 2. Định Dạng Giao Diện (`css/detail.css`)

### 2.1. Layout & Cấu Trúc

- **Grid Layout:** Sử dụng `grid-template-columns: 1fr 1fr` để chia đôi màn hình (Ảnh 50% - Thông tin 50%).
- **Sticky Gallery:** `.product-gallery` có `position: sticky`. Khi cuộn trang xuống, hình ảnh sản phẩm sẽ trượt theo để luôn hiển thị, trong khi phần thông tin bên phải cuộn bình thường.

### 2.2. Hiệu Ứng Hình Ảnh

- **Zoom Effect:** Main image có `overflow: hidden`. Khi hover vào `.gallery-main`, ảnh bên trong (`img`) sẽ `scale(1.1)` (phóng to 10%) tạo hiệu ứng soi chi tiết.
- **Thumbnail:** Có border. Khi active (được chọn) sẽ có border màu chủ đạo (`var(--primary-color)`).

### 2.3. Accordion Animation

- Sử dụng CSS Transition cho thuộc tính `max-height`.
- **Trạng thái đóng:** `max-height: 0`, `overflow: hidden`.
- **Trạng thái mở (`.active`):** `max-height: 1000px` (đủ lớn để chứa nội dung).
- Icon mũi tên (`.accordion-icon`) xoay 180 độ khi mở.

### 2.4. Responsive

- **Tablet/Mobile:** Chuyển từ 2 cột sang 1 cột (`1fr`). Ảnh sẽ nằm trên, thông tin nằm dưới.

---

## 3. Logic Xử Lý (`js/detail.js`)

Logic phức tạp nhất nằm ở việc lấy dữ liệu từ Firebase và hiển thị động.

### 3.1. Load Sản Phẩm (`loadProductDetail`)

1.  **Lấy ID:** Đọc tham số `?id=xyz` từ URL trình duyệt (`URLSearchParams`).
2.  **Fetch Data:** Gọi `loadProductFromFirestore(id)` để lấy dữ liệu từ collection `products`.
3.  **Render:**
    - Điền thông tin vào các thẻ HTML (Tên, Giá, Mô tả...).
    - **Gallery:** Render ảnh chính và danh sách thumbnails.
    - **Specs:** Render bảng thông số kỹ thuật.
    - **Stock:** Kiểm tra `inStock` để hiện "Còn hàng" hay "Hết hàng" (và disable nút mua nếu hết).

### 3.2. Chức Năng Gallery (`renderGallery`, `selectImage`)

- Render danh sách ảnh nhỏ.
- Hàm `selectImage(index)`: Khi click thumbnail, thay đổi `src` của ảnh lớn thành ảnh tại index tương ứng và cập nhật class `active` cho thumbnail.

### 3.3. Accordion & Quantity

- **Accordion:** Gán sự kiện click cho header. Khi click -> Toggle class `active` cho item đó và bỏ active của các item khác (chỉ mở 1 cái cùng lúc).
- **Quantity:** Xử lý nút tăng/giảm. Đảm bảo số lượng >= 1 và <= 100.

### 3.4. Thêm Vào Giỏ Hàng (`addToCart`)

- Lấy giỏ hàng từ `localStorage` (key `cart`).
- Kiểm tra sản phẩm đã có trong giỏ chưa?
  - **Có:** Cộng dồn số lượng.
  - **Chưa:** Thêm object mới vào mảng.
- Lưu lại vào `localStorage`.
- Cập nhật số hiển thị trên icon giỏ hàng (`updateCartBadge`).
- Hiển thị thông báo (Alert).

### 3.5. Sản Phẩm Liên Quan (`fetchRelatedProducts`)

- Lấy danh sách sản phẩm từ Firestore, loại trừ sản phẩm đang xem.
- Lấy 3 sản phẩm đầu tiên để hiển thị bên dưới.

---

**Tổng kết:** Trang Chi tiết sản phẩm kết hợp giữa việc hiển thị thông tin tĩnh (Layout) và dữ liệu động (từ Firebase). Các tương tác UI như Zoom ảnh, Accordion, Gallery giúp nâng cao trải nghiệm người dùng, trong khi logic giỏ hàng đảm bảo quy trình mua sắm hoạt động trơn tru.
