import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../../molecules/task-item/task-item.component';
import { Task } from '../../../core/models/task.model';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  statuses: Task['status'][] = ['Lista' , 'En Progreso' , 'Terminado'];

  constructor(private taskAdapter: LocalStorageTaskAdapter) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskAdapter.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  getTasksByStatus(status: Task['status']): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  toggleTask(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskAdapter.updateTask(updatedTask).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  deleteTask(task: Task): void {
    this.taskAdapter.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }

  onDragStart(event: DragEvent, task: Task): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(task));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: Task['status']): void {
    event.preventDefault();
    if (event.dataTransfer) {
      const task: Task = JSON.parse(event.dataTransfer.getData('text/plain'));
      if (task.status !== newStatus) {
        this.taskAdapter.updateTaskStatus(task.id, newStatus).subscribe({
          next: () => {
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error updating task status:', error);
          }
        });
      }
    }
  }
  
}