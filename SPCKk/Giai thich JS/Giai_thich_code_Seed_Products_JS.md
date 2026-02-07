# Giải Thích Chi Tiết Code `seed-products.js`

File `js/seed-products.js` là một script tiện ích dùng để **khởi tạo dữ liệu mẫu** (seed data) cho database Firestore. Nó giúp bạn nhanh chóng có danh sách sản phẩm để test mà không cần nhập tay từng cái một.

---

## 1. Import (Dòng 7-8)

```javascript
import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc } from "firebase-firestore.js";
```

- Import `db` để kết nối Firestore.
- Import các hàm:
  - `collection`: Tham chiếu đến bảng (collection) `products`.
  - `getDocs`: Lấy dữ liệu (để kiểm tra xem đã có dữ liệu chưa).
  - `addDoc`: Thêm document mới (tự động sinh ID).

---

## 2. Dữ Liệu Mẫu (`SEED_PRODUCTS`) (Dòng 10-23)

Đây là một mảng hằng số chứa danh sách các object sản phẩm. Mỗi sản phẩm có đầy đủ các trường thông tin cần thiết:

- `name`: Tên sản phẩm.
- `price`: Giá bán.
- `originalPrice`: Giá gốc (để tính "Tiết kiệm").
- `rating` & `reviews`: Đánh giá giả lập.
- `inStock` & `stock`: Trạng thái kho.
- `category`: Danh mục (Electronics).
- `image`: Link ảnh đại diện (dùng ảnh từ Unsplash).
- `images`: Mảng ảnh cho Gallery.
- `shortDesc` & `fullDesc`: Mô tả ngắn và dài.
- `specs`: Mảng thông số kỹ thuật (CPU, RAM, Pin...).

---

## 3. Helper Function (`toFirestoreProduct`) (Dòng 25-32)

```javascript
function toFirestoreProduct(p) {
  return {
    ...p,
    description: p.description || p.shortDesc || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
```

- Hàm này chuẩn hóa dữ liệu trước khi đẩy lên Firestore.
- Thêm các trường thời gian `createdAt` và `updatedAt` để biết sản phẩm được tạo/sửa khi nào.

---

## 4. Hàm Chạy Seed (`runSeed`) (Dòng 34-47)

Hàm `export async function` chính được gọi từ file HTML (ví dụ: khi bấm nút "Run Seed").

### Logic hoạt động:

1.  **Kiểm tra d liệũ:**
    - `getDocs(col)`: Lấy tất cả sản phẩm hiện có.
    - **Quan trọng:** Nếu `snapshot.size > 0` (đã có sản phẩm) -> **Dừng lại ngay**. Không thêm mới để tránh trùng lặp dữ liệu (duplicate). Trả về thông báo "Skipped".
2.  **Thêm dữ liệu (Nếu bảng rỗng):**
    - Duyệt qua từng sản phẩm trong mảng `SEED_PRODUCTS`.
    - Gọi `addDoc(col, data)` để thêm vào Firestore.
3.  **Trả về kết quả:**
    - Số lượng sản phẩm đã tạo.
    - Danh sách ID và Tên của chúng.

---

**Cách sử dụng:**
File này thường được import vào một file HTML riêng (ví dụ `seed-products.html`). Khi mở file đó trên trình duyệt, script sẽ chạy và đổ dữ liệu vào database của bạn. Đây là bước "Setup" chỉ cần làm một lần.
