# Giải Thích Chi Tiết Code Trang Chủ (Home Page)

Tài liệu này giải thích chi tiết từng phần code của trang chủ (`index.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`index.html`)

Đây là trang chính hiển thị khi người dùng truy cập website.

### 1.1. Phần `head` (Dòng 1-10)

- **Meta tags:** Thiết lập encoding UTF-8 và viewport cho mobile.
- **Title:** "Market - Mua sắm trực tuyến".
- **Styles:** Link tới `css/styles.css` (chung) và `css/home.css` (riêng).

### 1.2. Header & Navigation (Dòng 12-56)

Header được cố định trên cùng (`.sticky-header`) giúp người dùng dễ dàng điều hướng.

- **Logo:** Chữ "Market" có hiệu ứng gradient.
- **Menu (`.nav-menu`):** Các liên kết "Giới Thiệu", "Sản Phẩm", "Liên Hệ". Click chuột sẽ cuộn mượt đến phần tương ứng (nhờ `scroll-behavior: smooth` mặc định hoặc JS).
- **User Actions (`.header-right`):**
  - **Auth Buttons:** Nút "Đăng Nhập/Đăng Ký" (hiện khi chưa login).
  - **User Profile:** Avatar + Tên + Dropdown menu (hiện khi đã login).
  - **Cart Icon:** Biểu tượng giỏ hàng với số lượng sản phẩm (`.badge`).
- **Hamburger Menu:** Nút 3 gạch cho giao diện mobile.

### 1.3. Hero Section (Dòng 58-68)

Banner giới thiệu chính với background gradient.

- **Content:** Title lớn, Slogan, và nút "Khám Phá Sản Phẩm".
- **Animation:** Class `.fade-in` tạo hiệu ứng xuất hiện dần dần.

### 1.4. Products Section (Dòng 70-81)

Khu vực hiển thị danh sách sản phẩm.

- **Grid:** Div `#productGrid` rỗng, sẽ được JavaScript điền dữ liệu vào (loading từ Firestore).

### 1.5. Contact & Footer (Dòng 83-134)

- **Contact:** Thông tin liên hệ (Email, SĐT, Địa chỉ).
- **Footer:** Chân trang chứa thông tin bản quyền và các liên kết phụ (Chính sách, Hỗ trợ).

---

## 2. Định Dạng Giao Diện (CSS)

### 2.1. Global Styles (`css/styles.css`)

Thiết lập bộ khung thiết kế chung cho toàn bộ website.

- **Màu sắc (Variables):** Sử dụng bảng màu lạnh (Cold Palette) với chủ đạo là Xanh dương (`--primary-color: #0ea5e9`).
- **Glassmorphism:** Class `.glass-panel` tạo hiệu ứng kính mờ hiện đại.
- **Components:** Định nghĩa style cho Button (`.btn`), Form input, Card (`.card`), Badge.
- **Animations:** `fadeIn`, `slideInLeft`, `scaleUp` dùng chung.
- **Responsive:** Media queries xử lý giao diện trên Mobile (<768px) và Tablet.

### 2.2. Home Styles (`css/home.css`)

Định dạng riêng cho trang chủ.

- **Sticky Header:** Sử dụng `backdrop-filter: blur(10px)` để làm mờ nền khi cuộn trang.
- **Hero:** Background gradient chéo (`linear-gradient(135deg)`).
- **Product Card:**
  - Hiệu ứng hover: Card nổi lên (`translateY`), bóng đổ (`box-shadow`).
  - Ảnh sản phẩm: Zoom nhẹ khi di chuột vào (`transform: scale(1.05)`).
- **Mobile Menu:** Xử lý ẩn/hiện menu trên mobile khi bấm nút Hamburger.

---

## 3. Logic Xử Lý (`js/home.js`)

File JS chịu trách nhiệm tương tác người dùng và dữ liệu.

### 3.1. Khởi tạo & Config

Import `auth`, `db` từ Firebase config để kết nối database và xác thực người dùng.

### 3.2. Load Sản Phẩm (Hàm `loadProductsFromFirestore`)

- Kết nối tới collection `products` trên Firestore.
- Lấy dữ liệu về và gọi `renderProducts` để hiển thị HTML.
- **Render Logic:** Dùng `map` để tạo chuỗi HTML cho từng sản phẩm (Ảnh, Tên, Giá, Rating) rồi nhúng vào `#productGrid`.

### 3.3. Giỏ Hàng (Cart Logic)

- **Lưu trữ:** Sử dụng `localStorage` để lưu giỏ hàng, giữ dữ liệu khi F5 trang.
- **Add to Cart:**
  - Kiểm tra tồn kho (`inStock`).
  - Nếu sản phẩm đã có trong giỏ -> Tăng số lượng.
  - Nếu chưa -> Thêm mới.
  - Hiển thị thông báo Toast ("Đã thêm vào giỏ hàng") góc màn hình.
  - Cập nhật số lượng trên icon giỏ hàng (`updateCartBadge`).

### 3.4. Xác Thực (Authentication)

- Sử dụng `onAuthStateChanged` để lắng nghe trạng thái đăng nhập.
- **Chưa login:** Hiện nút Đăng nhập/Đăng ký.
- **Đã login:**
  - Ẩn nút Đăng nhập.
  - Hiện User Profile (Avatar + Tên).
  - Xử lý Đăng xuất (`signOut`).

### 3.5. Mobile Interaction

- **Hamburger Menu:** Toggle class `active` cho menu và icon khi click.
- **Dropdown User:** Ẩn/hiện menu tài khoản khi click vào avatar.

---

**Tóm tắt luồng hoạt động:**

1. Trang load -> `js/home.js` chạy.
2. Kiểm tra login -> Update Header.
3. Load Cart từ LocalStorage -> Update Badge.
4. Gọi Firestore lấy Products -> Render Grid.
5. Người dùng tương tác (Add to Cart, Click Menu...) -> JS xử lý sự kiện.
