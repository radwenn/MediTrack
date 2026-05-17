<?php
// api/utilisateurs/index.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt   = $db->query("SELECT id, nom, email, role, created_at FROM utilisateurs ORDER BY created_at DESC");
    $users  = $stmt->fetchAll();
    $result = array_map(fn($u) => [
        'id'           => $u['id'],
        'nom'          => $u['nom'],
        'email'        => $u['email'],
        'role'         => $u['role'],
        'dateCreation' => substr($u['created_at'], 0, 10),
    ], $users);
    repondreJson($result);
}

if ($method === 'POST') {
    $data = lireBody();

    if (empty($data['nom']) || empty($data['email']) || empty($data['password'])) {
        repondreJson(['erreur' => 'nom, email et password sont obligatoires'], 400);
    }
    if (strlen($data['password']) < 4) {
        repondreJson(['erreur' => 'Mot de passe trop court (minimum 4 caractères)'], 400);
    }

    $stmt = $db->prepare("SELECT id FROM utilisateurs WHERE email = ?");
    $stmt->execute([strtolower(trim($data['email']))]);
    if ($stmt->fetch()) {
        repondreJson(['erreur' => 'Cet email est déjà utilisé'], 409);
    }

    $stmt = $db->prepare("INSERT INTO utilisateurs (nom, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        trim($data['nom']),
        strtolower(trim($data['email'])),
        password_hash($data['password'], PASSWORD_DEFAULT),
        $data['role'] ?? 'medecin',
    ]);

    repondreJson(['message' => 'Compte créé', 'id' => $db->lastInsertId()], 201);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);