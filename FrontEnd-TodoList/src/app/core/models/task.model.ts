/**
 * Represents a task in the to-do list application.
 */
export interface Task {
  /**
   * Unique identifier for the task.
   */
  id: string;

  /**
   * Title or name of the task.
   */
  title: string;

  /**
   * Indicates whether the task is completed.
   */
  completed: boolean;

  /**
   * Current status of the task.
   * - 'Lista': The task is listed but not started.
   * - 'En Progreso': The task is in progress.
   * - 'Terminado': The task is completed.
   */
  status: 'Lista' | 'En Progreso' | 'Terminado';

  /**
   * Order or position of the task in a list.
   */
  order: number;

  /**
   * Timestamp indicating when the task was created.
   */
  createdAt: Date;

  /**
   * Timestamp indicating the last time the task was updated.
   */
  updatedAt: Date;
}