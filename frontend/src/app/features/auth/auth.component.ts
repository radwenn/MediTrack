// features/auth/auth.component.ts
// ── Modification : login() est maintenant async ──
import { Component, signal, inject } from '@angular/core';
import { FormsModule }               from '@angular/forms';
import { AuthService }               from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private auth = inject(AuthService);

  email    = '';
  password = '';
  showPwd  = signal(false);
  erreur   = signal(false);
  loading  = signal(false);   // 🆕 Pour désactiver le bouton pendant la requête

  togglePwd(): void { this.showPwd.update(v => !v); }

  // login() est maintenant async car il attend la réponse du serveur
  async login(): Promise<void> {
    this.loading.set(true);
    this.erreur.set(false);

    const ok = await this.auth.login(this.email, this.password);

    this.erreur.set(!ok);
    this.loading.set(false);
  }
}

// // features/auth/auth.component.ts
// import { Component, signal, inject } from '@angular/core';
// import { FormsModule }               from '@angular/forms';
// import { AuthService }               from '../../core/auth/services/auth.service';

// @Component({
//   selector: 'app-auth',
//   standalone: true,
//   imports: [FormsModule],
//   templateUrl: './auth.component.html',
//   styleUrl: './auth.component.css',
// })
// export class AuthComponent {
//   private auth = inject(AuthService);

//   // État local via Signals
//   email   = '';
//   password= '';
//   showPwd = signal(false);
//   erreur  = signal(false);

//   togglePwd(): void { this.showPwd.update(v => !v); }

//   login(): void {
//     const ok = this.auth.login(this.email, this.password);
//     this.erreur.set(!ok);
//   }
// }