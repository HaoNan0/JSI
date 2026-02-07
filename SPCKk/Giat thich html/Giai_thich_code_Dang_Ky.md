# Giải Thích Chi Tiết Code Trang Đăng Ký (Register Page)

Tài liệu này giải thích chi tiết từng phần code của trang đăng ký tài khoản (`register.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`register.html`)

Trang đăng ký cho phép người dùng tạo tài khoản mới.

### 1.1. Phần `head` (Dòng 1-12)

- Khai báo meta tags, title, và icon.
- **CSS Links:**
  - `font-awesome`: Icon.
  - `css/styles.css`: Style chung.
  - `css/auth.css`: Style riêng cho các trang xác thực (Auth pages) như Đăng ký/Đăng nhập.

### 1.2. Auth Container & Form (Dòng 13-104)

- **Background (`.auth-page`):** Bao phủ toàn màn hình.
- **Main Box (`.auth-container`, `.auth-form`):** Khung chứa form đăng ký, có hiệu ứng kính mờ (`glass-panel`).

#### A. Header (Dòng 17-22)

- **Logo:** Link về trang chủ (`index.html`).
- **Title:** "Tạo tài khoản mới".

#### B. Register Form (Dòng 24-98)

Form chứa các trường nhập liệu:

1.  **Họ và Tên (`#name`):** Input text, bắt buộc.
2.  **Email (`#email`):** Input email, bắt buộc.
3.  **Mật Khẩu (`#password`):**
    - Input password, min-length 8 ký tự.
    - Nút con mắt ẩn/hiện mật khẩu (`.eye-icon`).
    - Thanh đánh giá độ mạnh mật khẩu (`.strength-bar`).
4.  **Xác Nhận Mật Khẩu (`#confirmPassword`):**
    - Input password để nhập lại mật khẩu.
5.  **Điều khoản (`#terms`):** Checkbox bắt buộc đồng ý điều khoản.
6.  **Nút Submit:** Đăng Ký.

#### C. Footer (Dòng 100-102)

- Link chuyển sang trang Đăng nhập (`login.html`) nếu đã có tài khoản.

---

## 2. Định Dạng Giao Diện (`css/auth.css`)

Style riêng biệt cho trang Auth để tạo ấn tượng thị giác.

### 2.1. Background Animation (Dòng 10-71)

- **Gradient Background:** Màu chuyển sắc (`linear-gradient`) từ xanh tím sang hồng.
- **Animation:**
  - `gradientShift`: Làm nền chuyển động nhẹ nhàng.
  - `float`: Các vòng tròn trang trí (`::before`, `::after`) bay lơ lửng tạo chiều sâu.

### 2.2. Glassmorphism Form (Dòng 87-94)

- `.auth-form`: Sử dụng `backdrop-filter: blur(20px)` và background bán trong suốt để tạo hiệu ứng tấm kính mờ trên nền động.
- `box-shadow`: Đổ bóng sâu giúp form nổi bật.

### 2.3. Password Strength Indicator (Dòng 166-224)

- `.password-strength-bar`: Thanh ngang nhỏ dưới input mật khẩu.
- `.strength-bar`: Phần màu bên trong, thay đổi độ rộng (`width`) và màu sắc (`background-color`) dựa trên độ mạnh yếu (Weak: Đỏ, Medium: Vàng, Strong: Xanh).

### 2.4. Form Elements & Button

- Input được style trong suốt, border sáng màu.
- `.btn-full`: Nút bấm rộng 100%, có shadow và hiệu ứng hover nổi lên.

---

## 3. Logic Xử Lý (`js/auth.js`)

Logic xử lý đăng ký, bao gồm validate frontend và kết nối Firebase Auth.

### 3.1. Tiện ích (Utility Functions)

- **`validateEmail`:** Kiểm tra định dạng email bằng Regex.
- **`calculatePasswordStrength`:** Chấm điểm mật khẩu dựa trên độ dài và ký tự đặc biệt (Số, Chữ hoa, Ký tự lạ...).
- **`showError` / `showSuccess`:** Hiển thị thông báo Toast (góc trên phải) thay vì `alert()` mặc định.

### 3.2. Form Interactivity (`setupRegisterForm`)

- **Password Toggle:** Click icon mắt để chuyển đổi `type="password"` <-> `type="text"`.
- **Strength Indicator:** Lắng nghe sự kiện `input` trên ô mật khẩu để cập nhật thanh độ mạnh và text (Yếu/Trung bình/Mạnh).
- **Validation on Blur:** Khi người dùng nhập xong và focus ra ngoài (sự kiện `blur`), kiểm tra ngay Email/Password để báo lỗi nếu có.

### 3.3. Xử Lý Submit Form

1.  **Lấy dữ liệu:** Name, Email, Password, ConfirmPassword.
2.  **Validate:** Kiểm tra dữ liệu hợp lệ (trong trắng, format email, độ dài password, khớp mật khẩu).
3.  **Gửi yêu cầu:**
    - Disable nút submit để tránh double-click.
    - Gọi `createUserWithEmailAndPassword` (Firebase Auth) để tạo user mới.
    - Gọi `updateProfile` để lưu Tên hiển thị.
    - Gọi `setDoc` (Firestore) để tạo bản ghi user trong database (lưu thêm role, createdAt).
4.  **Kết quả:**
    - **Thành công:** Hiện thông báo, đợi 1s rồi chuyển hướng về `index.html`.
    - **Thất bại:** Hiện thông báo lỗi cụ thể (Email đã dùng, Mật khẩu yếu...) từ Firebase. Restore nút submit.

---

**Tóm lại:** Trang Đăng ký được thiết kế chau chuốt về giao diện (Animation, Glassmorphism) và trải nghiệm người dùng (Validation tức thì, Password Strength), đồng thời tích hợp chặt chẽ với Firebase Auth để quản lý danh tính an toàn.
