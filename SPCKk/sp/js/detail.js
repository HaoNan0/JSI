/* ============================================
   DETAIL.JS
   Sản phẩm chi tiết: gallery, info, accordion
   ============================================ */

// PRODUCT DETAILS DATABASE
// Lý do: Chi tiết sản phẩm đầy đủ với specs, description cho mỗi ID
// Map ID → Full product details để match với products từ home.js
const productDetails = {
  1: {
    id: 1,
    name: "Laptop Gaming Pro",
    price: 25000000,
    originalPrice: 29000000,
    rating: 4.5,
    reviews: 128,
    inStock: true,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
    ],
    shortDesc: "Laptop gaming mạnh mẽ với card đồ họa cao cấp, CPU Intel i9",
    fullDesc: `
      Laptop Gaming Pro là sự kết hợp hoàn hảo giữa hiệu suất và thiết kế.
      Với card đồ họa mạnh mẽ, CPU Intel Core i9 mới nhất, bạn có thể chạy
      bất kỳ game nào ở cấu hình ultra.
      
      Thiết kế mỏng gọn, pin lâu 8 tiếng, màn hình 144Hz IPS.
    `,
    specs: [
      { key: "CPU", value: "Intel Core i9-13900K" },
      { key: "GPU", value: "NVIDIA GeForce RTX cao cấp" },
      { key: "RAM", value: "32GB DDR5" },
      { key: "Storage", value: "1TB NVMe SSD" },
      { key: "Display", value: '17.3" 144Hz IPS' },
      { key: "Battery", value: "8 hours" },
    ],
  },
  2: {
    id: 2,
    name: "Tai Nghe Wireless",
    price: 2500000,
    originalPrice: 3000000,
    rating: 4.2,
    reviews: 256,
    inStock: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
    ],
    shortDesc: "Tai nghe không dây chất lượng cao với âm thanh sống động",
    fullDesc: `
      Tai nghe wireless với công nghệ Bluetooth tiên tiến, mang lại trải nghiệm
      âm thanh tuyệt vời. Pin lâu 30 giờ, chống ồn chủ động, thiết kế thoải mái.
    `,
    specs: [
      { key: "Kết nối", value: "Bluetooth 5.0" },
      { key: "Pin", value: "30 giờ" },
      { key: "Chống ồn", value: "Active Noise Cancelling" },
      { key: "Trọng lượng", value: "250g" },
    ],
  },
  3: {
    id: 3,
    name: "Smartphone X",
    price: 15000000,
    originalPrice: 18000000,
    rating: 4.8,
    reviews: 512,
    inStock: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop",
    ],
    shortDesc: "Smartphone flagship với camera 108MP và màn hình AMOLED",
    fullDesc: `
      Smartphone X với hiệu năng mạnh mẽ, camera chuyên nghiệp 108MP,
      màn hình AMOLED 120Hz sắc nét. Pin 5000mAh sạc nhanh 67W.
    `,
    specs: [
      { key: "Màn hình", value: "6.7 inch AMOLED 120Hz" },
      { key: "Camera", value: "108MP chính + 12MP ultra-wide" },
      { key: "CPU", value: "Snapdragon 8 Gen 2" },
      { key: "RAM", value: "12GB" },
      { key: "Storage", value: "256GB" },
      { key: "Pin", value: "5000mAh" },
    ],
  },
  4: {
    id: 4,
    name: "Màn Hình 4K",
    price: 8500000,
    originalPrice: 10000000,
    rating: 4.3,
    reviews: 89,
    inStock: false,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop",
    ],
    shortDesc: "Màn hình 4K Ultra HD 27 inch cho công việc và giải trí",
    fullDesc: `
      Màn hình 4K 27 inch với độ phân giải Ultra HD, màu sắc chính xác.
      Phù hợp cho thiết kế đồ họa, xem phim và chơi game.
    `,
    specs: [
      { key: "Kích thước", value: "27 inch" },
      { key: "Độ phân giải", value: "3840 x 2160 (4K UHD)" },
      { key: "Panel", value: "IPS" },
      { key: "Tần số quét", value: "60Hz" },
      { key: "Kết nối", value: "HDMI, DisplayPort, USB-C" },
    ],
  },
  5: {
    id: 5,
    name: "Bàn Phím Cơ RGB",
    price: 3200000,
    originalPrice: 4000000,
    rating: 4.6,
    reviews: 342,
    inStock: true,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
    ],
    shortDesc: "Bàn phím cơ học với đèn LED RGB và switch Cherry MX",
    fullDesc: `
      Bàn phím cơ học chuyên nghiệp với switch Cherry MX, đèn LED RGB đẹp mắt.
      Thiết kế chắc chắn, phù hợp cho gaming và làm việc.
    `,
    specs: [
      { key: "Layout", value: "Full-size 104 phím" },
      { key: "Switch", value: "Cherry MX Red" },
      { key: "Đèn LED", value: "RGB có thể tùy chỉnh" },
      { key: "Kết nối", value: "USB-C" },
    ],
  },
  6: {
    id: 6,
    name: "Chuột Gaming Wireless",
    price: 1800000,
    originalPrice: 2200000,
    rating: 4.4,
    reviews: 215,
    inStock: true,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=800&fit=crop",
    ],
    shortDesc: "Chuột gaming không dây với độ chính xác cao và độ trễ thấp",
    fullDesc: `
      Chuột gaming wireless với sensor 16000 DPI, độ trễ 1ms.
      Pin lâu 50 giờ, thiết kế ergonomic cho gaming marathon.
    `,
    specs: [
      { key: "DPI", value: "16000 DPI" },
      { key: "Độ trễ", value: "1ms" },
      { key: "Pin", value: "50 giờ" },
      { key: "Nút bấm", value: "6 nút có thể lập trình" },
    ],
  },
  7: {
    id: 7,
    name: "Loa Bluetooth",
    price: 4500000,
    originalPrice: 5500000,
    rating: 4.7,
    reviews: 178,
    inStock: true,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
    ],
    shortDesc: "Loa Bluetooth công suất lớn với âm thanh 360 độ",
    fullDesc: `
      Loa Bluetooth với công suất 60W, âm thanh 360 độ sống động.
      Chống nước IPX7, pin 20 giờ, kết nối đa điểm.
    `,
    specs: [
      { key: "Công suất", value: "60W" },
      { key: "Bluetooth", value: "5.0" },
      { key: "Pin", value: "20 giờ" },
      { key: "Chống nước", value: "IPX7" },
      { key: "Âm thanh", value: "360 độ" },
    ],
  },
  8: {
    id: 8,
    name: "Webcam HD 1080p",
    price: 2800000,
    originalPrice: 3500000,
    rating: 4.1,
    reviews: 94,
    inStock: true,
    image: "https://images.unsplash.com/photo-1587825147138-346c228c0ac5?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587825147138-346c228c0ac5?w=800&h=800&fit=crop",
    ],
    shortDesc: "Webcam HD 1080p với microphone tích hợp và autofocus",
    fullDesc: `
      Webcam HD 1080p 60fps với autofocus, microphone tích hợp chống ồn.
      Phù hợp cho hội nghị trực tuyến và streaming.
    `,
    specs: [
      { key: "Độ phân giải", value: "1080p 60fps" },
      { key: "Microphone", value: "Tích hợp, chống ồn" },
      { key: "Autofocus", value: "Có" },
      { key: "Kết nối", value: "USB 3.0" },
    ],
  },
  9: {
    id: 9,
    name: "Ổ Cứng SSD 1TB",
    price: 5200000,
    originalPrice: 6000000,
    rating: 4.9,
    reviews: 456,
    inStock: true,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop",
    ],
    shortDesc: "SSD NVMe 1TB tốc độ đọc/ghi siêu nhanh",
    fullDesc: `
      SSD NVMe 1TB với tốc độ đọc 3500MB/s, ghi 3000MB/s.
      Tăng tốc độ máy tính đáng kể, tuổi thọ cao.
    `,
    specs: [
      { key: "Dung lượng", value: "1TB" },
      { key: "Loại", value: "NVMe M.2" },
      { key: "Tốc độ đọc", value: "3500 MB/s" },
      { key: "Tốc độ ghi", value: "3000 MB/s" },
      { key: "Interface", value: "PCIe Gen 3.0 x4" },
    ],
  },
  10: {
    id: 10,
    name: "Camera Action 4K",
    price: 12000000,
    originalPrice: 15000000,
    rating: 4.8,
    reviews: 287,
    inStock: true,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop",
    ],
    shortDesc: "Camera action 4K chống nước cho thể thao mạo hiểm",
    fullDesc: `
      Camera action 4K với chống nước IPX8, chống sốc.
      Quay video 4K 60fps, chụp ảnh 20MP, pin lâu 2 giờ.
    `,
    specs: [
      { key: "Video", value: "4K 60fps" },
      { key: "Ảnh", value: "20MP" },
      { key: "Chống nước", value: "IPX8 (40m)" },
      { key: "Pin", value: "2 giờ" },
      { key: "Kết nối", value: "Wi-Fi, Bluetooth" },
    ],
  },
  11: {
    id: 11,
    name: "Smartwatch Pro",
    price: 6500000,
    originalPrice: 8000000,
    rating: 4.5,
    reviews: 321,
    inStock: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
    ],
    shortDesc: "Smartwatch cao cấp với theo dõi sức khỏe toàn diện",
    fullDesc: `
      Smartwatch Pro với màn hình AMOLED, theo dõi nhịp tim, giấc ngủ.
      Chống nước 5ATM, pin 7 ngày, GPS tích hợp.
    `,
    specs: [
      { key: "Màn hình", value: "1.4 inch AMOLED" },
      { key: "Pin", value: "7 ngày" },
      { key: "Chống nước", value: "5ATM" },
      { key: "GPS", value: "Tích hợp" },
      { key: "Cảm biến", value: "Nhịp tim, SpO2, Gia tốc" },
    ],
  },
  12: {
    id: 12,
    name: "Máy Tính Bảng 10 inch",
    price: 8500000,
    originalPrice: 10000000,
    rating: 4.3,
    reviews: 167,
    inStock: true,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop",
    ],
    shortDesc: "Máy tính bảng 10 inch với bút cảm ứng cho công việc và học tập",
    fullDesc: `
      Máy tính bảng 10 inch với màn hình sắc nét, bút cảm ứng chính xác.
      Pin 12 giờ, hỗ trợ bàn phím rời, phù hợp làm việc di động.
    `,
    specs: [
      { key: "Màn hình", value: "10 inch IPS" },
      { key: "Bút cảm ứng", value: "Có (tùy chọn)" },
      { key: "Pin", value: "12 giờ" },
      { key: "Storage", value: "128GB" },
      { key: "RAM", value: "6GB" },
    ],
  },
}

// Store current product globally for selectImage function
let currentProduct = null

// GET RELATED PRODUCTS
// Lý do: Lấy 3 sản phẩm ngẫu nhiên (không trùng với sản phẩm hiện tại)
function getRelatedProducts(currentId) {
  const allProducts = Object.values(productDetails)
  const related = allProducts
    .filter((p) => p.id !== currentId)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
    }))
  return related
}

// LOAD PRODUCT DETAIL
// Lý do: Lấy product ID từ URL params
// URL format: detail.html?id=1
function loadProductDetail() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  // Parse productId to number
  const id = productId ? parseInt(productId, 10) : 1

  // Find product by ID
  const product = productDetails[id]

  // If product not found, use first product as fallback
  if (!product) {
    console.warn(`Product with ID ${id} not found, using product ID 1`)
    currentProduct = productDetails[1]
  } else {
    currentProduct = product
  }

  // Ensure product has images array (use main image if only single image)
  if (!currentProduct.images || currentProduct.images.length === 0) {
    currentProduct.images = [currentProduct.image]
  }

  // RENDER GALLERY
  renderGallery(currentProduct.images)

  // RENDER PRODUCT INFO
  document.getElementById("productName").textContent = currentProduct.name
  document.getElementById("productDescription").textContent = currentProduct.shortDesc
  document.getElementById("productPrice").textContent = `₫${currentProduct.price.toLocaleString("vi-VN")}`
  document.getElementById("productFullDesc").textContent = currentProduct.fullDesc
  document.getElementById("productRating").textContent = "⭐".repeat(Math.floor(currentProduct.rating)) + " " + currentProduct.rating
  document.getElementById("reviewCount").textContent = `(${currentProduct.reviews} đánh giá)`

  // RENDER STOCK STATUS
  const stockStatus = document.getElementById("stockStatus")
  if (stockStatus) {
    if (currentProduct.inStock) {
      stockStatus.textContent = "Còn hàng"
      stockStatus.className = "stock-status in-stock"
    } else {
      stockStatus.textContent = "Hết hàng"
      stockStatus.className = "stock-status out-of-stock"
    }
  }

  // RENDER SAVE PRICE (if original price exists)
  const savePrice = document.getElementById("savePrice")
  if (savePrice && currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price) {
    const saved = currentProduct.originalPrice - currentProduct.price
    savePrice.textContent = `Tiết kiệm: ₫${saved.toLocaleString("vi-VN")}`
  } else if (savePrice) {
    savePrice.textContent = ""
  }

  // RENDER SPECS TABLE
  renderSpecs(currentProduct.specs)

  // RENDER RELATED PRODUCTS (get related products excluding current)
  const relatedProducts = getRelatedProducts(currentProduct.id)
  renderRelatedProducts(relatedProducts)

  // SETUP EVENT LISTENERS
  setupAccordion()
  setupQuantitySelector()
  setupAddToCart(currentProduct.id)
}

// RENDER GALLERY
// Lý do: Show main image + thumbnails
// Click thumbnail → update main image
function renderGallery(images) {
  const mainImage = document.getElementById("galleryMain")
  const thumbnails = document.getElementById("galleryThumbnails")

  mainImage.src = images[0]

  // RENDER THUMBNAILS
  // Lý do: Map images → HTML buttons
  thumbnails.innerHTML = images
    .map(
      (img, index) => `
    <button class="thumbnail ${index === 0 ? "active" : ""}" 
            onclick="selectImage(${index})">
      <img src="${img}" alt="Thumbnail ${index + 1}">
    </button>
  `,
    )
    .join("")
}

// SELECT IMAGE
// Lý do: Update main image khi click thumbnail
// Add active class để highlight selected
window.selectImage = (index) => {
  if (!currentProduct || !currentProduct.images) return
  
  const images = currentProduct.images
  const mainImage = document.getElementById("galleryMain")
  const thumbnails = document.querySelectorAll(".thumbnail")

  if (mainImage && images[index]) {
    mainImage.src = images[index]
  }
  
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add("active")
    } else {
      thumb.classList.remove("active")
    }
  })
}

// RENDER SPECS TABLE
// Lý do: HTML table cho thông số kỹ thuật
function renderSpecs(specs) {
  const table = document.getElementById("specsTable")
  table.innerHTML = specs
    .map(
      (spec) => `
    <tr>
      <td><strong>${spec.key}</strong></td>
      <td>${spec.value}</td>
    </tr>
  `,
    )
    .join("")
}

// RENDER RELATED PRODUCTS
// Lý do: Gợi ý sản phẩm liên quan ở dưới
function renderRelatedProducts(products) {
  const container = document.getElementById("relatedProducts")
  if (!container) return
  
  container.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" onclick="window.location.href='detail.html?id=${product.id}'">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₫${product.price.toLocaleString("vi-VN")}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${product.id}, 1)">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

// ACCORDION FUNCTIONALITY
// Lý do: Click header để toggle content
// Only 1 accordion open cùng lúc
function setupAccordion() {
  const buttons = document.querySelectorAll(".accordion-header")

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement
      const isActive = item.classList.contains("active")

      // Close all
      document.querySelectorAll(".accordion-item").forEach((el) => {
        el.classList.remove("active")
      })

      // Open current if not active
      if (!isActive) {
        item.classList.add("active")
      }
    })
  })
}

// QUANTITY SELECTOR
// Lý do: Nút +/- để thay đổi số lượng
// Min: 1, Max: 100
function setupQuantitySelector() {
  const decreaseBtn = document.getElementById("qtyDecrease")
  const increaseBtn = document.getElementById("qtyIncrease")
  const quantityInput = document.getElementById("quantity")

  decreaseBtn.addEventListener("click", () => {
    const qty = Number.parseInt(quantityInput.value)
    if (qty > 1) {
      quantityInput.value = qty - 1
    }
  })

  increaseBtn.addEventListener("click", () => {
    const qty = Number.parseInt(quantityInput.value)
    if (qty < 100) {
      quantityInput.value = qty + 1
    }
  })
}

// SETUP ADD TO CART
// Lý do: Click button để thêm vào giỏ
function setupAddToCart(productId) {
  const btn = document.getElementById("addToCartBtn")
  btn.addEventListener("click", () => {
    const quantity = Number.parseInt(document.getElementById("quantity").value)
    addToCart(productId, quantity)
  })
}

// ADD TO CART (shared function)
// Lý do: Thêm item vào cart (localStorage)
function addToCart(productId, quantity = 1) {
  // Find product in productDetails database
  const product = productDetails[productId]
  if (!product) {
    alert("Sản phẩm không tồn tại!")
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'detail.js:556',message:'addToCart: product not found',data:{productId:productId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'detail.js:565',message:'addToCart: updating existing item',data:{productId:productId,quantity:quantity,existingItem:existingItem,hasName:!!existingItem.name,hasPrice:!!existingItem.price,hasImage:!!existingItem.image},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  } else {
    // Save full product details in cart (matching home.js pattern)
    const newItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    }
    cart.push(newItem)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'detail.js:576',message:'addToCart: adding new item with full properties',data:{productId:productId,quantity:quantity,newItem:newItem,hasName:!!newItem.name,hasPrice:!!newItem.price,hasImage:!!newItem.image},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`Đã thêm ${quantity} sản phẩm vào giỏ!`)
}

// Make addToCart global for onclick handlers
window.addToCart = addToCart

// INITIALIZE
window.addEventListener("load", loadProductDetail)
