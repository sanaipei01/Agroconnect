const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", e => {
      e.preventDefault();

      
      const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
      };

      
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Registration successful! Please login.");
      window.location.href = "login.html";
    });