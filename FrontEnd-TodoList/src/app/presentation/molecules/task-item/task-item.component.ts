import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/models/task.model';

/**
 * TaskItemComponent is a standalone Angular component that represents a single task item.
 * It allows users to toggle the task's completion status, delete the task, and supports drag-and-drop functionality.
 * 
 * @selector app-task-item
 * @standalone true
 * @imports CommonModule
 *
 * @property {Task} task - The task object representing the task item.
 * @output
 * - `onToggle`: An `EventEmitter` that emits the task object when the task is toggled.
 * - `onDelete`: An `EventEmitter` that emits the task object when the task is deleted.
 *  - `dragStart`: An `EventEmitter` that emits the drag event when the task is dragged.
 *  
 */
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() onToggle = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<Task>();
  @Output() dragStart = new EventEmitter<DragEvent>();

  handleDragStart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(this.task));
      this.dragStart.emit(event);
    }
  }
}
