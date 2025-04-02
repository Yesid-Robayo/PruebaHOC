import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * InputComponent is a reusable and standalone Angular component that represents an input field.
 * It supports different input types, sizes, and emits value changes to the parent component.
 *
 * @selector app-input
 * @standalone true
 * @imports [CommonModule, FormsModule]
 *
 * @property {('text' | 'password' | 'email')} type - The type of the input field. Defaults to 'text'.
 * @property {string} placeholder - The placeholder text for the input field. Defaults to an empty string.
 * @property {string} value - The current value of the input field. Defaults to an empty string.
 * @property {('small' | 'medium' | 'large')} size - The size of the input field. Defaults to 'medium'.
 * @event valueChange - Emits the updated value of the input field whenever it changes.
 *
 * @method onInput - Handles the input event and emits the updated value through the `valueChange` EventEmitter.
 * @param {Event} event - The input event triggered by the user.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}