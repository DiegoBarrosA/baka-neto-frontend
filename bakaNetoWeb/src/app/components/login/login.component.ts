// src/app/login/login.component.ts  (Adjust path as needed)

import { Component, OnInit } from '@angular/core';
import {
  FormsModule, // Needed if using template-driven features within template
  ReactiveFormsModule, // Primary module for this component
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // For *ngIf, etc.

@Component({
  selector: 'app-login', // Standard selector
  standalone: true, // Using standalone component structure
  imports: [
    CommonModule,
    FormsModule, // Import if using [(ngModel)] or template variables in HTML
    ReactiveFormsModule, // Needed for FormGroup, formControlName etc.
    HttpClientModule, // Needed for HttpClient
  ],
  templateUrl: './login.component.html', // Link to your HTML file
  styleUrls: ['./login.component.scss'], // Link to your SCSS file
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  // IMPORTANT: Replace with your actual backend API URL
  // Consider using environment files like in RegisterComponent discussion
  apiUrl: string = 'http://localhost:30081';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize the form structure and validators
    this.loginForm = this.fb.group({
      // Match backend DTO: User can enter email or username
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]],
      // 'rememberMe': [false] // Optional: Can add if you implement client-side persistence
    });
  }

  ngOnInit(): void {
    // Initialization logic if needed when component loads
  }

  onSubmit(): void {
    this.errorMessage = ''; // Clear previous errors

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter both email/username and password.';
      // Optionally mark fields as touched to show validation errors in HTML
      this.loginForm.markAllAsTouched();
      return; // Stop submission if form is invalid
    }

    this.loading = true;

    // Prepare payload matching backend UserLoginDTO structure
    const credentials = {
      usernameOrEmail: this.loginForm.value.usernameOrEmail,
      password: this.loginForm.value.password,
    };

    this.http.post<any>(`${this.apiUrl}/users/login`, credentials).subscribe({
      // --- Success Handler ---
      next: (response) => {
        this.loading = false;
        console.log('Login successful:', response); // Log the response (UserDTO)

        // ** IMPORTANT: Session Management **
        // Your current backend returns UserDTO. Real-world apps usually return a
        // JWT token or session ID here. You would need to:
        // 1. Extract the token/session ID from the 'response'.
        // 2. Store it securely (e.g., localStorage, sessionStorage - consider security implications).
        // 3. Set up an HttpInterceptor to automatically add the token to headers
        //    of subsequent requests to protected backend endpoints.
        // 4. Implement AuthGuards to protect routes in Angular.

        // For now, just navigate on success (won't persist login state):
        alert('Login Successful!'); // Simple feedback
        this.router.navigate(['/dashboard']); // Navigate to a protected area (e.g., '/dashboard')
      },
      // --- Error Handler ---
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);

        // Try to extract backend error message
        if (error.error && typeof error.error === 'string') {
           // Handle plain text errors (less common with Spring default errors)
           this.errorMessage = error.error;
        } else if (error.error && error.error.message) {
          // Handle Spring Boot default error structure { timestamp, status, error, message, path }
          this.errorMessage = error.error.message;
        } else if (error.message) {
           // Fallback to generic error message
           this.errorMessage = error.message;
        } else {
           // Default error if nothing else is available
           this.errorMessage = 'Login failed. Please check your credentials or try again later.';
        }
        // Specific check for invalid credentials (often a 401 or 400/404 depending on backend)
        if (error.status === 401 || error.status === 404 || (error.error && error.error.message?.includes('Invalid credentials'))) {
             this.errorMessage = 'Login failed: Invalid credentials.';
        }

      },
      // --- Completion Handler (optional) ---
      complete: () => {
        this.loading = false; // Ensure loading is false even if no error/next emitted (rare)
        console.info('Login request completed.');
      },
    });
  }
}
