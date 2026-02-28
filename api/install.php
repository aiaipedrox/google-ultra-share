<?php
// ===== INSTALL: Create tables =====
require_once __DIR__ . '/config.php';

$pdo = getDB();

$pdo->exec("CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    total_slots INT DEFAULT 6,
    price DECIMAL(10,2) DEFAULT 101.50,
    payment_link TEXT,
    photo LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100),
    group_id VARCHAR(20),
    status ENUM('ativo','pendente','inativo') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(group_id),
    INDEX(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    group_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$pdo->exec("CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    group_id VARCHAR(20),
    group_name VARCHAR(100),
    status ENUM('pendente','pago','ativo','cancelado') DEFAULT 'pendente',
    paid TINYINT(1) DEFAULT 0,
    assigned_group VARCHAR(20) DEFAULT NULL,
    days INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(status),
    INDEX(email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Insert sample groups if empty
$count = $pdo->query("SELECT COUNT(*) FROM `groups`")->fetchColumn();
if ($count == 0) {
    $stmt = $pdo->prepare("INSERT INTO `groups` (group_id, name, total_slots, price, payment_link) VALUES (?,?,?,?,?)");
    $link = 'https://checkout.diasmarketplace.com.br/link/rateios-google-ultra';
    $stmt->execute(['GRP-001', 'Familia Premium 01', 6, 101.50, $link]);
    $stmt->execute(['GRP-002', 'Familia Premium 02', 6, 101.50, $link]);
    $stmt->execute(['GRP-003', 'Familia Premium 03', 6, 101.50, $link]);
}

jsonResponse(['success' => true, 'message' => 'Tables created successfully']);
