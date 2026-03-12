const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: document.getElementById("role").value
  };

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", { // your backend URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful! Please login.");
    window.location.href = "login.html";

  } catch (error) {
    console.error("Error registering user:", error);
    alert("An error occurred during registration. Please try again.");
  }
});