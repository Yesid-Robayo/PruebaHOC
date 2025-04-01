export interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'Lista' | 'En Progreso' | 'Terminado';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}