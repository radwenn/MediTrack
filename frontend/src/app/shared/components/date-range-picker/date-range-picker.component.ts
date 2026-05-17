// shared/components/date-range-picker/date-range-picker.component.ts
import {
  Component, signal, computed, output, input,
  HostListener, ElementRef, inject
} from '@angular/core';

export interface DateRange {
  debut: string;  // 'YYYY-MM-DD'
  fin:   string;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  templateUrl: './date-range-picker.component.html',
  styleUrl:    './date-range-picker.component.css',
})
export class DateRangePickerComponent {

  private elRef = inject(ElementRef);

  // ── Input : placeholder affiché quand rien n'est sélectionné
  placeholder = input<string>('Période');

  // ── Output : émet quand la plage change
  rangeChange = output<DateRange>();

  // ── État interne ────────────────────────────────────
  ouvert      = signal(false);
  debutSel    = signal('');   // date de début sélectionnée
  finSel      = signal('');   // date de fin sélectionnée
  moisAffiche = signal(new Date());  // mois visible dans le calendrier
  hoveredDate = signal('');          // date survolée (pour preview)

  // ── Libellé affiché sur le bouton ──────────────────
  label = computed(() => {
    const d = this.debutSel();
    const f = this.finSel();
    if (!d && !f) return '';
    if (d && !f)  return this.formaterDate(d) + ' →';
    return this.formaterDate(d) + ' → ' + this.formaterDate(f);
  });

  // ── Jours du mois affiché ──────────────────────────
  jours = computed(() => {
    const mois = this.moisAffiche();
    const annee = mois.getFullYear();
    const m     = mois.getMonth();

    const premierJour = new Date(annee, m, 1).getDay(); // 0=dim
    const nbJours     = new Date(annee, m + 1, 0).getDate();

    // Décalage : commence lundi (0=lun)
    const decalage = (premierJour + 6) % 7;

    const jours: { date: string; jouDuMois: number; vide: boolean }[] = [];

    // Cases vides avant le 1er
    for (let i = 0; i < decalage; i++) {
      jours.push({ date: '', jouDuMois: 0, vide: true });
    }

    // Vrais jours
    for (let j = 1; j <= nbJours; j++) {
      const d = new Date(annee, m, j);
      jours.push({
        date:      this.versString(d),
        jouDuMois: j,
        vide:      false,
      });
    }

    return jours;
  });

  nomMois = computed(() => {
    const m = this.moisAffiche();
    return m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  // ── Ouvrir/fermer ───────────────────────────────────
  toggle(): void { this.ouvert.update(v => !v); }

  // Fermer si clic en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.ouvert.set(false);
    }
  }

  // ── Navigation entre mois ──────────────────────────
  moisPrecedent(): void {
    const m = new Date(this.moisAffiche());
    m.setMonth(m.getMonth() - 1);
    this.moisAffiche.set(m);
  }

  moisSuivant(): void {
    const m = new Date(this.moisAffiche());
    m.setMonth(m.getMonth() + 1);
    this.moisAffiche.set(m);
  }

  // ── Sélection d'un jour ────────────────────────────
  selectionnerJour(date: string): void {
    if (!date) return;

    const d = this.debutSel();
    const f = this.finSel();

    if (!d || (d && f)) {
      // Nouveau départ : on sélectionne début
      this.debutSel.set(date);
      this.finSel.set('');
    } else {
      // On a un début, on choisit la fin
      if (date < d) {
        // Si fin < début, on inverse
        this.finSel.set(d);
        this.debutSel.set(date);
      } else {
        this.finSel.set(date);
      }
      // Émettre et fermer
      this.rangeChange.emit({ debut: this.debutSel(), fin: this.finSel() });
      this.ouvert.set(false);
    }
  }

  // ── Survol pour preview ────────────────────────────
  survoler(date: string): void { this.hoveredDate.set(date); }
  quitterSurvol(): void        { this.hoveredDate.set(''); }

  // ── Classes CSS d'un jour ──────────────────────────
  classesJour(date: string): string {
    if (!date) return '';
    const d    = this.debutSel();
    const f    = this.finSel();
    const hov  = this.hoveredDate();
    const finPrev = f || hov;  // fin réelle ou hovérée

    const classes: string[] = ['jour'];

    if (date === d)           classes.push('debut');
    if (date === f)           classes.push('fin');
    if (date === d && !f)     classes.push('seul');
    if (d && finPrev && date > d && date < finPrev) classes.push('dans-range');

    return classes.join(' ');
  }

  // ── Réinitialiser ──────────────────────────────────
  reset(e: Event): void {
    e.stopPropagation();
    this.debutSel.set('');
    this.finSel.set('');
    this.rangeChange.emit({ debut: '', fin: '' });
  }

  // ── Helpers ────────────────────────────────────────
  private versString(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private formaterDate(s: string): string {
    if (!s) return '';
    const [y, m, j] = s.split('-');
    return `${j}/${m}/${y}`;
  }
}