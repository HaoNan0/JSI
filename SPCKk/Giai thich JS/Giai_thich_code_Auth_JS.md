# Giải Thích Chi Tiết Code `auth.js`

File `js/auth.js` chịu trách nhiệm xử lý toàn bộ logic liên quan đến **Xác thực người dùng** (Authentication) trong ứng dụng, bao gồm Đăng ký (Register) và Đăng nhập (Login) thông qua Firebase.

---

## 1. Import Thư Viện (Dòng 7-13)

```javascript
import { auth, db } from "./firebase-config.js"
import { ... } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { ... } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
```

- **Firebase Auth:** Import các hàm `createUserWithEmailAndPassword` (tạo user mới), `signInWithEmailAndPassword` (đăng nhập), `updateProfile` (cập nhật tên).
- **Firestore:** Import các hàm để lưu và lấy dữ liệu người dùng từ database.

---

## 2. Các Hàm Tiện Ích (Utility Functions)

### 2.1. `validateEmail(email)` (Dòng 17-20)

- Sử dụng Regular Expression (Biểu thức chính quy) để kiểm tra xem email có đúng định dạng không (phải có ký tự @, có tên miền...).

### 2.2. `calculatePasswordStrength(password)` (Dòng 23-35)

- Đánh giá độ mạnh của mật khẩu dựa trên các tiêu chí:
  - Độ dài >= 8 ký tự.
  - Độ dài >= 12 ký tự.
  - Có chữ hoa.
  - Có số.
  - Có ký tự đặc biệt (!@#...).
- Trả về: "weak" (yếu), "medium" (trung bình), hoặc "strong" (mạnh).

### 2.3. `showError` & `showSuccess` (Dòng 39-88)

- Thay vì dùng `alert()` mặc định của trình duyệt (trông thiếu chuyên nghiệp), hai hàm này tạo ra các thông báo nổi (Toast Notification) đẹp mắt ở góc màn hình.
- Tự động biến mất sau 3 giây.

---

## 3. Xử Lý Đăng Ký (`setupRegisterForm`) (Dòng 91-280)

Hàm này được gọi khi trang Đăng ký (`register.html`) được tải.

### 3.1. Lấy Elements & Ẩn/Hiện Mật Khẩu

- Lấy các ô input (Tên, Email, Mật khẩu...).
- Gắn sự kiện click cho icon con mắt (`togglePasswordBtn`) để chuyển đổi `type="password"` sang `text` và ngược lại -> Giúp người dùng xem mật khẩu họ đang gõ.

### 3.2. Hiển Thị Độ Mạnh Mật Khẩu (Dòng 133-151)

- Lắng nghe sự kiện `input` (người dùng gõ phím).
- Gọi `calculatePasswordStrength` và cập nhật thanh màu (`strengthBar`) + chữ hiển thị (Yếu/Trung bình/Mạnh).

### 3.3. Validate "Real-time" (Dòng 154-191)

- Sự kiện `blur` (khi người dùng click ra ngoài ô input):
  - Kiểm tra Email hợp lệ chưa?
  - Kiểm tra mật khẩu đủ dài chưa?
  - Kiểm tra mật khẩu xác nhận có khớp không?
- Nếu sai, hiện thông báo lỗi đỏ ngay lập tức (`input-error`).

### 3.4. Submit Form (Dòng 193-272)

Khi người dùng bấm nút "Đăng Ký":

1.  **Chặn hành vi mặc định:** `e.preventDefault()`.
2.  **Validate lần cuối:** Kiểm tra lại tất cả các trường dữ liệu.
3.  **Vô hiệu hóa nút:** Để tránh người dùng bấm nhiều lần (`submitBtn.disabled = true`).
4.  **Gọi Firebase Auth:**
    - `createUserWithEmailAndPassword`: Tạo tài khoản trên hệ thống Firebase.
5.  **Cập nhật Profile:**
    - `updateProfile`: Lưu tên hiển thị (Display Name).
6.  **Lưu vào Firestore:**
    - `setDoc`: Lưu thêm thông tin chi tiết vào collection `users` trong database.
    - **Quan trọng:** Mặc định gán `role: "customer"` (khách hàng).
7.  **Hoàn tất:** Hiện thông báo thành công và chuyển hướng về trang chủ (`index.html`).
8.  **Xử lý lỗi:** Nếu có lỗi (email trùng, mật khẩu yếu...), hiển thị thông báo lỗi tương ứng.

---

## 4. Xử Lý Đăng Nhập (`setupLoginForm`) (Dòng 283-404)

Hàm này được gọi khi trang Đăng nhập (`login.html`) được tải.

### 4.1. "Ghi nhớ đăng nhập" (Remember Me) (Dòng 310-314)

- Kiểm tra `localStorage` xem có lưu email cũ không (`remembered_email`).
- Nếu có, tự động điền vào ô Email và tick chọn "Ghi nhớ tôi".

### 4.2. Submit Form (Dòng 316-403)

Khi người dùng bấm nút "Đăng Nhập":

1.  **Validate:** Kiểm tra email/pass có trống không.
2.  **Xử lý "Ghi nhớ":**
    - Nếu tick chọn: Lưu email vào `localStorage`.
    - Nếu không: Xóa khỏi `localStorage`.
3.  **Gọi Firebase Auth:**
    - `signInWithEmailAndPassword`: Xác thực email và mật khẩu với Server.
4.  **Kiểm tra Quyền (Role):**
    - Sau khi đăng nhập thành công, code sẽ lấy thông tin user từ Firestore (`getDoc`).
    - Kiểm tra trường `role`.
5.  **Chuyển hướng (Redirect):**
    - Nếu `role === "admin"` -> Chuyển sang trang quản trị `admin.html`.
    - Nếu là khách hàng (`customer`) -> Chuyển sang trang chủ `index.html`.

---

## 5. Khởi Chạy (Dòng 276 & 407)

- Code sử dụng `document.readyState` để đảm bảo trang web đã tải xong cấu trúc HTML (DOM) trước khi gán các sự kiện, tránh lỗi `null` (không tìm thấy phần tử).
