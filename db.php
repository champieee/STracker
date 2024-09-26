<?php
// Using PDO to connect to the Azure SQL Database
try {
    $conn = new PDO("sqlsrv:server = tcp:stracker-server.database.windows.net,1433; Database = sTrackerDB", "str", "Hone9!!!");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to Azure SQL Database successfully!<br>";

    // Insert a new user into the database (for testing purposes)
    $newUsername = "testUser";  // Change this to any username you want to insert
    $newPassword = password_hash("testPassword", PASSWORD_DEFAULT);  // Hash the password

    // Prepare and execute the insert query
    $sql = "INSERT INTO users (username, password) VALUES (:username, :password)";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $newUsername);
    $stmt->bindParam(':password', $newPassword);

    if ($stmt->execute()) {
        echo "New user added successfully!<br>";
    } else {
        echo "Error adding user!<br>";
    }

} catch (PDOException $e) {
    echo "Error connecting to SQL Server.";
    die(print_r($e->getMessage()));
}
?>
