<?php
// ===== MEMBERS API =====
require_once __DIR__ . '/config.php';
$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    checkAdmin();
    $group = $_GET['group'] ?? null;
    $status = $_GET['status'] ?? null;
    
    $sql = "SELECT * FROM members WHERE 1=1";
    $params = [];
    if ($group && $group !== 'all') { $sql .= " AND group_id = ?"; $params[] = $group; }
    if ($status && $status !== 'all') { $sql .= " AND status = ?"; $params[] = $status; }
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $members = $stmt->fetchAll();
    
    $result = array_map(function($m) {
        $start = new DateTime($m['created_at']);
        $end = clone $start;
        $end->modify('+30 days');
        $now = new DateTime();
        $diff = $now->diff($end);
        $daysLeft = $end > $now ? (int)$diff->days : 0;
        
        return [
            'id'        => 'm' . $m['id'],
            'dbId'      => (int)$m['id'],
            'name'      => $m['name'],
            'phone'     => $m['phone'],
            'email'     => $m['email'],
            'group'     => $m['group_id'],
            'status'    => $m['status'],
            'date'      => $m['created_at'],
            'daysLeft'  => $daysLeft
        ];
    }, $members);
    
    jsonResponse($result);
}

if ($method === 'POST') {
    checkAdmin();
    $input = getInput();
    
    $stmt = $pdo->prepare("INSERT INTO members (name, phone, email, group_id, status) VALUES (?,?,?,?,?)");
    $stmt->execute([
        $input['name'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['group'] ?? '',
        $input['status'] ?? 'pendente'
    ]);
    
    jsonResponse(['success' => true, 'id' => 'm' . $pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
    checkAdmin();
    $input = getInput();
    $id = str_replace('m', '', $input['id'] ?? '');
    
    $stmt = $pdo->prepare("UPDATE members SET name=?, phone=?, email=?, group_id=?, status=? WHERE id=?");
    $stmt->execute([
        $input['name'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['group'] ?? '',
        $input['status'] ?? 'pendente',
        $id
    ]);
    
    jsonResponse(['success' => true]);
}

if ($method === 'DELETE') {
    checkAdmin();
    $id = str_replace('m', '', $_GET['id'] ?? '');
    $stmt = $pdo->prepare("DELETE FROM members WHERE id=?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}
