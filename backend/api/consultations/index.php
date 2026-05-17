<?php
// api/consultations/index.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['utilisateur']['id'];

// ══════════════════════════════════════════════════
//  GET
// ══════════════════════════════════════════════════
if ($method === 'GET') {

    if (!empty($_GET['patientId'])) {
        // Consultations d'un patient spécifique (ET de ce médecin)
        $stmt = $db->prepare("
            SELECT * FROM consultations
            WHERE patient_id = ? AND user_id = ?
            ORDER BY date_consultation DESC
        ");
        $stmt->execute([$_GET['patientId'], $userId]);
    } else {
        // Toutes les consultations de ce médecin uniquement
        $stmt = $db->prepare("
            SELECT * FROM consultations
            WHERE user_id = ?
            ORDER BY date_consultation DESC
        ");
        $stmt->execute([$userId]);
    }

    $consultations = $stmt->fetchAll();
    repondreJson(array_map(fn($c) => formaterConsultation($c), $consultations));
}

// ══════════════════════════════════════════════════
//  POST — Créer une consultation liée à ce médecin
// ══════════════════════════════════════════════════
if ($method === 'POST') {

    $data = lireBody();

    if (empty($data['patientId']) || empty($data['date']) || empty($data['motif'])) {
        repondreJson(['erreur' => 'patientId, date et motif sont obligatoires'], 400);
    }

    // Vérifier que le patient appartient bien à ce médecin
    $stmt = $db->prepare("SELECT id FROM patients WHERE id = ? AND user_id = ?");
    $stmt->execute([$data['patientId'], $userId]);
    if (!$stmt->fetch()) {
        repondreJson(['erreur' => 'Patient introuvable'], 403);
    }

    $id = generateId('C', $db);

    $type   = $data['type'] ?? 'Consultation générale';
    $montant = ($type === 'Consultation de contrôle') ? 0 : ($data['montant'] ?? 0);

    $stmt = $db->prepare("
        INSERT INTO consultations
            (id, user_id, patient_id, patient_nom, date_consultation, type_consultation,
             tension, pouls, temperature, poids,
             motif, observations, ordonnance,
             statut_lors_consultation, montant, photos_analyses)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $id,
        $userId,
        $data['patientId'],
        $data['patientNom']               ?? '',
        $data['date'],
        $type,
        $data['tension']                  ?? '',
        $data['pouls']                    ?? null,
        $data['temperature']              ?? null,
        $data['poids']                    ?? null,
        $data['motif'],
        $data['observations']             ?? '',
        $data['ordonnance']               ?? '',
        $data['statutLorsDeConsultation'] ?? 'Régulier',
        $montant,
        isset($data['photosAnalyses']) ? json_encode($data['photosAnalyses']) : null,
    ]);

    repondreJson(['message' => 'Consultation créée', 'id' => $id], 201);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);

function formaterConsultation(array $c): array {
    return [
        'id'                       => $c['id'],
        'patientId'                => $c['patient_id'],
        'patientNom'               => $c['patient_nom'],
        'date'                     => $c['date_consultation'],
        'type'                     => $c['type_consultation'],
        'tension'                  => $c['tension'],
        'pouls'                    => (int)   $c['pouls'],
        'temperature'              => (float) $c['temperature'],
        'poids'                    => (float) $c['poids'],
        'motif'                    => $c['motif'],
        'observations'             => $c['observations'],
        'ordonnance'               => $c['ordonnance'],
        'statutLorsDeConsultation' => $c['statut_lors_consultation'],
        'montant'                  => (float) $c['montant'],
        'photosAnalyses'           => $c['photos_analyses'] ? json_decode($c['photos_analyses'], true) : [],
    ];
}