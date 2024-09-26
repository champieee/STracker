<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $userId = $_SESSION['user_id'];
  $workoutId = $_POST['id'];

  $sql = "DELETE FROM workouts WHERE id = ? AND user_id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param("ii", $workoutId, $userId);

  if ($stmt->execute()) {
    echo json_encode(["message" => "Workout deleted successfully"]);
  } else {
    echo json_encode(["error" => "Error deleting workout"]);
  }

  $stmt->close();
}

$conn->close();
?>
