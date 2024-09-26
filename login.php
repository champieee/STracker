<?php
require 'db.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Check if user exists
  $sql = "SELECT * FROM users WHERE username = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    echo json_encode(["error" => "Invalid username or password"]);
    exit;
  }

  $user = $result->fetch_assoc();

  // Verify password
  if (password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];  // Store user ID in session
    echo json_encode(["message" => "Login successful"]);
  } else {
    echo json_encode(["error" => "Invalid username or password"]);
  }

  $stmt->close();
}

$conn->close();
?>
