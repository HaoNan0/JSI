/* ============================================
   HOME.JS
   Render products, cart, auth UI, navigation
   Products loaded from Firestore
   ============================================ */

import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// PRODUCTS - loaded from Firestore
let products = []

// CART - Global state
// Lý do: Lưu items trong localStorage
// Structure: { productId, name, price, image, quantity }
let cart = []

// LOAD PRODUCTS FROM FIRESTORE
async function loadProductsFromFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "products"))
    products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    renderProducts(products)
  } catch (error) {
    console.error("Error loading products:", error)
    products = []
    renderProducts([])
  }
}

// LOAD CART FROM STORAGE
// Lý do: Khi page load, restore cart từ localStorage
function loadCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart)
    } catch (e) {
      cart = []
    }
  }
  updateCartBadge()
}

// UPDATE CART BADGE
// Lý do: Show số lượng items trong giỏ
function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0)
  const badge = document.getElementById("cartBadge")
  if (badge) {
    badge.textContent = total
  }
}

// SAVE CART TO STORAGE
// Lý do: Persist cart data
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
}

// ADD TO CART
// Lý do: Click "Thêm vào giỏ" button
// Logic: Nếu product đã có, tăng quantity; nếu không, thêm mới
function addToCart(productId, quantity = 1) {
  const product = products.find((p) => p.id === productId || String(p.id) === String(productId))
  if (!product) {
    alert("Sản phẩm không tồn tại!")
    return
  }

  const inStock = product.inStock !== undefined ? product.inStock : (product.stock || 0) > 0
  if (!inStock) {
    alert("Sản phẩm đã hết hàng!")
    return
  }

  const existingItem = cart.find((item) => item.productId === productId || item.productId === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })
  }

  saveCart()

  const toast = document.createElement("div")
  toast.textContent = `Đã thêm "${product.name}" vào giỏ hàng!`
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease"
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// RENDER PRODUCTS
// Lý do: Generate HTML cho product grid from Firestore data
function renderProducts(productsToRender) {
  const grid = document.getElementById("productGrid")
  if (!grid) return

  if (!productsToRender || productsToRender.length === 0) {
    grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Chưa có sản phẩm. <a href="seed-products.html">Chạy seed</a> để thêm sản phẩm mẫu.</p>'
    return
  }

  grid.innerHTML = productsToRender
    .map((product) => {
      const rating = product.rating ?? 0
      const reviews = product.reviews ?? 0
      const inStock = product.inStock !== undefined ? product.inStock : (product.stock || 0) > 0
      const id = product.id
      const idEsc = String(id).replace(/'/g, "\\'")
      return `
    <div class="product-card" onclick="goToDetail('${idEsc}')">
      <div class="product-image">
        <img src="${product.image || ""}" alt="${product.name || ""}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name || ""}</h3>
        <div class="product-rating">
          <span>⭐ ${rating}</span>
          <span>(${reviews} reviews)</span>
        </div>
        <p class="product-price">₫${(product.price || 0).toLocaleString("vi-VN")}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${idEsc}')" ${!inStock ? "disabled" : ""}>
          ${inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  `
    })
    .join("")
}

// GO TO DETAIL PAGE
// Lý do: Click sản phẩm card → chuyển tới detail.html
function goToDetail(productId) {
  window.location.href = `detail.html?id=${encodeURIComponent(productId)}`
}

// CHECK AUTH STATUS
// Lý do: Hiển thị UI khác dựa trên login status
function checkAuthStatus() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons")
    const userProfile = document.getElementById("userProfile")
    const userName = document.getElementById("userName")
    const logoutBtn = document.getElementById("logoutBtn")

    if (user) {
      if (authButtons) {
        authButtons.style.display = "none"
        authButtons.classList.add("hidden")
      }
      if (userProfile) {
        userProfile.style.display = "flex"
        userProfile.classList.remove("hidden")
      }
      if (userName) {
        userName.textContent = user.displayName || user.email || "User"
      }

      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.preventDefault()
          try {
            await signOut(auth)
            window.location.reload()
          } catch (error) {
            console.error("Logout error:", error)
          }
        }
      }

      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("from") === "login") {
        setTimeout(() => {
          const productsSection = document.getElementById("products")
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth", block: "start" })
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        }, 500)
      }
    } else {
      if (authButtons) {
        authButtons.style.display = "flex"
        authButtons.classList.remove("hidden")
      }
      if (userProfile) {
        userProfile.style.display = "none"
        userProfile.classList.add("hidden")
      }
    }
  })
}

// DROPDOWN MENU TOGGLE
function setupDropdownMenu() {
  const userProfile = document.getElementById("userProfile")
  const dropdownMenu = document.querySelector(".dropdown-menu")

  if (userProfile && dropdownMenu) {
    userProfile.addEventListener("click", () => {
      dropdownMenu.classList.toggle("active")
    })

    document.addEventListener("click", (e) => {
      if (!userProfile.contains(e.target)) {
        dropdownMenu.classList.remove("active")
      }
    })
  }
}

// MOBILE HAMBURGER MENU
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("navMenu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }
}

// CART ICON CLICK
function setupCartIcon() {
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "cart.html"
    })
  }
}

// INITIALIZE PAGE
window.addEventListener("load", () => {
  loadCart()
  checkAuthStatus()
  setupDropdownMenu()
  setupHamburgerMenu()
  setupCartIcon()
  loadProductsFromFirestore()
})

window.addToCart = addToCart
window.goToDetail = goToDetail
