<?php
// ===== AUTH API =====
require_once __DIR__ . '/config.php';

$input = getInput();
$password = $input['password'] ?? '';

if ($password === ADMIN_PASSWORD) {
    $token = md5(ADMIN_PASSWORD . '_rateios_secret');
    jsonResponse(['success' => true, 'token' => $token]);
} else {
    jsonResponse(['error' => 'Senha incorreta'], 401);
}
