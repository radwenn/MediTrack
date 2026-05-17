// features/patients/details-patient/details-patient.component.ts
import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink }  from '@angular/router';
import { DataService }                 from '../../../core/services/data.service';
import { SidebarComponent }            from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }             from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-details-patient',
  standalone: true,
  imports: [RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './details-patient.component.html',
  styleUrl: './details-patient.component.css',
})
export class DetailsPatientComponent {
  private data  = inject(DataService);
  private route = inject(ActivatedRoute);

  // Récupère le patient par l'ID dans l'URL
  id = this.route.snapshot.paramMap.get('id')!;

  patient = computed(() => this.data.getPatientById(this.id));

  // Consultations liées à ce patient
  consultations = computed(() =>
    this.data.getConsultationsByPatient(this.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  // Revenu total généré par ce patient
  revenuTotal = computed(() =>
    this.consultations().reduce((s, c) => s + c.montant, 0)
  );

  badgeStatut(s: string) { return s === 'Régulier' ? 'badge-stable' : 'badge-warning'; }
}