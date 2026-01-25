/* ============================================
   CART.JS
   Xử lý giỏ hàng: Load, Update, Remove items
   Calculate totals, Checkout
   ============================================ */

import { auth } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

// CART STATE
// Explanation: Global array to store cart items. Loaded from localStorage on page load.
// Structure: [{ productId, name, price, image, quantity }, ...]
let cart = []

// CONSTANTS
// Explanation: Fixed shipping fee in Vietnamese Dong (VND)
const SHIPPING_FEE = 30000 // 30,000 VND

// LOAD CART FROM LOCALSTORAGE
// Explanation: Restores cart data from browser localStorage when page loads.
// Validates and cleans up incomplete items (missing required properties).
// Required properties: price (number), name (string), image (string)
function loadCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart)
      // Ensure cart is an array
      if (!Array.isArray(cart)) {
        cart = []
      }
    } catch (e) {
      console.error("Error parsing cart from localStorage:", e)
      cart = []
    }
  }
  
  // Clean up: Remove incomplete items (missing required properties)
  // Fix: Validate that price is a number, not just truthy (0 would be invalid)
  const initialLength = cart.length
  cart = cart.filter(item => 
    item && 
    typeof item.price === 'number' && 
    item.price > 0 && 
    item.name && 
    typeof item.name === 'string' &&
    item.image && 
    typeof item.image === 'string' &&
    item.quantity &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
  
  if (cart.length < initialLength) {
    saveCart() // Save cleaned cart back to localStorage
  }
  
  renderCart()
  updateCartBadge()
}

// SAVE CART TO LOCALSTORAGE
// Explanation: Persists cart data to browser localStorage for persistence across page reloads.
// Also updates the cart badge count in the UI.
function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartBadge()
  } catch (e) {
    console.error("Error saving cart to localStorage:", e)
    // localStorage might be full or disabled
  }
}

// UPDATE CART BADGE
// Explanation: Updates the cart badge number showing total quantity of items in cart.
// Only counts valid items (with all required properties and valid values).
function updateCartBadge() {
  // Only count valid items (with all required properties)
  const validCart = cart.filter(item => 
    item && 
    typeof item.price === 'number' && 
    item.price > 0 && 
    item.name && 
    item.image &&
    item.quantity &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
  const total = validCart.reduce((sum, item) => sum + item.quantity, 0)
  const badge = document.getElementById("cartBadge")
  if (badge) {
    badge.textContent = total > 0 ? total : ""
  }
}

// RENDER CART
// Explanation: Generates HTML for cart items and displays them. Shows empty state if cart is empty.
// Fix: Uses productId instead of array index to avoid index mismatches when items are filtered.
function renderCart() {
  const itemsList = document.getElementById("cartItemsList")
  const emptyCart = document.getElementById("emptyCart")
  const cartItemCount = document.getElementById("cartItemCount")

  // Filter valid items first
  const validCart = cart.filter(item => 
    item && 
    typeof item.price === 'number' && 
    item.price > 0 && 
    item.name && 
    typeof item.name === 'string' &&
    item.image && 
    typeof item.image === 'string' &&
    item.quantity &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )

  // Check if cart is empty (using valid items)
  if (validCart.length === 0) {
    if (itemsList) itemsList.innerHTML = ""
    if (emptyCart) emptyCart.classList.remove("hidden")
    if (cartItemCount) cartItemCount.textContent = "0 sản phẩm"
    updateSummary()
    return
  }

  // Hide empty state and show items
  if (emptyCart) emptyCart.classList.add("hidden")
  if (cartItemCount) cartItemCount.textContent = `${validCart.length} sản phẩm`

  // Render cart items
  // Fix: Use productId for identification instead of array index to avoid index mismatches
  if (itemsList) {
    itemsList.innerHTML = validCart
      .map((item) => {
        // Escape HTML to prevent XSS attacks
        const escapeHtml = (text) => {
          const div = document.createElement('div')
          div.textContent = text
          return div.innerHTML
        }
        
        // Escape productId for use in onclick handlers (prevent XSS)
        const escapeJsString = (str) => {
          return String(str || '').replace(/'/g, "\\'").replace(/"/g, '\\"')
        }
        
        const productId = escapeJsString(item.productId || '')
        const name = escapeHtml(item.name)
        const image = escapeHtml(item.image)
        const price = typeof item.price === 'number' ? item.price : 0
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1
        
        return `
    <div class="cart-item" data-product-id="${escapeHtml(item.productId || '')}">
      <div class="cart-item-image">
        <img src="${image}" alt="${name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3C/svg%3E';">
      </div>
      
      <div class="cart-item-info">
        <h3 class="cart-item-name">${name}</h3>
        <p class="cart-item-price">₫${price.toLocaleString("vi-VN")}</p>
      </div>
      
      <div class="cart-item-actions">
        <div class="quantity-selector">
          <button class="quantity-btn" onclick="updateQuantityByProductId('${productId}', -1)" ${quantity <= 1 ? "disabled" : ""}>-</button>
          <input type="number" class="quantity-input" value="${quantity}" min="1" readonly>
          <button class="quantity-btn" onclick="updateQuantityByProductId('${productId}', 1)">+</button>
        </div>
        
        <button class="remove-btn" onclick="removeItemByProductId('${productId}')">
          <span><i class="fa-solid fa-trash"></i></span>
          <span>Xóa</span>
        </button>
      </div>
    </div>
  `
      })
      .join("")
  }

  updateSummary()
}

// UPDATE QUANTITY (Legacy - kept for backward compatibility)
// Explanation: Updates item quantity by array index. Deprecated in favor of updateQuantityByProductId.
// Fix: Added validation to prevent errors with invalid indices.
window.updateQuantity = (index, change) => {
  if (index < 0 || index >= cart.length) {
    console.warn("Invalid cart index:", index)
    return
  }

  const item = cart[index]
  if (!item) return

  item.quantity = Math.max(1, (item.quantity || 1) + change)

  saveCart()
  renderCart()
}

// UPDATE QUANTITY BY PRODUCT ID
// Explanation: Updates item quantity by productId (more reliable than array index).
// Fix: Uses productId to find item, preventing index mismatches after filtering.
window.updateQuantityByProductId = (productId, change) => {
  if (!productId) {
    console.warn("Missing productId")
    return
  }

  const item = cart.find(item => item.productId === productId)
  if (!item) {
    console.warn("Product not found in cart:", productId)
    return
  }

  item.quantity = Math.max(1, (item.quantity || 1) + change)

  saveCart()
  renderCart()
}

// REMOVE ITEM (Legacy - kept for backward compatibility)
// Explanation: Removes item from cart by array index. Deprecated in favor of removeItemByProductId.
// Fix: Added validation and error handling.
window.removeItem = (index) => {
  if (index < 0 || index >= cart.length) {
    console.warn("Invalid cart index:", index)
    return
  }

  const item = cart[index]
  if (!item) return

  const itemName = item.name || "sản phẩm"

  // Confirm before remove
  if (confirm(`Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
    cart.splice(index, 1)
    saveCart()
    renderCart()

    // Show toast
    showToast(`Đã xóa "${itemName}" khỏi giỏ hàng`, "success")
  }
}

// REMOVE ITEM BY PRODUCT ID
// Explanation: Removes item from cart by productId (more reliable than array index).
// Fix: Uses productId to find and remove item, preventing index mismatches.
window.removeItemByProductId = (productId) => {
  if (!productId) {
    console.warn("Missing productId")
    return
  }

  const item = cart.find(item => item.productId === productId)
  if (!item) {
    console.warn("Product not found in cart:", productId)
    return
  }

  const itemName = item.name || "sản phẩm"

  // Confirm before remove
  if (confirm(`Bạn có chắc muốn xóa "${itemName}" khỏi giỏ hàng?`)) {
    const index = cart.findIndex(item => item.productId === productId)
    if (index !== -1) {
      cart.splice(index, 1)
      saveCart()
      renderCart()

      // Show toast
      showToast(`Đã xóa "${itemName}" khỏi giỏ hàng`, "success")
    }
  }
}

// UPDATE SUMMARY
// Explanation: Calculates and displays cart totals: subtotal, shipping fee, and final total.
// Only includes valid items in calculations (with proper price, name, image, quantity).
function updateSummary() {
  // Filter out incomplete items when calculating totals
  const validCart = cart.filter(item => 
    item && 
    typeof item.price === 'number' && 
    item.price > 0 && 
    item.name && 
    item.image &&
    item.quantity &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )
  
  const subtotal = validCart.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0
    return sum + (price * quantity)
  }, 0)
  
  const shipping = validCart.length > 0 ? SHIPPING_FEE : 0
  const total = subtotal + shipping

  const subtotalEl = document.getElementById("subtotal")
  const shippingEl = document.getElementById("shipping")
  const totalEl = document.getElementById("total")

  if (subtotalEl) {
    subtotalEl.textContent = `₫${subtotal.toLocaleString("vi-VN")}`
  }
  if (shippingEl) {
    shippingEl.textContent = validCart.length > 0 ? `₫${shipping.toLocaleString("vi-VN")}` : "₫0"
  }
  if (totalEl) {
    totalEl.textContent = `₫${total.toLocaleString("vi-VN")}`
  }
}

// CHECKOUT
// Explanation: Handles checkout process. Checks if user is logged in and validates cart has items.
// Fix: Uses valid cart items for total calculation, consistent with other functions.
function handleCheckout() {
  // Filter valid items first
  const validCart = cart.filter(item => 
    item && 
    typeof item.price === 'number' && 
    item.price > 0 && 
    item.name && 
    item.image &&
    item.quantity &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  )

  if (validCart.length === 0) {
    showToast("Giỏ hàng trống!", "error")
    return
  }

  // Check if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, proceed to checkout
      // Fix: Use validCart instead of cart for total calculation
      const subtotal = validCart.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0
        return sum + (price * quantity)
      }, 0)
      const total = subtotal + SHIPPING_FEE
      
      alert(`Tổng thanh toán: ₫${total.toLocaleString("vi-VN")}\n\nTính năng thanh toán sẽ được cập nhật sau!`)

      // Clear cart after checkout (commented out for testing)
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
// Explanation: Displays a temporary notification message (toast) instead of using alert().
// Creates a styled div element that appears at bottom-right, auto-removes after 3 seconds.
// Types: "success" (green) or "error" (red).
function showToast(message, type = "success") {
  if (!message) return

  const toast = document.createElement("div")
  toast.textContent = message
  toast.className = `toast toast-${type}`
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
    max-width: 300px;
    word-wrap: break-word;
  `
  
  // Remove any existing toasts to prevent stacking
  const existingToasts = document.querySelectorAll('.toast')
  existingToasts.forEach(t => t.remove())
  
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove()
      }
    }, 300)
  }, 3000)
}

// CHECK AUTH STATUS
// Explanation: Updates UI based on user authentication status.
// Shows/hides login buttons and user profile dropdown accordingly.
// Sets up logout button handler when user is logged in.
function checkAuthStatus() {
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons")
    const userProfile = document.getElementById("userProfile")
    const userName = document.getElementById("userName")
    const logoutBtn = document.getElementById("logoutBtn")

    if (user) {
      // USER LOGGED IN - Hide auth buttons, show profile
      if (authButtons) {
        authButtons.style.display = "none"
        authButtons.classList.add("hidden")
      }
      if (userProfile) {
        userProfile.style.display = "flex"
        userProfile.classList.remove("hidden")
      }
      if (userName) {
        // Fix: Escape user input to prevent XSS
        const displayName = user.displayName || user.email || "User"
        userName.textContent = displayName
      }

      if (logoutBtn) {
        // Fix: Remove previous event listeners to prevent duplicates
        logoutBtn.replaceWith(logoutBtn.cloneNode(true))
        const newLogoutBtn = document.getElementById("logoutBtn")
        
        if (newLogoutBtn) {
          newLogoutBtn.onclick = async (e) => {
            e.preventDefault()
            try {
              await signOut(auth)
              window.location.href = "index.html"
            } catch (error) {
              console.error("Logout error:", error)
              showToast("Lỗi khi đăng xuất. Vui lòng thử lại.", "error")
            }
          }
        }
      }
    } else {
      // USER NOT LOGGED IN - Show auth buttons, hide profile
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
// Explanation: Sets up click handlers for user profile dropdown menu.
// Toggles menu visibility on profile click, closes when clicking outside.
function setupDropdownMenu() {
  const userProfile = document.getElementById("userProfile")
  const dropdownMenu = document.querySelector(".dropdown-menu")

  if (userProfile && dropdownMenu) {
    // Fix: Use event delegation and check if click is on profile or menu
    userProfile.addEventListener("click", (e) => {
      e.stopPropagation()
      dropdownMenu.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (userProfile && dropdownMenu && 
          !userProfile.contains(e.target) && 
          !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("active")
      }
    })
  }
}

// HAMBURGER MENU
// Explanation: Sets up mobile hamburger menu toggle functionality.
// Toggles active class on both hamburger icon and navigation menu.
function setupHamburgerMenu() {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("navMenu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation()
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (hamburger && navMenu && 
          !hamburger.contains(e.target) && 
          !navMenu.contains(e.target) &&
          navMenu.classList.contains("active")) {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      }
    })
  }
}

// CART ICON CLICK
// Explanation: Handles cart icon click behavior on cart page.
// Since we're already on the cart page, it just scrolls to top instead of navigating.
function setupCartIcon() {
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      // Already on cart page, scroll to top
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }
}

// INITIALIZE PAGE
// Explanation: Initializes all cart page functionality when DOM is fully loaded.
// Sets up cart display, authentication UI, navigation menus, and checkout handler.
// Fix: Uses DOMContentLoaded for faster initialization, with fallback for edge cases.
function initializePage() {
  loadCart()
  checkAuthStatus()
  setupDropdownMenu()
  setupHamburgerMenu()
  setupCartIcon()

  // Checkout button handler
  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      handleCheckout()
    })
  }
}

// Use DOMContentLoaded for faster initialization
if (document.readyState === 'loading') {
  // DOMContentLoaded has not fired yet, wait for it
  window.addEventListener("DOMContentLoaded", initializePage)
} else {
  // DOMContentLoaded has already fired, initialize immediately
  initializePage()
}
