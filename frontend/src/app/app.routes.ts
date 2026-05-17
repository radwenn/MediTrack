// app.routes.ts
import { Routes }     from '@angular/router';
import { authGuard }  from './core/auth/guards/auth.guard';
import { adminGuard } from './core/auth/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  // ─── Page de connexion (accessible sans être connecté) ───
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
  },

  // ─── Pages protégées (utilisateur connecté obligatoire) ───
  {
    path: '',
    canActivate: [authGuard],   // Redirige vers /auth si pas connecté
    children: [

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // Paramètres
      {
        path: 'parametres',
        loadComponent: () => import('./features/parametres/parametres.component').then(m => m.ParametresComponent),
      },

      // ─── Patients ─────────────────────────────────────────
      {
        path: 'patients',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/patients/liste-patient/liste-patient.component').then(m => m.ListePatientComponent),
          },
          {
            path: 'ajouter',
            loadComponent: () => import('./features/patients/ajouter-patient/ajouter-patient.component').then(m => m.AjouterPatientComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/patients/details-patient/details-patient.component').then(m => m.DetailsPatientComponent),
          },
          {
            path: ':id/modifier',
            loadComponent: () => import('./features/patients/patient-edit/patient-edit.component').then(m => m.PatientEditComponent),
          },
        ],
      },

      // ─── Consultations ────────────────────────────────────
      {
        path: 'consultations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/consultations/consultations-list/consultations-list.component').then(m => m.ConsultationsListComponent),
          },
          {
            path: 'ajouter',
            loadComponent: () => import('./features/consultations/consultation-add/consultation-add.component').then(m => m.ConsultationAddComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/consultations/details-consultation/details-consultation.component').then(m => m.DetailsConsultationComponent),
          },
          {
            path: ':id/modifier',
            loadComponent: () => import('./features/consultations/consultation-edit/consultation-edit.component').then(m => m.ConsultationEditComponent),
          },
        ],
      },

      // ─── Gestion des comptes (ADMIN SEULEMENT) ────────────
      // adminGuard vérifie que user.role === 'admin'
      // Si un médecin essaie d'accéder à /utilisateurs → redirigé vers /dashboard
      {
        path: 'utilisateurs',
        canActivate: [adminGuard],   // 🔒 Réservé aux admins
        children: [
          {
            path: '',
            loadComponent: () => import('./features/utilisateurs/liste-utilisateurs/liste-utilisateurs.component').then(m => m.ListeUtilisateursComponent),
          },
          {
            path: 'ajouter',
            loadComponent: () => import('./features/utilisateurs/ajouter-utilisateur/ajouter-utilisateur.component').then(m => m.AjouterUtilisateurComponent),
          },
          {
        path: ':id/modifier',
        loadComponent: () => import('./features/utilisateurs/modifier-utilisateur/modifier-utilisateur.component')
          .then(m => m.ModifierUtilisateurComponent),
      },
        ],
      },

    ],
  },

  // ─── Route inconnue → redirection vers dashboard ─────────
  { path: '**', redirectTo: 'dashboard' },
];