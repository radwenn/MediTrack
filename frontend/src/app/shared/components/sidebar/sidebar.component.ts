// shared/components/sidebar/sidebar.component.ts
// 🆕 DataService injecté pour afficher les tarifs actuels
import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService }                  from '../../../core/auth/services/auth.service';
import { DataService }                  from '../../../core/services/data.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private auth = inject(AuthService);
  data         = inject(DataService);

  user       = this.auth.user;
  nbPatients = this.data.stats;

  // Signal computed pour vérifier si l'utilisateur est admin
  isAdmin = computed(() => this.user()?.role === 'admin');

  logout(): void { 
    this.auth.logout(); 
  }
}