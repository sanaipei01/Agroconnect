let deliveries = JSON.parse(localStorage.getItem("deliveries")) || [];
const product = JSON.parse(localStorage.getItem("selectedProduct"));

if (product) {
  document.getElementById("productName").innerText =
    "Product: " + product.name;

  document.getElementById("pickupLocation").innerText =
    "Pickup Location: " + product.location;
}


function requestDelivery() {
  const destination = document.getElementById("deliveryLocation").value;

  deliveries.push({
    product: product.name,
    pickup: product.location,
    destination,
    status: "Pending",
    transporter: null
  });

  localStorage.setItem("deliveries", JSON.stringify(deliveries));
  alert("Delivery request sent!");
}