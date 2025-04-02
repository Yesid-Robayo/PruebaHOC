import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../../molecules/task-item/task-item.component';
import { Task } from '../../../core/models/task.model';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';

/**
 * TaskListComponent displays and manages a list of tasks organized by status.
 * 
 * Features:
 * - Displays tasks in three columns (Lista, En Progreso, Terminado)
 * - Supports task status updates via drag-and-drop
 * - Handles task completion toggle and deletion
 * - Reactively updates the task list when changes occur
 * 
 * Uses:
 * - TaskItemComponent for individual task rendering
 * - LocalStorageTaskAdapter for task persistence
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = []; // Array holding all tasks
  statuses: Task['status'][] = ['Lista', 'En Progreso', 'Terminado']; // Available task statuses

  constructor(private taskAdapter: LocalStorageTaskAdapter) {}

  /**
   * Initializes the component by loading tasks
   */
  ngOnInit(): void {
    this.loadTasks();
  }

  /**
   * Loads tasks from the data adapter
   * Updates the local tasks array when new data is received
   */
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

  /**
   * Filters tasks by their status
   * @param status The status to filter by
   * @returns Array of tasks with the specified status
   */
  getTasksByStatus(status: Task['status']): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * Toggles the completion status of a task
   * @param task The task to update
   */
  toggleTask(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskAdapter.updateTask(updatedTask).subscribe({
      next: () => {
        this.loadTasks(); // Refresh task list after update
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  /**
   * Deletes a task from the list
   * @param task The task to delete
   */
  deleteTask(task: Task): void {
    this.taskAdapter.deleteTask(task.id).subscribe({
      next: () => {
        this.loadTasks(); // Refresh task list after deletion
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }

  /**
   * Handles drag start event for task items
   * @param event The drag event
   * @param task The task being dragged
   */
  onDragStart(event: DragEvent, task: Task): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify(task));
    }
  }

  /**
   * Handles drag over event to allow drop
   * @param event The drag event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Necessary to allow drop
  }

  /**
   * Handles drop event to update task status
   * @param event The drop event
   * @param newStatus The new status for the dropped task
   */
  onDrop(event: DragEvent, newStatus: Task['status']): void {
    event.preventDefault();
    if (event.dataTransfer) {
      const task: Task = JSON.parse(event.dataTransfer.getData('text/plain'));
      if (task.status !== newStatus) {
        // Only update if status changed
        this.taskAdapter.updateTaskStatus(task.id, newStatus).subscribe({
          next: () => {
            this.loadTasks(); // Refresh task list after status change
          },
          error: (error) => {
            console.error('Error updating task status:', error);
          }
        });
      }
    }
  }
}