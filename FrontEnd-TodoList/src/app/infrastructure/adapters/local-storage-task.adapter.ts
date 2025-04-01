import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TaskRepositoryPort } from '../../core/ports/task-repository.port';
import { Task } from '../../core/models/task.model';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageTaskAdapter implements TaskRepositoryPort {
  private readonly STORAGE_KEY = 'tasks';
  private tasksSubject = new BehaviorSubject<Task[]>(this.getTasksFromStorage());

  private getTasksFromStorage(): Task[] {
    const tasks = localStorage.getItem(this.STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.tasksSubject.next(tasks); // Emitir las tareas después de guardar
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable(); // Emitir tareas como un Observable
  }

  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedTasks = [...tasks, newTask];
    this.saveTasks(updatedTasks);
    return of(newTask);
  }

  updateTask(task: Task): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      const updatedTask = { ...task, updatedAt: new Date() };
      const updatedTasks = [...tasks];
      updatedTasks[index] = updatedTask;
      this.saveTasks(updatedTasks);
      return of(updatedTask);
    }
    throw new Error('Task not found');
  }

  deleteTask(taskId: string): Observable<void> {
    const tasks = this.getTasksFromStorage();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(updatedTasks);
    return of(void 0);
  }

  updateTaskStatus(taskId: string, status: Task['status']): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status, updatedAt: new Date() };
      return this.updateTask(updatedTask);
    }
    throw new Error('Task not found');
  }

  reorderTasks(tasks: Task[]): Observable<Task[]> {
    this.saveTasks(tasks);
    return of(tasks);
  }
}
