# Giải Thích Chi Tiết Code `home.js`

File `js/home.js` là script chính cho Trang Chủ (`index.html`). Nó chịu trách nhiệm tải danh sách sản phẩm từ database, hiển thị lên lưới (grid), xử lý giỏ hàng và các chức năng điều hướng cơ bản.

---

## 1. Import & State (Dòng 7-17)

```javascript
import { auth, db } from "./firebase-config.js"
import { ... } from "firebase-firestore.js"

let products = []
let cart = []
```

- **Import:** Các hàm cần thiết từ Firebase (Auth, Firestore).
- **State:**
  - `products`: Mảng chứa danh sách tất cả sản phẩm tải từ Firestore.
  - `cart`: Mảng chứa các sản phẩm trong giỏ hàng (được đồng bộ với `localStorage`).

---

## 2. Load Dữ Liệu

### 2.1. `loadProductsFromFirestore()` (Dòng 20-33)

- Kết nối tới collection `products` trên Firestore.
- Lấy toàn bộ documents (`getDocs`).
- Map dữ liệu rải rác thành mảng object gọn gàng (bao gồm ID và data).
- Gọi `renderProducts` để hiển thị.
- _Xử lý lỗi:_ Nếu lỗi mạng hoặc database, log ra console và hiển thị mảng rỗng.

### 2.2. `loadCart()` (Dòng 37-47)

- Đọc dữ liệu từ `localStorage` (key `"cart"`).
- `JSON.parse` để chuyển chuỗi thành mảng.
- Gọi `updateCartBadge` để cập nhật số lượng trên icon.

---

## 3. Hiển Thị Sản Phẩm (`renderProducts`) (Dòng 121-157)

Hàm quan trọng nhất để vẽ giao diện:

1.  **Check Rỗng:** Nếu không có sản phẩm nào -> Hiện thông báo và link tới trang Seed data.
2.  **Tạo HTML String:** Duyệt qua mảng `products`. Với mỗi sản phẩm:
    - Tính toán: Rating, Reviews, Trạng thái kho (`inStock`).
    - **Xử lý ID:** Escape các ký tự đặc biệt trong ID để tránh lỗi khi truyền vào hàm `onclick`.
    - **Template Literal:** Tạo thẻ `div.product-card` chứa:
      - Ảnh.
      - Tên, Giá.
      - Đánh giá (Sao).
      - **Nút "Thêm vào giỏ":** Vô hiệu hóa (disable) nếu hết hàng.
      - **Sự kiện Click:**
        - Click vào Card -> `goToDetail(id)` (Chuyển trang).
        - Click vào Nút Mua -> `addToCart(id)` (Thêm giỏ hàng). `event.stopPropagation()` được dùng để ngăn việc click nút mua lại kích hoạt sự kiện click card (dẫn đến chuyển trang ngoài ý muốn).

---

## 4. Chức Năng Giỏ Hàng

### 4.1. `addToCart(productId, quantity)` (Dòng 69-117)

- **Tìm sản phẩm:** Dựa vào ID trong mảng `products`.
- **Kiểm tra kho:** Nếu hết hàng (`!inStock`) -> Báo lỗi `alert`.
- **Cập nhật giỏ:**
  - Nếu đã có -> Tăng số lượng.
  - Nếu chưa -> Thêm mới vào mảng `cart`.
- **Lưu & Thông báo:**
  - `saveCart()`: Lưu vào localStorage.
  - Tạo `div` thông báo (Toast) màu xanh: "Đã thêm... vào giỏ hàng!".

### 4.2. `saveCart()` & `updateCartBadge()` (Dòng 49-64)

- Các hàm phụ trợ để đồng bộ dữ liệu với trình duyệt và giao diện (số trên icon giỏ hàng).

---

## 5. Tiện Ích & Điều Hướng

- **`goToDetail(id)`:** Chuyển hướng sang `detail.html?id=...`. URL này sẽ được trang chi tiết đọc để tải đúng sản phẩm.
- **`checkAuthStatus()`:**
  - Ẩn/Hiện nút Login/Register hoặc Profile tùy trạng thái đăng nhập.
  - Xử lý **Redirect sau khi login:** Nếu URL có tham số `?from=login`, tự động cuộn xuống phần sản phẩm (`#products`) để người dùng mua sắm tiếp.
- **`setupDropdownMenu` & `setupHamburgerMenu`:** Xử lý các menu thả xuống và menu mobile (đóng/mở class `active`).

---

## 6. Khởi Tạo (`window.onload`) (Dòng 271-278)

Khi trang tải xong:

1.  Load giỏ hàng cũ (`loadCart`).
2.  Kiểm tra đăng nhập (`checkAuthStatus`).
3.  Setup các menu điều hướng.
4.  **Quan trọng:** Gọi `loadProductsFromFirestore` để bắt đầu tải và hiển thị sản phẩm.

---

**Tóm lại:** `home.js` đóng vai trò như "Controller" của trang chủ, kết nối dữ liệu (Firestore/LocalStorage) với giao diện người dùng (HTML).
