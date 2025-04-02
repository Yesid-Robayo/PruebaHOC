import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ButtonComponent is a reusable button component that supports different variants and states.
 * It emits a click event when the button is clicked.
 *
 * @selector app-button
 * @standalone true
 * @imports CommonModule
 *
 * @property {('primary' | 'secondary')} variant - The visual style of the button. Defaults to 'primary'.
 * @property {boolean} disabled - Whether the button is disabled. Defaults to `false`.
 * @event onClick - Emits a `MouseEvent` when the button is clicked.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'] 
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
