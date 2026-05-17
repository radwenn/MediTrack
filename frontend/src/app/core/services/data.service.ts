// core/services/data.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Patient }       from '../../shared/models/patient.model';
import { Consultation }  from '../../shared/models/consultation.model';
import { StatutPatient } from '../../shared/models/patient.model';

const API     = 'http://localhost/backend/api';
const OPTIONS = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class DataService {

  private http = inject(HttpClient);

  tarifRegulier    = signal<number>(20);
  tarifNonRegulier = signal<number>(40);

  // Notifications dismissées (stockées en localStorage)
  private _dismissedNotifs = signal<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('mt_dismissed_notifs') ?? '[]'))
  );

  // Notifications : patients chroniques sans consultation depuis > 3 mois
  readonly notifications = computed(() => {
    const today = new Date();
    const seuilJours = 90; // 3 mois

    return this._patients()
      .filter(p => p.isChronique)
      .map(p => {
        const consultations = this._consultations()
          .filter(c => c.patientId === p.id)
          .sort((a, b) => b.date.localeCompare(a.date));

        const derniere = consultations[0];
        let joursDepuis: number;
        let derniereDate: string;

        if (derniere) {
          const d = new Date(derniere.date);
          joursDepuis = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          derniereDate = derniere.date;
        } else {
          // Jamais consulté
          joursDepuis = 999;
          derniereDate = '';
        }

        return { patient: p, joursDepuis, derniereDate };
      })
      .filter(n => n.joursDepuis >= seuilJours && !this._dismissedNotifs().has(n.patient.id))
      .sort((a, b) => b.joursDepuis - a.joursDepuis);
  });

  readonly notifCount = computed(() => this.notifications().length);

  dismissNotification(patientId: string): void {
    this._dismissedNotifs.update(set => {
      const newSet = new Set(set);
      newSet.add(patientId);
      localStorage.setItem('mt_dismissed_notifs', JSON.stringify([...newSet]));
      return newSet;
    });
  }

  private _patients      = signal<Patient[]>([]);
  private _consultations = signal<Consultation[]>([]);

  readonly patients      = this._patients.asReadonly();
  readonly consultations = this._consultations.asReadonly();

  chargement = signal(true);

  readonly stats = computed(() => {
    const patients      = this._patients();
    const consultations = this._consultations();
    const now           = new Date();
    const moisCourant   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // ─── Revenus réels depuis les consultations ─────────
    const revenuRegulier = consultations
      .filter(c => c.statutLorsDeConsultation === 'Régulier')
      .reduce((s, c) => s + c.montant, 0);

    const revenuNonRegulier = consultations
      .filter(c => c.statutLorsDeConsultation === 'Non Régulier')
      .reduce((s, c) => s + c.montant, 0);

    // Total = somme des deux → cohérent avec les lignes
    const revenuTotal = revenuRegulier + revenuNonRegulier;

    const revenuMois = consultations
      .filter(c => c.date.startsWith(moisCourant))
      .reduce((s, c) => s + c.montant, 0);

    const revenuEstime =
      patients.filter(p => p.statutPatient === 'Régulier').length    * this.tarifRegulier() +
      patients.filter(p => p.statutPatient === 'Non Régulier').length * this.tarifNonRegulier();

    return {
      totalPatients:      patients.length,
      chroniques:         patients.filter(p => p.isChronique).length,
      nonChroniques:      patients.filter(p => !p.isChronique).length,
      reguliers:          patients.filter(p => p.statutPatient === 'Régulier').length,
      nonReguliers:       patients.filter(p => p.statutPatient === 'Non Régulier').length,
      totalConsultations: consultations.length,
      revenuTotal,
      revenuRegulier,
      revenuNonRegulier,
      revenuMois,
      revenuEstime,
      pctChroniques: patients.length
        ? Math.round(patients.filter(p => p.isChronique).length / patients.length * 100)
        : 0,
    };
  });

  readonly consultationsRecentes = computed(() =>
    [...this._consultations()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  );

  constructor() { this.chargerTout(); }

  private async chargerTout(): Promise<void> {
    this.chargement.set(true);
    try {
      const [patientsRaw, consultationsRaw, tarifs] = await Promise.all([
        firstValueFrom(this.http.get<any[]>(`${API}/patients/index.php`, OPTIONS)),
        firstValueFrom(this.http.get<any[]>(`${API}/consultations/index.php`, OPTIONS)),
        firstValueFrom(this.http.get<any>(`${API}/settings/tarifs.php`, OPTIONS)),
      ]);

      const consultations: Consultation[] = consultationsRaw.map(c => this.phpVersConsultation(c));
      this._consultations.set(consultations);

      const patients: Patient[] = patientsRaw.map(p => {
        const patient = this.phpVersPatient(p);
        const ids = consultations.filter(c => c.patientId === patient.id).map(c => c.id);
        return { ...patient, historiqueConsultations: ids };
      });
      this._patients.set(patients);

      this.tarifRegulier.set(tarifs.tarifRegulier);
      this.tarifNonRegulier.set(tarifs.tarifNonRegulier);

    } catch (e) {
      console.error('Erreur chargement :', e);
    } finally {
      this.chargement.set(false);
    }
  }

  tarifPour(statut: StatutPatient, type?: string): number {
    if (type === 'Consultation de contrôle') return 0;
    return statut === 'Régulier' ? this.tarifRegulier() : this.tarifNonRegulier();
  }

  async mettreAJourTarifs(regulier: number, nonRegulier: number): Promise<void> {
    await firstValueFrom(
      this.http.put(`${API}/settings/tarifs.php`,
        { tarifRegulier: regulier, tarifNonRegulier: nonRegulier }, OPTIONS)
    );
    this.tarifRegulier.set(regulier);
    this.tarifNonRegulier.set(nonRegulier);
  }

  getPatientById(id: string): Patient | undefined {
    return this._patients().find(p => p.id === id);
  }

  async addPatient(patient: Patient): Promise<void> {
    const reponse = await firstValueFrom(
      this.http.post<{ id: string }>(`${API}/patients/index.php`, this.patientVersPhp(patient), OPTIONS)
    );
    this._patients.update(list => [{ ...patient, id: reponse.id, historiqueConsultations: [] }, ...list]);
  }

  async updatePatient(updated: Patient): Promise<void> {
    await firstValueFrom(
      this.http.put(`${API}/patients/single.php?id=${updated.id}`, this.patientVersPhp(updated), OPTIONS)
    );
    this._patients.update(list => list.map(p => p.id === updated.id ? updated : p));
  }

  async deletePatient(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/patients/single.php?id=${id}`, OPTIONS));
    this._patients.update(list => list.filter(p => p.id !== id));
    this._consultations.update(list => list.filter(c => c.patientId !== id));
  }

  getConsultationById(id: string): Consultation | undefined {
    return this._consultations().find(c => c.id === id);
  }

  getConsultationsByPatient(patientId: string): Consultation[] {
    return this._consultations().filter(c => c.patientId === patientId);
  }

  async addConsultation(consultation: Consultation): Promise<void> {
    const reponse = await firstValueFrom(
      this.http.post<{ id: string }>(`${API}/consultations/index.php`, consultation, OPTIONS)
    );
    const avecId = { ...consultation, id: reponse.id };
    this._consultations.update(list => [avecId, ...list]);
    this._patients.update(list =>
      list.map(p => p.id === consultation.patientId
        ? { ...p, historiqueConsultations: [avecId.id, ...p.historiqueConsultations] }
        : p)
    );
  }

  async updateConsultation(updated: Consultation): Promise<void> {
    await firstValueFrom(
      this.http.put(`${API}/consultations/single.php?id=${updated.id}`, updated, OPTIONS)
    );
    this._consultations.update(list => list.map(c => c.id === updated.id ? updated : c));
  }

  async deleteConsultation(id: string): Promise<void> {
    const c = this.getConsultationById(id);
    await firstValueFrom(this.http.delete(`${API}/consultations/single.php?id=${id}`, OPTIONS));
    this._consultations.update(list => list.filter(x => x.id !== id));
    if (c) {
      this._patients.update(list =>
        list.map(p => p.id === c.patientId
          ? { ...p, historiqueConsultations: p.historiqueConsultations.filter(cid => cid !== id) }
          : p)
      );
    }
  }

  generateId(_prefix: string): string { return ''; }

  private phpVersPatient(p: any): Patient {
    return {
      id: p.id, nom: p.nom, prenom: p.prenom, age: p.age, sexe: p.sexe,
      telephone: p.telephone, email: p.email, adresse: p.adresse,
      sanguin: p.sanguin, allergies: p.allergies ?? [],
      poids: p.poids, taille: p.taille,
      isChronique: !!p.is_chronique, maladieChronique: p.maladie_chronique,
      statutPatient: p.statut_patient, initiales: p.initiales,
      couleur: p.couleur, dateInscription: p.date_inscription,
      historiqueConsultations: [],
    };
  }

  private patientVersPhp(p: Patient): any {
    return {
      nom: p.nom, prenom: p.prenom, age: p.age, sexe: p.sexe,
      telephone: p.telephone, email: p.email, adresse: p.adresse,
      sanguin: p.sanguin, allergies: p.allergies,
      poids: p.poids, taille: p.taille,
      isChronique: p.isChronique, maladieChronique: p.maladieChronique,
      statutPatient: p.statutPatient, couleur: p.couleur,
      dateInscription: p.dateInscription,
    };
  }

  private phpVersConsultation(c: any): Consultation {
    return {
      id: c.id, patientId: c.patientId, patientNom: c.patientNom,
      date: c.date, type: c.type, tension: c.tension,
      pouls: c.pouls, temperature: c.temperature, poids: c.poids,
      motif: c.motif, observations: c.observations, ordonnance: c.ordonnance,
      statutLorsDeConsultation: c.statutLorsDeConsultation, montant: c.montant,
      photosAnalyses: c.photosAnalyses ?? [],
    };
  }
}