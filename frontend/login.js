 const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", e => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Redirect based on role
        if (user.role === "farmer") {
          window.location.href = "farmer.html";
        } else {
          window.location.href = "buyer.html";
        }
      } else {
        alert("Invalid email or password");
      }
    });