import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskListComponent } from '../../organisms/task-list/task-list.component';
import { TaskFormComponent } from '../../molecules/task-form/task-form.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, TaskListComponent, TaskFormComponent, ButtonComponent],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  constructor(
    private taskAdapter: LocalStorageTaskAdapter,
    private authAdapter: LocalStorageAuthAdapter,
    private router: Router
  ) {}

  addTask(task: Omit<Task, 'id'>): void {
    this.taskAdapter.addTask(task).subscribe();
  }

  logout(): void {
    this.authAdapter.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
