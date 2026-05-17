# 🏥 MediTrack — Système de Gestion de Cabinet Médical

> Application web de gestion médicale développée avec **Angular 18** (frontend) et **PHP/MySQL** (backend).  
> Permet à un médecin de gérer ses patients, consultations, ordonnances et analyses en toute simplicité.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
- [Installation](#installation)
- [Comptes de test](#comptes-de-test)
- [Endpoints API](#endpoints-api)
- [Base de données](#base-de-données)
- [Notes techniques](#notes-techniques)

---

## Aperçu

MediTrack est une application **desktop-first** conçue pour les médecins généralistes. Elle centralise la gestion des patients, l'historique des consultations, les ordonnances et la facturation dans une interface moderne et intuitive.

> ⚠️ **Application optimisée pour desktop uniquement** (résolution min. 1024px).

---

## Technologies utilisées

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| Angular | 18 | Framework SPA |
| TypeScript | 5.x | Langage principal |
| Angular Signals | 18 | Gestion d'état réactif |
| Font Awesome | 6 | Icônes |
| Google Fonts (Outfit) | — | Typographie |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| PHP | 8.3 | API REST |
| MySQL / MariaDB | 10.4 | Base de données |
| PDO | — | Accès base de données |
| Sessions PHP | — | Authentification |

### Outils
| Outil | Usage |
|---|---|
| XAMPP | Serveur local Apache + MySQL |
| phpMyAdmin | Administration base de données |
| Postman | Test des endpoints API |
| Angular CLI | Génération et build du projet |

---

## Fonctionnalités

### 👤 Gestion des patients
- ➕ Ajout / modification / suppression de patients
- 🔍 Recherche par nom, prénom ou téléphone
- 📋 Fiche complète : informations personnelles, profil médical, allergies
- 🩺 Suivi des maladies chroniques
- 📊 Historique complet des consultations par patient
- 🎨 Avatar personnalisé avec initiales et couleur gradient

### 🩺 Gestion des consultations
- ➕ Nouvelle consultation avec pré-sélection du patient
- 📝 Constantes vitales : tension, pouls, température, poids
- 💊 Ordonnance et observations cliniques
- 📸 **Photos d'analyses** : upload et visualisation (lightbox)
- 🔖 5 types : Consultation générale, Suivi traitement, Urgence, Bilan annuel, **Consultation de contrôle (0 DT)**
- 💰 Facturation automatique selon statut patient (Régulier / Non Régulier)

### 🔔 Notifications intelligentes
- Détection automatique des **patients chroniques** sans consultation depuis +90 jours
- Badge sur la cloche avec compteur
- Navigation directe vers nouvelle consultation pré-remplie
- Dismissal persistant (localStorage)

### 📊 Tableau de bord
- Statistiques en temps réel : patients, consultations, revenus
- Répartition Réguliers / Non Réguliers
- Dernières consultations

### ⚙️ Paramètres
- Configuration des tarifs (Régulier / Non Régulier)
- Gestion des utilisateurs (admin uniquement)

### 🔐 Authentification
- Login / Logout sécurisé par sessions PHP
- Deux rôles : **médecin** et **admin**
- Isolation des données par médecin (`user_id`)

---

## Architecture du projet

```
MediTrack/
│
├── frontend/                          ← Application Angular 18
│   └── src/app/
│       ├── core/
│       │   └── services/
│       │       ├── data.service.ts    ← Service central (patients, consultations, tarifs, notifications)
│       │       ├── api.service.ts     ← Appels HTTP vers le backend
│       │       └── storage.service.ts
│       │
│       ├── features/
│       │   ├── auth/                  ← Login
│       │   ├── dashboard/             ← Tableau de bord
│       │   ├── patients/
│       │   │   ├── liste-patient/     ← Liste avec recherche et filtres
│       │   │   ├── details-patient/   ← Fiche patient + historique
│       │   │   ├── ajouter-patient/   ← Formulaire ajout
│       │   │   └── patient-edit/      ← Formulaire modification
│       │   ├── consultations/
│       │   │   ├── consultations-list/      ← Liste avec filtres date
│       │   │   ├── consultation-add/        ← Nouvelle consultation
│       │   │   ├── consultation-edit/       ← Modifier consultation
│       │   │   └── details-consultation/    ← Détail + visionneuse photos
│       │   ├── utilisateurs/          ← Gestion utilisateurs (admin)
│       │   └── parametres/            ← Tarifs
│       │
│       └── shared/
│           ├── components/
│           │   ├── sidebar/           ← Navigation principale
│           │   ├── topbar/            ← Barre supérieure
│           │   ├── notifications/     ← Panel notifications patients chroniques
│           │   ├── date-range-picker/ ← Filtre par période
│           │   └── loader/            ← Spinner de chargement
│           ├── models/
│           │   ├── patient.model.ts
│           │   └── consultation.model.ts
│           └── pipes/
│
├── backend/                           ← API REST PHP
│   ├── config/
│   │   ├── database.php               ← Connexion PDO MySQL
│   │   └── cors.php                   ← Headers CORS + helpers
│   └── api/
│       ├── auth/
│       │   ├── login.php              ← POST — Connexion
│       │   └── logout.php             ← POST — Déconnexion
│       ├── patients/
│       │   ├── index.php              ← GET liste / POST créer
│       │   └── single.php             ← GET / PUT / DELETE par id
│       ├── consultations/
│       │   ├── index.php              ← GET liste / POST créer
│       │   └── single.php             ← GET / PUT / DELETE par id
│       ├── settings/
│       │   └── tarifs.php             ← GET / PUT tarifs
│       └── utilisateurs/
│           ├── index.php              ← GET liste / POST créer
│           └── single.php             ← GET / PUT / DELETE par id
│
└── meditrack.sql                      ← Schéma + données initiales
```

---

## Installation

### Prérequis
- [XAMPP](https://www.apachefriends.org) (Apache + MySQL)
- [Node.js](https://nodejs.org) v18+
- [Angular CLI](https://angular.io/cli) : `npm install -g @angular/cli`

---

### Étape 1 — Base de données

1. Démarrez **Apache** et **MySQL** dans XAMPP
2. Ouvrez **phpMyAdmin** → `http://localhost/phpmyadmin`
3. Créez une base : `meditrack`
4. Onglet **SQL** → collez le contenu de `meditrack.sql` → **Exécuter**
5. Exécutez ensuite ces 2 requêtes pour les nouvelles fonctionnalités :

```sql
ALTER TABLE consultations
  ADD COLUMN photos_analyses LONGTEXT DEFAULT NULL;

ALTER TABLE consultations
  MODIFY COLUMN type_consultation
  ENUM('Consultation générale','Suivi traitement','Urgence','Bilan annuel','Consultation de contrôle') NOT NULL;
```

---

### Étape 2 — Backend PHP

Copiez le dossier `backend/` dans htdocs :

```
C:\xampp\htdocs\MediTrack\backend\
```

Vérifiez la config dans `backend/config/database.php` :

```php
define('DB_HOST',     'localhost');
define('DB_NAME',     'meditrack');
define('DB_USER',     'root');
define('DB_PASSWORD', '');
```

---

### Étape 3 — Frontend Angular

```bash
cd frontend
npm install
ng serve
```

L'application est accessible sur : **http://localhost:4200**

---

### Étape 4 — Vérification

| Service | URL | Résultat attendu |
|---|---|---|
| Frontend Angular | http://localhost:4200 | Page de login |
| Backend API | http://localhost/MediTrack/backend/api/patients/index.php | `{"erreur":"Non autorisé"}` |
| phpMyAdmin | http://localhost/phpmyadmin | Interface DB |

---

## Comptes de test

| Nom | Email | Mot de passe | Rôle |
|---|---|---|---|
| Dr. Radhouene | radhouene@gmail.com | radhouene | Médecin |
| Rayen Saidi | rayensaidi@gmail.com | rayen | Admin |

---

## Endpoints API

### Authentification
| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login.php` | Connexion |
| `POST` | `/api/auth/logout.php` | Déconnexion |

### Patients
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients/index.php` | Liste des patients |
| `GET` | `/api/patients/index.php?terme=nom` | Recherche patient |
| `POST` | `/api/patients/index.php` | Créer un patient |
| `GET` | `/api/patients/single.php?id=P-001` | Détail patient |
| `PUT` | `/api/patients/single.php?id=P-001` | Modifier patient |
| `DELETE` | `/api/patients/single.php?id=P-001` | Supprimer patient |

### Consultations
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/consultations/index.php` | Liste des consultations |
| `GET` | `/api/consultations/index.php?patientId=P-001` | Consultations d'un patient |
| `POST` | `/api/consultations/index.php` | Créer une consultation |
| `GET` | `/api/consultations/single.php?id=C-001` | Détail consultation |
| `PUT` | `/api/consultations/single.php?id=C-001` | Modifier consultation |
| `DELETE` | `/api/consultations/single.php?id=C-001` | Supprimer consultation |

### Paramètres
| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/settings/tarifs.php` | Lire les tarifs |
| `PUT` | `/api/settings/tarifs.php` | Modifier les tarifs |

---

## Base de données

### Tables

```sql
utilisateurs    — Médecins et admins
patients        — Fiches patients (liées à un utilisateur)
consultations   — Consultations médicales (liées à un patient et utilisateur)
parametres      — Configuration (tarif_regulier, tarif_non_regulier)
```

### Relations
```
Utilisateur (1) ──── gère ────► (0..*) Patient
Utilisateur (1) ──── crée ────► (0..*) Consultation
Patient     (1) ──── possède ──► (0..*) Consultation
Consultation (0..*) ─ utilise ──► (1) Parametre
```

---

## Notes techniques

### Gestion des notifications
Les notifications pour patients chroniques sont calculées côté frontend via un `computed()` Angular Signal. Les notifications ignorées sont persistées en `localStorage` avec la clé `mt_dismissed_notifs`.

### Photos d'analyses
Les photos sont stockées en **base64** dans la colonne `photos_analyses` (LONGTEXT). Pour une production, il est recommandé de les stocker sur le serveur et de sauvegarder uniquement les chemins en base.

### Consultation de contrôle
Le montant est forcé à `0` côté frontend (signal `computed`) **et** côté backend PHP, pour garantir la cohérence même en cas d'appel API direct.

### Isolation multi-médecin
Chaque requête filtre par `user_id = $_SESSION['user_id']` — un médecin ne voit jamais les données d'un autre.

### Sécurité des sessions
Les sessions PHP expirent après inactivité. Le frontend redirige automatiquement vers `/login` en cas de réponse `401` du backend.

---

## Auteur

**Mohamed Radhouen Ksouri**  
**Mohamed Rayen Saidi** 

Projet d'intégration — 2026
