// features/consultations/consultations-list/consultations-list.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink }            from '@angular/router';
import { FormsModule }           from '@angular/forms';
import { DataService }           from '../../../core/services/data.service';
import { SidebarComponent }      from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }       from '../../../shared/components/topbar/topbar.component';
import { DateRangePickerComponent, DateRange } from '../../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, TopbarComponent, DateRangePickerComponent],
  templateUrl: './consultations-list.component.html',
  styleUrl:    './consultations-list.component.css',
})
export class ConsultationsListComponent {
  private data = inject(DataService);

  recherche    = signal('');
  filtreType   = signal('tous');
  filtreStatut = signal('tous');

  // ── Plage de dates ──────────────────────────────────
  dateMin = signal('');
  dateMax = signal('');

  // Appelé par le composant date-range-picker
  onRangeChange(range: DateRange): void {
    this.dateMin.set(range.debut);
    this.dateMax.set(range.fin);
  }

  consultationsFiltrees = computed(() => {
    const q   = this.recherche().toLowerCase();
    const t   = this.filtreType();
    const st  = this.filtreStatut();
    const min = this.dateMin();
    const max = this.dateMax();

    return [...this.data.consultations()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(c => {
        const matchQ    = !q  || c.patientNom.toLowerCase().includes(q)
                              || c.motif.toLowerCase().includes(q)
                              || c.id.toLowerCase().includes(q);
        const matchT    = t   === 'tous' || c.type === t;
        const matchSt   = st  === 'tous' || c.statutLorsDeConsultation === st;
        const matchMin  = !min || c.date >= min;
        const matchMax  = !max || c.date <= max;
        return matchQ && matchT && matchSt && matchMin && matchMax;
      });
  });

  revenuFiltree = computed(() =>
    this.consultationsFiltrees().reduce((s, c) => s + c.montant, 0)
  );

  supprimer(id: string): void {
    if (confirm('Supprimer cette consultation ?')) {
      this.data.deleteConsultation(id);
    }
  }

  badgeStatut(s: string) { return s === 'Régulier' ? 'badge-stable' : 'badge-warning'; }
  badgeType(t: string) {
    const map: Record<string, string> = {
      'Urgence':               'badge-critical',
      'Bilan annuel':          'badge-info',
      'Suivi traitement':      'badge-stable',
      'Consultation générale': 'badge-stable',
    };
    return map[t] ?? 'badge-info';
  }
}