// app.config.ts
import { ApplicationConfig }                  from '@angular/core';
import { provideRouter }                       from '@angular/router';
import { provideHttpClient, withFetch }        from '@angular/common/http';
import { DecimalPipe }                         from '@angular/common';
import { routes }                              from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // withFetch() = utilise l'API Fetch moderne du navigateur
    // Nécessaire pour que withCredentials (cookies de session) fonctionne bien
    provideHttpClient(withFetch()),

    DecimalPipe, provideAnimationsAsync(),
  ],
};