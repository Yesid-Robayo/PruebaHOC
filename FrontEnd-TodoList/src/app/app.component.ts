import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * The root component of the application.
 * 
 * This component serves as the entry point for the Angular application.
 * It uses the `RouterOutlet` directive to render routed components dynamically
 * based on the application's routing configuration.
 * 
 * @selector app-root - The selector used to identify this component in HTML.
 * @standalone true - Indicates that this is a standalone component.
 * @imports [RouterOutlet] - Specifies the Angular features or modules imported by this component.
 * @template `<router-outlet></router-outlet>` - The HTML template for this component, which contains
 * a `<router-outlet>` element to display routed views.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}