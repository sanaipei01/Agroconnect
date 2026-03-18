// API base URL
const API_BASE = "http://localhost:5000/api";

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// Fetch products from backend
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Fetch farmer's products
async function fetchFarmerProducts() {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user || user.role !== "farmer") {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/products/farmer/${user._id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch farmer products");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    return [];
  }
}

// Global products array
let products = [];
let farmerProducts = [];

// Render marketplace products
async function renderMarketplace() {
  const list = document.getElementById("productList");
  if (!list) return;

  // Fetch products from backend
  products = await fetchProducts();

  list.innerHTML = "";

  products.forEach((product, index) => {
    list.innerHTML += `
      <div class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
        <div class="p-4">
          <h3 class="text-lg font-bold text-green-700 mb-2">
            ${product.name}
          </h3>
          <p class="text-gray-600">
            Price: KES ${product.price} / kg
          </p>
          <p class="text-gray-600">
            Quantity: ${product.quantity} kg
          </p>
          <p class="text-gray-600">
            Location: ${product.location}
          </p>
          <span class="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            ${product.availability}
          </span>
          <button
            onclick="startOrder('${product._id}')"
            class="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Order / Negotiate
          </button>
        </div>
      </div>
    `;
  });
}

// Search products
function searchProducts() {
  const keyword = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(keyword) ||
    product.location.toLowerCase().includes(keyword)
  );

  const list = document.getElementById("productList");
  list.innerHTML = "";

  filteredProducts.forEach((product) => {
    list.innerHTML += `
      <div class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
        <div class="p-4">
          <h3 class="text-lg font-bold text-green-700 mb-2">
            ${product.name}
          </h3>
          <p class="text-gray-600">
            Price: KES ${product.price} / kg
          </p>
          <p class="text-gray-600">
            Quantity: ${product.quantity} kg
          </p>
          <p class="text-gray-600">
            Location: ${product.location}
          </p>
          <span class="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            ${product.availability}
          </span>
          <button
            onclick="startOrder('${product._id}')"
            class="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Order / Negotiate
          </button>
        </div>
      </div>
    `;
  });
}


// Render farmer products
async function renderFarmerProducts() {
  const list = document.getElementById("farmerProducts");
  if (!list) return;

  // Fetch farmer products from backend
  farmerProducts = await fetchFarmerProducts();

  list.innerHTML = "";

  farmerProducts.forEach((product, index) => {
    list.innerHTML += `
      <div class="product-card">
        <h3>${product.name}</h3>
        <p>Price: KES ${product.price}</p>
        <p>Quantity: ${product.quantity} kg</p>
        <p>Location: ${product.location}</p>
        <p>Status: ${product.availability}</p>
        <button onclick="deleteProduct('${product._id}')">Delete</button>
      </div>
    `;
  });
}


// Delete product
async function deleteProduct(productId) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    // Refresh farmer products
    await renderFarmerProducts();
    // Also refresh marketplace if needed
    await renderMarketplace();
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Failed to delete product");
  }
}


// Handle product form submission
const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = getToken();
    if (!token) {
      alert("Please login first");
      return;
    }

    const product = {
      name: document.getElementById("name").value,
      quantity: parseInt(document.getElementById("quantity").value),
      price: parseInt(document.getElementById("price").value),
      location: document.getElementById("location").value,
      availability: document.getElementById("availability").value
    };

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      form.reset();
      await renderFarmerProducts();
      await renderMarketplace();
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    }
  });
}


function startOrder(index) {
  localStorage.setItem(
    "selectedProduct",
    JSON.stringify(products[index])
  );
  window.location.href = "order.html";
}


renderMarketplace();
renderFarmerProducts();