/* ============================================
   ADMIN.JS
   Admin dashboard logic with Cloudinary integration
   Quản lý: Products, Orders, Users, Categories
   ============================================ */

// IMPORT FIREBASE
import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

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
// Sử dụng Firebase Auth thay vì localStorage
function checkAdminAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // User not logged in, redirect to login
      window.location.href = "login.html"
      return
    }

    // Check user role in Firestore
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      if (!userData || userData.role !== "admin") {
        alert("Bạn không có quyền truy cập trang admin!")
        window.location.href = "index.html"
        return
      }

      // Update admin profile name in UI
      const profileName = document.querySelector(".profile-name")
      if (profileName) {
        profileName.textContent = userData.name || user.email || "Admin User"
      }
    } catch (error) {
      console.error("Error checking admin auth:", error)
      alert("Lỗi kiểm tra quyền truy cập!")
      window.location.href = "login.html"
    }
  })
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

      // Close sidebar on mobile after selecting a link
      const sidebar = document.querySelector(".admin-sidebar")
      const hamburger = document.getElementById("sidebarToggle")
      if (window.innerWidth <= 768 && sidebar && hamburger) {
        sidebar.classList.remove("active")
        hamburger.classList.remove("active")
      }
    })
  })
}

// HAMBURGER MENU TOGGLE (Mobile)
// Lý do: Toggle sidebar visibility on mobile
function setupHamburgerMenu() {
  const hamburger = document.getElementById("sidebarToggle")
  const sidebar = document.querySelector(".admin-sidebar")

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active")
      hamburger.classList.toggle("active")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (
          sidebar.classList.contains("active") &&
          !sidebar.contains(e.target) &&
          !hamburger.contains(e.target)
        ) {
          sidebar.classList.remove("active")
          hamburger.classList.remove("active")
        }
      }
    })
  }
}

// LOGOUT
// Lý do: Firebase sign out + redirect
function setupLogout() {
  const logoutBtn = document.getElementById("adminLogout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
        try {
          await signOut(auth)
          window.location.href = "login.html"
        } catch (error) {
          console.error("Logout error:", error)
          alert("Lỗi đăng xuất. Vui lòng thử lại!")
        }
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

// LOAD PRODUCTS FROM FIRESTORE
// Lý do: Load products từ Firestore thay vì mock data
async function loadProductsFromFirestore() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"))
    const products = []
    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    mockProducts.length = 0
    mockProducts.push(...products)
    renderProductsTable()
  } catch (error) {
    console.error("Error loading products:", error)
  }
}

// RENDER PRODUCTS TABLE
// Lý do: CRUD interface cho products
function renderProductsTable() {
  const tbody = document.getElementById("productsTableBody")
  if (!tbody) return

  if (mockProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có sản phẩm nào</td></tr>'
    return
  }

  tbody.innerHTML = mockProducts
    .map(
      (product) => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category || "N/A"}</td>
      <td>${product.stock || 0}</td>
      <td>₫${(product.price || 0).toLocaleString("vi-VN")}</td>
      <td>
        <button class="action-btn" onclick="editProduct('${product.id}')">Sửa</button>
        <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Xóa</button>
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
    form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("productName").value.trim()
    const category = document.getElementById("productCategory").value
    const price = parseInt(document.getElementById("productPrice").value)
    const stock = parseInt(document.getElementById("productStock").value)
    const description = document.getElementById("productDescription").value.trim()
    const imageUrl = document.getElementById("productImageUrl").value

    if (!name || !category || !price || stock === undefined || !imageUrl) {
      alert("Vui lòng điền đầy đủ thông tin!")
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = "Đang lưu..."

    try {
      const productData = {
        name,
        category,
        price,
        stock,
        description: description || "",
        image: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (editingProductId !== null) {
        // Edit existing product in Firestore
        const productRef = doc(db, "products", editingProductId)
        await updateDoc(productRef, {
          ...productData,
          updatedAt: new Date().toISOString(),
        })
        alert("Sản phẩm đã được cập nhật!")
      } else {
        // Add new product to Firestore
        await addDoc(collection(db, "products"), productData)
        alert("Sản phẩm đã được thêm thành công!")
      }

      if (modal) modal.classList.add("hidden")
      form.reset()
      document.getElementById("productImagePreview").classList.add("hidden")
      document.getElementById("productImageUrl").value = ""
      editingProductId = null
      await loadProductsFromFirestore()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Lỗi lưu sản phẩm: " + error.message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Lưu"
    }
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
  const modal = document.getElementById("productModal")
  if (!modal) return
  
  const modalTitle = document.getElementById("modalTitle")
  if (modalTitle) modalTitle.textContent = "Sửa Sản Phẩm"
  
  const product = mockProducts.find((p) => p.id === id)

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

window.deleteProduct = async (id) => {
  if (confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
    try {
      await deleteDoc(doc(db, "products", id))
      const index = mockProducts.findIndex((p) => p.id === id)
      if (index > -1) {
        mockProducts.splice(index, 1)
        renderProductsTable()
      }
      alert("Sản phẩm đã được xóa!")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Lỗi xóa sản phẩm: " + error.message)
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

        if (previewImage && imageUrlInput && previewContainer) {
          previewImage.src = imageUrl
          imageUrlInput.value = imageUrl
          previewContainer.classList.remove("hidden")
        }
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

      if (previewContainer) previewContainer.classList.add("hidden")
      if (imageUrlInput) imageUrlInput.value = ""
    })
  }
}

// INITIALIZE ADMIN PAGE
window.addEventListener("load", () => {
  checkAdminAuth()
  setupSidebar()
  setupHamburgerMenu()
  setupLogout()
  setupProductModal()
  setupOrderFilters()
  setupCategoryModal()
  setupSettingsForm()
  setupSearch()
  initCloudinaryWidget()
  setupCloudinaryUpload()
  renderRecentOrders()
  loadProductsFromFirestore() // Load from Firestore instead of mock data
  renderOrdersTable()
  renderUsersTable()
  renderCategories()
})
