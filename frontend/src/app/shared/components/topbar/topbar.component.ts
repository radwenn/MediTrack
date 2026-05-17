// shared/components/topbar/topbar.component.ts
import { Component, input } from '@angular/core';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NotificationsComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  titre     = input<string>('');
  sousTitre = input<string>('');

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}