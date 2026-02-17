let deliveries = JSON.parse(localStorage.getItem("deliveries")) || [];

function renderDeliveries() {
  const list = document.getElementById("deliveryList");
  list.innerHTML = "";

  deliveries.forEach((d, i) => {
    list.innerHTML += `
      <div class="product-card">
        <h3>${d.product}</h3>
        <p>Pickup: ${d.pickup}</p>
        <p>Destination: ${d.destination}</p>
        <p>Status: ${d.status}</p>

        ${d.status === "Pending" ? `
          <button onclick="acceptDelivery(${i})">
            Accept Delivery
          </button>
        ` : ""}
      </div>
    `;
  });
}

function acceptDelivery(index) {
  deliveries[index].status = "Accepted";
  deliveries[index].transporter = "FastTrans Ltd";
  localStorage.setItem("deliveries", JSON.stringify(deliveries));
  renderDeliveries();
}

renderDeliveries();