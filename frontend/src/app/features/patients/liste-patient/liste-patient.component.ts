// features/patients/liste-patient/liste-patient.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink }       from '@angular/router';
import { FormsModule }      from '@angular/forms';
import { DataService }      from '../../../core/services/data.service';
import { Patient }          from '../../../shared/models/patient.model';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }  from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-liste-patient',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, TopbarComponent],
  templateUrl: './liste-patient.component.html',
  styleUrl: './liste-patient.component.css',
})
export class ListePatientComponent {
  private data = inject(DataService);

  // Filtres
  recherche      = signal('');
  filtreStatut   = signal<string>('tous');      // 'tous' | 'Régulier' | 'Non Régulier'
  filtreChronique= signal<string>('tous');      // 'tous' | 'oui' | 'non'

  // Liste filtrée (computed = recalculé automatiquement si un signal change)
  patientsFiltres = computed(() => {
    const q  = this.recherche().toLowerCase();
    const st = this.filtreStatut();
    const ch = this.filtreChronique();

    return this.data.patients().filter(p => {
      const matchQ  = !q || `${p.prenom} ${p.nom}`.toLowerCase().includes(q)
                          || p.id.toLowerCase().includes(q)
                          || p.maladieChronique?.toLowerCase().includes(q);
      const matchSt = st === 'tous' || p.statutPatient === st;
      const matchCh = ch === 'tous'
                    || (ch === 'oui' && p.isChronique)
                    || (ch === 'non' && !p.isChronique);
      return matchQ && matchSt && matchCh;
    });
  });

  // Supprimer un patient
  supprimer(id: string, nom: string): void {
    if (confirm(`Supprimer le patient ${nom} ? Cette action est irréversible.`)) {
      this.data.deletePatient(id);
    }
  }

  // Classes CSS badge
  badgeStatut(s: string)  { return s === 'Régulier' ? 'badge-stable' : 'badge-warning'; }
  badgeStatutPatient(p: Patient) {
    if (p.isChronique) return 'badge-critical';
    return 'badge-info';
  }
}