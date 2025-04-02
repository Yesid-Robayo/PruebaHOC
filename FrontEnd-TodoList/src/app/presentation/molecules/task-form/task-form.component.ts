import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../atoms/input/input.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Task } from '../../../core/models/task.model';

/**
 * TaskFormComponent is a standalone Angular component that provides a form
 * for adding new tasks. It emits an event when a task is submitted.
 *
 * @selector app-task-form
 * @standalone true
 * @imports CommonModule, FormsModule, InputComponent, ButtonComponent
 *
 * @output
 * - `addTask`: An `EventEmitter` that emits a task object (excluding the `id` property)
 *   when the form is submitted.
 *
 * @property {string} taskTitle - The title of the task being created. It is bound to the input field.
 *
 * @method onSubmit
 * - Handles the form submission. If the `taskTitle` is not empty or whitespace,
 *   it emits the `addTask` event with the task details and resets the `taskTitle` field.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  @Output() addTask = new EventEmitter<Omit<Task, 'id'>>();
  taskTitle = '';

  onSubmit(): void {
    if (this.taskTitle.trim()) {
      this.addTask.emit({
        title: this.taskTitle,
        completed: false,
        status: 'Lista',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.taskTitle = '';
    }
  }
}