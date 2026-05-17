<?php
// api/patients/single.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

setCorsHeaders();
verifierSession();

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? '';
$userId = $_SESSION['utilisateur']['id'];   // médecin connecté

if (empty($id)) repondreJson(['erreur' => 'ID manquant'], 400);

// ─── Chercher le patient ET vérifier qu'il appartient à ce médecin ──
// Sans le WHERE user_id, un médecin pourrait accéder aux patients d'un autre !
$stmt = $db->prepare("SELECT * FROM patients WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $userId]);
$patient = $stmt->fetch();

if (!$patient) {
    // Patient introuvable OU n'appartient pas à ce médecin
    repondreJson(['erreur' => 'Patient introuvable'], 404);
}

// ══════════════════════════════════════════════════
//  GET
// ══════════════════════════════════════════════════
if ($method === 'GET') {
    $patient['allergies']    = json_decode($patient['allergies'] ?? '[]', true);
    $patient['is_chronique'] = (bool) $patient['is_chronique'];
    repondreJson($patient);
}

// ══════════════════════════════════════════════════
//  PUT — Modifier (uniquement son propre patient)
// ══════════════════════════════════════════════════
if ($method === 'PUT') {
    $data = lireBody();

    $stmt = $db->prepare("
        UPDATE patients SET
            nom = ?, prenom = ?, age = ?, sexe = ?,
            telephone = ?, email = ?, adresse = ?, sanguin = ?,
            allergies = ?, poids = ?, taille = ?,
            is_chronique = ?, maladie_chronique = ?,
            statut_patient = ?, couleur = ?
        WHERE id = ? AND user_id = ?
    ");

    $stmt->execute([
        $data['nom'], $data['prenom'], $data['age'] ?? null, $data['sexe'],
        $data['telephone'] ?? null, $data['email'] ?? null,
        $data['adresse'] ?? null, $data['sanguin'] ?? null,
        json_encode($data['allergies'] ?? []),
        $data['poids'] ?? null, $data['taille'] ?? null,
        $data['isChronique'] ?? false, $data['maladieChronique'] ?? null,
        $data['statutPatient'] ?? 'Régulier', $data['couleur'] ?? null,
        $id, $userId,   // double sécurité dans le WHERE
    ]);

    repondreJson(['message' => 'Patient modifié']);
}

// ══════════════════════════════════════════════════
//  DELETE
// ══════════════════════════════════════════════════
if ($method === 'DELETE') {
    $stmt = $db->prepare("DELETE FROM patients WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $userId]);
    repondreJson(['message' => 'Patient supprimé']);
}

repondreJson(['erreur' => 'Méthode non autorisée'], 405);