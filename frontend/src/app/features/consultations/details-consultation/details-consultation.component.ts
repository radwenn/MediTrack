// features/consultations/details-consultation/details-consultation.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink }  from '@angular/router';
import { DataService }                 from '../../../core/services/data.service';
import { SidebarComponent }            from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }             from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-details-consultation',
  standalone: true,
  imports: [RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './details-consultation.component.html',
  styleUrl: './details-consultation.component.css',
})
export class DetailsConsultationComponent {
  private data  = inject(DataService);
  private route = inject(ActivatedRoute);

  id           = this.route.snapshot.paramMap.get('id')!;
  consultation = computed(() => this.data.getConsultationById(this.id));
  patient      = computed(() => {
    const c = this.consultation();
    return c ? this.data.getPatientById(c.patientId) : undefined;
  });

  // ── Visionneuse photos ──────────────────────────
  viewerIndex = signal<number | null>(null);

  openViewer(index: number): void { this.viewerIndex.set(index); }
  closeViewer(): void             { this.viewerIndex.set(null); }
  prevPhoto(total: number): void  {
    const i = this.viewerIndex();
    if (i !== null) this.viewerIndex.set((i - 1 + total) % total);
  }
  nextPhoto(total: number): void  {
    const i = this.viewerIndex();
    if (i !== null) this.viewerIndex.set((i + 1) % total);
  }

  badgeStatut(s: string): string {
    return s === 'Régulier' ? 'badge-stable' : 'badge-warning';
  }

  badgeType(t: string): string {
    if (t === 'Urgence')                  return 'badge-critical';
    if (t === 'Suivi traitement')         return 'badge-info';
    if (t === 'Bilan annuel')             return 'badge-warning';
    if (t === 'Consultation de contrôle') return 'badge-stable';
    return 'badge-stable';
  }
}