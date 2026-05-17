<?php
// api/auth/login.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();

if (session_status() === PHP_SESSION_NONE) session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    repondreJson(['erreur' => 'Méthode non autorisée'], 405);
}

$body     = lireBody();
$email    = trim(strtolower($body['email']    ?? ''));
$password = trim($body['password'] ?? '');

if (empty($email) || empty($password)) {
    repondreJson(['erreur' => 'Email et mot de passe obligatoires'], 400);
}

$db   = getDB();
$stmt = $db->prepare("SELECT * FROM utilisateurs WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    repondreJson(['erreur' => 'Identifiants invalides'], 401);
}

$_SESSION['utilisateur'] = [
    'id'    => $user['id'],
    'nom'   => $user['nom'],
    'email' => $user['email'],
    'role'  => $user['role'],
];

// On retourne aussi l'id pour que le frontend puisse modifier son propre profil
repondreJson([
    'message' => 'Connexion réussie',
    'user'    => [
        'id'    => $user['id'],     // ← AJOUT : nécessaire pour modifier le profil
        'nom'   => $user['nom'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ]
]);