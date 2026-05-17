// core/auth/guards/admin.guard.ts
import { inject }     from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }from '../services/auth.service';

// Guard réservé aux administrateurs (à connecter au backend)
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const user   = auth.user();
  if (user?.role === 'admin') return true;
  router.navigate(['/dashboard']);
  return false;
};