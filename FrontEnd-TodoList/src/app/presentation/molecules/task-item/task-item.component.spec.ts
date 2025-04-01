import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';
import { Task } from '../../../core/models/task.model';

describe('TaskItemComponent', () => {
    let component: TaskItemComponent;
    let fixture: ComponentFixture<TaskItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskItemComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit dragStart event with DragEvent when handleDragStart is called', () => {
        const mockTask: Task = { 
            id: '1', 
            title: 'Test Task', 
            completed: false, 
            status: 'En Progreso', 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };
        component.task = mockTask;

        const dragEvent = new DragEvent('dragstart', {
            dataTransfer: new DataTransfer(),
        });

        spyOn(component.dragStart, 'emit');
        component.handleDragStart(dragEvent);

        expect(dragEvent.dataTransfer?.getData('text/plain')).toBe(JSON.stringify(mockTask));
        expect(component.dragStart.emit).toHaveBeenCalledWith(dragEvent);
    });

    it('should emit onToggle event when onToggle is triggered', () => {
        const mockTask: Task = { 
            id: '1', 
            title: 'Test Task', 
            completed: false, 
            status: 'En Progreso', 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };
        component.task = mockTask;

        spyOn(component.onToggle, 'emit');
        component.onToggle.emit(mockTask);

        expect(component.onToggle.emit).toHaveBeenCalledWith(mockTask);
    });

    it('should emit onDelete event when onDelete is triggered', () => {
       
        const mockTask: Task = { 
            id: '1', 
            title: 'Test Task', 
            completed: false, 
            status: 'En Progreso', 
            order: 1, 
            createdAt: new Date(), 
            updatedAt: new Date() 
        };
        component.task = mockTask;

        spyOn(component.onDelete, 'emit');
        component.onDelete.emit(mockTask);

        expect(component.onDelete.emit).toHaveBeenCalledWith(mockTask);
    });
});