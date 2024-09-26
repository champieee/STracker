<?php
require 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Check if user already exists
  $sql = "SELECT * FROM users WHERE username = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
    echo json_encode(["error" => "Username already exists"]);
    exit;
  }

  // Hash password and insert user
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
  $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ss", $username, $hashedPassword);

  if ($stmt->execute()) {
    echo json_encode(["message" => "User registered successfully"]);
  } else {
    echo json_encode(["error" => "Error registering user"]);
  }

  $stmt->close();
}

$conn->close();
?>
