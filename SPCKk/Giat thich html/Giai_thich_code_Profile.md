# Giải Thích Chi Tiết Code Trang Cá Nhân (Profile Page)

Tài liệu này giải thích chi tiết từng phần code của trang hồ sơ người dùng (`profile.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`profile.html`)

Đây là trang để người dùng xem và chỉnh sửa thông tin cá nhân, đổi mật khẩu, quản lý đơn hàng và địa chỉ.

### 1.1. Phần `head` (Dòng 1-12)

- Khai báo meta tags, title, và icon tương tự các trang khác.
- **CSS Links:**
  - `css/styles.css`: Style chung.
  - `css/home.css`: Style cho Header/Footer dùng lại từ trang chủ.
  - `css/profile.css`: Style riêng cho trang Profile.
  - `font-awesome`: Thư viện icon.

### 1.2. Layout Chính (`.profile-layout`) - Dòng 67-270

Trang sử dụng layout 2 cột:

- **Sidebar (Trái):** Chứa thông tin tóm tắt và menu điều hướng.
- **Content (Phải):** Chứa các phần nội dung chi tiết (Thông tin, Bảo mật, Đơn hàng...).

#### A. Sidebar (`aside.profile-sidebar`) - Dòng 69-101

- **Profile Card:** Hiển thị Avatar lớn, Tên hiển thị và Email. Có nút chỉnh sửa avatar.
- **Navigation (`.profile-nav`):** Các tab để chuyển đổi nội dung:
  - Thông tin cá nhân (`#info`)
  - Bảo mật (`#security`)
  - Đơn hàng (`#orders`)
  - Địa chỉ (`#addresses`)

#### B. Main Content (`.profile-content`) - Dòng 104-269

Chứa các `section`, mỗi section tương ứng với một tab bên sidebar.

**1. Thông Tin Cá Nhân (`#infoSection`):**

- Form chỉnh sửa: Họ tên, Email (readonly), SĐT, Ngày sinh, Giới tính, Bio.
- Nút "Lưu thay đổi" và "Hủy".

**2. Bảo Mật (`#securitySection`):**

- Form đổi mật khẩu: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
- Có nút con mắt (`.password-toggle`) để ẩn/hiện mật khẩu.

**3. Đơn Hàng (`#ordersSection`):**

- Hiện tại hiển thị trạng thái trống (Empty State) vì chưa tích hợp lịch sử đơn hàng thực tế.

**4. Địa Chỉ (`#addressesSection`):**

- Danh sách địa chỉ (`#addressesList`): Được render bằng JS.
- Nút "Thêm địa chỉ mới": Mở modal.

### 1.3. Modal Thêm/Sửa Địa Chỉ (Dòng 275-319)

Popup form để nhập thông tin địa chỉ giao hàng (Tên, SĐT, Địa chỉ, Thành phố...).

---

## 2. Định Dạng Giao Diện (`css/profile.css`)

### 2.1. Layout & Responsive

- `.profile-layout`: Sử dụng Grid `280px 1fr` cho desktop.
- **Responsive:**
  - Tablet: `240px 1fr`.
  - Mobile: Chuyển sang 1 cột (`1fr`), Sidebar đẩy xuống dưới hoặc lên trên tùy thiết kế (ở đây dùng Flexbox order để đảo vị trí nếu cần, hoặc chồng lên nhau).
  - Navigation trên mobile chuyển thành thanh trượt ngang (`overflow-x: auto`).

### 2.2. Avatar Styles

- `.profile-avatar-large`: Avatar tròn kích thước 120px.
- `.avatar-edit-btn`: Nút camera nhỏ nằm đè lên góc avatar (dùng `position: absolute`).

### 2.3. Forms

- Input/Select được style thống nhất với border, padding và hiệu ứng focus (highlight màu primary).
- `.password-input-wrapper`: Wrapper tương đối (`relative`) để đặt nút toggle password (`absolute`) vào bên phải input.

### 2.4. Address Card

- Card hiển thị từng địa chỉ, có border và hiệu ứng hover.
- `.address-card.default`: Style khác biệt (nền xanh nhạt) cho địa chỉ mặc định.

---

## 3. Logic Xử Lý (`js/profile.js`)

### 3.1. Authentication & Data Loading

- **`checkAuthAndLoadData`:**
  - Kiểm tra login bằng Firebase Auth.
  - Nếu chưa login -> Chuyển về `login.html`.
  - Nếu đã login -> Lấy dữ liệu từ Firestore (`users/{uid}`). Nếu chưa có doc, tạo doc mới với data mặc định.
  - Gọi `updateProfileUI` (header/sidebar) và `loadProfileData` (điền vào form).

### 3.2. Chuyển Tab (Navigation)

- **`setupProfileNavigation`:** Bắt sự kiện click vào menu sidebar. Ẩn tất cả section, chỉ hiện section có ID tương ứng (`data-section`).

### 3.3. Cập Nhật Thông Tin (`setupProfileForm`)

- Lấy value từ các input (Name, Phone, Bio...).
- **Validate:** Kiểm tra tên trống, định dạng SĐT.
- **Save:**
  - Update `displayName` trên Firebase Auth.
  - Update document trong Firestore (`updateDoc`).
  - Cập nhật lại UI và biến cục bộ `userData`.

### 3.4. Đổi Mật Khẩu (`setupPasswordForm`)

- Yêu cầu nhập mật khẩu cũ để xác thực lại (`reauthenticateWithCredential`).
- Kiểm tra mật khẩu mới (độ dài, trùng khớp).
- Gọi `updatePassword` của Firebase.

### 3.5. Quản Lý Địa Chỉ

- **Load (`loadAddresses`):** Render HTML từ mảng `userData.addresses`.
- **Thêm/Sửa:** Sử dụng Modal. Khi submit form:
  - Nếu là thêm mới: Push vào mảng, nếu là địa chỉ đầu tiên thì set làm mặc định.
  - Nếu là sửa: Update tại index tương ứng.
  - Lưu mảng mới lên Firestore.
- **Xóa:** Filter bỏ địa chỉ tại index đã chọn và cập nhật Firestore.

### 3.6. Các chức năng khác

- **Password Toggle:** Click icon mắt để chuyển type `password` <-> `text`.
- **Header:** Logic hiển thị user/cart tương tự trang chủ.
- **Toast Notification:** Hàm `showSuccess`/`showError` hiển thị thông báo góc màn hình.

---

**Tổng kết:** Trang Profile tập trung vào việc tương tác sâu với dữ liệu người dùng (User Data) trên Firebase Firestore, bao gồm các thao tác CRUD (Create, Read, Update, Delete) cho thông tin cá nhân và địa chỉ.
