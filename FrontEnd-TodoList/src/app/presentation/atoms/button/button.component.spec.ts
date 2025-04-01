import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have default variant as "primary"', () => {
        expect(component.variant).toBe('primary');
    });

    it('should set variant to "secondary" when input is provided', () => {
        component.variant = 'secondary';
        fixture.detectChanges();
        expect(component.variant).toBe('secondary');
    });

    it('should have disabled set to false by default', () => {
        expect(component.disabled).toBeFalse();
    });

    it('should emit onClick event when button is clicked', () => {
        spyOn(component.onClick, 'emit');
        const buttonElement = fixture.debugElement.query(By.css('button'));
        buttonElement.triggerEventHandler('click', new MouseEvent('click'));
        expect(component.onClick.emit).toHaveBeenCalled();
    });

    it('should disable the button when disabled input is true', () => {
        component.disabled = true;
        fixture.detectChanges();
        const buttonElement = fixture.debugElement.query(By.css('button'));
        expect(buttonElement.nativeElement.disabled).toBeTrue();
    });
});