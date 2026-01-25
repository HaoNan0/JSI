/* ============================================
   DETAIL.JS
   Sản phẩm chi tiết: gallery, info, accordion
   Load product & related from Firestore
   ============================================ */

import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// Store current product globally for selectImage and addToCart
let currentProduct = null
let relatedProducts = []

// LOAD PRODUCT FROM FIRESTORE
async function loadProductFromFirestore(productId) {
  const ref = doc(db, "products", productId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    images: Array.isArray(data.images) && data.images.length
      ? data.images
      : data.image
        ? [data.image]
        : [],
    shortDesc: data.shortDesc || data.description || "",
    fullDesc: data.fullDesc || data.shortDesc || data.description || "",
    specs: Array.isArray(data.specs) ? data.specs : [],
    inStock: data.inStock !== undefined ? data.inStock : (data.stock || 0) > 0,
  }
}

// GET RELATED PRODUCTS FROM FIRESTORE
async function fetchRelatedProducts(excludeId, limit = 3) {
  const snapshot = await getDocs(collection(db, "products"))
  const all = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.id !== excludeId)
  return all.slice(0, limit).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
  }))
}

// LOAD PRODUCT DETAIL
async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  if (!productId) {
    window.location.href = "index.html"
    return
  }

  const product = await loadProductFromFirestore(productId)
  if (!product) {
    document.body.innerHTML = `
      <div style="text-align:center;padding:4rem;font-family:system-ui;">
        <h1>Sản phẩm không tồn tại</h1>
        <p><a href="index.html">← Về trang chủ</a></p>
      </div>
    `
    return
  }

  currentProduct = product
  if (!currentProduct.images || !currentProduct.images.length) {
    currentProduct.images = currentProduct.image ? [currentProduct.image] : []
  }

  relatedProducts = await fetchRelatedProducts(currentProduct.id)

  renderGallery(currentProduct.images)
  document.getElementById("productName").textContent = currentProduct.name
  document.getElementById("productDescription").textContent = currentProduct.shortDesc
  document.getElementById("productPrice").textContent = `₫${(currentProduct.price || 0).toLocaleString("vi-VN")}`
  document.getElementById("productFullDesc").textContent = currentProduct.fullDesc
  const rating = currentProduct.rating ?? 0
  const reviews = currentProduct.reviews ?? 0
  document.getElementById("productRating").textContent = "⭐".repeat(Math.floor(rating)) + " " + rating
  document.getElementById("reviewCount").textContent = `(${reviews} đánh giá)`

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

  const savePrice = document.getElementById("savePrice")
  if (savePrice && currentProduct.originalPrice && currentProduct.originalPrice > (currentProduct.price || 0)) {
    const saved = currentProduct.originalPrice - currentProduct.price
    savePrice.textContent = `Tiết kiệm: ₫${saved.toLocaleString("vi-VN")}`
  } else if (savePrice) {
    savePrice.textContent = ""
  }

  renderSpecs(currentProduct.specs)
  renderRelatedProducts(relatedProducts)

  setupAccordion()
  setupQuantitySelector()
  setupAddToCart()

  const addBtn = document.getElementById("addToCartBtn")
  if (addBtn && !currentProduct.inStock) {
    addBtn.disabled = true
    addBtn.textContent = "Hết hàng"
  }
}

// RENDER GALLERY
function renderGallery(images) {
  const mainImage = document.getElementById("galleryMain")
  const thumbnails = document.getElementById("galleryThumbnails")
  if (!mainImage || !thumbnails || !images || !images.length) return

  mainImage.src = images[0]
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

window.selectImage = (index) => {
  if (!currentProduct || !currentProduct.images) return
  const images = currentProduct.images
  const mainImage = document.getElementById("galleryMain")
  const thumbnails = document.querySelectorAll(".thumbnail")
  if (mainImage && images[index]) mainImage.src = images[index]
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index)
  })
}

// RENDER SPECS
function renderSpecs(specs) {
  const table = document.getElementById("specsTable")
  if (!table) return
  if (!specs || !specs.length) {
    table.innerHTML = "<tr><td>Chưa có thông số.</td></tr>"
    return
  }
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
function renderRelatedProducts(productsToRender) {
  const container = document.getElementById("relatedProducts")
  if (!container) return
  if (!productsToRender || !productsToRender.length) {
    container.innerHTML = ""
    return
  }

  container.innerHTML = productsToRender
    .map((p) => {
      const idEsc = String(p.id).replace(/'/g, "\\'")
      return `<div class="product-card" onclick="window.location.href='detail.html?id=${encodeURIComponent(p.id)}'">
      <div class="product-image">
        <img src="${p.image || ""}" alt="${p.name || ""}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name || ""}</h3>
        <p class="product-price">₫${(p.price || 0).toLocaleString("vi-VN")}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${idEsc}', 1)">
          Thêm vào giỏ
        </button>
      </div>
    </div>`
    })
    .join("")
}

// ACCORDION
function setupAccordion() {
  document.querySelectorAll(".accordion-header").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement
      const isActive = item.classList.contains("active")
      document.querySelectorAll(".accordion-item").forEach((el) => el.classList.remove("active"))
      if (!isActive) item.classList.add("active")
    })
  })
}

// QUANTITY SELECTOR
function setupQuantitySelector() {
  const decreaseBtn = document.getElementById("qtyDecrease")
  const increaseBtn = document.getElementById("qtyIncrease")
  const quantityInput = document.getElementById("quantity")
  if (!decreaseBtn || !increaseBtn || !quantityInput) return

  decreaseBtn.addEventListener("click", () => {
    const qty = parseInt(quantityInput.value, 10)
    if (qty > 1) quantityInput.value = qty - 1
  })
  increaseBtn.addEventListener("click", () => {
    const qty = parseInt(quantityInput.value, 10)
    if (qty < 100) quantityInput.value = qty + 1
  })
}

// SETUP ADD TO CART (main CTA)
function setupAddToCart() {
  const btn = document.getElementById("addToCartBtn")
  if (!btn) return
  btn.addEventListener("click", () => {
    const qty = parseInt(document.getElementById("quantity")?.value || "1", 10)
    addToCart(currentProduct, qty)
  })
}

// ADD TO CART
// productOrId: product object (main CTA) or Firestore doc id (related products)
function addToCart(productOrId, quantity = 1) {
  let product = typeof productOrId === "object" ? productOrId : relatedProducts.find((p) => p.id === productOrId)
  if (!product) {
    alert("Sản phẩm không tồn tại!")
    return
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const existing = cart.find((item) => item.productId === product.id)

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
  alert(`Đã thêm ${quantity} sản phẩm vào giỏ!`)
}

function updateCartBadge() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const badge = document.getElementById("cartBadge")
    if (badge) badge.textContent = total
  } catch (_) {}
}

window.addToCart = addToCart

// AUTH & UI
function checkAuthStatus() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons")
    const userProfile = document.getElementById("userProfile")
    const userName = document.getElementById("userName")
    const logoutBtn = document.getElementById("logoutBtn")

    if (user) {
      if (authButtons) { authButtons.style.display = "none"; authButtons.classList.add("hidden") }
      if (userProfile) { userProfile.style.display = "flex"; userProfile.classList.remove("hidden") }
      if (userName) userName.textContent = user.displayName || user.email
      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.preventDefault()
          try {
            await signOut(auth)
            window.location.reload()
          } catch (err) {
            console.error("Logout error:", err)
          }
        }
      }
    } else {
      if (authButtons) { authButtons.style.display = "flex"; authButtons.classList.remove("hidden") }
      if (userProfile) { userProfile.style.display = "none"; userProfile.classList.add("hidden") }
    }
  })
}

function setupDropdownMenu() {
  const userProfile = document.getElementById("userProfile")
  const dropdownMenu = document.querySelector(".dropdown-menu")
  if (!userProfile || !dropdownMenu) return
  userProfile.addEventListener("click", () => dropdownMenu.classList.toggle("active"))
  document.addEventListener("click", (e) => {
    if (!userProfile.contains(e.target)) dropdownMenu.classList.remove("active")
  })
}

function setupCartIcon() {
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) cartIcon.addEventListener("click", () => { window.location.href = "cart.html" })
}

function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("navMenu")
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }
}

window.addEventListener("load", async () => {
  updateCartBadge()
  await loadProductDetail()
  checkAuthStatus()
  setupDropdownMenu()
  setupCartIcon()
  setupHamburgerMenu()
})
