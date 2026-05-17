// features/utilisateurs/modifier-utilisateur/modifier-utilisateur.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule }                        from '@angular/forms';
import { UtilisateurService }                 from '../utilisateur.service';
import { SidebarComponent }                   from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }                    from '../../../shared/components/topbar/topbar.component';
import { AuthService }                        from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-modifier-utilisateur',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './modifier-utilisateur.component.html',
  styleUrl:    './modifier-utilisateur.component.css',
})
export class ModifierUtilisateurComponent implements OnInit {
  private route              = inject(ActivatedRoute);
  private router             = inject(Router);
  private utilisateurService = inject(UtilisateurService);
  private auth               = inject(AuthService);

  // ─── Champs du formulaire ──────────────────────────
  id       = signal<number>(0);
  nom      = signal('');
  email    = signal('');
  password = signal('');       // Vide = ne pas changer le mot de passe
  role     = signal<'medecin' | 'admin'>('medecin');

  // ─── UI ───────────────────────────────────────────
  showPassword   = signal(false);
  erreurs        = signal<string[]>([]);
  succes         = signal(false);
  introuvable    = signal(false);
  chargement     = signal(false);

  // Est-ce que l'utilisateur modifie son propre compte ?
  estSonPropre = signal(false);

  ngOnInit(): void {
    // Récupérer l'ID depuis l'URL : /utilisateurs/2/modifier
    const idParam = Number(this.route.snapshot.paramMap.get('id'));

    const user = this.utilisateurService.getById(idParam);

    if (!user) {
      this.introuvable.set(true);
      return;
    }

    // Pré-remplir les champs avec les données existantes
    this.id.set(user.id);
    this.nom.set(user.nom);
    this.email.set(user.email);
    this.role.set(user.role);

    // Vérifier si c'est son propre compte
    this.estSonPropre.set(user.email === this.auth.user()?.email);
  }

  togglePassword(): void { this.showPassword.update(v => !v); }

  // ─── Validation ────────────────────────────────────
  private valider(): boolean {
    const errs: string[] = [];

    if (!this.nom().trim()) {
      errs.push('Le nom est obligatoire.');
    }
    if (!this.email().trim() || !this.email().includes('@')) {
      errs.push('Un email valide est obligatoire.');
    }
    // Mot de passe : seulement si l'utilisateur en saisit un nouveau
    if (this.password() && this.password().length < 4) {
      errs.push('Le nouveau mot de passe doit contenir au moins 4 caractères.');
    }
    // Vérifier unicité email (sauf pour lui-même)
    if (this.utilisateurService.emailExiste(this.email(), this.id())) {
      errs.push('Cet email est déjà utilisé par un autre compte.');
    }

    this.erreurs.set(errs);
    return errs.length === 0;
  }

  // ─── Enregistrer les modifications ─────────────────
  async enregistrer(): Promise<void> {
    if (!this.valider()) return;

    this.chargement.set(true);

    try {
      await this.utilisateurService.modifier({
        id:           this.id(),
        nom:          this.nom().trim(),
        email:        this.email().trim().toLowerCase(),
        password:     this.password() || undefined,  // undefined = pas de changement
        role:         this.role(),
        dateCreation: '',  // ignoré par le backend pour un UPDATE
      });

      this.succes.set(true);
      setTimeout(() => this.router.navigate(['/utilisateurs']), 1500);
    } catch (e: any) {
      const msg = e?.error?.erreur ?? 'Une erreur est survenue.';
      this.erreurs.set([msg]);
    } finally {
      this.chargement.set(false);
    }
  }
}