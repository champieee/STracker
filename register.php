<?php
require 'db.php'; // Ensure db.php is included for the database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if username or password are empty
    if (empty($username) || empty($password)) {
        echo "Username and password are required!";
        exit;
    }

    // Check if user already exists
    $sql = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "Username already exists!";
        exit;
    }

    // Hash password and insert user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $hashedPassword);

    if ($stmt->execute()) {
        // Redirect to login page
        header("Location: login.html");
        exit;
    } else {
        echo "Error: Could not register user.";
    }

    $stmt->close();
}

$conn->close();
?>
