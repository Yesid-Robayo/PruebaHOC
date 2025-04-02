import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

/**
 * Interface representing the contract for a Task Repository.
 * Provides methods for managing tasks, including CRUD operations
 * and additional functionalities such as reordering and updating task status.
 */
export interface TaskRepositoryPort {
  /**
   * Retrieves the list of tasks.
   * @returns An observable emitting an array of tasks.
   */
  getTasks(): Observable<Task[]>;

  /**
   * Adds a new task to the repository.
   * @param task - The task to be added, excluding the `id` property.
   * @returns An observable emitting the added task with its generated `id`.
   */
  addTask(task: Omit<Task, 'id'>): Observable<Task>;

  /**
   * Updates an existing task in the repository.
   * @param task - The task to be updated, including its `id`.
   * @returns An observable emitting the updated task.
   */
  updateTask(task: Task): Observable<Task>;

  /**
   * Deletes a task from the repository.
   * @param taskId - The unique identifier of the task to be deleted.
   * @returns An observable emitting `void` upon successful deletion.
   */
  deleteTask(taskId: string): Observable<void>;

  /**
   * Updates the status of a specific task.
   * @param taskId - The unique identifier of the task.
   * @param status - The new status to be assigned to the task.
   * @returns An observable emitting the updated task.
   */
  updateTaskStatus(taskId: string, status: Task['status']): Observable<Task>;

  /**
   * Reorders the list of tasks in the repository.
   * @param tasks - The array of tasks in their new order.
   * @returns An observable emitting the reordered array of tasks.
   */
  reorderTasks(tasks: Task[]): Observable<Task[]>;
}