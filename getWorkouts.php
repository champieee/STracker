<?php
require 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$userId = $_SESSION['user_id'];

$sql = "SELECT * FROM workouts WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$workouts = [];

while ($row = $result->fetch_assoc()) {
  $workouts[] = $row;
}

echo json_encode($workouts);

$stmt->close();
$conn->close();
?>
