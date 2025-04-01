import { TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';
import { of, throwError } from 'rxjs';
import { Task } from '../../../core/models/task.model';

describe('TaskListComponent', () => {
    let component: TaskListComponent;
    let taskAdapterMock: jasmine.SpyObj<LocalStorageTaskAdapter>;

    beforeEach(() => {
        taskAdapterMock = jasmine.createSpyObj('LocalStorageTaskAdapter', ['getTasks', 'updateTask', 'deleteTask', 'updateTaskStatus']);

        TestBed.configureTestingModule({
            imports: [TaskListComponent],
            providers: [{ provide: LocalStorageTaskAdapter, useValue: taskAdapterMock }]
        });

        const fixture = TestBed.createComponent(TaskListComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should load tasks on initialization', () => {
        const mockTasks: Task[] = [{ id: '1', title: 'Test Task', status: 'Lista', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() }];
        taskAdapterMock.getTasks.and.returnValue(of(mockTasks));

        component.ngOnInit();

        expect(taskAdapterMock.getTasks).toHaveBeenCalled();
        expect(component.tasks).toEqual(mockTasks);
    });

    it('should handle error when loading tasks', () => {
        spyOn(console, 'error');
        taskAdapterMock.getTasks.and.returnValue(throwError(() => new Error('Error loading tasks')));

        component.ngOnInit();

        expect(taskAdapterMock.getTasks).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error loading tasks:', jasmine.any(Error));
    });

    it('should filter tasks by status', () => {
        component.tasks = [
            { id: '1', title: 'Task 1', status: 'Lista', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() },
            { id: '2', title: 'Task 2', status: 'En Progreso', completed: false, order: 2, createdAt: new Date(), updatedAt: new Date() },
            { id: '3', title: 'Task 3', status: 'Terminado', completed: true, order: 3, createdAt: new Date(), updatedAt: new Date() }
        ];

        const filteredTasks = component.getTasksByStatus('Lista');

        expect(filteredTasks).toEqual([{
            id: '1',
            title: 'Task 1',
            status: 'Lista',
            completed: false,
            order: 1,
            createdAt: jasmine.any(Date),
            updatedAt: jasmine.any(Date)
        }]);
    });

    it('should toggle task completion', () => {
        const task: Task = {
            id: '1',
            title: 'Task 1',
            status: 'Lista',
            completed: false,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        taskAdapterMock.updateTask.and.returnValue(of({
            id: '1',
            title: 'Task 1',
            status: 'Lista',
            completed: true,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        spyOn(component, 'loadTasks');

        component.toggleTask(task);

        expect(taskAdapterMock.updateTask).toHaveBeenCalledWith({ ...task, completed: true });
        expect(component.loadTasks).toHaveBeenCalled();
    });

    it('should handle error when toggling task', () => {
        spyOn(console, 'error');
        const task: Task = { id: '1', title: 'Task 1', status: 'Lista', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() };

        taskAdapterMock.updateTask.and.returnValue(throwError(() => new Error('Error updating task')));

        component.toggleTask(task);

        expect(console.error).toHaveBeenCalledWith('Error updating task:', jasmine.any(Error));
    });

    it('should delete a task', () => {
        const task: Task = { id: '1', title: 'Task 1', status: 'Lista', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() };
        taskAdapterMock.deleteTask.and.returnValue(of(void 0));
        spyOn(component, 'loadTasks');

        component.deleteTask(task);

        expect(taskAdapterMock.deleteTask).toHaveBeenCalledWith(task.id);
        expect(component.loadTasks).toHaveBeenCalled();
    });

    it('should handle error when deleting a task', () => {
        spyOn(console, 'error');
        const task: Task = { id: '1', title: 'Task 1', status: 'Lista', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() };
        taskAdapterMock.deleteTask.and.returnValue(throwError(() => new Error('Error deleting task')));

        component.deleteTask(task);

        expect(console.error).toHaveBeenCalledWith('Error deleting task:', jasmine.any(Error));
    });

    it('should set data on drag start', () => {
        const task: Task = {
            id: '1',
            title: 'Task 1',
            status: 'Lista',
            completed: false,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const event = new DragEvent('dragstart', { dataTransfer: new DataTransfer() });

        component.onDragStart(event, task);

        expect(event.dataTransfer?.getData('text/plain')).toEqual(JSON.stringify(task));
    });

    it('should prevent default on drag over', () => {
        const event = new DragEvent('dragover');
        spyOn(event, 'preventDefault');

        component.onDragOver(event);

        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should update task status on drop', () => {
        const task: Task = { 
            id: '1', 
            title: 'Task 1', 
            status: 'Lista', 
            completed: false, 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };

        const event = new DragEvent('drop', { dataTransfer: new DataTransfer() });
        event.dataTransfer?.setData('text/plain', JSON.stringify(task));
        taskAdapterMock.updateTaskStatus.and.returnValue(of({ id: '1', title: 'Task 1', status: 'En Progreso', completed: false, order: 1, createdAt: new Date(), updatedAt: new Date() }));
        spyOn(component, 'loadTasks');

        component.onDrop(event, 'En Progreso');

        expect(taskAdapterMock.updateTaskStatus).toHaveBeenCalledWith(task.id, 'En Progreso');
        expect(component.loadTasks).toHaveBeenCalled();
    });

    it('should handle error when updating task status on drop', () => {
        spyOn(console, 'error');
        const task: Task = { 
            id: '1', 
            title: 'Task 1', 
            status: 'Lista', 
            completed: false, 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };
        const event = new DragEvent('drop', { dataTransfer: new DataTransfer() });
        event.dataTransfer?.setData('text/plain', JSON.stringify(task));
        taskAdapterMock.updateTaskStatus.and.returnValue(throwError(() => new Error('Error updating task status')));

        component.onDrop(event, 'En Progreso');

        expect(console.error).toHaveBeenCalledWith('Error updating task status:', jasmine.any(Error));
    });
});