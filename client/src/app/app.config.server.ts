import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
// Removed provideServerRouting import
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // If routing setup is needed, use provideRouter or similar from @angular/router
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
