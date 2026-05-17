<?php
// api/patients/index.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ─── ID de l'utilisateur connecté (depuis la session) ──
// Chaque requête est automatiquement filtrée par cet ID
$userId = $_SESSION['utilisateur']['id'];

// ══════════════════════════════════════════════════
//  GET — Retourner UNIQUEMENT les patients de ce médecin
// ══════════════════════════════════════════════════
if ($method === 'GET') {

    // WHERE user_id = ? → chaque médecin ne voit que ses patients
    $stmt = $db->prepare("
        SELECT * FROM patients
        WHERE user_id = ?
        ORDER BY date_inscription DESC
    ");
    $stmt->execute([$userId]);
    $patients = $stmt->fetchAll();

    foreach ($patients as &$p) {
        $p['allergies']    = json_decode($p['allergies'] ?? '[]', true);
        $p['is_chronique'] = (bool) $p['is_chronique'];
    }

    repondreJson($patients);
}

// ══════════════════════════════════════════════════
//  POST — Créer un patient LIÉ à ce médecin
// ══════════════════════════════════════════════════
if ($method === 'POST') {

    $data = lireBody();

    if (empty($data['nom']) || empty($data['prenom']) || empty($data['sexe'])) {
        repondreJson(['erreur' => 'nom, prenom et sexe sont obligatoires'], 400);
    }

    $id        = generateId('P', $db);
    $initiales = strtoupper(substr($data['prenom'], 0, 1) . substr($data['nom'], 0, 1));

    if (!empty($data['telephone'])) {
    $stmt = $db->prepare("
        SELECT id FROM patients
        WHERE telephone = ? AND user_id = ?
    ");
    
    $stmt->execute([$data['telephone'], $userId]);
    if ($stmt->fetch()) {
        repondreJson([
            'erreur' => 'Un patient avec ce numéro de téléphone existe déjà dans votre cabinet.'
        ], 409);
    }
}
    $stmt = $db->prepare("
        INSERT INTO patients
            (id, user_id, nom, prenom, age, sexe, telephone, email, adresse, sanguin,
             allergies, poids, taille, is_chronique, maladie_chronique,
             statut_patient, initiales, couleur, date_inscription)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $id,
        $userId,                                          // ← lié à ce médecin
        $data['nom'],
        $data['prenom'],
        $data['age']              ?? null,
        $data['sexe'],
        $data['telephone']        ?? null,
        $data['email']            ?? null,
        $data['adresse']          ?? null,
        $data['sanguin']          ?? null,
        json_encode($data['allergies'] ?? []),
        $data['poids']            ?? null,
        $data['taille']           ?? null,
        $data['isChronique']      ?? false,
        $data['maladieChronique'] ?? null,
        $data['statutPatient']    ?? 'Régulier',
        $initiales,
        $data['couleur']          ?? 'linear-gradient(135deg,#1E6FFF,#00C9A7)',
        $data['dateInscription']  ?? date('Y-m-d'),
    ]);

    repondreJson(['message' => 'Patient créé', 'id' => $id], 201);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);