// features/consultations/consultation-add/consultation-add.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule }          from '@angular/forms';
import { DataService }          from '../../../core/services/data.service';
import { Consultation, TypeConsultation } from '../../../shared/models/consultation.model';
import { StatutPatient }        from '../../../shared/models/patient.model';
import { SidebarComponent }     from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }      from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-consultation-add',
  standalone: true,
  imports: [FormsModule, RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './consultation-add.component.html',
  styleUrl: './consultation-add.component.css',
})
export class ConsultationAddComponent implements OnInit {
  private data   = inject(DataService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  patients = this.data.patients;

  patientId                = signal('');
  date                     = signal(new Date().toISOString().split('T')[0]);
  type                     = signal<TypeConsultation>('Consultation générale');
  tension                  = signal('');
  pouls                    = signal<number>(0);
  temperature              = signal<number>(37.0);
  poids                    = signal<number>(0);
  motif                    = signal('');
  observations             = signal('');
  ordonnance               = signal('');
  statutLorsDeConsultation = signal<StatutPatient>('Régulier');
  photosAnalyses           = signal<string[]>([]);

  montant = computed(() =>
    this.data.tarifPour(this.statutLorsDeConsultation(), this.type())
  );

  tarifRegulier    = this.data.tarifRegulier;
  tarifNonRegulier = this.data.tarifNonRegulier;

  patientNom = computed(() => {
    const p = this.patients().find(p => p.id === this.patientId());
    return p ? `${p.prenom} ${p.nom}` : '';
  });

  isControle = computed(() => this.type() === 'Consultation de contrôle');

  erreurs = signal<string[]>([]);
  succes  = signal(false);

  ngOnInit(): void {
    const patientParam = this.route.snapshot.queryParamMap.get('patient');
    if (!patientParam) return;

    const appliquer = () => {
      const liste = this.patients();
      if (liste.length > 0) {
        this.onPatientChange(patientParam);
      } else {
        // API pas encore revenue — on réessaie après 200ms
        setTimeout(appliquer, 200);
      }
    };

    // setTimeout(0) pour attendre qu'Angular ait rendu le <select>
    setTimeout(appliquer, 0);
  }

  onPatientChange(id: string): void {
    this.patientId.set(id);
    const p = this.patients().find(p => p.id === id);
    if (p) this.statutLorsDeConsultation.set(p.statutPatient);
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
    if (!this.patientId())    errs.push('Sélectionnez un patient.');
    if (!this.date())         errs.push('La date est obligatoire.');
    if (!this.motif().trim()) errs.push('Le motif est obligatoire.');
    this.erreurs.set(errs);
    return errs.length === 0;
  }

  enregistrer(): void {
    if (!this.valider()) return;

    const consultation: Consultation = {
      id:           this.data.generateId('C'),
      patientId:    this.patientId(),
      patientNom:   this.patientNom(),
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
      montant:      this.isControle() ? 0 : Math.round(this.montant()),
      photosAnalyses: this.photosAnalyses(),
    };

    this.data.addConsultation(consultation).then(() => {
      this.succes.set(true);
      setTimeout(() => this.router.navigate(['/consultations']), 1500);
    });
  }
}