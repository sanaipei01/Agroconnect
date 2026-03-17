const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", { // your backend URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save current user data (optional: could include token from backend)
    localStorage.setItem("token", data.token); // if you want to save the token
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "farmer") {
      window.location.href = "farmer.html";
    } else if (data.user.role === "buyer") {
      window.location.href = "marketplace.html";
    } else if (data.user.role === "transporter") {
      window.location.href = "transporter.html";
    }

  } catch (error) {
    console.error("Error logging in:", error);
    alert("An error occurred while logging in. Please try again.");
  }
});

// Optional: Check if user is already logged in on page load