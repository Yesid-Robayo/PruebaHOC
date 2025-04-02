import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { TaskRepositoryPort } from '../../core/ports/task-repository.port';
import { Task } from '../../core/models/task.model';

/**
 * LocalStorageTaskAdapter is an implementation of TaskRepositoryPort that uses
 * the browser's localStorage as the persistence mechanism for tasks.
 * 
 * This service:
 * - Manages task data in localStorage under the 'tasks' key
 * - Provides reactive updates through a BehaviorSubject
 * - Implements all CRUD operations for tasks
 * - Automatically handles timestamps (createdAt, updatedAt) and IDs
 * - Maintains data consistency across all operations
 */
@Injectable({
  providedIn: 'root' // Makes this service available application-wide
})
export class LocalStorageTaskAdapter implements TaskRepositoryPort {
  // Key used for storing tasks in localStorage
  private readonly STORAGE_KEY = 'tasks';
  
  // BehaviorSubject to provide reactive updates to task data
  private tasksSubject = new BehaviorSubject<Task[]>(this.getTasksFromStorage());

  /**
   * Retrieves tasks from localStorage
   * @returns Array of tasks or empty array if no tasks exist
   */
  private getTasksFromStorage(): Task[] {
    const tasks = localStorage.getItem(this.STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
  }

  /**
   * Saves tasks to localStorage and notifies subscribers
   * @param tasks Array of tasks to be saved
   */
  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.tasksSubject.next(tasks); // Emit updated tasks to subscribers
  }

  /**
   * Gets all tasks as an Observable stream
   * @returns Observable emitting an array of tasks
   */
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  /**
   * Adds a new task
   * @param task Task data without ID and timestamps (these are auto-generated)
   * @returns Observable emitting the newly created task
   */
  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(), // Generate unique ID using timestamp
      createdAt: new Date(),     // Set creation timestamp
      updatedAt: new Date()     // Set initial update timestamp
    };
    const updatedTasks = [...tasks, newTask];
    this.saveTasks(updatedTasks);
    return of(newTask);
  }

  /**
   * Updates an existing task
   * @param task Complete task object with updates
   * @returns Observable emitting the updated task
   * @throws Error if task is not found
   */
  updateTask(task: Task): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      const updatedTask = { 
        ...task, 
        updatedAt: new Date() // Update modification timestamp
      };
      const updatedTasks = [...tasks];
      updatedTasks[index] = updatedTask;
      this.saveTasks(updatedTasks);
      return of(updatedTask);
    }
    throw new Error('Task not found');
  }

  /**
   * Deletes a task by ID
   * @param taskId ID of the task to delete
   * @returns Observable emitting void when complete
   */
  deleteTask(taskId: string): Observable<void> {
    const tasks = this.getTasksFromStorage();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    this.saveTasks(updatedTasks);
    return of(void 0);
  }

  /**
   * Updates the status of a specific task
   * @param taskId ID of the task to update
   * @param status New status value
   * @returns Observable emitting the updated task
   * @throws Error if task is not found
   */
  updateTaskStatus(taskId: string, status: Task['status']): Observable<Task> {
    const tasks = this.getTasksFromStorage();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { 
        ...task, 
        status, 
        updatedAt: new Date() // Update modification timestamp
      };
      return this.updateTask(updatedTask);
    }
    throw new Error('Task not found');
  }

  /**
   * Reorders and saves the complete task list
   * @param tasks Array of tasks in new order
   * @returns Observable emitting the reordered tasks
   */
  reorderTasks(tasks: Task[]): Observable<Task[]> {
    this.saveTasks(tasks);
    return of(tasks);
  }
}