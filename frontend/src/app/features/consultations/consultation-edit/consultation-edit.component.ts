// features/consultations/consultation-edit/consultation-edit.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { DataService }   from '../../../core/services/data.service';
import { Consultation, TypeConsultation } from '../../../shared/models/consultation.model';
import { StatutPatient } from '../../../shared/models/patient.model';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }  from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-consultation-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './consultation-edit.component.html',
  styleUrl: './consultation-edit.component.css',
})
export class ConsultationEditComponent implements OnInit {
  private data   = inject(DataService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get('id')!;
  introuvable = signal(false);

  patientNomAffiche        = signal('');
  date                     = signal('');
  type                     = signal<TypeConsultation>('Consultation générale');
  tension                  = signal('');
  pouls                    = signal(0);
  temperature              = signal(37.0);
  poids                    = signal(0);
  motif                    = signal('');
  observations             = signal('');
  ordonnance               = signal('');
  statutLorsDeConsultation = signal<StatutPatient>('Régulier');
  photosAnalyses           = signal<string[]>([]);

  isControle = computed(() => this.type() === 'Consultation de contrôle');

  montant = computed(() => this.data.tarifPour(this.statutLorsDeConsultation(), this.type()));

  tarifRegulier    = this.data.tarifRegulier;
  tarifNonRegulier = this.data.tarifNonRegulier;

  erreurs     = signal<string[]>([]);
  succes      = signal(false);

  ngOnInit(): void {
    const c = this.data.getConsultationById(this.id);
    if (!c) { this.introuvable.set(true); return; }

    this.patientNomAffiche.set(c.patientNom);
    this.date.set(c.date);
    this.type.set(c.type);
    this.tension.set(c.tension);
    this.pouls.set(c.pouls);
    this.temperature.set(c.temperature);
    this.poids.set(c.poids);
    this.motif.set(c.motif);
    this.observations.set(c.observations);
    this.ordonnance.set(c.ordonnance);
    this.statutLorsDeConsultation.set(c.statutLorsDeConsultation);
    this.photosAnalyses.set(c.photosAnalyses ?? []);
  }

  onTypeChange(val: string): void {
    this.type.set(val as TypeConsultation);
  }

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.photosAnalyses.update(arr => [...arr, base64]);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number): void {
    this.photosAnalyses.update(arr => arr.filter((_, i) => i !== index));
  }

  private valider(): boolean {
    const errs: string[] = [];
    if (!this.date())         errs.push('La date est obligatoire.');
    if (!this.motif().trim()) errs.push('Le motif est obligatoire.');
    this.erreurs.set(errs);
    return errs.length === 0;
  }

  enregistrer(): void {
    if (!this.valider()) return;
    const ancien = this.data.getConsultationById(this.id)!;

    const misAJour: Consultation = {
      ...ancien,
      date:         this.date(),
      type:         this.type(),
      tension:      this.tension(),
      pouls:        this.pouls(),
      temperature:  this.temperature(),
      poids:        this.poids(),
      motif:        this.motif().trim(),
      observations: this.observations().trim(),
      ordonnance:   this.ordonnance().trim(),
      statutLorsDeConsultation: this.statutLorsDeConsultation(),
      montant: this.montant(),
      photosAnalyses: this.photosAnalyses(),
    };

    this.data.updateConsultation(misAJour);
    this.succes.set(true);
    setTimeout(() => this.router.navigate(['/consultations', this.id]), 1500);
  }
}