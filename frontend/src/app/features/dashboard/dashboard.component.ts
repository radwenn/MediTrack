// features/dashboard/dashboard.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink }        from '@angular/router';
import { DataService }       from '../../core/services/data.service';
import { SidebarComponent }  from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }   from '../../shared/components/topbar/topbar.component';
import { DecimalPipe }       from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, SidebarComponent, TopbarComponent, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  data = inject(DataService); // <-- PAS de private ici
  public tarifRegulier = signal(this.data.tarifRegulier());
  public tarifNonRegulier = signal(this.data.tarifNonRegulier());

  // Signals réactifs depuis le service
  stats                 = this.data.stats;
  consultationsRecentes = this.data.consultationsRecentes;



  // Helpers affichage
  badgeStatut(s: string): string {
    return s === 'Régulier' ? 'badge-stable' : 'badge-warning';
  }
}