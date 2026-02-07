# Giải Thích Chi Tiết Code `cart.js`

File `js/cart.js` xử lý toàn bộ logic của Giỏ hàng: từ việc lưu trữ, hiển thị, cập nhật số lượng cho đến quy trình thanh toán.

---

## 1. Quản Lý Dữ Liệu Giỏ Hàng (Cart State)

### 1.1. Khai báo & Load Dữ Liệu (Dòng 10-60)

- **Biến `cart`:** Mảng toàn cục chứa danh sách sản phẩm.
- **Hàm `loadCart()`:**
  - Lấy chuỗi JSON từ `localStorage` (key là `"cart"`).
  - `JSON.parse` để chuyển về mảng object.
  - **Clean up:** Lọc bỏ các sản phẩm lỗi (thiếu giá, thiếu tên...). Đây là bước quan trọng để tránh giỏ hàng bị lỗi khi dữ liệu cũ không tương thích.
  - Nếu mảng sau khi lọc ngắn hơn mảng ban đầu -> Gọi `saveCart()` để cập nhật lại `localStorage` cho sạch.

### 1.2. Lưu Dữ Liệu (`saveCart`) (Dòng 62-73)

- `JSON.stringify(cart)`: Chuyển mảng thành chuỗi.
- `localStorage.setItem`: Lưu vào trình duyệt.
- Gọi `updateCartBadge()` để số cập nhật số lượng trên icon giỏ hàng ngay lập tức.

---

## 2. Hiển Thị Giao Diện (`renderCart`) (Dòng 97-185)

Hàm này chịu trách nhiệm biến dữ liệu trong mảng `cart` thành HTML để người dùng nhìn thấy.

1.  **Kiểm tra Rỗng:** Nếu giỏ hàng không có gì -> Hiện thông báo "Giỏ hàng trống" và nút quay lại trang chủ.
2.  **Duyệt Mảng (Map):** Tạo HTML cho từng sản phẩm:
    - Ảnh sản phẩm (có cơ chế `onerror` để hiện ảnh mặc định nếu link ảnh chết).
    - Tên, Giá (format VND).
    - **Bộ chỉnh số lượng:** Nút Tăng (+), Giảm (-).
    - **Nút Xóa:** Icon thùng rác.
3.  **Security (Bảo mật):** Sử dụng các hàm `escapeHtml` và `escapeJsString` để ngăn chặn tấn công XSS (Cross-Site Scripting) khi hiển thị tên sản phẩm hoặc gán ID vào sự kiện onclick.

---

## 3. Các Thao Tác Người Dùng

### 3.1. Cập Nhật Số Lượng (`updateQuantityByProductId`) (Dòng 205-224)

- Tìm sản phẩm theo `productId` (ID duy nhất).
- Thay đổi số lượng (+1 hoặc -1).
- Đảm bảo số lượng tối thiểu là 1 (`Math.max(1, ...)`).
- Lưu lại và render lại giao diện.

### 3.2. Xóa Sản Phẩm (`removeItemByProductId`) (Dòng 251-280)

- Tìm sản phẩm cần xóa.
- Hiện Popup xác nhận (`confirm`).
- Nếu đồng ý -> Cắt (`splice`) khỏi mảng `cart`.
- Lưu và render lại.
- Hiện thông báo Toast ("Đã xóa thành công").

### 3.3. Tính Toán Tổng Tiền (`updateSummary`) (Dòng 282-320)

- **Subtotal (Tạm tính):** Tổng `giá * số lượng` của tất cả sản phẩm.
- **Shipping (Vận chuyển):** Phí cố định 30.000đ (chỉ tính khi có hàng).
- **Total (Tổng cộng):** Subtotal + Shipping.
- Cập nhật con số lên giao diện.

---

## 4. Thanh Toán (`handleCheckout`) (Dòng 322-369)

Quy trình xử lý khi bấm nút "Thanh toán":

1.  **Kiểm tra giỏ hàng:** Nếu trống -> Báo lỗi.
2.  **Kiểm tra Đăng nhập (`onAuthStateChanged`):**
    - **Chưa đăng nhập:** Báo lỗi "Vui lòng đăng nhập" -> Chuyển hướng sang trang Login sau 1.5 giây.
    - **Đã đăng nhập:**
      - Tính lại tổng tiền lần cuối.
      - Hiện thông báo xác nhận thanh toán (Alert).
      - _Lưu ý: Hiện tại code đang chỉ hiển thị thông báo giả lập, chưa tích hợp cổng thanh toán thực tế._

---

## 5. Các Tiện Ích Khác

- **`showToast` (Dòng 371-410):** Hàm tạo thông báo nổi góc màn hình (Xanh/Đỏ), thay thế cho `alert` nhàm chán.
- **`checkAuthStatus` (Dòng 412-469):**
  - Kiểm tra trạng thái đăng nhập để ẩn/hiện nút Login/Register.
  - Nếu đã đăng nhập -> Hiện Avatar và Tên người dùng.
  - Xử lý Đăng xuất (`signOut`).

---

## 6. Khởi Tạo (`initializePage`) (Dòng 537-566)

- Chạy khi trang web tải xong (`DOMContentLoaded`).
- Gọi một loạt các hàm setup: `loadCart`, `checkAuthStatus`, gắn sự kiện cho nút Menu Mobile, nút Checkout, v.v.
