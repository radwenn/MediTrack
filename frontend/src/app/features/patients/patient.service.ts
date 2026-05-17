import { Injectable, signal, computed } from '@angular/core';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private _patients = signal<Patient[]>([
    {
      id: '1',
      nom: 'Ben Ali',
      prenom: 'Ahmed',
      age: 54,
      sexe: 'M',
      telephone: '20111222',
      isChronique: true,
      maladieChronique: 'Diabète',
      statutPatient: 'Régulier',
      historiqueConsultations: []
    },
    {
      id: '2',
      nom: 'Trabelsi',
      prenom: 'Sonia',
      age: 37,
      sexe: 'F',
      telephone: '22111444',
      isChronique: false,
      statutPatient: 'Non Régulier',
      historiqueConsultations: []
    }
  ]);

  allPatients = computed(() => this._patients());

  totalPatients = computed(() =>
    this._patients().length
  );

  patientsChroniques = computed(() =>
    this._patients().filter(p => p.isChronique).length
  );

  patientsNonChroniques = computed(() =>
    this._patients().filter(p => !p.isChronique).length
  );

  /* ================= CRUD ================= */

  addPatient(patient: Patient) {
    this._patients.update(list => [patient, ...list]);
  }

  updatePatient(updated: Patient) {
    this._patients.update(list =>
      list.map(p =>
        p.id === updated.id ? updated : p
      )
    );
  }

  deletePatient(id: string) {
    this._patients.update(list =>
      list.filter(p => p.id !== id)
    );
  }

  getPatientById(id: string) {
    return computed(() =>
      this._patients().find(p => p.id === id)
    );
  }

  findPatientsByNom(nom: string) {
    return computed(() =>
      this._patients().filter(p => p.nom.toLowerCase().includes(nom.toLowerCase()))
    );
  }

  nomRecherche: string = '';

  get patients() {
    return this.findPatientsByNom(this.nomRecherche)();
  }

}