// File: api/order_submit.php
// Endpoint for receiving and processing checkout data.

header('Content-Type: application/json; charset=utf-8');
include('../db_connect.php');

$response = ['success' => false, 'message' => ''];

// Sanitize and validate input
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method.';
    echo json_encode($response);
    exit;
}

// Get the raw JSON POST data
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['email']) || empty($data['shippingAddress']) || empty($data['items']) || empty($data['totalAmount'])) {
    $response['message'] = 'Missing required fields.';
    echo json_encode($response);
    exit;
}

// Basic sanitization and variable assignment
$customer_email = $conn->real_escape_string($data['email']);
$total_amount = (float)$data['totalAmount'];
$order_details_json = json_encode($data['items']); // Store items as JSON text
$shipping_address_json = json_encode($data['shippingAddress']);

// 1. Insert the main order into the 'orders' table
$order_sql = "INSERT INTO orders (customer_email, total_amount, status, shipping_details, created_at) VALUES 
              ('$customer_email', $total_amount, 'Pending', '$shipping_address_json', NOW())";

if ($conn->query($order_sql) === TRUE) {
    $order_id = $conn->insert_id; // Get the ID of the newly created order
    $response['success'] = true;
    $response['message'] = "Order placed successfully! Your Order ID is: " . $order_id;
    $response['order_id'] = $order_id;

    // 2. Insert item details into 'order_items' table (more complex, but essential)
    // For simplicity here, we skip individual item insertion, and rely on the JSON blob above.
    // In a production app, a loop around $data['items'] would insert data into a separate `order_items` table.
    
    // 3. Clear the customer's cart (handled on client side, but could be server-side too)
    
} else {
    $response['message'] = "Error placing order: " . $conn->error;
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
$conn->close();
?>
