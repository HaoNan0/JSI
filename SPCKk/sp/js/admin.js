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

const mockCategories = [
  {
    id: 1,
    name: "Electronics",
    icon: "fa-box",
    productCount: 3,
  },
  {
    id: 2,
    name: "Fashion",
    icon: "fa-shirt",
    productCount: 0,
  },
  {
    id: 3,
    name: "Home & Garden",
    icon: "fa-home",
    productCount: 0,
  },
]

// Track if editing a product (store product ID)
let editingProductId = null

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

// POPULATE CATEGORY DROPDOWN
// Lý do: Fill category select with available categories
function populateCategoryDropdown() {
  const select = document.getElementById("productCategory")
  if (!select) return

  // Clear existing options except the first one
  select.innerHTML = '<option value="">-- Chọn Danh Mục --</option>'
  
  mockCategories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category.name
    option.textContent = category.name
    select.appendChild(option)
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

  // Populate category dropdown
  populateCategoryDropdown()

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:298',message:'Add product button clicked',data:{action:'add'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      editingProductId = null
      document.getElementById("modalTitle").textContent = "Thêm Sản Phẩm"
      if (form) form.reset()
      document.getElementById("productImagePreview").classList.add("hidden")
      document.getElementById("productImageUrl").value = ""
      if (modal) modal.classList.remove("hidden")
    })
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (modal) modal.classList.add("hidden")
    })
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (modal) modal.classList.add("hidden")
    })
  }

  if (form) {
    form.addEventListener("submit", (e) => {
    e.preventDefault()

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:271',message:'Product form submit',data:{editingId:editingProductId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    const name = document.getElementById("productName").value.trim()
    const category = document.getElementById("productCategory").value
    const price = parseInt(document.getElementById("productPrice").value)
    const stock = parseInt(document.getElementById("productStock").value)
    const description = document.getElementById("productDescription").value.trim()
    const imageUrl = document.getElementById("productImageUrl").value

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:284',message:'Form data extracted',data:{name,category,price,stock,hasDescription:!!description,hasImage:!!imageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!name || !category || !price || stock === undefined || !imageUrl) {
      alert("Vui lòng điền đầy đủ thông tin!")
      return
    }

    if (editingProductId !== null) {
      // Edit existing product
      const productIndex = mockProducts.findIndex((p) => p.id === editingProductId)
      if (productIndex > -1) {
        mockProducts[productIndex] = {
          ...mockProducts[productIndex],
          name,
          category,
          price,
          stock,
          description,
          image: imageUrl,
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:304',message:'Product updated',data:{id:editingProductId,productIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // Add new product
      const newId = mockProducts.length > 0 ? Math.max(...mockProducts.map((p) => p.id)) + 1 : 1
      mockProducts.push({
        id: newId,
        name,
        category,
        price,
        stock,
        description,
        image: imageUrl,
      })
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:317',message:'Product added',data:{id:newId,name,category},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }

    alert("Sản phẩm đã được lưu!")
    if (modal) modal.classList.add("hidden")
    renderProductsTable()
    })
  }

  // Close modal when click outside
  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden")
      }
    })
  }
}

// GLOBAL FUNCTIONS for inline onclick
window.editProduct = (id) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:398',message:'Edit product called',data:{id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const modal = document.getElementById("productModal")
  if (!modal) return
  
  const modalTitle = document.getElementById("modalTitle")
  if (modalTitle) modalTitle.textContent = "Sửa Sản Phẩm"
  
  const product = mockProducts.find((p) => p.id === id)
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:408',message:'Product found for edit',data:{found:!!product,hasCategory:!!product?.category,hasDescription:!!product?.description,hasImage:!!product?.image},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (product) {
    editingProductId = id
    const nameInput = document.getElementById("productName")
    const priceInput = document.getElementById("productPrice")
    const stockInput = document.getElementById("productStock")
    const categoryInput = document.getElementById("productCategory")
    const descriptionInput = document.getElementById("productDescription")
    
    if (nameInput) nameInput.value = product.name || ""
    if (priceInput) priceInput.value = product.price || ""
    if (stockInput) stockInput.value = product.stock || ""
    if (categoryInput) categoryInput.value = product.category || ""
    if (descriptionInput) descriptionInput.value = product.description || ""
    
    // Handle image
    const imageUrlInput = document.getElementById("productImageUrl")
    const previewContainer = document.getElementById("productImagePreview")
    const previewImage = document.getElementById("previewImage")
    
    if (product.image && imageUrlInput && previewImage && previewContainer) {
      imageUrlInput.value = product.image
      previewImage.src = product.image
      previewContainer.classList.remove("hidden")
    } else if (imageUrlInput && previewContainer) {
      imageUrlInput.value = ""
      previewContainer.classList.add("hidden")
    }
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

// RENDER CATEGORIES
// Lý do: Display categories in grid layout
function renderCategories() {
  const grid = document.getElementById("categoryGrid")
  if (!grid) return

  grid.innerHTML = mockCategories
    .map(
      (category) => `
    <div class="category-card">
      <div class="icon"><i class="fa-solid ${category.icon}"></i></div>
      <h3>${category.name}</h3>
      <p>${category.productCount} sản phẩm</p>
      <div style="margin-top: 1rem;">
        <button class="action-btn" onclick="editCategory(${category.id})">Sửa</button>
        <button class="action-btn delete" onclick="deleteCategory(${category.id})">Xóa</button>
      </div>
    </div>
  `,
    )
    .join("")
}

// CATEGORY MANAGEMENT
window.editCategory = (id) => {
  const category = mockCategories.find((c) => c.id === id)
  if (category) {
    const name = prompt("Nhập tên danh mục mới:", category.name)
    if (name && name.trim()) {
      category.name = name.trim()
      renderCategories()
    }
  }
}

window.deleteCategory = (id) => {
  if (confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
    const index = mockCategories.findIndex((c) => c.id === id)
    if (index > -1) {
      mockCategories.splice(index, 1)
      renderCategories()
    }
  }
}

function setupCategoryModal() {
  const addBtn = document.getElementById("addCategoryBtn")
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:410',message:'Add category button clicked',data:{action:'add'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const name = prompt("Nhập tên danh mục:")
      if (name && name.trim()) {
        const newId = mockCategories.length > 0 ? Math.max(...mockCategories.map((c) => c.id)) + 1 : 1
        mockCategories.push({
          id: newId,
          name: name.trim(),
          icon: "fa-tag",
          productCount: 0,
        })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:420',message:'Category added',data:{id:newId,name:name.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        renderCategories()
      }
    })
  }
}

// SETTINGS FORM
function setupSettingsForm() {
  const form = document.getElementById("settingsForm")
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:434',message:'Settings form submit',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      alert("Cài đặt đã được lưu!")
    })
  }
}

// SEARCH FUNCTIONALITY
function setupSearch() {
  const searchInput = document.getElementById("adminSearch")
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/318ddf1e-b891-4683-862e-0b209af2f534',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin.js:446',message:'Search input',data:{query,length:query.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      // Simple search: filter based on current section
      // This is a basic implementation - can be enhanced
      if (query) {
        // Could implement section-specific search here
        console.log("Searching for:", query)
      }
    })
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
  setupCategoryModal()
  setupSettingsForm()
  setupSearch()
  initCloudinaryWidget()
  setupCloudinaryUpload()
  renderRecentOrders()
  renderProductsTable()
  renderOrdersTable()
  renderUsersTable()
  renderCategories()
})
