/* ============================================
   DETAIL.JS
   Sản phẩm chi tiết: gallery, info, accordion
   ============================================ */

// MOCK PRODUCT DATA
// Lý do: Chi tiết sản phẩm đầy đủ với specs, description
const mockProductDetail = {
  id: 1,
  name: "Laptop Gaming Pro - RTX 4090",
  price: 25000000,
  originalPrice: 29000000,
  rating: 4.5,
  reviews: 128,
  inStock: true,
  images: [
    "/modern-laptop.png",
    "/laptop-2.png",
    "/laptop-3.jpg",
    "/laptop-4.jpg",
  ],
  shortDesc: "Laptop gaming mạnh mẽ với card đồ họa RTX 4090, CPU Intel i9",
  fullDesc: `
    Laptop Gaming Pro là sự kết hợp hoàn hảo giữa hiệu suất và thiết kế.
    Với card đồ họa RTX 4090, CPU Intel Core i9 mới nhất, bạn có thể chạy
    bất kỳ game nào ở cấu hình ultra.
    
    Thiết kế mỏng gọn, pin lâu 8 tiếng, màn hình 144Hz IPS.
  `,
  specs: [
    { key: "CPU", value: "Intel Core i9-13900K" },
    { key: "GPU", value: "NVIDIA GeForce RTX 4090" },
    { key: "RAM", value: "32GB DDR5" },
    { key: "Storage", value: "1TB NVMe SSD" },
    { key: "Display", value: '17.3" 144Hz IPS' },
    { key: "Battery", value: "8 hours" },
  ],
  relatedProducts: [
    {
      id: 2,
      name: "Tai Nghe Wireless Gaming",
      price: 2500000,
      image: "/diverse-people-listening-headphones.png",
    },
    {
      id: 5,
      name: "Mouse Gaming Mechanical",
      price: 1500000,
      image: "/field-mouse.png",
    },
  ],
}

// LOAD PRODUCT DETAIL
// Lý do: Lấy product ID từ URL params
// URL format: detail.html?id=1
function loadProductDetail() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  // Mock: Ngoài thực tế sẽ fetch từ API
  const product = mockProductDetail

  // RENDER GALLERY
  renderGallery(product.images)

  // RENDER PRODUCT INFO
  document.getElementById("productName").textContent = product.name
  document.getElementById("productDescription").textContent = product.shortDesc
  document.getElementById("productPrice").textContent = `₫${product.price.toLocaleString("vi-VN")}`
  document.getElementById("productFullDesc").textContent = product.fullDesc
  document.getElementById("productRating").textContent = "⭐".repeat(Math.floor(product.rating)) + " " + product.rating
  document.getElementById("reviewCount").textContent = `(${product.reviews} đánh giá)`

  // RENDER SPECS TABLE
  renderSpecs(product.specs)

  // RENDER RELATED PRODUCTS
  renderRelatedProducts(product.relatedProducts)

  // SETUP EVENT LISTENERS
  setupAccordion()
  setupQuantitySelector()
  setupAddToCart(productId || 1)
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
  const images = mockProductDetail.images
  const mainImage = document.getElementById("galleryMain")
  const thumbnails = document.querySelectorAll(".thumbnail")

  mainImage.src = images[index]
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
  container.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₫${product.price.toLocaleString("vi-VN")}</p>
        <button class="btn btn-primary" onclick="addToCart(${product.id}, 1)">
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
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`Đã thêm ${quantity} sản phẩm vào giỏ!`)
}

// INITIALIZE
window.addEventListener("load", loadProductDetail)
