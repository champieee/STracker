<?php
$servername = "stracker-server.database.windows.net";
$username = "str";
$password = "Hone9!!!";
$dbname = "sTrackerDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>
