<?php
// ===== DATABASE CONFIG + SECURITY =====
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('DB_HOST', 'localhost');
define('DB_NAME', 'u305971088_rateios_db');
define('DB_USER', 'u305971088_rateios_user');
define('DB_PASS', 'RateiosPro@2024!');
define('ADMIN_PASSWORD', 'rateios2026');
define('RATE_LIMIT_REQUESTS', 60);  // max per minute
define('RATE_LIMIT_WINDOW', 60);    // seconds

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false  // REAL prepared statements (SQL injection protection)
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error']);  // Don't leak details
            exit;
        }
    }
    return $pdo;
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getInput() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) return [];
    // Sanitize all string inputs
    return array_map(function($v) {
        if (is_string($v)) return sanitize($v);
        return $v;
    }, $data);
}

// ===== SECURITY FUNCTIONS =====

function sanitize($str) {
    $str = trim($str);
    $str = strip_tags($str);
    $str = htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
    return $str;
}

function checkAdmin() {
    $token = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_GET['token'] ?? '');
    $token = str_replace('Bearer ', '', $token);
    if (empty($token) || $token !== md5(ADMIN_PASSWORD . '_rateios_secret')) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

// Rate limiting (file-based, works on shared hosting)
function rateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $file = sys_get_temp_dir() . '/rateios_rl_' . md5($ip) . '.json';
    
    $now = time();
    $data = ['count' => 0, 'start' => $now];
    
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: $data;
    }
    
    // Reset if window expired
    if ($now - $data['start'] > RATE_LIMIT_WINDOW) {
        $data = ['count' => 0, 'start' => $now];
    }
    
    $data['count']++;
    file_put_contents($file, json_encode($data));
    
    if ($data['count'] > RATE_LIMIT_REQUESTS) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Try again later.']);
        exit;
    }
}

// Validate email
function validEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Validate phone (Brazilian format)
function validPhone($phone) {
    $clean = preg_replace('/\D/', '', $phone);
    return strlen($clean) >= 10 && strlen($clean) <= 15;
}

// Apply rate limiting to all requests
rateLimit();
