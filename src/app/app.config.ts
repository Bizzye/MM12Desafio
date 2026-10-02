import { ApplicationConfig, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, RouteReuseStrategy, TitleStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';

import { routes } from './app.routes';
import { provideDataAccess } from './core/infra/data-access.providers';
import { AppTitleStrategy } from './core/services/app-title.strategy';
import { APP_ICONS } from './shared/app-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular({ mode: 'md' }),
    provideDataAccess(),
    provideAppInitializer(() => addIcons(APP_ICONS)),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
