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

/* LOAD SELECTED PRODUCT */
const product = JSON.parse(localStorage.getItem("selectedProduct"));

if (product) {
  document.getElementById("productName").innerText = product.name;
  document.getElementById("pickupLocation").innerText = product.location;
  document.getElementById("pricePerKg").innerText = `KES ${product.price}`;
}

/* CALCULATE TOTAL PRICE */
function calculateTotal() {
  const quantity = parseInt(document.getElementById("orderQty").value) || 0;
  const total = product ? product.price * quantity : 0;
  document.getElementById("totalPrice").innerText = `KES ${total}`;
}

/* Resolve product ID (handles stale localStorage products) */
async function resolveProductId(selectedProduct) {
  if (!selectedProduct) return null;
  if (selectedProduct._id || selectedProduct.id) {
    return selectedProduct._id || selectedProduct.id;
  }

  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) return null;

    const products = await response.json();
    const match = products.find(p =>
      p.name === selectedProduct.name &&
      p.location === selectedProduct.location &&
      p.price === selectedProduct.price
    );

    return match?._id || null;
  } catch (err) {
    console.error("Error resolving product ID:", err);
    return null;
  }
}

/* REQUEST DELIVERY */
async function requestDelivery() {
  if (!product) {
    alert("No product selected!");
    return;
  }

  const token = getToken();
  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const deliveryLocation = document.getElementById("deliveryLocation").value.trim();
  const quantity = parseInt(document.getElementById("orderQty").value.trim());
  const notes = document.getElementById("orderNotes").value.trim();

  if (!deliveryLocation || !quantity) {
    alert("Please enter quantity and delivery location!");
    return;
  }

  if (quantity <= 0) {
    alert("Please enter a valid quantity!");
    return;
  }

  const productId = await resolveProductId(product);
  if (!productId) {
    alert("Unable to resolve product. Please go back to the marketplace and try again.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
        deliveryLocation: deliveryLocation,
        notes: notes
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    alert("Order created successfully! You will be notified when a transporter accepts your order.");

    // Clear form
    clearDeliveryForm();

    // Redirect to marketplace or order tracking
    window.location.href = "marketplace.html";

  } catch (error) {
    console.error("Error creating order:", error);
    alert("Failed to create order: " + error.message);
  }
}

/* CLEAR FORM */
function clearDeliveryForm() {
  document.getElementById("orderQty").value = "";
  document.getElementById("deliveryLocation").value = "";
  document.getElementById("orderNotes").value = "";
  calculateTotal();
}

// Load order details on page load
document.addEventListener("DOMContentLoaded", function() {
  // Check if user is logged in
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    alert("Please login to place an order");
    window.location.href = "login.html";
    return;
  }

  // Display order summary if product is selected
  if (product) {
    // Could add more details like price calculation
    const estimatedPrice = product.price * (parseInt(document.getElementById("orderQty").value) || 0);
    // You could add a price display here if needed
  }
});