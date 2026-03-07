let deliveries = JSON.parse(localStorage.getItem("deliveries")) || [];

/* RENDER DELIVERY DASHBOARD */

function renderDeliveries() {

    const list = document.getElementById("deliveryList");
    if (!list) return;

    list.innerHTML = "";

    if (deliveries.length === 0) {
        list.innerHTML = `
            <p class="text-center text-gray-500 col-span-full">
                No delivery requests available.
            </p>
        `;
        return;
    }

    deliveries.forEach((d, i) => {

        const statusColor =
            d.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700";

        list.innerHTML += `
        <div class="bg-white shadow rounded-xl p-6 hover:shadow-lg transition">

            <h3 class="text-xl font-bold text-green-700 mb-2">
                ${d.product}
            </h3>

            <p class="text-gray-600">📍 Pickup: ${d.pickup}</p>
            <p class="text-gray-600">🚚 Destination: ${d.destination}</p>
            <p class="text-gray-600">📦 Quantity: ${d.quantity || "N/A"} kg</p>

            <!-- STATUS -->
            <span class="inline-block mt-3 px-3 py-1 rounded-full text-sm ${statusColor}">
                ${d.status}
            </span>

            <!-- CONTACT INFO -->
            <div class="mt-4 space-y-2 text-sm text-gray-700">

                <p>📞 Phone: ${d.requester?.phone || "Not provided"}</p>
                <p>✉ Email: ${d.requester?.email || "Not provided"}</p>

            </div>

            <!-- ACTION BUTTONS -->
            <div class="mt-5">

            ${d.status === "Pending" ? `
                <button
                    onclick="acceptDelivery(${i})"
                    class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">

                    Accept Delivery

                </button>
            ` : `
                <p class="text-sm text-gray-500">
                    Assigned to: ${d.transporter || "N/A"}
                </p>
            `}

            </div>

        </div>
        `;
    });
}

/*  ACCEPT DELIVERY */

function acceptDelivery(index) {

    deliveries[index].status = "Accepted";
    deliveries[index].transporter = "FastTrans Ltd";

    localStorage.setItem(
        "deliveries",
        JSON.stringify(deliveries)
    );

    renderDeliveries();
}

/* INITIAL LOAD */

renderDeliveries();