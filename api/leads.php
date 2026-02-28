<?php
// ===== LEADS API =====
require_once __DIR__ . '/config.php';
$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// POST: save lead from checkout (PUBLIC)
if ($method === 'POST') {
    $input = getInput();
    
    $stmt = $pdo->prepare("INSERT INTO leads (name, phone, email, group_id) VALUES (?,?,?,?)");
    $stmt->execute([
        $input['name'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['group'] ?? ''
    ]);
    
    jsonResponse(['success' => true, 'id' => (int)$pdo->lastInsertId()], 201);
}

// GET: list leads (admin only)
if ($method === 'GET') {
    checkAdmin();
    $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC");
    $leads = $stmt->fetchAll();
    
    $result = array_map(function($l) {
        return [
            'id'    => (int)$l['id'],
            'name'  => $l['name'],
            'phone' => $l['phone'],
            'email' => $l['email'],
            'group' => $l['group_id'],
            'date'  => $l['created_at']
        ];
    }, $leads);
    
    jsonResponse($result);
}

// DELETE: clear all leads or single lead (admin only)
if ($method === 'DELETE') {
    checkAdmin();
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM leads WHERE id=?");
        $stmt->execute([$id]);
    } else {
        $pdo->exec("DELETE FROM leads");
    }
    jsonResponse(['success' => true]);
}
