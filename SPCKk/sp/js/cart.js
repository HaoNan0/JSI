/* ============================================
   CART.JS
   Xử lý giỏ hàng: Load, Update, Remove items
   Calculate totals, Checkout
   ============================================ */

import { auth } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

// CART STATE
// Lý do: Load từ localStorage để persist data
let cart = []

// CONSTANTS
const SHIPPING_FEE = 30000 // 30,000 VND

// LOAD CART FROM LOCALSTORAGE
// Lý do: Restore cart khi page load
function loadCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart)
    } catch (e) {
      cart = []
    }
  }
  renderCart()
  updateCartBadge()
}

// SAVE CART TO LOCALSTORAGE
// Lý do: Persist cart data
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
}

// UPDATE CART BADGE
// Lý do: Hiển thị số lượng items trong icon giỏ hàng
function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0)
  const badge = document.getElementById("cartBadge")
  if (badge) {
    badge.textContent = total
  }
}

// RENDER CART
// Lý do: Generate HTML cho cart items và summary
function renderCart() {
  const itemsList = document.getElementById("cartItemsList")
  const emptyCart = document.getElementById("emptyCart")
  const cartItemCount = document.getElementById("cartItemCount")

  // Check if cart is empty
  if (cart.length === 0) {
    itemsList.innerHTML = ""
    emptyCart.classList.remove("hidden")
    cartItemCount.textContent = "0 sản phẩm"
    updateSummary()
    return
  }

  // Hide empty state
  emptyCart.classList.add("hidden")
  cartItemCount.textContent = `${cart.length} sản phẩm`

  // Render cart items
  itemsList.innerHTML = cart
    .map(
      (item, index) => `
    <div class="cart-item" data-index="${index}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      
      <div class="cart-item-info">
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-price">₫${item.price.toLocaleString("vi-VN")}</p>
      </div>
      
      <div class="cart-item-actions">
        <div class="quantity-selector">
          <button class="quantity-btn" onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" readonly>
          <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        
        <button class="remove-btn" onclick="removeItem(${index})">
          <span>🗑️</span>
          <span>Xóa</span>
        </button>
      </div>
    </div>
  `,
    )
    .join("")

  updateSummary()
}

// UPDATE QUANTITY
// Lý do: Tăng/giảm số lượng sản phẩm
window.updateQuantity = (index, change) => {
  if (index < 0 || index >= cart.length) return

  cart[index].quantity += change

  // Minimum quantity is 1
  if (cart[index].quantity < 1) {
    cart[index].quantity = 1
  }

  saveCart()
  renderCart()
}

// REMOVE ITEM
// Lý do: Xóa sản phẩm khỏi giỏ hàng
window.removeItem = (index) => {
  if (index < 0 || index >= cart.length) return

  const itemName = cart[index].name

  // Confirm before remove
  if (confirm(`Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
    cart.splice(index, 1)
    saveCart()
    renderCart()

    // Show toast
    showToast(`Đã xóa "${itemName}" khỏi giỏ hàng`, "success")
  }
}

// UPDATE SUMMARY
// Lý do: Tính tổng tiền, phí ship, tổng cuối
function updateSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cart.length > 0 ? SHIPPING_FEE : 0
  const total = subtotal + shipping

  document.getElementById("subtotal").textContent = `₫${subtotal.toLocaleString("vi-VN")}`
  document.getElementById("shipping").textContent = cart.length > 0 ? `₫${shipping.toLocaleString("vi-VN")}` : "₫0"
  document.getElementById("total").textContent = `₫${total.toLocaleString("vi-VN")}`
}

// CHECKOUT
// Lý do: Xử lý thanh toán (tạm thời chỉ alert)
function handleCheckout() {
  if (cart.length === 0) {
    showToast("Giỏ hàng trống!", "error")
    return
  }

  // Check if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, proceed to checkout
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + SHIPPING_FEE
      alert(`Tổng thanh toán: ₫${total.toLocaleString("vi-VN")}\n\nTính năng thanh toán sẽ được cập nhật sau!`)

      // Clear cart after checkout
      // cart = []
      // saveCart()
      // renderCart()
    } else {
      // User not logged in, redirect to login
      showToast("Vui lòng đăng nhập để tiếp tục!", "error")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1500)
    }
  })
}

// SHOW TOAST
// Lý do: Hiển thị thông báo đẹp thay vì alert()
function showToast(message, type = "success") {
  const toast = document.createElement("div")
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : "#ef4444"};
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
  }, 3000)
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
      authButtons?.classList.add("hidden")
      userProfile?.classList.remove("hidden")
      if (userName) {
        userName.textContent = user.displayName || user.email
      }

      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.preventDefault()
          try {
            await signOut(auth)
            window.location.href = "index.html"
          } catch (error) {
            console.error("Logout error:", error)
          }
        }
      }
    } else {
      authButtons?.classList.remove("hidden")
      userProfile?.classList.add("hidden")
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

// HAMBURGER MENU
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

// CART ICON CLICK
function setupCartIcon() {
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      // Already on cart page, do nothing or scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
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

  // Checkout button handler
  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout)
  }
})
