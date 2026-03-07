let deliveries = JSON.parse(localStorage.getItem("deliveries")) || [];

/* LOAD SELECTED PRODUCT */

const product = JSON.parse(localStorage.getItem("selectedProduct"));

if (product) {

  document.getElementById("productName").innerText =
    "Product: " + product.name;

  document.getElementById("pickupLocation").innerText =
    "Pickup Location: " + product.location;

}

/* REQUEST DELIVERY */

function requestDelivery() {

  if (!product) {
    alert("No product selected!");
    return;
  }

  const destination = document.getElementById("deliveryLocation").value.trim();
  const qty = document.getElementById("orderQty").value.trim();

  if (!destination || !qty) {
    alert("Please enter quantity and delivery location!");
    return;
  }

  const deliveryRequest = {
    product: product.name,
    pickup: product.location,
    quantity: qty,
    destination: destination,
    status: "Pending",
    transporter: null,
    date: new Date().toISOString()
  };

  deliveries.push(deliveryRequest);

  localStorage.setItem(
    "deliveries",
    JSON.stringify(deliveries)
  );

  alert("Delivery request sent successfully!");

  /* Optional redirect */
  window.location.href = "marketplace.html";
}

/* OPTIONAL: CLEAR FORM */

function clearDeliveryForm() {
  document.getElementById("orderQty").value = "";
  document.getElementById("deliveryLocation").value = "";
}