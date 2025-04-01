import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('InputComponent', () => {
    let component: InputComponent;
    let fixture: ComponentFixture<InputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule, FormsModule, InputComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render input with default type "text"', () => {
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.type).toBe('text');
    });

    it('should update the input type based on @Input() type', () => {
        component.type = 'password';
        fixture.detectChanges();
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.type).toBe('password');
    });

    it('should render placeholder text', () => {
        component.placeholder = 'Enter text';
        fixture.detectChanges();
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.placeholder).toBe('Enter text');
    });

    it('should emit valueChange event on input', () => {
        spyOn(component.valueChange, 'emit');
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        inputElement.value = 'test value';
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(component.valueChange.emit).toHaveBeenCalledWith('test value');
    });

    it('should apply size class based on @Input() size', () => {
        component.size = 'large';
        fixture.detectChanges();
        const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputElement.classList).toContain('large');
    });
});