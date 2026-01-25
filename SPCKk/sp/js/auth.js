/* ============================================
   AUTH.JS - Firebase Authentication Integration
   Lý do: Xử lý đăng ký, đăng nhập với Firebase
   Validation: Email format + Password 8+ chars
   ============================================ */

import { auth, db } from "./firebase-config.js"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// UTILITY: Validate email format
// Lý do: Kiểm tra email phải có @ và domain
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// UTILITY: Calculate password strength
function calculatePasswordStrength(password) {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*]/.test(password)) strength++

  if (strength < 2) return "weak"
  if (strength < 4) return "medium"
  return "strong"
}

// UTILITY: Show error toast
// Lý do: Hiển thị thông báo lỗi đẹp hơn alert()
function showError(message) {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = "toast error-toast"
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(toast)

  // Remove after 3s
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// UTILITY: Show success toast
function showSuccess(message) {
  const toast = document.createElement("div")
  toast.className = "toast success-toast"
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

// ============= REGISTER PAGE =============
function setupRegisterForm() {
  const form = document.getElementById("registerForm")
  if (!form) return

  const nameInput = document.getElementById("name")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const confirmInput = document.getElementById("confirmPassword")
  const togglePasswordBtn = document.getElementById("togglePassword")
  const toggleConfirmBtn = document.getElementById("toggleConfirm")
  const strengthBar = document.getElementById("strengthBar")
  const strengthText = document.getElementById("strengthText")

  if (!nameInput || !emailInput || !passwordInput || !confirmInput || !togglePasswordBtn || !toggleConfirmBtn) {
    console.error("Register form elements not found")
    return
  }

  // PASSWORD VISIBILITY TOGGLE
  togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault()
    const isPassword = passwordInput.type === "password"
    passwordInput.type = isPassword ? "text" : "password"
    const icon = togglePasswordBtn.querySelector("i")
    if (icon) {
      icon.classList.toggle("fa-eye")
      icon.classList.toggle("fa-eye-slash")
    }
  })

  toggleConfirmBtn.addEventListener("click", (e) => {
    e.preventDefault()
    const isPassword = confirmInput.type === "password"
    confirmInput.type = isPassword ? "text" : "password"
    const icon = toggleConfirmBtn.querySelector("i")
    if (icon) {
      icon.classList.toggle("fa-eye")
      icon.classList.toggle("fa-eye-slash")
    }
  })

  // PASSWORD STRENGTH INDICATOR
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value
    const strength = calculatePasswordStrength(password)

    strengthBar.className = "strength-bar"
    strengthText.className = "strength-text"

    if (password.length === 0) {
      strengthText.textContent = ""
    } else {
      strengthBar.classList.add(strength)
      strengthText.classList.add(strength)
      strengthText.textContent = {
        weak: "Yếu",
        medium: "Trung Bình",
        strong: "Mạnh",
      }[strength]
    }
  })

  // EMAIL VALIDATION - On blur
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value
    const errorEl = document.getElementById("emailError")

    if (email && !validateEmail(email)) {
      errorEl.textContent = "Email không hợp lệ"
      emailInput.classList.add("input-error")
    } else {
      errorEl.textContent = ""
      emailInput.classList.remove("input-error")
    }
  })

  passwordInput.addEventListener("blur", () => {
    const errorEl = document.getElementById("passwordError")
    const password = passwordInput.value

    if (password.length > 0 && password.length < 8) {
      errorEl.textContent = "Mật khẩu phải có ít nhất 8 ký tự"
      passwordInput.classList.add("input-error")
    } else {
      errorEl.textContent = ""
      passwordInput.classList.remove("input-error")
    }
  })

  // PASSWORD CONFIRM VALIDATION
  confirmInput.addEventListener("blur", () => {
    const errorEl = document.getElementById("confirmError")

    if (passwordInput.value !== confirmInput.value) {
      errorEl.textContent = "Mật khẩu không khớp"
      confirmInput.classList.add("input-error")
    } else {
      errorEl.textContent = ""
      confirmInput.classList.remove("input-error")
    }
  })

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = nameInput.value.trim()
    const email = emailInput.value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmInput.value

    // Validation
    if (!name) {
      showError("Vui lòng nhập họ và tên")
      return
    }

    if (!validateEmail(email)) {
      showError("Email không hợp lệ")
      return
    }

    if (password.length < 8) {
      showError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    if (password !== confirmPassword) {
      showError("Mật khẩu không khớp")
      return
    }

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = "Đang xử lý..."

    try {
      // CREATE USER WITH FIREBASE AUTH
      // Lý do: Firebase xử lý authentication, hash password tự động
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // UPDATE DISPLAY NAME
      // Lý do: Lưu tên người dùng vào Firebase Auth profile
      await updateProfile(user, { displayName: name })

      // SAVE TO FIRESTORE
      // Lý do: Lưu thông tin chi tiết người dùng vào database
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "customer",
        createdAt: new Date().toISOString(),
      })

      showSuccess("Đăng ký thành công!")

      // Redirect to homepage
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    } catch (error) {
      console.error("Register error:", error)

      // Firebase error messages
      let errorMessage = "Đăng ký không thành công"

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email đã được sử dụng"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Mật khẩu quá yếu"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ"
      }

      showError(errorMessage)
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = "Đăng Ký"
      }
    }
  })
}

// Initialize register form when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupRegisterForm)
} else {
  setupRegisterForm()
}

// ============= LOGIN PAGE =============
function setupLoginForm() {
  const form = document.getElementById("loginForm")
  if (!form) return

  const emailInput = document.getElementById("loginEmail")
  const passwordInput = document.getElementById("loginPassword")
  const togglePasswordBtn = document.getElementById("toggleLoginPassword")
  const rememberMeCheckbox = document.getElementById("rememberMe")

  if (!emailInput || !passwordInput || !togglePasswordBtn || !rememberMeCheckbox) {
    console.error("Login form elements not found")
    return
  }

  // PASSWORD VISIBILITY TOGGLE
  togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault()
    const isPassword = passwordInput.type === "password"
    passwordInput.type = isPassword ? "text" : "password"
    const icon = togglePasswordBtn.querySelector("i")
    if (icon) {
      icon.classList.toggle("fa-eye")
      icon.classList.toggle("fa-eye-slash")
    }
  })

  // LOAD REMEMBERED EMAIL
  const rememberedEmail = localStorage.getItem("remembered_email")
  if (rememberedEmail) {
    emailInput.value = rememberedEmail
    rememberMeCheckbox.checked = true
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = emailInput.value.trim()
    const password = passwordInput.value

    // Validation
    if (!email) {
      showError("Vui lòng nhập email")
      return
    }

    if (!validateEmail(email)) {
      showError("Email không hợp lệ")
      return
    }

    if (!password) {
      showError("Vui lòng nhập mật khẩu")
      return
    }

    // Handle remember me
    if (rememberMeCheckbox.checked) {
      localStorage.setItem("remembered_email", email)
    } else {
      localStorage.removeItem("remembered_email")
    }

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = "Đang đăng nhập..."
    }

    try {
      // SIGN IN WITH FIREBASE
      // Lý do: Firebase xử lý authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // GET USER DATA FROM FIRESTORE
      // Lý do: Lấy thông tin chi tiết từ database
      let userData = null
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        userData = userDoc.data()
      } catch (dbError) {
        console.error("Error fetching user data:", dbError)
      }

      showSuccess("Đăng nhập thành công!")

      // Redirect based on role
      setTimeout(() => {
        if (userData?.role === "admin") {
          window.location.href = "admin.html"
        } else {
          // Redirect to products section on homepage
          window.location.href = "index.html?from=login#products"
        }
      }, 1000)
    } catch (error) {
      console.error("Login error:", error)

      // Firebase error messages
      let errorMessage = "Đăng nhập không thành công"

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email không tồn tại"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mật khẩu không đúng"
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Email hoặc mật khẩu không đúng"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Quá nhiều lần thử. Vui lòng thử lại sau"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ"
      }

      showError(errorMessage)
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = "Đăng Nhập"
      }
    }
  })
}

// Initialize login form when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLoginForm)
} else {
  setupLoginForm()
}
