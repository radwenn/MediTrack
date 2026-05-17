<?php
// =====================================================
//  api/auth/logout.php
//  POST /api/auth/logout.php
//  Détruit la session côté serveur
// =====================================================

require_once '../../config/cors.php';

setCorsHeaders();
session_start();

// Détruire toutes les données de session
session_destroy();

repondreJson(['message' => 'Déconnexion réussie']);