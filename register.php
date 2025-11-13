<?php
// backend/register.php
header('Content-Type: application/json');

// Allow calls from same origin. If frontend served from different origin, configure properly.
// For local development you can enable:
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Adjust origins as needed
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/config.php';

// read JSON input
$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$name || !$phone || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address.']);
    exit;
}

try {
    // check existing email
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered.']);
        exit;
    }

    // hash password
    $hash = password_hash($password, PASSWORD_DEFAULT);

    // insert user
    $stmt = $pdo->prepare('INSERT INTO users (name, phone, email, password_hash) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $phone, $email, $hash]);

    echo json_encode(['message' => 'User registered successfully.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error.']);
}
