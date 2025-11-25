// --- Admin Login System ---

// Default Admin (You can remove or add more in dashboard)
let admins = JSON.parse(localStorage.getItem("admins")) || [
  { username: "admin", password: "12345" }
];

// LOGIN FUNCTION
function loginAdmin() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const found = admins.find(a => a.username === user && a.password === pass);

  if (found) {
    localStorage.setItem("admin_logged", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid Username or Password!");
  }
}

// CHECK LOGIN STATUS
function checkLogin() {
  if (!localStorage.getItem("admin_logged")) {
    window.location.href = "admin.html";
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("admin_logged");
  window.location.href = "admin.html";
}

// ADD NEW ADMIN (From Dashboard Modal)
function addNewAdmin(username, password) {
  admins.push({ username, password });
  localStorage.setItem("admins", JSON.stringify(admins));
  loadAdmins();
}

// Load Admins in Dashboard
function loadAdmins() {
  const list = document.getElementById("admin-list");
  if (!list) return;

  list.innerHTML = "";
  admins.forEach((a, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${a.username}`;
    list.appendChild(li);
  });
}

// Modal Controls (Dashboard)
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const addAdminBtn = document.getElementById("add-admin-btn");
  const saveBtn = document.getElementById("save-admin");

  if (addAdminBtn) {
    addAdminBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const user = document.getElementById("new-username").value.trim();
      const pass = document.getElementById("new-password").value.trim();

      if (user.length < 3 || pass.length < 3) {
        alert("Please enter valid information!");
        return;
      }

      addNewAdmin(user, pass);
      alert("New Admin Added!");
      modal.classList.add("hidden");
    });
  }
});
