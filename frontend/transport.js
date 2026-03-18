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

// Fetch available orders for transporters
async function fetchAvailableOrders() {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/orders/available`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Fetch orders assigned to this transporter
async function fetchMyOrders() {
  const token = getToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/orders/transporter`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch my orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return [];
  }
}

/* RENDER DELIVERY DASHBOARD */
async function renderDeliveries() {
  const list = document.getElementById("deliveryList");
  if (!list) return;

  // Fetch available and assigned orders
  const availableOrders = await fetchAvailableOrders();
  const myOrders = await fetchMyOrders();

  const allOrders = [...availableOrders, ...myOrders];

  list.innerHTML = "";

  if (allOrders.length === 0) {
    list.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500 text-lg">No delivery requests available.</p>
        <p class="text-gray-400 text-sm mt-2">Check back later for new orders.</p>
      </div>
    `;
    return;
  }

  allOrders.forEach((order) => {
    const statusColor = getStatusColor(order.status);

    list.innerHTML += `
      <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">
        <h3 class="text-xl font-bold text-green-700 mb-2">
          ${order.product.name}
        </h3>

        <p class="text-gray-600"><strong>Pickup:</strong> ${order.pickupLocation}</p>
        <p class="text-gray-600"><strong>Destination:</strong> ${order.deliveryLocation}</p>
        <p class="text-gray-600"><strong>Quantity:</strong> ${order.quantity} kg</p>
        <p class="text-gray-600"><strong>Total Price:</strong> KES ${order.totalPrice}</p>

        <div class="mt-3">
          <p class="text-gray-600"><strong>Buyer:</strong> ${order.buyer.name}</p>
          <p class="text-gray-600"><strong>Email:</strong> ${order.buyer.email}</p>
        </div>

        ${order.notes ? `<p class="text-gray-600 mt-2"><strong>Notes:</strong> ${order.notes}</p>` : ''}

        <!-- STATUS -->
        <span class="inline-block mt-3 px-3 py-1 rounded-full text-sm ${statusColor}">
          ${order.status}
        </span>

        <!-- ACTION BUTTONS -->
        <div class="mt-5">
          ${order.status === "pending" ? `
            <button
              onclick="acceptOrder('${order._id}')"
              class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
              Accept Delivery
            </button>
          ` : order.status === "accepted" ? `
            <div class="space-y-2">
              <button
                onclick="updateOrderStatus('${order._id}', 'in-transit')"
                class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                Mark as In Transit
              </button>
              <button
                onclick="updateOrderStatus('${order._id}', 'delivered')"
                class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Mark as Delivered
              </button>
            </div>
          ` : `
            <p class="text-sm text-gray-500 text-center">
              Order ${order.status}
            </p>
          `}
        </div>
      </div>
    `;
  });
}

/* GET STATUS COLOR */
function getStatusColor(status) {
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

/* ACCEPT ORDER */
async function acceptOrder(orderId) {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to accept order");
    }

    alert("Order accepted successfully!");
    await renderDeliveries();
  } catch (error) {
    console.error("Error accepting order:", error);
    alert("Failed to accept order: " + error.message);
  }
}

/* UPDATE ORDER STATUS */
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

    alert(`Order marked as ${status.replace('-', ' ')}!`);
    await renderDeliveries();
  } catch (error) {
    console.error("Error updating order status:", error);
    alert("Failed to update order status: " + error.message);
  }
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out!");
  window.location.href = "login.html";
}

/* INITIAL LOAD */
document.addEventListener("DOMContentLoaded", async function() {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user || user.role !== "transporter") {
    alert("Please login as a transporter");
    window.location.href = "login.html";
    return;
  }

  await renderDeliveries();
});