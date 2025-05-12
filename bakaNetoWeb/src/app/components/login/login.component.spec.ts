import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let httpClient: HttpClient;

  const API_URL = 'http://localhost:30081/users/login';

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        LoginComponent // Import instead of declare for standalone components
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
      ],
      // Remove declarations array since LoginComponent is standalone
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    component.ngOnInit();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loginForm should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('username field validity', () => {
    const username = component.loginForm.controls['username'];
    expect(username.valid).toBeFalse();
    expect(username.hasError('required')).toBeTrue();

    username.setValue("testuser");
    expect(username.hasError('required')).toBeFalse();
  });

  it('password field validity', () => {
    const password = component.loginForm.controls['password'];
    expect(password.valid).toBeFalse();
    expect(password.hasError('required')).toBeTrue();

    password.setValue("password123");
    expect(password.hasError('required')).toBeFalse();
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.loginForm.setValue({ 
        username: 'testuser', 
        usernameOrEmail: 'testuser', 
        password: 'password123' 
      });
      expect(component.loginForm.valid).toBeTrue();
    });

    it('should set loading to true when called', () => {
      component.onSubmit();
      expect(component.loading).toBeTrue();
      const req = httpMock.expectOne(API_URL);
      req.flush({});
    });

    it('should call login API (via HttpClient) and navigate on successful login', fakeAsync(() => {
      component.onSubmit();
      expect(component.loading).toBeTrue();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'fake-jwt-token', user: { name: 'Test User' } });

      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.errorMessage).toBeNull();
    }));

    it('should handle login error with Spring Boot default error structure (example: 400 Bad Request)', fakeAsync(() => {
      component.onSubmit();
      expect(component.loading).toBeTrue();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');

      const springError = {
        timestamp: '2025-05-11T22:25:00.000+00:00',
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed for object=\'loginRequest\'. Error count: 1',
        path: '/users/login'
      };
      req.flush(springError, { status: 400, statusText: 'Bad Request' });

      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe(springError.message || 'Login failed. Please try again.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should set specific message for 401 Unauthorized error', fakeAsync(() => {
      component.onSubmit();
      const req = httpMock.expectOne(API_URL);
      const errorResponse = { error: 'Unauthorized', message: 'Invalid credentials' };
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });

      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('Login failed: Invalid credentials');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should set specific message for 404 Not Found error', fakeAsync(() => {
        component.onSubmit();
        const req = httpMock.expectOne(API_URL);
        req.flush({ message: "User not found or API endpoint issue" }, { status: 404, statusText: 'Not Found' });

        tick();
        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(component.errorMessage).toBe('Login failed: User not found or system issue.');
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle login error with string response from backend (e.g., 500 Internal Server Error)', fakeAsync(() => {
      component.onSubmit();
      const req = httpMock.expectOne(API_URL);
      const errorStringResponse = "An unexpected internal server error occurred.";
      req.flush(errorStringResponse, { status: 500, statusText: 'Internal Server Error' });

      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe(errorStringResponse);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle login error with generic error.message (root level message)', fakeAsync(() => {
        component.onSubmit();
        const req = httpMock.expectOne(API_URL);
        const errorResponse = { message: 'A generic error occurred at the root.' };
        req.flush(errorResponse, { status: 500, statusText: 'Server Error' });

        tick();
        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(component.errorMessage).toBe('A generic error occurred at the root.');
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should handle login error with default message if no specific error format matches', fakeAsync(() => {
      component.onSubmit();
      const req = httpMock.expectOne(API_URL);
      req.flush(null, { status: 503, statusText: 'Service Unavailable' });

      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('Login failed. An unknown error occurred.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));

    it('should ensure loading is false in finalize/complete operator after an error', fakeAsync(() => {
        component.onSubmit();
        const req = httpMock.expectOne(API_URL);
        req.flush(null, { status: 500, statusText: 'Internal Server Error' });

        tick();
        fixture.detectChanges();

        expect(component.loading).toBeFalse();
        expect(component.errorMessage).not.toBeNull();
    }));
  });
});
