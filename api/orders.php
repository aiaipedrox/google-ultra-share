<?php
// ===== ORDERS API =====
require_once __DIR__ . '/config.php';
$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// POST: create order from checkout (PUBLIC)
if ($method === 'POST') {
    $input = getInput();
    
    $orderId = 'PED-' . strtoupper(base_convert(time(), 10, 36)) . rand(10, 99);
    
    $stmt = $pdo->prepare("INSERT INTO orders (order_id, name, phone, email, group_id, group_name, status, days) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $orderId,
        $input['name'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['group'] ?? '',
        $input['groupName'] ?? '',
        'pendente',
        $input['days'] ?? 30
    ]);
    
    // ENVIO DE E-MAIL
    $to = 'admin@rateios.pro'; // Ajuste conforme necessario
    $subject = 'Novo Pedido Google Ultra - ' . $orderId;
    $message = "Novo pedido recebido:\n\n" .
               "ID do Pedido: " . $orderId . "\n" .
               "Nome: " . ($input['name'] ?? '') . "\n" .
               "E-mail: " . ($input['email'] ?? '') . "\n" .
               "WhatsApp: " . ($input['phone'] ?? '') . "\n" .
               "Grupo Escolhido: " . ($input['groupName'] ?? '') . "\n";
    $headers = "From: noreply@rateios.pro\r\n" .
               "Reply-To: " . ($input['email'] ?? '') . "\r\n" .
               "X-Mailer: PHP/" . phpversion();
    @mail($to, $subject, $message, $headers);
    
    jsonResponse(['success' => true, 'orderId' => $orderId], 201);
}

// GET: list orders (admin) or by email (customer)
if ($method === 'GET') {
    $email = $_GET['email'] ?? null;
    
    if ($email) {
        // Customer: get their orders
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC");
        $stmt->execute([$email]);
    } else {
        // Admin: get all orders
        checkAdmin();
        $status = $_GET['status'] ?? null;
        $sql = "SELECT * FROM orders";
        $params = [];
        if ($status && $status !== 'all') { $sql .= " WHERE status = ?"; $params[] = $status; }
        $sql .= " ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }
    
    $orders = $stmt->fetchAll();
    
    $result = array_map(function($o) {
        $created = new DateTime($o['created_at']);
        $now = new DateTime();
        $diff = $now->diff($created);
        $daysAgo = (int)$diff->days;
        
        $daysLeft = max(0, (int)$o['days'] - $daysAgo);
        
        return [
            'id'            => (int)$o['id'],
            'orderId'       => $o['order_id'],
            'name'          => $o['name'],
            'phone'         => $o['phone'],
            'email'         => $o['email'],
            'group'         => $o['group_id'],
            'groupName'     => $o['group_name'],
            'status'        => $o['status'],
            'paid'          => (bool)$o['paid'],
            'assignedGroup' => $o['assigned_group'],
            'days'          => (int)$o['days'],
            'daysAgo'       => $daysAgo,
            'daysLeft'      => $daysLeft,
            'notes'         => $o['notes'],
            'date'          => $o['created_at']
        ];
    }, $orders);
    
    jsonResponse($result);
}

// PUT: update order (admin - assign group, mark paid, change status, set days)
if ($method === 'PUT') {
    checkAdmin();
    $input = getInput();
    $id = $input['id'] ?? 0;
    
    $fields = [];
    $params = [];
    if (isset($input['status']))        { $fields[] = 'status = ?';         $params[] = $input['status']; }
    if (isset($input['paid']))          { $fields[] = 'paid = ?';           $params[] = $input['paid'] ? 1 : 0; }
    if (isset($input['assignedGroup'])) { $fields[] = 'assigned_group = ?'; $params[] = $input['assignedGroup']; }
    if (isset($input['days']))          { $fields[] = 'days = ?';           $params[] = $input['days']; }
    if (isset($input['notes']))         { $fields[] = 'notes = ?';          $params[] = $input['notes']; }
    
    if (empty($fields)) { jsonResponse(['error' => 'No fields'], 400); }
    
    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}

// DELETE: delete order (admin only)
if ($method === 'DELETE') {
    checkAdmin();
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}
