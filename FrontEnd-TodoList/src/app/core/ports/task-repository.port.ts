import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

export interface TaskRepositoryPort {
  getTasks(): Observable<Task[]>;
  addTask(task: Omit<Task, 'id'>): Observable<Task>;
  updateTask(task: Task): Observable<Task>;
  deleteTask(taskId: string): Observable<void>;
  updateTaskStatus(taskId: string, status: Task['status']): Observable<Task>;
  reorderTasks(tasks: Task[]): Observable<Task[]>;
}