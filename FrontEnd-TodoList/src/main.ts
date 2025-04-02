/**
 * Bootstraps the Angular application by initializing the root component and configuring the router.
 *
 * This code uses the `bootstrapApplication` function from Angular's platform-browser package to
 * start the application with the specified root component (`AppComponent`) and providers.
 *
 * The `provideRouter` function is used to configure the application's routing with the defined
 * routes from `app.routes.ts`.
 *
 * If an error occurs during the bootstrap process, it will be logged to the console.
 *
 * @module Main
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));