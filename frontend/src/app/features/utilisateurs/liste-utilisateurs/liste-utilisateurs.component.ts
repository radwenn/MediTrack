// features/utilisateurs/liste-utilisateurs/liste-utilisateurs.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink }            from '@angular/router';
import { FormsModule }           from '@angular/forms';
import { UtilisateurService }    from '../utilisateur.service';
import { Utilisateur }           from '../utilisateur.service';
import { SidebarComponent }      from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }       from '../../../shared/components/topbar/topbar.component';
import { AuthService }           from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl:    './liste-utilisateurs.component.css',
})
export class ListeUtilisateursComponent {
  private utilisateurService = inject(UtilisateurService);
  private auth               = inject(AuthService);

  // ─── Recherche ─────────────────────────────────────
  recherche  = signal('');
  filtreRole = signal('tous');     // 'tous' | 'admin' | 'medecin'

  // ─── Liste filtrée en temps réel ───────────────────
  utilisateursFiltres = computed(() => {
    const q    = this.recherche().toLowerCase();
    const role = this.filtreRole();

    return this.utilisateurService.utilisateurs().filter(u => {
      const matchQ    = !q || u.nom.toLowerCase().includes(q)
                           || u.email.toLowerCase().includes(q);
      const matchRole = role === 'tous' || u.role === role;
      return matchQ && matchRole;
    });
  });

  // ─── Stats ─────────────────────────────────────────
  stats = this.utilisateurService.stats;

  // ─── Utilisateur connecté (pour ne pas se supprimer soi-même) ──
  userConnecte = this.auth.user;

  // ─── Modal de confirmation de suppression ──────────
  idASupprimer    = signal<number | null>(null);
  nomASupprimer   = signal('');
  modalOuverte    = signal(false);

  ouvrirModal(u: Utilisateur): void {
    this.idASupprimer.set(u.id);
    this.nomASupprimer.set(u.nom);
    this.modalOuverte.set(true);
  }

  fermerModal(): void {
    this.modalOuverte.set(false);
    this.idASupprimer.set(null);
  }

  confirmerSuppression(): void {
    const id = this.idASupprimer();
    if (id !== null) {
      this.utilisateurService.supprimer(id);
    }
    this.fermerModal();
  }

  // ─── Helper badge rôle ─────────────────────────────
  badgeRole(role: string): string {
    return role === 'admin' ? 'badge-critical' : 'badge-info';
  }
}