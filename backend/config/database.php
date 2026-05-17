<?php
// config/database.php

define('DB_HOST',     'localhost');
define('DB_NAME',     'meditrack');
define('DB_USER',     'root');
define('DB_PASSWORD', '');
define('DB_CHARSET',  'utf8mb4');

function getDB(): PDO {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['erreur' => 'Connexion DB impossible : ' . $e->getMessage()]));
    }
}