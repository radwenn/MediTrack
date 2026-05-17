// shared/models/consultation.model.ts

import { StatutPatient } from './patient.model';

export type TypeConsultation =
  | 'Consultation générale'
  | 'Suivi traitement'
  | 'Urgence'
  | 'Bilan annuel'
  | 'Consultation de contrôle';

// Règle de facturation cabinet :
// Régulier    → 20 DT  (reste pris en charge par la CNAM)
// Non Régulier → 40 DT (payé directement par le patient)
export const TARIF: Record<StatutPatient, number> = {
  'Régulier':     20,
  'Non Régulier': 40,
};

export interface Consultation {
  id:         string;
  patientId:  string;
  patientNom: string; // dénormalisé pour l'affichage

  date:        string;           // ISO 'YYYY-MM-DD'
  type:        TypeConsultation;

  // Constantes vitales
  tension:     string;           // ex: '165/105'
  pouls:       number;           // bpm
  temperature: number;           // °C
  poids:       number;           // kg

  // Clinique
  motif:        string;
  observations: string;
  ordonnance:   string;

  // Facturation — CRUCIAL : snapshot du statut au moment de la consultation
  statutLorsDeConsultation: StatutPatient;
  montant:                  number;  // calculé automatiquement : 20 ou 40 DT

  // Photos analyses (stockées en base64, ou URLs si serveur)
  photosAnalyses?: string[];
}