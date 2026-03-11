<?php
// ===== PRODUCTS API (Digital Content Showcase) =====
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

switch ($method) {

    case 'GET':
        // Public: list all active products (or all for admin)
        $showAll = isset($_GET['all']) && $_GET['all'] === '1';
        
        if ($showAll) {
            $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM products WHERE status = 'ativo' ORDER BY created_at DESC");
        }
        
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        checkAdmin();
        $data = getInput();
        
        if (empty($data['title'])) {
            jsonResponse(['error' => 'Title is required'], 400);
        }
        
        $stmt = $pdo->prepare("INSERT INTO products (title, description, price, category, photo, file_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $data['price'] ?? 0,
            $data['category'] ?? 'pdf',
            $data['photo'] ?? null,
            $data['file_url'] ?? '',
            $data['status'] ?? 'ativo'
        ]);
        
        jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        checkAdmin();
        $data = getInput();
        
        if (empty($data['id'])) {
            jsonResponse(['error' => 'Product ID required'], 400);
        }
        
        $fields = [];
        $values = [];
        
        foreach (['title', 'description', 'price', 'category', 'photo', 'file_url', 'status'] as $f) {
            if (isset($data[$f])) {
                $fields[] = "$f = ?";
                $values[] = $data[$f];
            }
        }
        
        if (empty($fields)) {
            jsonResponse(['error' => 'No fields to update'], 400);
        }
        
        $values[] = $data['id'];
        $stmt = $pdo->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($values);
        
        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        checkAdmin();
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            jsonResponse(['error' => 'Product ID required'], 400);
        }
        
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        
        jsonResponse(['success' => true]);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
