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
    const response = await fetch(`${API_BASE}/products/farmer/${user.id}`, {
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


// Render farmer orders
async function renderFarmerOrders() {
  const list = document.getElementById("farmerOrders");
  if (!list) return;

  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user || user.role !== "farmer") {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/farmer`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();

    list.innerHTML = "";

    if (orders.length === 0) {
      list.innerHTML = `
        <div class="col-span-full text-center py-8 bg-white rounded-lg shadow">
          <p class="text-gray-500">No orders yet.</p>
          <p class="text-gray-400 text-sm mt-1">Orders for your products will appear here.</p>
        </div>
      `;
      return;
    }

    orders.forEach((order) => {
      const statusColor = getOrderStatusColor(order.status);

      list.innerHTML += `
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-bold text-green-700">${order.product.name}</h3>
            <span class="px-3 py-1 rounded-full text-sm ${statusColor}">${order.status}</span>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
            <p><strong>Quantity:</strong> ${order.quantity} kg</p>
            <p><strong>Total Price:</strong> KES ${order.totalPrice}</p>
            <p><strong>Delivery Location:</strong> ${order.deliveryLocation}</p>
            <p><strong>Buyer:</strong> ${order.buyer.name} (${order.buyer.email})</p>
            ${order.transporter ? `<p><strong>Transporter:</strong> ${order.transporter.name}</p>` : ''}
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          </div>

          <div class="mt-4 flex gap-2">
            ${order.status === "pending" ? `
              <button
                onclick="updateOrderStatus('${order._id}', 'accepted')"
                class="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                Accept Order
              </button>
              <button
                onclick="updateOrderStatus('${order._id}', 'cancelled')"
                class="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
                Reject Order
              </button>
            ` : order.status === "accepted" ? `
              <button
                onclick="updateOrderStatus('${order._id}', 'in-transit')"
                class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Mark as In Transit
              </button>
            ` : `
              <p class="text-center text-gray-500 text-sm w-full">Order ${order.status}</p>
            `}
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    list.innerHTML = `
      <div class="col-span-full text-center py-8 bg-white rounded-lg shadow">
        <p class="text-red-500">Failed to load orders.</p>
      </div>
    `;
  }
}

// Update order status (for farmers)
async function updateOrderStatus(orderId, status) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update order status");
    }

    alert(`Order ${status === "cancelled" ? "rejected" : "updated"} successfully!`);
    await renderFarmerOrders();
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Failed to update order: " + error.message);
  }
}

// Get order status color
function getOrderStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "in-transit":
      return "bg-orange-100 text-orange-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
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


function startOrder(productId) {
  const selected = products.find(p => p._id === productId || p.id === productId);

  if (!selected) {
    alert("Unable to start order: product not found.");
    return;
  }

  const normalized = {
    ...selected,
    _id: selected._id || selected.id
  };

  localStorage.setItem(
    "selectedProduct",
    JSON.stringify(normalized)
  );
  window.location.href = "order.html";
}


// Initialize when page loads
document.addEventListener("DOMContentLoaded", async function() {
  await renderMarketplace();
  await renderFarmerProducts();
  await renderFarmerOrders();
});