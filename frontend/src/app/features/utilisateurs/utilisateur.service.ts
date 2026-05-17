// features/utilisateurs/utilisateur.service.ts
// ── Version finale : appels HTTP vers le backend PHP ──

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient }     from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Utilisateur {
  id:           number;
  nom:          string;
  email:        string;
  password?:    string;   // Optionnel : seulement à l'envoi, jamais reçu du serveur
  role:         'medecin' | 'admin';
  dateCreation: string;
}

const API     = 'http://localhost/backend/api';
const OPTIONS = { withCredentials: true };   // Pour les cookies de session PHP

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  private http = inject(HttpClient);

  // ─── Signal local ───────────────────────────────────
  private _utilisateurs = signal<Utilisateur[]>([]);
  readonly utilisateurs = this._utilisateurs.asReadonly();

  // ─── Chargement en cours ? ─────────────────────────
  chargement = signal(false);

  // ─── Stats calculées automatiquement ───────────────
  readonly stats = computed(() => ({
    total:    this._utilisateurs().length,
    admins:   this._utilisateurs().filter(u => u.role === 'admin').length,
    medecins: this._utilisateurs().filter(u => u.role === 'medecin').length,
  }));

  constructor() {
    // Charger la liste dès que le service est créé
    this.chargerUtilisateurs();
  }

  // ─── Charger tous les utilisateurs depuis PHP ───────
  async chargerUtilisateurs(): Promise<void> {
    this.chargement.set(true);
    try {
      const data = await firstValueFrom(
        this.http.get<Utilisateur[]>(`${API}/utilisateurs/index.php`, OPTIONS)
      );
      this._utilisateurs.set(data);
    } catch (e) {
      console.error('Impossible de charger les utilisateurs :', e);
    } finally {
      this.chargement.set(false);
    }
  }

  // ─── Ajouter un utilisateur ─────────────────────────
  // Le mot de passe est envoyé au PHP qui le hashe avant de le stocker
  async ajouter(utilisateur: Omit<Utilisateur, 'id'>): Promise<void> {
    const reponse = await firstValueFrom(
      this.http.post<{ id: number; message: string }>(
        `${API}/utilisateurs/index.php`,
        utilisateur,
        OPTIONS
      )
    );
    // Ajouter localement avec l'ID généré par MySQL
    this._utilisateurs.update(list => [
      ...list,
      { ...utilisateur, id: reponse.id, password: undefined },
    ]);
  }

  // ─── Modifier un utilisateur ────────────────────────
  // Si password est vide → le backend NE change PAS le mot de passe
  async modifier(updated: Utilisateur): Promise<void> {
    await firstValueFrom(
      this.http.put(
        `${API}/utilisateurs/single.php?id=${updated.id}`,
        updated,
        OPTIONS
      )
    );
    // Mettre à jour le signal local (sans le mot de passe)
    this._utilisateurs.update(list =>
      list.map(u => u.id === updated.id
        ? { ...updated, password: undefined }
        : u
      )
    );
  }

  // ─── Supprimer un utilisateur ───────────────────────
  async supprimer(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${API}/utilisateurs/single.php?id=${id}`, OPTIONS)
    );
    this._utilisateurs.update(list => list.filter(u => u.id !== id));
  }

  // ─── Chercher par ID ────────────────────────────────
  getById(id: number): Utilisateur | undefined {
    return this._utilisateurs().find(u => u.id === id);
  }

  // ─── Vérifier si email existe (côté client, rapide) ─
  emailExiste(email: string, idExclu?: number): boolean {
    return this._utilisateurs().some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.id !== idExclu
    );
  }
}