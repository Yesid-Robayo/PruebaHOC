import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { LocalStorageAuthAdapter } from '../../../infrastructure/adapters/local-storage-auth.adapter';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockAuthAdapter: jasmine.SpyObj<LocalStorageAuthAdapter>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockAuthAdapter = jasmine.createSpyObj('LocalStorageAuthAdapter', ['login']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CommonModule, FormsModule, ButtonComponent, InputComponent,LoginComponent],
            providers: [
                { provide: LocalStorageAuthAdapter, useValue: mockAuthAdapter },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call authAdapter.login and navigate on successful login', () => {
        mockAuthAdapter.login.and.returnValue(of({ id: '1', email: 'test@example.com', name: 'Test User' }));
        component.email = 'test@example.com';
        component.password = 'password123';

        component.onSubmit();

        expect(mockAuthAdapter.login).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should handle login failure', () => {
        const consoleSpy = spyOn(console, 'error');
        mockAuthAdapter.login.and.returnValue(throwError(() => new Error('Login failed')));

        component.email = 'test@example.com';
        component.password = 'wrongpassword';

        component.onSubmit();

        expect(mockAuthAdapter.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
        expect(consoleSpy).toHaveBeenCalledWith('Login failed:', jasmine.any(Error));
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
});