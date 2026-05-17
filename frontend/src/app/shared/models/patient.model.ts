// shared/models/patient.model.ts

export type StatutPatient = 'Régulier' | 'Non Régulier';

export const MALADIES_CHRONIQUES = [
  'Diabète type 1',
  'Diabète type 2',
  'Hypertension artérielle (HTA)',
  'Asthme',
  'Insuffisance cardiaque',
  'Insuffisance rénale chronique',
  'Maladie pulmonaire obstructive chronique (BPCO)',
  'Arthrite rhumatoïde',
  'Epilepsie',
  'Autre',
] as const;

export interface Patient {
  id:        string;
  nom:       string;
  prenom:    string;
  age:       number;
  sexe:      'M' | 'F';
  telephone: string;
  email:     string;
  adresse?:  string;
  sanguin:   string;
  allergies: string[];         // ex: ['pénicilline', 'aspirine']

  // Mesures (optionnelles)
  poids?:    number;           // kg
  taille?:   number;           // cm

  // Statut & pathologie
  isChronique:       boolean;
  maladieChronique?: string;   // renseignée seulement si isChronique = true
  statutPatient:     StatutPatient;

  // Historique
  historiqueConsultations: string[]; // IDs des consultations liées

  // Helpers affichage
  initiales:       string;
  couleur:         string;    // gradient CSS pour l'avatar
  dateInscription: string;
}