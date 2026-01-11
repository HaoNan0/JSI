/* ============================================
   HOME.JS
   Render products, cart, auth UI, navigation
   ============================================ */

import { auth } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

// MOCK DATA - Products
// Lý do: Dữ liệu tạm để demo, ngoài thực tế sẽ từ API
const mockProducts = [
  {
    id: 1,
    name: "Laptop Gaming Pro",
    price: 25000000,
    image: "/modern-laptop-workspace.png",
    category: "electronics",
    rating: 4.5,
    reviews: 128,
    inStock: true,
  },
  {
    id: 2,
    name: "Tai Nghe Wireless",
    price: 2500000,
    image: "/diverse-people-listening-headphones.png",
    category: "electronics",
    rating: 4.2,
    reviews: 256,
    inStock: true,
  },
  {
    id: 3,
    name: "Smartphone X",
    price: 15000000,
    image: "/modern-smartphone.png",
    category: "electronics",
    rating: 4.8,
    reviews: 512,
    inStock: true,
  },
  {
    id: 4,
    name: "Màn Hình 4K",
    price: 8500000,
    image: "/computer-monitor.png",
    category: "electronics",
    rating: 4.3,
    reviews: 89,
    inStock: false,
  },
  // Add more products...
]

// CART - Global state
// Lý do: Lưu items trong localStorage
// Structure: { productId, name, price, image, quantity }
let cart = []

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
  // Find product in mock data
  const product = mockProducts.find((p) => p.id === productId)
  if (!product) {
    alert("Sản phẩm không tồn tại!")
    return
  }

  // Check if product already in cart
  const existingItem = cart.find((item) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    // Save full product details in cart
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })
  }

  saveCart()

  // Show success message
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
// Lý do: Generate HTML cho product grid
// Map products array → HTML strings → join
function renderProducts(products) {
  const grid = document.getElementById("productGrid")
  if (!grid) return

  grid.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" onclick="goToDetail(${product.id})">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          <span>⭐ ${product.rating}</span>
          <span>(${product.reviews} reviews)</span>
        </div>
        <p class="product-price">₫${product.price.toLocaleString("vi-VN")}</p>
        <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${product.id})">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

// GO TO DETAIL PAGE
// Lý do: Click sản phẩm card → chuyển tới detail.html
// Pass product ID via URL param
function goToDetail(productId) {
  window.location.href = `detail.html?id=${productId}`
}

// CHECK AUTH STATUS
// Lý do: Hiển thị UI khác dựa trên login status
// Token ở localStorage có sẵn sau login
function checkAuthStatus() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons")
    const userProfile = document.getElementById("userProfile")
    const userName = document.getElementById("userName")
    const logoutBtn = document.getElementById("logoutBtn")

    if (user) {
      // USER LOGGED IN
      authButtons?.classList.add("hidden")
      userProfile?.classList.remove("hidden")
      if (userName) {
        userName.textContent = user.displayName || user.email
      }

      // LOGOUT HANDLER
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
    } else {
      // USER NOT LOGGED IN
      authButtons?.classList.remove("hidden")
      userProfile?.classList.add("hidden")
    }
  })
}

// DROPDOWN MENU TOGGLE
// Lý do: Click avatar để show/hide dropdown
function setupDropdownMenu() {
  const userProfile = document.getElementById("userProfile")
  const dropdownMenu = document.querySelector(".dropdown-menu")

  if (userProfile && dropdownMenu) {
    userProfile.addEventListener("click", () => {
      dropdownMenu.classList.toggle("active")
    })

    // Close khi click outside
    document.addEventListener("click", (e) => {
      if (!userProfile.contains(e.target)) {
        dropdownMenu.classList.remove("active")
      }
    })
  }
}

// MOBILE HAMBURGER MENU
// Lý do: Toggle navigation menu trên mobile
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("navMenu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu khi click nav link
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }
}

// CART ICON CLICK
// Lý do: Chuyển đến trang giỏ hàng (sẽ tạo sau)
function setupCartIcon() {
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "cart.html"
    })
  }
}

// INITIALIZE PAGE
// Lý do: Chạy tất cả setup functions khi page load
window.addEventListener("load", () => {
  loadCart()
  checkAuthStatus()
  setupDropdownMenu()
  setupHamburgerMenu()
  setupCartIcon()
  renderProducts(mockProducts)
})

// Make addToCart global for onclick
window.addToCart = addToCart
window.goToDetail = goToDetail
