/* ============================================
   ADMIN.JS
   Admin dashboard logic with Cloudinary integration
   Quản lý: Products, Orders, Users, Categories
   ============================================ */

// CLOUDINARY CONFIG
// Lý do: Credentials cho Cloudinary upload widget
// User cần thay YOUR_CLOUD_NAME và YOUR_UPLOAD_PRESET
const CLOUDINARY_CLOUD_NAME = `dipk2lnyf` // Thay bằng cloud name từ Cloudinary
const CLOUDINARY_UPLOAD_PRESET = `sanphamck` // Thay bằng upload preset

// MOCK ADMIN DATA
const mockOrders = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    value: 5000000,
    status: "pending",
    date: "2025-01-20",
  },
  {
    id: "ORD002",
    customer: "Trần Thị B",
    value: 8500000,
    status: "shipped",
    date: "2025-01-19",
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    value: 3200000,
    status: "delivered",
    date: "2025-01-18",
  },
]

const mockProducts = [
  {
    id: 1,
    name: "Laptop Gaming",
    category: "Electronics",
    stock: 12,
    price: 25000000,
  },
  {
    id: 2,
    name: "Tai Nghe Wireless",
    category: "Electronics",
    stock: 45,
    price: 2500000,
  },
  {
    id: 3,
    name: "Smartphone X",
    category: "Electronics",
    stock: 0,
    price: 15000000,
  },
]

const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyena@email.com",
    role: "customer",
    created: "2025-01-15",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranb@email.com",
    role: "customer",
    created: "2025-01-10",
  },
]

// CHECK ADMIN AUTH
// Lý do: Chỉ admin mới có quyền truy cập trang này
function checkAdminAuth() {
  const token = localStorage.getItem("auth_token")
  const user = localStorage.getItem("user")

  if (!token || !user) {
    window.location.href = "login.html"
    return
  }

  const userData = JSON.parse(user)
  if (userData.role !== "admin") {
    alert("Bạn không có quyền truy cập!")
    window.location.href = "index.html"
  }
}

// SIDEBAR NAVIGATION
// Lý do: Click sidebar item → show/hide section
function setupSidebar() {
  const sidebarLinks = document.querySelectorAll(".sidebar-link")
  const sections = document.querySelectorAll(".admin-section")

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()

      // Remove active from all
      sidebarLinks.forEach((l) => l.classList.remove("active"))
      sections.forEach((s) => s.classList.remove("active"))

      // Add active to current
      link.classList.add("active")
      const sectionId = link.dataset.section + "Section"
      const section = document.getElementById(sectionId)
      if (section) {
        section.classList.add("active")
      }
    })
  })
}

// LOGOUT
// Lý do: Clear token + redirect
function setupLogout() {
  const logoutBtn = document.getElementById("adminLogout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        window.location.href = "login.html"
      }
    })
  }
}

// RENDER RECENT ORDERS
// Lý do: Table hiển thị đơn hàng gần đây
function renderRecentOrders() {
  const tbody = document.getElementById("recentOrdersBody")
  tbody.innerHTML = mockOrders
    .map(
      (order) => `
    <tr>
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>₫${order.value.toLocaleString("vi-VN")}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${order.date}</td>
      <td>
        <button class="action-btn">Xem</button>
        <button class="action-btn delete">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// RENDER PRODUCTS TABLE
// Lý do: CRUD interface cho products
function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody")
  tbody.innerHTML = mockProducts
    .map(
      (product) => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.stock}</td>
      <td>₫${product.price.toLocaleString("vi-VN")}</td>
      <td>
        <button class="action-btn" onclick="editProduct(${product.id})">Sửa</button>
        <button class="action-btn delete" onclick="deleteProduct(${product.id})">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// RENDER ORDERS TABLE
// Lý do: Quản lý đơn hàng với filter
function renderOrdersTable(status = "all") {
  const tbody = document.getElementById("ordersTableBody")
  const filtered = status === "all" ? mockOrders : mockOrders.filter((o) => o.status === status)

  tbody.innerHTML = filtered
    .map(
      (order) => `
    <tr>
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>₫${order.value.toLocaleString("vi-VN")}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${order.date}</td>
      <td>
        <button class="action-btn" onclick="updateOrderStatus('${order.id}')">Cập nhật</button>
        <button class="action-btn delete">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// RENDER USERS TABLE
// Lý do: Quản lý người dùng, phân quyền
function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody")
  tbody.innerHTML = mockUsers
    .map(
      (user) => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.created}</td>
      <td>
        <button class="action-btn">Khóa</button>
        <button class="action-btn delete">Xóa</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// ORDER FILTER
// Lý do: Filter orders by status
function setupOrderFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn")
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      renderOrdersTable(btn.dataset.status)
    })
  })
}

// ADD PRODUCT MODAL
// Lý do: Form popup để add product
function setupProductModal() {
  const addBtn = document.getElementById("addProductBtn")
  const modal = document.getElementById("productModal")
  const closeBtn = document.getElementById("closeProductModal")
  const cancelBtn = document.getElementById("cancelProductModal")
  const form = document.getElementById("productForm")

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      document.getElementById("modalTitle").textContent = "Thêm Sản Phẩm"
      form.reset()
      document.getElementById("productImagePreview").classList.add("hidden")
      document.getElementById("productImageUrl").value = ""
      modal.classList.remove("hidden")
    })
  }

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
  })

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
  })

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const imageUrl = document.getElementById("productImageUrl").value
    if (!imageUrl) {
      alert("Vui lòng upload hình ảnh sản phẩm!")
      return
    }

    alert("Sản phẩm đã được lưu!")
    modal.classList.add("hidden")
    renderProductsTable()
  })

  // Close modal when click outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
    }
  })
}

// GLOBAL FUNCTIONS for inline onclick
window.editProduct = (id) => {
  const modal = document.getElementById("productModal")
  document.getElementById("modalTitle").textContent = "Sửa Sản Phẩm"
  const product = mockProducts.find((p) => p.id === id)
  if (product) {
    document.getElementById("productName").value = product.name
    document.getElementById("productPrice").value = product.price
    document.getElementById("productStock").value = product.stock
  }
  modal.classList.remove("hidden")
}

window.deleteProduct = (id) => {
  if (confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
    const index = mockProducts.findIndex((p) => p.id === id)
    if (index > -1) {
      mockProducts.splice(index, 1)
      renderProductsTable()
    }
  }
}

window.updateOrderStatus = (orderId) => {
  const order = mockOrders.find((o) => o.id === orderId)
  if (order) {
    const statuses = ["pending", "shipped", "delivered", "cancelled"]
    const currentIndex = statuses.indexOf(order.status)
    order.status = statuses[(currentIndex + 1) % statuses.length]
    renderOrdersTable()
  }
}

// CLOUDINARY UPLOAD WIDGET
// Lý do: Upload ảnh lên Cloudinary cloud storage
// Khi upload thành công, lưu URL vào hidden input
let cloudinaryWidget = null
const cloudinary = window.cloudinary // Declare the cloudinary variable

function initCloudinaryWidget() {
  if (typeof cloudinary === "undefined") {
    console.error("Cloudinary script not loaded")
    return
  }

  cloudinaryWidget = cloudinary.createUploadWidget(
    {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      sources: ["local", "url", "camera"],
      multiple: false,
      maxFiles: 1,
      clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
      maxFileSize: 5000000, // 5MB
      showAdvancedOptions: false,
      cropping: true,
      croppingAspectRatio: 1,
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#0ea5e9",
          tabIcon: "#0ea5e9",
          menuIcons: "#164e63",
          textDark: "#0c3d66",
          textLight: "#FFFFFF",
          link: "#0ea5e9",
          action: "#0ea5e9",
          inactiveTabIcon: "#7dd3fc",
          error: "#ef4444",
          inProgress: "#0ea5e9",
          complete: "#10b981",
          sourceBg: "#f0f9ff",
        },
      },
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        console.log("Upload thành công:", result.info)
        const imageUrl = result.info.secure_url

        // Update preview
        const previewContainer = document.getElementById("productImagePreview")
        const previewImage = document.getElementById("previewImage")
        const imageUrlInput = document.getElementById("productImageUrl")

        previewImage.src = imageUrl
        imageUrlInput.value = imageUrl
        previewContainer.classList.remove("hidden")
      }

      if (error) {
        console.error("Upload error:", error)
        alert("Lỗi upload ảnh. Vui lòng thử lại!")
      }
    },
  )
}

function setupCloudinaryUpload() {
  const uploadBtn = document.getElementById("uploadImageBtn")
  const removeBtn = document.getElementById("removeImageBtn")

  if (uploadBtn) {
    uploadBtn.addEventListener("click", (e) => {
      e.preventDefault()
      if (cloudinaryWidget) {
        cloudinaryWidget.open()
      } else {
        alert("Cloudinary widget chưa sẵn sàng. Vui lòng kiểm tra config!")
      }
    })
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const previewContainer = document.getElementById("productImagePreview")
      const imageUrlInput = document.getElementById("productImageUrl")

      previewContainer.classList.add("hidden")
      imageUrlInput.value = ""
    })
  }
}

// INITIALIZE ADMIN PAGE
window.addEventListener("load", () => {
  checkAdminAuth()
  setupSidebar()
  setupLogout()
  setupProductModal()
  setupOrderFilters()
  initCloudinaryWidget()
  setupCloudinaryUpload()
  renderRecentOrders()
  renderProductsTable()
  renderOrdersTable()
  renderUsersTable()
})
