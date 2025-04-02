import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskListComponent } from '../../organisms/task-list/task-list.component';
import { TaskFormComponent } from '../../molecules/task-form/task-form.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';
import { Task } from '../../../core/models/task.model';

/**
 * TasksComponent serves as the main task management dashboard.
 * 
 * Features:
 * - Displays the complete task list (via TaskListComponent)
 * - Provides task creation functionality (via TaskFormComponent)
 * - Handles user logout
 * - Acts as a container for task-related components
 * 
 * Composition:
 * - Uses atomic design pattern components (atoms, molecules, organisms)
 * - Integrates with task and auth adapters for data operations
 */
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    TaskListComponent,
    TaskFormComponent,
    ButtonComponent
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  /**
   * Creates an instance of TasksComponent
   * @param taskAdapter Service for task-related operations
   * @param authAdapter Service for authentication operations
   * @param router Angular Router for navigation
   */
  constructor(
    private taskAdapter: LocalStorageTaskAdapter,
    private authAdapter: LocalStorageAuthAdapter,
    private router: Router
  ) {}

  /**
   * Handles new task creation
   * @param task Partial task object (without id) to be added
   * The task will be completed with generated id and timestamps
   */
  addTask(task: Omit<Task, 'id'>): void {
    this.taskAdapter.addTask(task).subscribe({
      error: (error) => console.error('Error adding task:', error)
    });
  }

  /**
   * Handles user logout
   * - Clears authentication state
   * - Redirects to login page
   */
  logout(): void {
    this.authAdapter.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // In a production app, consider showing error feedback to user
      }
    });
  }
}