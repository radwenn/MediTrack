// features/parametres/parametres.component.ts

import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { DataService }    from '../../core/services/data.service';
import { AuthService }    from '../../core/auth/services/auth.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }  from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css',
})
export class ParametresComponent {

  data = inject(DataService);
  private auth = inject(AuthService);

  // ── Infos utilisateur connecté ──────────────────────────────────────────
  user = this.auth.user;

  // ── Mode édition profil : false = affichage, true = formulaire actif ────
  modeEditionProfil = signal(false);

  // ── Champs du formulaire profil ─────────────────────────────────────────
  // Initialisés avec les valeurs actuelles dès qu'on clique sur "Modifier"
  editNom      = signal('');
  editEmail    = signal('');

  // ── Messages de retour pour le profil ──────────────────────────────────
  succesProfil  = signal(false);
  erreurProfil  = signal('');
  chargementProfil = signal(false);

  // ── Ouvrir le formulaire de modification ────────────────────────────────
  activerEditionProfil(): void {
    const u = this.user();
    if (!u) return;
    // Pré-remplir avec les valeurs actuelles
    this.editNom.set(u.nom);
    this.editEmail.set(u.email);
    this.erreurProfil.set('');
    this.modeEditionProfil.set(true);
  }

  // ── Annuler sans sauvegarder ────────────────────────────────────────────
  annulerEditionProfil(): void {
    this.modeEditionProfil.set(false);
    this.erreurProfil.set('');
  }

  // ── Sauvegarder les modifications du profil ─────────────────────────────
  async sauvegarderProfil(): Promise<void> {
    const nom   = this.editNom().trim();
    const email = this.editEmail().trim();

    // Validation simple
    if (!nom) {
      this.erreurProfil.set('Le nom est obligatoire.');
      return;
    }
    if (!email || !email.includes('@')) {
      this.erreurProfil.set('Veuillez entrer un email valide.');
      return;
    }

    this.chargementProfil.set(true);
    this.erreurProfil.set('');

    try {
      // Appel au service → PUT /utilisateurs/single.php?id=...
      await this.auth.updateProfile(nom, email);

      // Succès
      this.modeEditionProfil.set(false);
      this.succesProfil.set(true);
      setTimeout(() => this.succesProfil.set(false), 3000);

    } catch (e: any) {
      // L'API renvoie 409 si l'email est déjà utilisé
      if (e?.status === 409) {
        this.erreurProfil.set('Cet email est déjà utilisé par un autre compte.');
      } else {
        this.erreurProfil.set('Une erreur est survenue. Réessayez.');
      }
    } finally {
      this.chargementProfil.set(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  //  TARIFS
  // ══════════════════════════════════════════════════════════════════════

  tarifRegulierEdit    = signal(this.data.tarifRegulier());
  tarifNonRegulierEdit = signal(this.data.tarifNonRegulier());

  // Prévisualisation du revenu estimé si les tarifs changent
  revenuEstimePreview = computed(() => {
    const stats = this.data.stats();
    return stats.reguliers    * this.tarifRegulierEdit()
         + stats.nonReguliers * this.tarifNonRegulierEdit();
  });

  succesTarifs  = signal(false);
  erreurTarifs  = signal('');

  stats = this.data.stats;

  enregistrerTarifs(): void {
    const r  = Math.round(this.tarifRegulierEdit());
    const nr = Math.round(this.tarifNonRegulierEdit());

    if (r <= 0 || nr <= 0) {
      this.erreurTarifs.set('Les tarifs doivent être des nombres positifs.');
      return;
    }

    this.data.mettreAJourTarifs(r, nr);
    this.erreurTarifs.set('');
    this.succesTarifs.set(true);
    setTimeout(() => this.succesTarifs.set(false), 3000);
  }

  reinitialiserTarifs(): void {
    this.tarifRegulierEdit.set(20);
    this.tarifNonRegulierEdit.set(40);
    this.data.mettreAJourTarifs(20, 40);
    this.succesTarifs.set(true);
    setTimeout(() => this.succesTarifs.set(false), 3000);
  }

  incrementer(champ: 'regulier' | 'nonRegulier', pas: number): void {
    if (champ === 'regulier') {
      this.tarifRegulierEdit.update(v => Math.max(1, v + pas));
    } else {
      this.tarifNonRegulierEdit.update(v => Math.max(1, v + pas));
    }
  }
}