import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  
  private apiUrl = 'http://localhost:30081/users/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],      
      usernameOrEmail: ['', Validators.required], 
      password: ['', Validators.required]
    });

    this.loginForm.get('username')?.valueChanges.subscribe(value => {
      this.loginForm.get('usernameOrEmail')?.setValue(value, { emitEvent: false });
    });

    this.loginForm.get('usernameOrEmail')?.valueChanges.subscribe(value => {
      this.loginForm.get('username')?.setValue(value, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const credentials = {
      usernameOrEmail: this.loginForm.value.usernameOrEmail,
      password: this.loginForm.value.password
    };

    this.http.post<any>(this.apiUrl, credentials)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return of(null);         }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(response => {
        if (response) {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          this.router.navigate(['/dashboard']);
        }
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.errorMessage = 'Login failed: Invalid credentials';
    } else if (error.status === 404) {
      this.errorMessage = 'Login failed: User not found or system issue.';
    } else if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        this.errorMessage = error.error.message;
      } else {
        this.errorMessage = 'Login failed. An unknown error occurred.';
      }
    } else if (typeof error.error === 'string') {
      this.errorMessage = error.error;
    } else {
      this.errorMessage = 'Login failed. An unknown error occurred.';
    }
  }
}
