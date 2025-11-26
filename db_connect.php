// File: db_connect.php
// This file establishes a secure connection to the MySQL database.

// Database Credentials (REPLACE with your actual credentials)
define('DB_SERVER', 'localhost');
definedefine('DB_USERNAME', 'mah_store_user');
define('DB_PASSWORD', 'YourStrongPassword123'); // **IMPORTANT: Change this!**
define('DB_NAME', 'mah_store_db');

/* Attempt to connect to MySQL database */
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($conn === false){
    die("ERROR: Could not connect to the database. " . $conn->connect_error);
}

// Set character set to UTF8 for proper Urdu/Arabic and international character support
$conn->set_charset("utf8mb4");

// For security, never echo credentials or sensitive info here!
?>
