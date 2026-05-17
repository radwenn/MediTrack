<?php
// config/cors.php

function setCorsHeaders(): void {
    header('Access-Control-Allow-Origin: http://localhost:4200');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function repondreJson(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function lireBody(): array {
    $contenu = file_get_contents('php://input');
    $data    = json_decode($contenu, true);
    return $data ?? [];
}

function verifierSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['utilisateur'])) {
        repondreJson(['erreur' => 'Non autorisé. Connectez-vous.'], 401);
    }
}

function generateId(string $prefix, PDO $db): string {
    $table = $prefix === 'P' ? 'patients' : 'consultations';
    $stmt  = $db->query("SELECT id FROM {$table} ORDER BY id DESC LIMIT 1");
    $row   = $stmt->fetch();

    if ($row) {
        $num = (int) substr($row['id'], strlen($prefix) + 1);
        $num++;
    } else {
        $num = 1;
    }

    return $prefix . '-' . str_pad($num, 3, '0', STR_PAD_LEFT);
}