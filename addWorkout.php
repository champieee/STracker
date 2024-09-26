<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $userId = $_SESSION['user_id'];
  $exercise = $_POST['exercise'];
  $weight = $_POST['weight'];

  $sql = "INSERT INTO workouts (user_id, exercise, weight, date) VALUES (?, ?, ?, NOW())";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("issd", $userId, $exercise, $weight);

  if ($stmt->execute()) {
    echo json_encode(["message" => "Workout added successfully"]);
  } else {
    echo json_encode(["error" => "Error adding workout"]);
  }

  $stmt->close();
}

$conn->close();
?>
