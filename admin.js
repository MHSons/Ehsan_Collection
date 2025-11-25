function login() {
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;

    if (u === "admin" && p === "1234") {
        localStorage.setItem("logged", "yes");
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("error").innerText = "Invalid Login!";
    }
}
