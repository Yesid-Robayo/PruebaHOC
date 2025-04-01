import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../atoms/input/input.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Task } from '../../../core/models/task.model';

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