# Giải Thích Chi Tiết Code Seed Sản Phẩm (Seed Products)

Tài liệu này giải thích chi tiết code của tool "Seed Products" (`seed-products.html` và `js/seed-products.js`). Đây là công cụ dùng để **tạo dữ liệu mẫu** ban đầu cho Firestore Database, giúp bạn không phải nhập tay từng sản phẩm.

---

## 1. Giao Diện (`seed-products.html`)

Đây là một trang HTML đơn giản, không có CSS phức tạp, chỉ dùng để chạy script.

### 1.1. Cấu Trúc

- **CSS Inline (Dòng 7-16):**
  - Style đơn giản cho status box (Loading: Vàng, Success: Xanh, Error: Đỏ).
- **Body:**
  - Tiêu đề & Hướng dẫn.
  - `<div id="status">`: Khu vực hiển thị trạng thái (Đang chạy, Thành công, hoặc Lỗi).
  - **Script Module (Dòng 22-41):**
    - Import hàm `runSeed` từ `js/seed-products.js`.
    - Gọi `await runSeed()` ngay khi trang load.
    - Cập nhật UI dựa trên kết quả trả về (`result`).

---

## 2. Logic Xử Lý (`js/seed-products.js`)

File này chứa dữ liệu mẫu và logic đẩy data lên Firebase.

### 2.1. Dữ Liệu Mẫu (`SEED_PRODUCTS`)

- Là một mảng (Array) chứa các object sản phẩm.
- Mỗi sản phẩm có đầy đủ các trường:
  - `name`: Tên sản phẩm.
  - `price` & `originalPrice`: Giá bán & Giá gốc.
  - `rating` & `reviews`: Đánh giá giả lập.
  - `image` & `images`: Link ảnh (dùng Unsplash).
  - `specs`: Thông số kỹ thuật (Array các object key-value).
  - `category`, `stock`, `description`...

### 2.2. Hàm Helper (`toFirestoreProduct`)

- Chuẩn hóa dữ liệu trước khi lưu.
- Thêm `createdAt` và `updatedAt` là thời gian hiện tại (`new Date().toISOString()`).

### 2.3. Hàm Chính (`runSeed`)

1.  **Kiểm tra dữ liệu cũ:**
    - `getDocs(collection(db, "products"))`: Lấy tất cả sản phẩm hiện có.
    - Nếu `snapshot.size > 0`: Trả về `skipped: true`. **An toàn:** Không bao giờ ghi đè hoặc tạo trùng lặp nếu database đã có dữ liệu.
2.  **Thêm dữ liệu mới (Nếu rỗng):**
    - Duyệt qua mảng `SEED_PRODUCTS`.
    - Gọi `addDoc(col, data)`: Thêm từng sản phẩm vào Firestore. Firestore sẽ tự sinh ID ngẫu nhiên.
    - Lưu lại danh sách ID vừa tạo (`created.push`).
3.  **Trả về kết quả:**
    - Thông báo số lượng sản phẩm đã thêm thành công.

---

## 3. Cách Sử Dụng

1.  Đảm bảo bạn đã cấu hình Firebase trong `js/firebase-config.js` (nếu chưa, xem file `Giai_thich_code_Trang_Chu.md` để biết thêm).
2.  Mở file `seed-products.html` bằng Live Server.
3.  Chờ vài giây:
    - Nếu màn hình hiện **Xanh (Success)**: Dữ liệu mẫu đã được thêm vào Firestore.
    - Nếu màn hình hiện **Xanh dương nhạt (Skipped)**: Database đã có dữ liệu rồi, tool không làm gì cả.
4.  Sau khi seed xong, bạn có thể quay lại trang chủ (`index.html`) để thấy danh sách sản phẩm hiển thị lên.

---

**Tại sao cần tool này?**
Khi phát triển ứng dụng, việc nhập tay 20-30 sản phẩm vào Firestore Console rất mất thời gian. File này giúp bạn khởi tạo database chỉ với 1 cú click chuột (hoặc 1 lần load trang), rất tiện lợi cho việc test và demo.
