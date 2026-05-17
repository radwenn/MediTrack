<?php
// api/consultations/single.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? '';
$userId = $_SESSION['utilisateur']['id'];

if (empty($id)) repondreJson(['erreur' => 'ID manquant'], 400);

// ─── Vérifier que la consultation appartient à ce médecin ──
$stmt = $db->prepare("SELECT * FROM consultations WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $userId]);
$consultation = $stmt->fetch();

if (!$consultation) {
    repondreJson(['erreur' => 'Consultation introuvable'], 404);
}

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

if ($method === 'GET') {
    repondreJson(formaterConsultation($consultation));
}

if ($method === 'PUT') {
    $data = lireBody();

    $type    = $data['type'] ?? 'Consultation générale';
    $montant = ($type === 'Consultation de contrôle') ? 0 : ($data['montant'] ?? 0);

    $stmt = $db->prepare("
        UPDATE consultations SET
            date_consultation        = ?,
            type_consultation        = ?,
            tension                  = ?,
            pouls                    = ?,
            temperature              = ?,
            poids                    = ?,
            motif                    = ?,
            observations             = ?,
            ordonnance               = ?,
            statut_lors_consultation = ?,
            montant                  = ?,
            photos_analyses          = ?
        WHERE id = ? AND user_id = ?
    ");

    $stmt->execute([
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
        $id, $userId,
    ]);

    repondreJson(['message' => 'Consultation modifiée']);
}

if ($method === 'DELETE') {
    $stmt = $db->prepare("DELETE FROM consultations WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);
    repondreJson(['message' => 'Consultation supprimée']);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);