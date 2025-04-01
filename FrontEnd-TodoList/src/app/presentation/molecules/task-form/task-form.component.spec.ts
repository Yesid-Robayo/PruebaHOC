import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../atoms/input/input.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { By } from '@angular/platform-browser';

describe('TaskFormComponent', () => {
    let component: TaskFormComponent;
    let fixture: ComponentFixture<TaskFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, InputComponent, ButtonComponent,TaskFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit addTask event with correct data when onSubmit is called', () => {
        const taskTitle = 'Test Task';
        component.taskTitle = taskTitle;

        spyOn(component.addTask, 'emit');
        component.onSubmit();

        expect(component.addTask.emit).toHaveBeenCalledWith({
            title: taskTitle,
            completed: false,
            status: 'Lista',
            order: 0,
            createdAt: jasmine.any(Date),
            updatedAt: jasmine.any(Date),
        });
        expect(component.taskTitle).toBe('');
    });

    it('should not emit addTask event if taskTitle is empty', () => {
        component.taskTitle = '   ';

        spyOn(component.addTask, 'emit');
        component.onSubmit();

        expect(component.addTask.emit).not.toHaveBeenCalled();
    });

    it('should bind taskTitle to the input field', () => {
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

        inputElement.value = 'New Task';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(component.taskTitle).toBe('New Task');
    });

    it('should call onSubmit when the form is submitted', () => {
        spyOn(component, 'onSubmit');

        const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
        formElement.dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        expect(component.onSubmit).toHaveBeenCalled();
    });
});