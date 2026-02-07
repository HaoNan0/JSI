# Giải Thích Chi Tiết Code Trang Tạo Admin (Create Admin Page)

Tài liệu này giải thích chi tiết từng phần code của trang tạo tài khoản Admin (`create-admin.html`). Trang này được thiết kế riêng biệt để tạo ra user có quyền quản trị hệ thống.

---

## 1. Cấu Trúc Giao Diện (`create-admin.html`)

Đây là một trang "độc lập", không dùng chung navigation với trang chủ khách hàng.

### 1.1. Phần `head` (Dòng 1-11)

- **CSS Links:**
  - Font Awesome: Icon mắt (xem mật khẩu).
  - `css/styles.css`: Style nền tảng.
  - `css/auth.css`: Style đặc thù cho các form đăng nhập/đăng ký (hiệu ứng kính mờ, background gradient).

### 1.2. Body - Form Tạo Admin (Dòng 12-86)

- **Container:** `.auth-container` căn giữa màn hình.
- **Form:** `.auth-form` có hiệu ứng kính (`glass-panel`).
- **Input Fields:**
  - `adminName`: Họ tên.
  - `adminEmail`: Email (dùng làm tên đăng nhập).
  - `adminPassword`: Mật khẩu (có nút bật/tắt xem mật khẩu).
  - `adminConfirmPassword`: Nhập lại mật khẩu để xác nhận.
- **Submit Button:** "Tạo Tài Khoản Admin".

---

## 2. Logic Xử Lý (Inline Script)

Khác với các trang khác dùng file JS riêng, trang này nhúng trực tiếp script vào cuối file HTML (Dòng 88-228).

### 2.1. Firebase Config (Dòng 88-95)

- Import `auth` và `db` từ `js/firebase-config.js`.
- Import các hàm cần thiết:
  - `createUserWithEmailAndPassword`: Tạo user mới trong Authentication.
  - `updateProfile`: Cập nhật tên hiển thị.
  - `setDoc`: Lưu thông tin user vào Firestore.

### 2.2. Xử Lý Giao Diện (UI Logic)

- **Toggle Password:** Bắt sự kiện click vào icon con mắt (`.eye-icon`) để chuyển đổi `type` của input giữa `password` (ẩn) và `text` (hiện).
- **Toast Notify:** Hàm `showError` và `showSuccess` tự tạo element `div` để hiển thị thông báo góc màn hình, thay vì dùng `alert` mặc định.

### 2.3. Xử Lý Form Submit (Dòng 162-227)

Khi người dùng bấm nút "Tạo Tài Khoản Admin":

1.  **Validate:**
    - Kiểm tra tên không để trống.
    - Mật khẩu phải >= 8 ký tự.
    - Mật khẩu xác nhận phải trùng khớp.
2.  **Tạo User (Auth):**
    - Gọi `createUserWithEmailAndPassword(auth, email, password)` -> Tạo user trên hệ thống Firebase Auth.
3.  **Cập Nhật Profile:**
    - Gọi `updateProfile(user, { displayName: name })` -> Gán tên hiển thị cho user vừa tạo.
4.  **Lưu Role Admin (Firestore):**
    - Gọi `setDoc` lưu vào collection `users` với ID là `user.uid`.
    - **Quan trọng:** Dữ liệu lưu kèm trường `role: "admin"`. Đây là dấu hiệu nhận biết quyền quản trị khi đăng nhập sau này.
5.  **Xử Lý Kết Quả:**
    - **Thành công:** Hiện thông báo xanh, chuyển hướng về trang `admin.html` sau 2 giây.
    - **Lỗi:** Hiện thông báo đỏ (Email đã tồn tại, mật khẩu yếu...).

---

**Tại sao trang này quan trọng?**
Thông thường, người dùng đăng ký qua trang `register.html` chỉ có quyền "customer" (khách hàng). Trang `create-admin.html` là "cửa sau" (backdoor) hoặc công cụ nội bộ để dev team tự tạo tài khoản quản trị viên đầu tiên cho hệ thống.
