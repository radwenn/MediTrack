// shared/components/notifications/notifications.component.ts
import {
  Component, signal, inject,
  HostListener, ElementRef
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {

  private elRef  = inject(ElementRef);
  private data   = inject(DataService);
  private router = inject(Router);

  ouvert = signal(false);
  notifs = this.data.notifications;
  count  = this.data.notifCount;

  toggle(): void { this.ouvert.update(v => !v); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.ouvert.set(false);
    }
  }

  naviguerVersConsultation(patientId: string): void {
    this.ouvert.set(false);
    this.router.navigate(['/consultations/ajouter'], {
      queryParams: { patient: patientId }
    });
  }

  dismiss(patientId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.data.dismissNotification(patientId);
  }

  joursLabel(jours: number): string {
    if (jours >= 999) return 'Jamais consulté';
    if (jours >= 365) {
      const ans = Math.floor(jours / 365);
      return `${ans} an${ans > 1 ? 's' : ''} sans consultation`;
    }
    if (jours >= 30) {
      const mois = Math.floor(jours / 30);
      return `${mois} mois sans consultation`;
    }
    return `${jours} jours sans consultation`;
  }

  urgenceClass(jours: number): string {
    if (jours >= 365 || jours >= 999) return 'notif-critical';
    if (jours >= 180) return 'notif-high';
    return 'notif-medium';
  }
}