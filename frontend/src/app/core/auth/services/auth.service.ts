// core/auth/services/auth.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserSession {
  id:    number;
  email: string;
  nom:   string;
  role:  'medecin' | 'admin';
}

const API = 'http://localhost/backend/api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  // ─── Signal : contient les infos de l'utilisateur connecté (ou null) ───
  private _user = signal<UserSession | null>(
    JSON.parse(localStorage.getItem('meditrack_session') ?? 'null')
  );

  readonly user       = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());

  // ─── Connexion ─────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<boolean> {
    try {
      const reponse = await firstValueFrom(
        this.http.post<{ user: UserSession }>(
          `${API}/auth/login.php`,
          { email: email.trim().toLowerCase(), password: password.trim() },
          { withCredentials: true }
        )
      );

      // Sauvegarder la session dans localStorage
      this._user.set(reponse.user);
      localStorage.setItem('meditrack_session', JSON.stringify(reponse.user));

      // ⚠️ IMPORTANT : on utilise window.location.href au lieu de router.navigate()
      //
      // Pourquoi ? Le DataService est un singleton Angular (providedIn: 'root').
      // Il charge les patients UNE SEULE FOIS au démarrage de l'app.
      // Si Médecin A se connecte, puis Médecin B se connecte sans recharger la page,
      // le DataService garde encore les données de Médecin A en mémoire !
      //
      // window.location.href force un rechargement COMPLET de la page,
      // ce qui remet à zéro tous les singletons → les données repartent de zéro.
      window.location.href = '/dashboard';
      return true;

    } catch (erreur) {
      console.error('Erreur de connexion :', erreur);
      return false;
    }
  }

  // ─── Modifier son propre profil ────────────────────────────────────────
  async updateProfile(nom: string, email: string, password?: string): Promise<void> {
    const user = this._user();
    if (!user) return;

    const body: any = { nom: nom.trim(), email: email.trim(), role: user.role };
    if (password && password.trim() !== '') {
      body.password = password.trim();
    }

    await firstValueFrom(
      this.http.put(
        `${API}/utilisateurs/single.php?id=${user.id}`,
        body,
        { withCredentials: true }
      )
    );

    const updatedUser: UserSession = { ...user, nom: nom.trim(), email: email.trim() };
    this._user.set(updatedUser);
    localStorage.setItem('meditrack_session', JSON.stringify(updatedUser));
  }

  // ─── Déconnexion ───────────────────────────────────────────────────────
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${API}/auth/logout.php`, {}, { withCredentials: true })
      );
    } catch (e) {
      // Même si le serveur est inaccessible, on déconnecte côté client
    }

    // Vider la session locale
    this._user.set(null);
    localStorage.removeItem('meditrack_session');

    // ⚠️ Même raison que dans login() : rechargement complet pour vider
    //    le DataService et ne pas laisser les données de l'ancien utilisateur
    window.location.href = '/auth';
  }
}