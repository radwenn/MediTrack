// features/utilisateurs/ajouter-utilisateur/ajouter-utilisateur.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink }        from '@angular/router';
import { FormsModule }               from '@angular/forms';
import { UtilisateurService }        from '../utilisateur.service';
import { SidebarComponent }          from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }           from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-ajouter-utilisateur',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './ajouter-utilisateur.component.html',
  styleUrl:    './ajouter-utilisateur.component.css',
})
export class AjouterUtilisateurComponent {
  private utilisateurService = inject(UtilisateurService);
  private router             = inject(Router);

  // ─── Champs du formulaire ──────────────────────────
  nom      = signal('');
  email    = signal('');
  password = signal('');
  role     = signal<'medecin' | 'admin'>('medecin');

  // ─── Afficher/masquer le mot de passe ─────────────
  showPassword = signal(false);

  // ─── État formulaire ───────────────────────────────
  erreurs = signal<string[]>([]);
  succes  = signal(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  // ─── Validation ───────────────────────────────────
  private valider(): boolean {
    const errs: string[] = [];

    if (!this.nom().trim()) {
      errs.push('Le nom est obligatoire.');
    }
    if (!this.email().trim() || !this.email().includes('@')) {
      errs.push('Un email valide est obligatoire.');
    }
    if (this.password().length < 4) {
      errs.push('Le mot de passe doit contenir au moins 4 caractères.');
    }
    // Vérifier si l'email est déjà pris
    if (this.utilisateurService.emailExiste(this.email())) {
      errs.push('Cet email est déjà utilisé par un autre compte.');
    }

    this.erreurs.set(errs);
    return errs.length === 0;
  }

  // ─── Enregistrer ──────────────────────────────────
  enregistrer(): void {
    if (!this.valider()) return;

    this.utilisateurService.ajouter({
      nom:          this.nom().trim(),
      email:        this.email().trim().toLowerCase(),
      password:     this.password(),
      role:         this.role(),
      dateCreation: new Date().toISOString().split('T')[0],
    });

    this.succes.set(true);
    // Rediriger vers la liste après 1.5 secondes
    setTimeout(() => this.router.navigate(['/utilisateurs']), 1500);
  }
}