<?php
require 'db.php';  // Ensure db.php is included for database connection
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if username and password are received
    if (empty($username) || empty($password)) {
        echo "Username and password are required!";
        exit;
    }

    // Check if the user exists
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo "Invalid username or password!";
        exit;
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];  // Store user ID in session
        header("Location: home.html");  // Redirect to home.html after successful login
        exit;
    } else {
        echo "Invalid username or password!";
        exit;
    }

    $stmt->close();
}

$conn->close();
?>
