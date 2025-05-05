import { Component, OnInit } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
// import { environment } from '../environments/environment'; // Removed incorrect import
// Import the environment file directly, path may vary based on your project structure
// import { environment } from '../../../environments/environment'; // Removed original import

@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: "./register.component.html", // Assuming your HTML file is named register.component.html in the same directory
  styleUrl: "./register.component.scss",
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;
  apiUrl: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required], // Added confirmPassword
        termsAccepted: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    ); // Add custom validator
    this.apiUrl = "http://localhost:30081"; // Default, and get from environment
  }

  ngOnInit(): void {
    //  this.apiUrl = environment.apiUrl; // removed duplicate initialization
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.controls["password"].value;
    const confirmPassword = group.controls["confirmPassword"].value;

    return password === confirmPassword ? null : { notSame: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const user = {
	name: this.registerForm.value.name,
        username: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        termsAccepted: this.registerForm.value.termsAccepted,
      };

      this.http.post<any>(`${this.apiUrl}/users/register`, user).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage =
            "Registration successful! Please check your email to confirm your account.";
          // Optionally, redirect the user:
          // this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = "An error occurred: " + error.message;
          } else {
            this.errorMessage = "Registration failed. Please try again.";
          }
          console.error("Registration error:", error);
        },
        complete: () => console.info("complete"),
      });
    } else {
      this.errorMessage =
        "Please fill in all required fields and accept the terms and conditions.";
    }
  }
}
