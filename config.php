<?php
header('Content-Type: application/json');

// ✅ Database connection settings
$host = 'localhost';          // Server name
$db   = 'user_auth';          // Your database name (from phpMyAdmin)
$user = 'root';               // MySQL username (default for XAMPP)
$pass = '';                   // MySQL password (leave empty if none)
$charset = 'utf8mb4';

// ✅ Build DSN and options
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    // ✅ Create connection
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
?>
