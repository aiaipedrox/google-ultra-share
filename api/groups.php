<?php
// ===== GROUPS API =====
require_once __DIR__ . '/config.php';
$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET: public (for homepage) + admin
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT g.*, 
        (SELECT COUNT(*) FROM members m WHERE m.group_id = g.group_id AND m.status = 'ativo') as active_members
        FROM `groups` g ORDER BY g.group_id ASC");
    $groups = $stmt->fetchAll();
    
    // Format response
    $result = array_map(function($g) {
        $free = $g['total_slots'] - $g['active_members'];
        return [
            'id'           => $g['group_id'],
            'name'         => $g['name'],
            'totalSlots'   => (int)$g['total_slots'],
            'filledSlots'  => (int)$g['active_members'],
            'price'        => (float)$g['price'],
            'link'         => $g['payment_link'],
            'photo'        => $g['photo'],
            'status'       => $free <= 0 ? 'full' : ($free <= 1 ? 'almost' : 'open'),
            'created_at'   => $g['created_at']
        ];
    }, $groups);
    
    jsonResponse($result);
}

// POST: create group (admin only)
if ($method === 'POST') {
    checkAdmin();
    $input = getInput();
    
    // Generate next group ID
    $last = $pdo->query("SELECT group_id FROM `groups` ORDER BY id DESC LIMIT 1")->fetchColumn();
    $num = $last ? (int)substr($last, 4) + 1 : 1;
    $groupId = 'GRP-' . str_pad($num, 3, '0', STR_PAD_LEFT);
    
    $stmt = $pdo->prepare("INSERT INTO `groups` (group_id, name, total_slots, price, payment_link, photo) VALUES (?,?,?,?,?,?)");
    $stmt->execute([
        $groupId,
        $input['name'] ?? 'Familia Premium ' . str_pad($num, 2, '0', STR_PAD_LEFT),
        $input['totalSlots'] ?? 6,
        $input['price'] ?? 101.50,
        $input['link'] ?? '',
        $input['photo'] ?? null
    ]);
    
    jsonResponse(['success' => true, 'id' => $groupId], 201);
}

// PUT: update group (admin only)
if ($method === 'PUT') {
    checkAdmin();
    $input = getInput();
    $id = $input['id'] ?? '';
    
    $fields = [];
    $params = [];
    if (isset($input['name']))       { $fields[] = 'name = ?';         $params[] = $input['name']; }
    if (isset($input['totalSlots'])) { $fields[] = 'total_slots = ?';  $params[] = $input['totalSlots']; }
    if (isset($input['price']))      { $fields[] = 'price = ?';        $params[] = $input['price']; }
    if (isset($input['link']))       { $fields[] = 'payment_link = ?'; $params[] = $input['link']; }
    if (isset($input['photo']))      { $fields[] = 'photo = ?';        $params[] = $input['photo']; }
    
    if (empty($fields)) { jsonResponse(['error' => 'No fields to update'], 400); }
    
    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE `groups` SET " . implode(', ', $fields) . " WHERE group_id = ?");
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}

// DELETE: delete group (admin only)
if ($method === 'DELETE') {
    checkAdmin();
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM `groups` WHERE group_id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}
