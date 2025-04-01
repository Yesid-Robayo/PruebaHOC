import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TasksComponent } from './tasks.component';
import { LocalStorageTaskAdapter } from '../../../infrastructure/adapters/local-storage-task.adapter';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';
import { Task } from '../../../core/models/task.model';

describe('TasksComponent', () => {
    let component: TasksComponent;
    let taskAdapterMock: jasmine.SpyObj<LocalStorageTaskAdapter>;
    let authAdapterMock: jasmine.SpyObj<LocalStorageAuthAdapter>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(() => {
        taskAdapterMock = jasmine.createSpyObj('LocalStorageTaskAdapter', ['addTask']);
        authAdapterMock = jasmine.createSpyObj('LocalStorageAuthAdapter', ['logout']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                TasksComponent,
                { provide: LocalStorageTaskAdapter, useValue: taskAdapterMock },
                { provide: LocalStorageAuthAdapter, useValue: authAdapterMock },
                { provide: Router, useValue: routerMock },
            ],
        });

        component = TestBed.inject(TasksComponent);
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call addTask on taskAdapter when addTask is invoked', () => {
        const task: Omit<Task, 'id'> = { 
            title: 'Test Task', 
            completed: false, 
            status: 'Lista', 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };
        taskAdapterMock.addTask.and.returnValue(of({ title: 'Test Task', description: 'Test Description' } as unknown as Task));

        component.addTask(task);

        expect(taskAdapterMock.addTask).toHaveBeenCalledWith(task);
    });

    it('should call logout on authAdapter and navigate to /login when logout is invoked', () => {
        authAdapterMock.logout.and.returnValue(of(void 0));

        component.logout();

        expect(authAdapterMock.logout).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
});