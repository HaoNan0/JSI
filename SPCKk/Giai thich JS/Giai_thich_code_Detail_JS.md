# Giải Thích Chi Tiết Code `detail.js`

File `js/detail.js` chịu trách nhiệm xử lý toàn bộ logic cho trang Chi tiết sản phẩm (`detail.html`), bao gồm việc tải dữ liệu sản phẩm từ Firestore, hiển thị hình ảnh (gallery), sản phẩm liên quan và tính năng "Thêm vào giỏ hàng".

---

## 1. Import & Khai Báo Biến (Dòng 7-13)

```javascript
import { auth, db } from "./firebase-config.js"
import { ... } from "firebase-firestore.js"

let currentProduct = null
let relatedProducts = []
```

- Import `auth` và `db` để tương tác với Firebase.
- **`currentProduct`**: Biến toàn cục lưu trữ thông tin sản phẩm đang xem.
- **`relatedProducts`**: Biến lưu danh sách sản phẩm liên quan.

---

## 2. Tải Dữ Liệu Từ Firestore

### 2.1. `loadProductFromFirestore(productId)` (Dòng 16-34)

- Kết nối tới collection `products`, tìm document theo `productId`.
- **Chuẩn hóa dữ liệu:**
  - Xử lý hình ảnh: Nếu data cũ chỉ có `image` (string), chuyển thành mảng `images` để dùng cho Gallery.
  - Xử lý mô tả: Tách `shortDesc` và `fullDesc`.
  - Tính trạng thái `inStock` (Còn hàng hay không).

### 2.2. `fetchRelatedProducts(excludeId)` (Dòng 37-48)

- Lấy toàn bộ sản phẩm (trong thực tế nên query theo `category` để tối ưu).
- Loại trừ sản phẩm đang xem (`excludeId`).
- Lấy 3 sản phẩm làm "Sản phẩm liên quan".

---

## 3. Hiển Thị Giao Diện Chính (`loadProductDetail`) (Dòng 51-119)

Hàm này chạy ngay khi trang web tải xong (`window.onload`).

1.  **Lấy ID từ URL:** `new URLSearchParams(window.location.search).get("id")`.
    - Nếu không có ID -> Chuyển hướng về trang chủ.
2.  **Tải dữ liệu:** Gọi `loadProductFromFirestore`.
    - Nếu không tìm thấy sản phẩm -> Hiện thông báo lỗi.
3.  **Render UI:**
    - Gọi `renderGallery` để hiển thị ảnh.
    - Điền thông tin: Tên, Giá, Mô tả ngắn/dài, Đánh giá (Sao).
    - Hiển thị trạng thái kho (Còn hàng/Hết hàng).
    - Hiển thị phần "Tiết kiệm" nếu có giá khuyến mãi.
4.  **Thiết lập tính năng:**
    - Gọi `renderSpecs` (Bảng thông số kỹ thuật).
    - Gọi `renderRelatedProducts`.
    - Gắn sự kiện cho các nút (Accordion, chọn số lượng, thêm vào giỏ).

---

## 4. Các Tính Năng Giao Diện (UI Features)

### 4.1. Gallery Ảnh (`renderGallery` & `selectImage`) (Dòng 122-149)

- Hiển thị ảnh lớn (`#galleryMain`) và danh sách ảnh nhỏ (`thumbnails`).
- Khi click thumbnail -> Đổi ảnh lớn và cập nhật class `active` cho thumbnail đó.

### 4.2. Bảng Thông Số (`renderSpecs`) (Dòng 152-169)

- Duyệt qua mảng `specs` (Key-Value) để tạo các dòng `<tr>` cho bảng thông số kỹ thuật.

### 4.3. Sản Phẩm Liên Quan (`renderRelatedProducts`) (Dòng 172-197)

- Tạo danh sách card sản phẩm ở cuối trang.
- Mỗi card có nút "Thêm vào giỏ" riêng và sự kiện click để chuyển sang trang chi tiết của sản phẩm đó.

### 4.4. Accordion (`setupAccordion`) (Dòng 200-209)

- Xử lý hiệu ứng đóng/mở cho các mục: "Mô tả chi tiết", "Thông số kỹ thuật", "Đánh giá".
- Chỉ cho phép mở 1 mục tại một thời điểm (khi click mục mới, mục cũ sẽ đóng lại).

### 4.5. Bộ Chọn Số Lượng (`setupQuantitySelector`) (Dòng 212-226)

- Xử lý nút Tăng (+) và Giảm (-) cạnh nút "Thêm vào giỏ".
- Giới hạn số lượng min = 1, max = 100.

---

## 5. Thêm Vào Giỏ Hàng (`addToCart`) (Dòng 240-265)

Đây là tính năng quan trọng nhất của trang.

1.  **Xác định sản phẩm:** Có thể là sản phẩm chính (`currentProduct`) hoặc sản phẩm liên quan (khi click nút ở mục Related).
2.  **Lấy giỏ hàng cũ:** Từ `localStorage`.
3.  **Kiểm tra tồn tại:**
    - Nếu sản phẩm đã có trong giỏ -> Cộng dồn số lượng.
    - Nếu chưa -> Thêm mới vào mảng.
4.  **Lưu & Cập nhật:**
    - Lưu lại vào `localStorage`.
    - Gọi `updateCartBadge` để số trên icon giỏ hàng nhảy ngay lập tức.
    - Hiện thông báo (`alert`) xác nhận.

---

## 6. Authentication & Header (Dòng 279-341)

- Các hàm `checkAuthStatus`, `setupDropdownMenu`, `setupCartIcon`, `setupHamburgerMenu` tương tự như các file JS khác, đảm bảo Header hoạt động đúng (Login/Logout, Menu, Cart items).
