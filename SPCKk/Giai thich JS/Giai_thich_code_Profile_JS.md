# Giải Thích Chi Tiết Code `profile.js`

File `js/profile.js` quản lý trang thông tin cá nhân (`profile.html`), cho phép người dùng xem/sửa thông tin, đổi mật khẩu và quản lý địa chỉ giao hàng.

---

## 1. Import & State (Dòng 6-13)

```javascript
import { auth, db } from "./firebase-config.js"
import { ... } from "firebase-auth.js"
import { ... } from "firebase-firestore.js"

let currentUser = null
let userData = null
```

- **Import:** Các hàm xử lý Auth (updateProfile, updatePassword...) và Firestore (getDoc, setDoc...).
- **State:**
  - `currentUser`: Object user của Firebase Auth (chứa uid, email, displayName).
  - `userData`: Dữ liệu chi tiết lưu trong Firestore (chứa phone, birthday, addresses...).

---

## 2. Load Dữ Liệu (`checkAuthAndLoadData`) (Dòng 15-48)

Hàm khởi chạy đầu tiên:

1.  **Kiểm tra đăng nhập:** `onAuthStateChanged`.
    - Nếu chưa login -> Chuyển hướng về `login.html`.
2.  **Load từ Firestore:** Lấy document `users/{uid}`.
    - Nếu chưa có (lần đầu đăng nhập) -> Tạo document mới (`setDoc`) với role mặc định là `customer`.
    - Nếu đã có -> Lưu vào biến `userData`.
3.  **Update UI:** Gọi các hàm hiển thị dữ liệu lên giao diện.

---

## 3. Hiển Th & Cập Nhật Thông Tin Cá Nhân

### 3.1. Hiển Thị (`loadProfileData`) (Dòng 71-84)

- Điền dữ liệu vào các ô input trong form "Thông Tin Cá Nhân" (Tên, Email, SĐT, Ngày sinh...).
- Gọi `loadAddresses()` để tải danh sách địa chỉ.

### 3.2. Cập Nhật Form (`setupProfileForm`) (Dòng 111-166)

- Bắt sự kiện **Submit**:
  - **Validate:** Kiểm tra tên và format số điện thoại.
  - **Update Auth:** `updateProfile` (tên hiển thị).
  - **Update Firestore:** `updateDoc` (lưu các thông tin mở rộng).
  - **Update Local State:** Cập nhật biến `userData` để không cần tải lại trang.
  - Hiển thị thông báo thành công.

---

## 4. Đổi Mật Khẩu (`setupPasswordForm`) (Dòng 169-214)

1.  **Validate:** Mật khẩu mới >= 8 ký tự, khớp với xác nhận.
2.  **Re-authenticate (Xác thực lại):**
    - Firebase yêu cầu người dùng phải nhập đúng mật khẩu cũ trước khi đổi mật khẩu mới để bảo mật.
    - `reauthenticateWithCredential`.
3.  **Update:** Gọi `updatePassword`.
4.  **Xử lý lỗi:** Báo lỗi cụ thể nếu mật khẩu cũ sai hoặc mật khẩu mới quá yếu.

---

## 5. Quản Lý Địa Chỉ (`Addresses`)

Hệ thống địa chỉ được lưu dưới dạng một mảng `addresses` bên trong document user.

### 5.1. Hiển Thị (`loadAddresses`) (Dòng 238-278)

- Duyệt mảng `address` và tạo HTML cho từng thẻ địa chỉ.
- Hiển thị nhãn "Mặc định" nếu `default: true`.
- Gắn nút Sửa/Xóa.

### 5.2. Thêm/Sửa (`setupAddressModal`) (Dòng 281-385)

- Sử dụng **Modal** (Popup) để nhập thông tin.
- **Save Logic:**
  - Nếu chọn "Mặc định" -> Set `default: false` cho tất cả địa chỉ cũ.
  - Nếu là `editingIndex` (Sửa) -> Ghi đè.
  - Nếu là thêm mới -> `push` vào mảng.
  - Lưu toàn bộ mảng mới lên Firestore (`updateDoc`).
- **Xóa:** Xác nhận `confirm` -> Lọc bỏ địa chỉ khỏi mảng -> Lưu lại.

---

## 6. Điều Hướng & UI Phụ Trợ

- **Navigation (`setupProfileNavigation`):** Xử lý chuyển tab giữa "Thông tin", "Đơn hàng", "Địa chỉ".
- **Password Toggle (`setupPasswordToggles`):** Icon con mắt để ẩn/hiện mật khẩu.
- **Header (`setupHeader`):** Hiển thị Avatar/Tên người dùng trên thanh menu chính.

---

**Tóm lại:** File này tập trung nhiều vào các thao tác **CRUD** (Create, Read, Update, Delete) trên dữ liệu người dùng trong Firestore và xử lý các nghiệp vụ bảo mật của Firebase Auth.
