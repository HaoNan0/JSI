# Giải Thích Chi Tiết Code Trang Giỏ Hàng (Cart Page)

Tài liệu này giải thích chi tiết từng phần code của trang giỏ hàng (`cart.html`), bao gồm cấu trúc giao diện (HTML), định dạng (CSS) và logic xử lý (JS).

---

## 1. Cấu Trúc Giao Diện (`cart.html`)

Trang giỏ hàng hiển thị danh sách sản phẩm người dùng đã chọn và tổng tiền cần thanh toán.

### 1.1. Phần `head` (Dòng 1-12)

- **CSS Links:**
  - `css/styles.css`: Style chung.
  - `css/home.css`: Style cho Header/Footer.
  - `css/cart.css`: Style layout riêng cho giỏ hàng.

### 1.2. Cart Section (Dòng 67-140)

Container chính `.cart-section` chứa nội dung giỏ hàng, được chia thành 2 cột (`.cart-layout`):

#### A. Cột Trái: Danh Sách Sản Phẩm (`.cart-items-container`)

- **Empty State (`#emptyCart`):** Hiển thị icon và thông báo khi giỏ hàng trống. Có nút "Khám Phá Sản Phẩm" để quay lại trang chủ.
- **Cart List (`#cartItemsList`):** Container rỗng, sẽ được JavaScript điền các sản phẩm vào (render).

#### B. Cột Phải: Tóm Tắt Đơn Hàng (`.cart-summary`)

- **Subtotal:** Tạm tính (Tổng giá trị sản phẩm).
- **Shipping:** Phí vận chuyển (Mặc định 30.000đ).
- **Total:** Tổng cộng cần thanh toán.
- **Checkout Button:** Nút "Tiến Hành Thanh Toán".
- **Continue Shopping:** Link quay lại mua sắm tiếp.

---

## 2. Định Dạng Giao Diện (`css/cart.css`)

### 2.1. Layout Grid

- `.cart-layout`: Sử dụng CSS Grid `1fr 400px` để chia: cột trái chiếm phần lớn, cột phải cố định 400px.
- **Responsive:** Trên mobile/tablet (`max-width: 1024px`), chuyển về 1 cột (`1fr`), sidebar summary sẽ nằm dưới danh sách sản phẩm.

### 2.2. Cart Item Styling

- Mỗi sản phẩm là một card (`.cart-item`) nằm ngang.
- **Ảnh:** Kích thước cố định 120x120px.
- **Thông tin:** Tên và giá nằm giữa.
- **Actions:** Bộ chọn số lượng (Quantity Selector) và nút Xóa (Remove) nằm bên phải.

### 2.3. Sticky Summary

- `.cart-summary`: Có `position: sticky; top: 100px`.
- Khi người dùng cuộn xem danh sách sản phẩm dài, bảng tóm tắt tiền sẽ luôn trượt theo để người dùng dễ theo dõi và thanh toán.

---

## 3. Logic Xử Lý (`js/cart.js`)

Logic quản lý trạng thái giỏ hàng (Cart State) dựa hoàn toàn vào `localStorage` của trình duyệt.

### 3.1. Khởi Tạo & Load Cart (`loadCart`)

- Đọc dữ liệu từ `localStorage` (key `cart`).
- **Validate:** Lọc bỏ các item lỗi (thiếu tên, giá, hoặc số lượng sai).
- Gọi `renderCart` để hiển thị.
- Cập nhật số lượng trên icon giỏ hàng (`updateCartBadge`).

### 3.2. Hiển Thị (`renderCart`)

1.  **Kiểm tra rỗng:** Nếu array `cart` trống -> Hiện Empty State, ẩn danh sách.
2.  **Render Items:** Duyệt qua mảng `cart`, tạo HTML cho từng sản phẩm:
    - Ảnh, Tên, Giá (format VND).
    - Input số lượng với nút +/- có sự kiện `updateQuantityByProductId`.
    - Nút xóa có sự kiện `removeItemByProductId`.
3.  Gọi `updateSummary` để tính tiền.

### 3.3. Cập Nhật Số Lượng (`updateQuantityByProductId`)

- Tìm sản phẩm trong mảng `cart` bằng `productId`.
- Tăng/giảm số lượng (tối thiểu là 1).
- Lưu lại vào `localStorage` (`saveCart`) và render lại giao diện.

### 3.4. Xóa Sản Phẩm (`removeItemByProductId`)

- Hiển thị Popup xác nhận (`confirm`).
- Nếu đồng ý: Cắt bỏ item khỏi mảng `cart`.
- Lưu `localStorage`, render lại và hiện thông báo Toast ("Đã xóa...").

### 3.5. Tính Toán Tổng Tiền (`updateSummary`)

- **Subtotal:** Duyệt mảng `cart`, tính tổng `price * quantity`.
- **Shipping:** 30.000đ (nếu giỏ hàng có hàng), 0đ (nếu rỗng).
- **Total:** Subtotal + Shipping.
- Cập nhật text hiển thị lên các element HTML tương ứng.

### 3.6. Thanh Toán (`handleCheckout`)

- Kiểm tra đăng nhập (`onAuthStateChanged`):
  - **Chưa đăng nhập:** Hiện thông báo lỗi, chuyển hướng sang `login.html`.
  - **Đã đăng nhập:** Tính tổng tiền và hiện Alert thông báo thanh toán (Tính năng thanh toán thực tế chưa tích hợp).

---

**Tổng kết:** Trang Giỏ hàng là nơi quản lý trạng thái mua sắm của người dùng. Dữ liệu được lưu client-side (trình duyệt) giúp thao tác nhanh và giữ được giỏ hàng ngay cả khi tắt tab, chỉ khi thanh toán mới yêu cầu đăng nhập.
