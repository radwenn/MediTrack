<?php
// api/utilisateurs/single.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? '';

if (empty($id)) repondreJson(['erreur' => 'ID manquant'], 400);

$stmt = $db->prepare("SELECT * FROM utilisateurs WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch();

if (!$user) repondreJson(['erreur' => 'Utilisateur introuvable'], 404);

if ($method === 'GET') {
    repondreJson([
        'id'           => $user['id'],
        'nom'          => $user['nom'],
        'email'        => $user['email'],
        'role'         => $user['role'],
        'dateCreation' => substr($user['created_at'], 0, 10),
    ]);
}

if ($method === 'PUT') {
    $data = lireBody();

    if (!empty($data['email'])) {
        $stmt = $db->prepare("SELECT id FROM utilisateurs WHERE email = ? AND id != ?");
        $stmt->execute([strtolower(trim($data['email'])), $id]);
        if ($stmt->fetch()) repondreJson(['erreur' => 'Email déjà utilisé'], 409);
    }

    if (!empty($data['password'])) {
        $stmt = $db->prepare("UPDATE utilisateurs SET nom=?, email=?, role=?, password=? WHERE id=?");
        $stmt->execute([
            trim($data['nom']),
            strtolower(trim($data['email'])),
            $data['role'] ?? $user['role'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $id,
        ]);
    } else {
        $stmt = $db->prepare("UPDATE utilisateurs SET nom=?, email=?, role=? WHERE id=?");
        $stmt->execute([
            trim($data['nom']),
            strtolower(trim($data['email'])),
            $data['role'] ?? $user['role'],
            $id,
        ]);
    }
    repondreJson(['message' => 'Compte modifié']);
}

if ($method === 'DELETE') {
    $stmt = $db->prepare("DELETE FROM utilisateurs WHERE id = ?");
    $stmt->execute([$id]);
    repondreJson(['message' => 'Compte supprimé']);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);