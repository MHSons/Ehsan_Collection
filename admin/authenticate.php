// File: admin/authenticate.php 
// Handles admin login attempt. (Uses a simple hardcoded check - **INSECURE FOR PRODUCTION**)

session_start();

// Production apps must use:
// 1. Database lookups (e.g., SELECT * FROM admins WHERE username=?)
// 2. Password Hashing (e.g., password_verify())

$valid_username = "admin_mah";
$valid_password_hash = password_hash("securepass123", PASSWORD_DEFAULT); // Hashed version of the password

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // For Demo: Direct password check (DO NOT USE IN REAL LIFE!)
    if ($username === $valid_username && $password === "securepass123") {
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username;
        header("location: dashboard.php");
        exit;
    } else {
        // Correct implementation would perform password_verify($password, $valid_password_hash)
        $login_err = "Invalid username or password.";
        // Redirect back to login with an error message
        header("location: login.html?error=" . urlencode($login_err));
        exit;
    }
} else {
    // If not a POST request, go to login page
    header("location: login.html");
}
?>
