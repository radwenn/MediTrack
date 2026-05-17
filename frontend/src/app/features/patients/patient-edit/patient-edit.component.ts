// features/patients/patient-edit/patient-edit.component.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { DataService }   from '../../../core/services/data.service';
import { Patient, MALADIES_CHRONIQUES, StatutPatient } from '../../../shared/models/patient.model';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }  from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './patient-edit.component.html',
  styleUrl: './patient-edit.component.css',
})
export class PatientEditComponent implements OnInit {
  private data   = inject(DataService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  readonly maladiesChroniques = MALADIES_CHRONIQUES;
  id = this.route.snapshot.paramMap.get('id')!;

  // Signals pour chaque champ
  prenom           = signal('');
  nom              = signal('');
  age              = signal<number>(0);
  sexe             = signal<'M'|'F'>('M');
  telephone        = signal('');
  email            = signal('');
  adresse          = signal('');
  sanguin          = signal('A+');
  allergies        = signal('');
  poids            = signal<number>(0);
  taille           = signal<number>(0);
  statutPatient    = signal<StatutPatient>('Régulier');
  isChronique      = signal(false);
  maladieChronique = signal('');
  autresMaladie    = signal('');

  isAutre  = computed(() => this.maladieChronique() === 'Autre');
  erreurs  = signal<string[]>([]);
  succes   = signal(false);
  introuvable = signal(false);

  ngOnInit(): void {
    const p = this.data.getPatientById(this.id);
    if (!p) { this.introuvable.set(true); return; }

    // Pré-remplissage depuis le patient existant
    this.prenom.set(p.prenom);
    this.nom.set(p.nom);
    this.age.set(p.age);
    this.sexe.set(p.sexe);
    this.telephone.set(p.telephone);
    this.email.set(p.email);
    this.adresse.set(p.adresse ?? '');
    this.sanguin.set(p.sanguin);
    this.allergies.set(p.allergies.join(', '));
    this.poids.set(p.poids ?? 0);
    this.taille.set(p.taille ?? 0);
    this.statutPatient.set(p.statutPatient);
    this.isChronique.set(p.isChronique);

    if (p.maladieChronique) {
      const connue = (MALADIES_CHRONIQUES as readonly string[]).includes(p.maladieChronique);
      if (connue) {
        this.maladieChronique.set(p.maladieChronique);
      } else {
        this.maladieChronique.set('Autre');
        this.autresMaladie.set(p.maladieChronique);
      }
    }
  }

  private valider(): boolean {
    const errs: string[] = [];
    if (!this.prenom().trim())    errs.push('Le prénom est obligatoire.');
    if (!this.nom().trim())       errs.push('Le nom est obligatoire.');
    if (!this.age() || this.age() < 0) errs.push('L\'âge est invalide.');
    if (!this.telephone().trim()) errs.push('Le téléphone est obligatoire.');
    if (this.isChronique() && !this.maladieChronique()) errs.push('Précisez la maladie chronique.');
    if (this.isChronique() && this.isAutre() && !this.autresMaladie().trim())
      errs.push('Veuillez préciser la maladie dans le champ texte.');
    this.erreurs.set(errs);
    return errs.length === 0;
  }

  enregistrer(): void {
    if (!this.valider()) return;
    const ancien = this.data.getPatientById(this.id)!;

    const maladie = this.isChronique()
      ? (this.isAutre() ? this.autresMaladie().trim() : this.maladieChronique())
      : undefined;

    const mis_a_jour: Patient = {
      ...ancien,
      prenom:    this.prenom().trim(),
      nom:       this.nom().trim(),
      age:       this.age(),
      sexe:      this.sexe(),
      telephone: this.telephone().trim(),
      email:     this.email().trim(),
      adresse:   this.adresse().trim(),
      sanguin:   this.sanguin(),
      allergies: this.allergies().split(',').map(a => a.trim()).filter(Boolean),
      poids:     this.poids() || undefined,
      taille:    this.taille() || undefined,
      statutPatient:    this.statutPatient(),
      isChronique:      this.isChronique(),
      maladieChronique: maladie,
      initiales:        (this.prenom()[0] + this.nom()[0]).toUpperCase(),
    };

    this.data.updatePatient(mis_a_jour);
    this.succes.set(true);
    setTimeout(() => this.router.navigate(['/patients', this.id]), 1500);
  }
}