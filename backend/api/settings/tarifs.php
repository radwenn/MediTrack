<?php
// =====================================================
//  api/settings/tarifs.php
//  GET /api/settings/tarifs.php  → lire les tarifs
//  PUT /api/settings/tarifs.php  → modifier les tarifs
// =====================================================

require_once '../../config/cors.php';
require_once '../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ══════════════════════════════════════════════════
//  GET — Lire les tarifs actuels
// ══════════════════════════════════════════════════
if ($method === 'GET') {

    // Lire toutes les clés de paramètres
    $stmt   = $db->query("SELECT cle, valeur FROM parametres");
    $rows   = $stmt->fetchAll();

    // Convertir en tableau associatif : ['tarif_regulier' => '20', ...]
    $params = [];
    foreach ($rows as $row) {
        $params[$row['cle']] = (float) $row['valeur'];
    }

    repondreJson([
        'tarifRegulier'    => $params['tarif_regulier']     ?? 20,
        'tarifNonRegulier' => $params['tarif_non_regulier'] ?? 40,
    ]);
}

// ══════════════════════════════════════════════════
//  PUT — Mettre à jour les tarifs
// ══════════════════════════════════════════════════
if ($method === 'PUT') {

    $data = lireBody();

    $regulier    = (float) ($data['tarifRegulier']    ?? 20);
    $nonRegulier = (float) ($data['tarifNonRegulier'] ?? 40);

    // Validation
    if ($regulier <= 0 || $nonRegulier <= 0) {
        repondreJson(['erreur' => 'Les tarifs doivent être positifs'], 400);
    }

    // Mettre à jour chaque paramètre
    // INSERT OR UPDATE (upsert) : si la clé existe, on met à jour
    $stmt = $db->prepare("
        INSERT INTO parametres (cle, valeur) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)
    ");

    $stmt->execute(['tarif_regulier',     $regulier]);
    $stmt->execute(['tarif_non_regulier', $nonRegulier]);

    repondreJson(['message' => 'Tarifs mis à jour']);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);