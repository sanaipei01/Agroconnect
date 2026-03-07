let products = JSON.parse(localStorage.getItem("products"));

if (!products) {
  products = [
    {
      name: "Tomatoes",
      quantity: 500,
      price: 2500,
      location: "Nakuru",
      availability: "Available"
    },
    {
      name: "Carrots",
      quantity: 300,
      price: 1500,
      location: "Thika",
      availability: "Available"
    }
  ];

  localStorage.setItem("products", JSON.stringify(products));
}


function renderMarketplace() {
  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  products
    .filter(p => p.availability === "Available")
    .forEach((product, index) => {

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
            onclick="startOrder(${index})"
            class="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Order / Negotiate
          </button>

        </div>
      </div>
      `;
    });
}


function searchProducts() {
  const keyword = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  document.querySelectorAll(".product-card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(keyword)
      ? "block"
      : "none";
  });
}


function renderFarmerProducts() {
  const list = document.getElementById("farmerProducts");
  if (!list) return;

  list.innerHTML = "";

  products.forEach((product, index) => {
    list.innerHTML += `
      <div class="product-card">
        <h3>${product.name}</h3>
        <p>Price: KES ${product.price}</p>
        <p>Quantity: ${product.quantity} kg</p>
        <p>Location: ${product.location}</p>
        <p>Status: ${product.availability}</p>
        <button onclick="deleteProduct(${index})">Delete</button>
      </div>
    `;
  });
}


function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderFarmerProducts();
  renderMarketplace();
}


const form = document.getElementById("productForm");

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const product = {
      name: document.getElementById("name").value,
      quantity: document.getElementById("quantity").value,
      price: document.getElementById("price").value,
      location: document.getElementById("location").value,
      availability: document.getElementById("availability").value
    };

    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));

    form.reset();
    renderFarmerProducts();
    renderMarketplace();
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