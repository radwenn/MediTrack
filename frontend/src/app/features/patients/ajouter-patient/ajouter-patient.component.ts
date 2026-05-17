// features/patients/ajouter-patient/ajouter-patient.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink }  from '@angular/router';
import { FormsModule }         from '@angular/forms';
import { DataService }         from '../../../core/services/data.service';
import { Patient, MALADIES_CHRONIQUES, StatutPatient } from '../../../shared/models/patient.model';
import { SidebarComponent }    from '../../../shared/components/sidebar/sidebar.component';
import { TopbarComponent }     from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-ajouter-patient',
  standalone: true,
  imports: [FormsModule, RouterLink, SidebarComponent, TopbarComponent],
  templateUrl: './ajouter-patient.component.html',
  styleUrl: './ajouter-patient.component.css',
})
export class AjouterPatientComponent {
  private data   = inject(DataService);
  private router = inject(Router);

  // Liste des maladies chroniques pour le <select>
  readonly maladiesChroniques = MALADIES_CHRONIQUES;

  // ── Champs du formulaire ──
  prenom      = signal('');
  nom         = signal('');
  age         = signal<number | null>(null);
  sexe        = signal<'M' | 'F'>('M');
  telephone   = signal('');
  email       = signal('');
  adresse     = signal('');
  sanguin     = signal('A+');
  allergies   = signal('');        // saisie libre, séparée par virgules
  poids       = signal<number | null>(null);
  taille      = signal<number | null>(null);

  // ── Champs spécifiques ──
  statutPatient  = signal<StatutPatient>('Régulier');
  isChronique    = signal(false);
  maladieChronique = signal('');   // valeur du select
  autresMaladie  = signal('');     // si "Autre" est sélectionné

  // computed : "Autre" est-il sélectionné ?
  isAutre = computed(() => this.maladieChronique() === 'Autre');

  // ── Validation & soumission ──
  erreurs = signal<string[]>([]);
  succes  = signal(false);

  private valider(): boolean {
    const errs: string[] = [];
    if (!this.prenom().trim())    errs.push('Le prénom est obligatoire.');
    if (!this.nom().trim())       errs.push('Le nom est obligatoire.');
    if (!this.age() || this.age()! < 0) errs.push('L\'âge doit être un nombre positif.');
    if (!this.telephone().trim()) errs.push('Le téléphone est obligatoire.');
    if (this.isChronique() && !this.maladieChronique()) errs.push('Veuillez sélectionner la maladie chronique.');
    if (this.isChronique() && this.isAutre() && !this.autresMaladie().trim())
      errs.push('Veuillez préciser la maladie chronique.');
    this.erreurs.set(errs);
    return errs.length === 0;
  }

  enregistrer(): void {
    if (!this.valider()) return;

    const maladie = this.isChronique()
      ? (this.isAutre() ? this.autresMaladie().trim() : this.maladieChronique())
      : undefined;

    const nouveau: Patient = {
      id:        this.data.generateId('P'),
      prenom:    this.prenom().trim(),
      nom:       this.nom().trim(),
      age:       this.age()!,
      sexe:      this.sexe(),
      telephone: this.telephone().trim(),
      email:     this.email().trim(),
      adresse:   this.adresse().trim(),
      sanguin:   this.sanguin(),
      allergies: this.allergies().split(',').map(a => a.trim()).filter(Boolean),
      poids:     this.poids() ?? undefined,
      taille:    this.taille() ?? undefined,
      statutPatient:     this.statutPatient(),
      isChronique:       this.isChronique(),
      maladieChronique:  maladie,
      historiqueConsultations: [],
      initiales:         (this.prenom()[0] + this.nom()[0]).toUpperCase(),
      couleur:           'linear-gradient(135deg, var(--teal), var(--blue))',
      dateInscription:   new Date().toISOString().split('T')[0],
    };

    this.data.addPatient(nouveau);
    this.succes.set(true);
    setTimeout(() => this.router.navigate(['/patients']), 1500);
  }
}