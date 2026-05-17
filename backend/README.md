# MediTrack — Backend PHP

## Structure des fichiers

```
backend/
│
├── config/
│   ├── database.php     ← Connexion MySQL (PDO)
│   └── cors.php         ← Headers CORS + fonctions utilitaires
│
├── api/
│   ├── auth/
│   │   ├── login.php    ← POST  — Connexion
│   │   └── logout.php   ← POST  — Déconnexion
│   │
│   ├── patients/
│   │   ├── index.php    ← GET (liste) / POST (créer)
│   │   └── single.php   ← GET / PUT / DELETE  ?id=P-001
│   │
│   ├── consultations/
│   │   ├── index.php    ← GET (liste) / POST (créer)
│   │   └── single.php   ← GET / PUT / DELETE  ?id=C-001
│   │
│   └── settings/
│       └── tarifs.php   ← GET (lire) / PUT (modifier)
│
└── database.sql         ← Schéma + données de test
```

---

## Installation

### Étape 1 — Installer XAMPP
Téléchargez XAMPP sur https://www.apachefriends.org  
Démarrez **Apache** et **MySQL** depuis le panneau de contrôle.

### Étape 2 — Créer la base de données
1. Ouvrez **phpMyAdmin** : http://localhost/phpmyadmin
2. Cliquez sur **"Nouvelle base de données"** → `meditrack`
3. Allez dans l'onglet **SQL**
4. Copiez-collez tout le contenu de `database.sql`
5. Cliquez **Exécuter**

### Étape 3 — Placer le backend dans XAMPP
Copiez le dossier `backend/` ici :
```
C:\xampp\htdocs\backend\
```

### Étape 4 — Tester
Ouvrez votre navigateur :
- http://localhost/backend/api/patients/index.php  
  → Devrait retourner une erreur "Non autorisé" (normal, vous n'êtes pas connecté)

---

## Mots de passe de test

Les mots de passe dans `database.sql` sont des hash PHP.  
Pour les générer vous-même, créez un fichier `hash.php` :

```php
<?php
echo password_hash('rayen',     PASSWORD_DEFAULT); // Pour Dr. Rayen
echo password_hash('radhouene', PASSWORD_DEFAULT); // Pour Dr. Radhouene
```

---

## Endpoints disponibles

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/login.php | Connexion |
| POST | /api/auth/logout.php | Déconnexion |
| GET | /api/patients/index.php | Liste des patients |
| POST | /api/patients/index.php | Créer un patient |
| GET | /api/patients/single.php?id=P-001 | Détail d'un patient |
| PUT | /api/patients/single.php?id=P-001 | Modifier un patient |
| DELETE | /api/patients/single.php?id=P-001 | Supprimer un patient |
| GET | /api/consultations/index.php | Liste des consultations |
| GET | /api/consultations/index.php?patientId=P-001 | Consultations d'un patient |
| POST | /api/consultations/index.php | Créer une consultation |
| GET | /api/consultations/single.php?id=C-001 | Détail d'une consultation |
| PUT | /api/consultations/single.php?id=C-001 | Modifier une consultation |
| DELETE | /api/consultations/single.php?id=C-001 | Supprimer une consultation |
| GET | /api/settings/tarifs.php | Lire les tarifs |
| PUT | /api/settings/tarifs.php | Modifier les tarifs |

---

## Intégrer avec Angular (étape suivante)

Dans Angular, vous devrez remplacer les données mock dans `data.service.ts`  
par des appels HTTP vers ces endpoints.

Exemple dans un service Angular :

```typescript
// Remplacer les données mock par un appel HTTP
getPatients() {
  return this.http.get('http://localhost/backend/api/patients/index.php', {
    withCredentials: true  // Important : envoie les cookies de session
  });
}

login(email: string, password: string) {
  return this.http.post('http://localhost/backend/api/auth/login.php',
    { email, password },
    { withCredentials: true }
  );
}
```

L'option `withCredentials: true` est essentielle pour que la session PHP  
fonctionne avec les requêtes Angular.