import { Injectable, signal, computed } from '@angular/core';
import { Consultation } from '../../shared/models/consultation.model';

@Injectable({ providedIn: 'root' })
export class ConsultationService {

  private _consultations = signal<Consultation[]>([]);

  consultations = computed(() => this._consultations());

  /* ================= CRUD ================= */

  addConsultation(c: Consultation) {
    this._consultations.update(list => [c, ...list]);
  }

  updateConsultation(updated: Consultation) {
    this._consultations.update(list =>
      list.map(c => c.id === updated.id ? updated : c)
    );
  }

  deleteConsultation(id: string) {
    this._consultations.update(list =>
      list.filter(c => c.id !== id)
    );
  }

  getByPatient(patientId: string) {
    return computed(() =>
      this._consultations().filter(c => c.patientId === patientId)
    );
  }

  /* ================= REVENUS ================= */

  totalRevenus = computed(() =>
    this._consultations().reduce((total, c) => {
      return total + (c.statutLorsDeConsultation === 'Régulier' ? 20 : 40);
    }, 0)
  );
}