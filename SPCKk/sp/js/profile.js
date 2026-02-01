/* ============================================
   PROFILE.JS
   User profile management, editing, security
   ============================================ */

import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// GLOBAL STATE
let currentUser = null
let userData = null

// CHECK AUTH & LOAD USER DATA
function checkAuthAndLoadData() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "login.html"
      return
    }

    currentUser = user

    // Load user data from Firestore
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        userData = userDoc.data()
      } else {
        // Create user document if doesn't exist
        userData = {
          name: user.displayName || "",
          email: user.email,
          role: "customer",
          createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, "users", user.uid), userData)
      }

      // Update UI
      updateProfileUI()
      loadProfileData()
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  })
}

// UPDATE PROFILE UI IN HEADER
function updateProfileUI() {
  const userName = document.getElementById("userName")
  const headerAvatar = document.getElementById("headerAvatar")
  const profileDisplayName = document.getElementById("profileDisplayName")
  const profileEmail = document.getElementById("profileEmail")
  const profileAvatar = document.getElementById("profileAvatar")

  if (currentUser) {
    const displayName = currentUser.displayName || currentUser.email
    if (userName) userName.textContent = displayName
    if (profileDisplayName) profileDisplayName.textContent = displayName
    if (profileEmail) profileEmail.textContent = currentUser.email
    if (currentUser.photoURL) {
      if (headerAvatar) headerAvatar.src = currentUser.photoURL
      if (profileAvatar) profileAvatar.src = currentUser.photoURL
    }
  }
}

// LOAD PROFILE DATA INTO FORM
function loadProfileData() {
  if (!userData || !currentUser) return

  // Personal Info
  document.getElementById("editName").value = userData.name || currentUser.displayName || ""
  document.getElementById("editEmail").value = currentUser.email || ""
  document.getElementById("editPhone").value = userData.phone || ""
  document.getElementById("editBirthday").value = userData.birthday || ""
  document.getElementById("editGender").value = userData.gender || ""
  document.getElementById("editBio").value = userData.bio || ""

  // Load addresses
  loadAddresses()
}

// PROFILE NAVIGATION
function setupProfileNavigation() {
  const navLinks = document.querySelectorAll(".profile-nav-link")
  const sections = document.querySelectorAll(".profile-section")

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const sectionId = link.dataset.section + "Section"

      // Remove active from all
      navLinks.forEach((l) => l.classList.remove("active"))
      sections.forEach((s) => s.classList.remove("active"))

      // Add active to current
      link.classList.add("active")
      const section = document.getElementById(sectionId)
      if (section) {
        section.classList.add("active")
      }
    })
  })
}

// UPDATE PROFILE FORM
function setupProfileForm() {
  const form = document.getElementById("profileForm")
  const cancelBtn = document.getElementById("cancelEditBtn")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("editName").value.trim()
    const phone = document.getElementById("editPhone").value.trim()
    const birthday = document.getElementById("editBirthday").value
    const gender = document.getElementById("editGender").value
    const bio = document.getElementById("editBio").value.trim()

    // Validation
    if (!name) {
      showError("nameError", "Vui lòng nhập họ và tên")
      return
    }

    if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      showError("phoneError", "Số điện thoại không hợp lệ")
      return
    }

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, { displayName: name })

      // Update Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: name,
        phone: phone || null,
        birthday: birthday || null,
        gender: gender || null,
        bio: bio || null,
        updatedAt: new Date().toISOString(),
      })

      // Update local state
      userData = { ...userData, name, phone, birthday, gender, bio }
      currentUser = auth.currentUser

      showSuccess("Cập nhật thông tin thành công!")
      updateProfileUI()
    } catch (error) {
      console.error("Error updating profile:", error)
      showError("nameError", "Có lỗi xảy ra. Vui lòng thử lại.")
    }
  })

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      loadProfileData()
    })
  }
}

// PASSWORD CHANGE FORM
function setupPasswordForm() {
  const form = document.getElementById("passwordForm")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = document.getElementById("newPassword").value
    const confirmPassword = document.getElementById("confirmNewPassword").value

    // Clear previous errors
    clearErrors()

    // Validation
    if (newPassword.length < 8) {
      showError("newPasswordError", "Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    if (newPassword !== confirmPassword) {
      showError("confirmPasswordError", "Mật khẩu không khớp")
      return
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
      await reauthenticateWithCredential(currentUser, credential)

      // Update password
      await updatePassword(currentUser, newPassword)

      showSuccess("Đổi mật khẩu thành công!")
      form.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      if (error.code === "auth/wrong-password") {
        showError("currentPasswordError", "Mật khẩu hiện tại không đúng")
      } else if (error.code === "auth/weak-password") {
        showError("newPasswordError", "Mật khẩu quá yếu")
      } else {
        showError("currentPasswordError", "Có lỗi xảy ra. Vui lòng thử lại.")
      }
    }
  })
}

// PASSWORD TOGGLE
function setupPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target
      const input = document.getElementById(targetId)
      const icon = btn.querySelector("i")

      if (input.type === "password") {
        input.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        input.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }
    })
  })
}

// ADDRESSES MANAGEMENT
function loadAddresses() {
  const addressesList = document.getElementById("addressesList")
  if (!addressesList) return

  const addresses = userData.addresses || []

  if (addresses.length === 0) {
    addressesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-map-marker-alt"></i>
        <p>Chưa có địa chỉ nào</p>
      </div>
    `
    return
  }

  addressesList.innerHTML = addresses
    .map(
      (addr, index) => `
    <div class="address-card ${addr.default ? "default" : ""}">
      <div class="address-info">
        ${addr.default ? '<span class="address-badge">Mặc định</span>' : ""}
        <h4>${addr.name}</h4>
        <p><i class="fa-solid fa-phone"></i> ${addr.phone}</p>
        <p>${addr.street}</p>
        <p>${addr.district}, ${addr.city}</p>
        ${addr.postal ? `<p>Mã bưu điện: ${addr.postal}</p>` : ""}
      </div>
      <div class="address-actions">
        <button class="address-action-btn" onclick="editAddress(${index})">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="address-action-btn delete" onclick="deleteAddress(${index})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

// ADDRESS MODAL
function setupAddressModal() {
  const addBtn = document.getElementById("addAddressBtn")
  const modal = document.getElementById("addressModal")
  const closeBtn = document.getElementById("closeAddressModal")
  const cancelBtn = document.getElementById("cancelAddressBtn")
  const form = document.getElementById("addressForm")
  let editingIndex = null

  addBtn.addEventListener("click", () => {
    editingIndex = null
    document.getElementById("addressModalTitle").textContent = "Thêm Địa Chỉ Mới"
    form.reset()
    modal.classList.remove("hidden")
  })

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
  })

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
  })

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const address = {
      name: document.getElementById("addressName").value.trim(),
      phone: document.getElementById("addressPhone").value.trim(),
      street: document.getElementById("addressStreet").value.trim(),
      district: document.getElementById("addressDistrict").value.trim(),
      city: document.getElementById("addressCity").value.trim(),
      postal: document.getElementById("addressPostal").value.trim(),
      default: document.getElementById("addressDefault").checked,
    }

    try {
      let addresses = userData.addresses || []

      // If setting as default, unset others
      if (address.default) {
        addresses = addresses.map((addr) => ({ ...addr, default: false }))
      }

      if (editingIndex !== null) {
        // Update existing
        addresses[editingIndex] = address
      } else {
        // Add new
        // If first address, set as default
        if (addresses.length === 0) {
          address.default = true
        }
        addresses.push(address)
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        addresses: addresses,
        updatedAt: new Date().toISOString(),
      })

      userData.addresses = addresses
      loadAddresses()
      modal.classList.add("hidden")
      showSuccess(editingIndex !== null ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!")
    } catch (error) {
      console.error("Error saving address:", error)
      showError("addressError", "Có lỗi xảy ra. Vui lòng thử lại.")
    }
  })

  // Make functions global for onclick handlers
  window.editAddress = (index) => {
    editingIndex = index
    const address = userData.addresses[index]
    document.getElementById("addressModalTitle").textContent = "Chỉnh Sửa Địa Chỉ"
    document.getElementById("addressName").value = address.name
    document.getElementById("addressPhone").value = address.phone
    document.getElementById("addressStreet").value = address.street
    document.getElementById("addressDistrict").value = address.district
    document.getElementById("addressCity").value = address.city
    document.getElementById("addressPostal").value = address.postal || ""
    document.getElementById("addressDefault").checked = address.default || false
    modal.classList.remove("hidden")
  }

  window.deleteAddress = async (index) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return

    try {
      const addresses = userData.addresses.filter((_, i) => i !== index)
      await updateDoc(doc(db, "users", currentUser.uid), {
        addresses: addresses,
        updatedAt: new Date().toISOString(),
      })

      userData.addresses = addresses
      loadAddresses()
      showSuccess("Xóa địa chỉ thành công!")
    } catch (error) {
      console.error("Error deleting address:", error)
      showError("addressError", "Có lỗi xảy ra. Vui lòng thử lại.")
    }
  }
}

// HEADER FUNCTIONALITY
function setupHeader() {
  // Auth status check
  onAuthStateChanged(auth, (user) => {
    const authButtons = document.getElementById("authButtons")
    const userProfile = document.getElementById("userProfile")

    if (user) {
      if (authButtons) {
        authButtons.style.display = "none"
        authButtons.classList.add("hidden")
      }
      if (userProfile) {
        userProfile.style.display = "flex"
        userProfile.classList.remove("hidden")
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

  // Logout
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault()
      try {
        await signOut(auth)
        window.location.href = "index.html"
      } catch (error) {
        console.error("Logout error:", error)
      }
    })
  }

  // Dropdown menu
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

  // Cart icon
  const cartIcon = document.getElementById("cartIcon")
  if (cartIcon) {
    cartIcon.addEventListener("click", () => {
      window.location.href = "cart.html"
    })
  }

  // Load cart badge
  const cart = JSON.parse(localStorage.getItem("cart") || "[]")
  const total = cart.reduce((sum, item) => sum + item.quantity, 0)
  const badge = document.getElementById("cartBadge")
  if (badge) badge.textContent = total

  // Hamburger menu
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("navMenu")
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation()
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on nav links
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
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

// UTILITY FUNCTIONS
function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId)
  if (errorEl) {
    errorEl.textContent = message
    errorEl.classList.add("show")
    const input = errorEl.previousElementSibling || errorEl.parentElement.querySelector("input")
    if (input) input.classList.add("error")
  }
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.remove("show")
    el.textContent = ""
  })
  document.querySelectorAll(".error").forEach((el) => {
    el.classList.remove("error")
  })
}

function showSuccess(message) {
  const toast = document.createElement("div")
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
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
  }, 3000)
}

// INITIALIZE
window.addEventListener("load", () => {
  checkAuthAndLoadData()
  setupHeader()
  setupProfileNavigation()
  setupProfileForm()
  setupPasswordForm()
  setupPasswordToggles()
  setupAddressModal()
})
