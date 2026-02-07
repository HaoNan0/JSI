# Giải Thích Chi Tiết Code Trang Đăng Nhập (Login Page)

Tài liệu này giải thích chi tiết từng phần code của trang đăng nhập (`login.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`login.html`)

Trang đăng nhập cho phép người dùng truy cập vào tài khoản đã tạo.

### 1.1. Phần `head` (Dòng 1-12)

- Khai báo meta tags, title, và icon.
- **CSS Links:** Tương tự trang đăng ký, bao gồm:
  - `font-awesome`: Icon cho nút ẩn/hiện mật khẩu.
  - `css/styles.css`: Style chung.
  - `css/auth.css`: Style nền và form đăng nhập.

### 1.2. Auth Container & Form (Dòng 13-68)

Sử dụng chung cấu trúc với trang đăng ký (`.auth-container`, `.auth-form`, `glass-panel`).

#### A. Header (Dòng 17-22)

- **Logo:** Link về trang chủ.
- **Title:** "Đăng nhập vào tài khoản".

#### B. Login Form (Dòng 24-62)

Form chứa các trường nhập liệu:

1.  **Email (`#loginEmail`):** Input email, bắt buộc.
2.  **Mật Khẩu (`#loginPassword`):**
    - Input password.
    - Nút con mắt ẩn/hiện mật khẩu (`.eye-icon` - ID `#toggleLoginPassword`).
3.  **Ghi nhớ đăng nhập (`#rememberMe`):** Checkbox để lưu email cho lần sau.
4.  **Nút Submit:** Đăng Nhập.

#### C. Footer (Dòng 64-66)

- Link chuyển sang trang Đăng ký (`register.html`) nếu chưa có tài khoản.

---

## 2. Định Dạng Giao Diện (`css/auth.css`)

Trang đăng nhập sử dụng chung file CSS với trang đăng ký (`auth.css`).

### 2.1. Điểm Nổi Bật

- **Background:** Gradient động (`gradientShift`) tạo cảm giác hiện đại.
- **Form:** Hiệu ứng kính mờ (`glassmorphism`) giúp form nổi bật trên nền màu sắc.
- **Input:** Trong suốt với border sáng, focus sẽ phát sáng (`box-shadow`).
- **Nút Đăng Nhập:** `.btn-full` rộng 100%, dễ bấm trên cả mobile.

---

## 3. Logic Xử Lý (`js/auth.js`)

File `js/auth.js` chứa logic cho cả Đăng ký và Đăng nhập. Dưới đây là phần dành riêng cho Đăng nhập (`setupLoginForm`).

### 3.1. Khởi tạo Form & Elements

- Lấy tham chiếu đến các element: Form, Email, Password, Nút Toggle, Checkbox Remember Me.

### 3.2. Tiện Ích (Utilities)

- **Toggle Password:** Click icon mắt để hiện/ẩn mật khẩu.
- **Remember Me Logic:**
  - Khi trang load: Kiểm tra `localStorage` có key `remembered_email` không. Nếu có -> Điền tự động vào ô Email và check vào ô "Ghi nhớ".
  - Khi submit: Nếu checkbox được chọn -> Lưu email vào `localStorage`. Nếu bỏ chọn -> Xóa khỏi `localStorage`.

### 3.3. Xử Lý Submit Form

1.  **Validate:**
    - Kiểm tra email/password có trống không.
    - Kiểm tra định dạng email.
2.  **Gửi yêu cầu:**
    - Disable nút submit, hiện text "Đang đăng nhập...".
    - Gọi `signInWithEmailAndPassword` (Firebase Auth) để xác thực.
3.  **Xử Lý Sau Đăng Nhập:**
    - Lấy thông tin user từ Firestore (`getDoc`) để kiểm tra `role` (vai trò).
    - **Điều hướng:**
      - Nếu là **Admin** -> Chuyển đến `admin.html`.
      - Nếu là **Customer** -> Chuyển đến `index.html` (kèm hash `#products` để cuộn xuống phần sản phẩm).
4.  **Xử Lý Lỗi:**
    - Bắt các lỗi từ Firebase (Sai mật khẩu, Không tìm thấy email, Tài khoản bị khóa...).
    - Hiển thị thông báo lỗi tiếng Việt thân thiện qua hàm `showError`.

---

**Tổng kết:** Trang Đăng nhập tập trung vào tính bảo mật và thuận tiện (Remember Me, Show Password). Việc phân quyền (Admin vs User) được xử lý ngay sau khi đăng nhập thành công để điều hướng người dùng đến đúng trang chức năng.
