import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { ReactiveFormsModule, AbstractControl } from "@angular/forms";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { RegisterComponent } from "./register.component";

class RouterStub {
  navigate(commands: any[], extras?: any): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const apiUrl = "http://localhost:30081";

  const getControl = (name: string): AbstractControl | null => {
    return component.registerForm.get(name);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        CommonModule,
      ],
      providers: [{ provide: Router, useClass: RouterStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize registerForm with required controls", () => {
    expect(component.registerForm).toBeDefined();
    expect(getControl("name")).toBeDefined();
    expect(getControl("email")).toBeDefined();
    expect(getControl("password")).toBeDefined();
    expect(getControl("confirmPassword")).toBeDefined();
    expect(getControl("termsAccepted")).toBeDefined();
  });

  it("should have the correct API URL set", () => {
    expect(component.apiUrl).toBe(apiUrl);
  });

  describe("Form Control Validation", () => {
    it("should make name control required", () => {
      const control = getControl("name");
      control?.setValue("");
      expect(control?.hasError("required")).toBeTrue();
      control?.setValue("Test Name");
      expect(control?.valid).toBeTrue();
    });

    it("should make email control required and validate email format", () => {
      const control = getControl("email");
      control?.setValue("");
      expect(control?.hasError("required")).toBeTrue();
      control?.setValue("invalid-email");
      expect(control?.hasError("email")).toBeTrue();
      control?.setValue("valid@example.com");
      expect(control?.valid).toBeTrue();
    });

    it("should make password control required and validate minLength(8)", () => {
      const control = getControl("password");
      control?.setValue("");
      expect(control?.hasError("required")).toBeTrue();
      control?.setValue("1234567");
      expect(control?.hasError("minlength")).toBeTrue();
      control?.setValue("12345678");
      expect(control?.valid).toBeTrue();
    });

    it("should make confirmPassword control required", () => {
      const control = getControl("confirmPassword");
      control?.setValue("");
      expect(control?.hasError("required")).toBeTrue();
      control?.setValue("password123");
      expect(control?.valid).toBeTrue();
    });

    it("should make termsAccepted control requiredTrue", () => {
      const control = getControl("termsAccepted");
      control?.setValue(false);
      expect(control?.hasError("required")).toBeTrue();
      control?.setValue(true);
      expect(control?.valid).toBeTrue();
    });
  });

  describe("Password Match Validation", () => {
    it('should have "notSame" error when password and confirmPassword do not match', () => {
      getControl("password")?.setValue("password123");
      getControl("confirmPassword")?.setValue("password456");
      expect(component.registerForm.hasError("notSame")).toBeTrue();
    });
  });

  describe("Overall Form Validity", () => {
    it("should be invalid initially", () => {
      expect(component.registerForm.valid).toBeFalse();
    });

    it("should be invalid if any required field is missing", () => {
      getControl("name")?.setValue("Test");
      getControl("email")?.setValue("test@test.com");
      getControl("password")?.setValue("password123");
      getControl("confirmPassword")?.setValue("password123");
      getControl("termsAccepted")?.setValue(true);
      expect(component.registerForm.valid).toBeTrue();

      getControl("name")?.setValue("");
      expect(component.registerForm.valid).toBeFalse();
    });

    it("should be invalid if passwords do not match", () => {
      getControl("name")?.setValue("Test");
      getControl("email")?.setValue("test@test.com");
      getControl("password")?.setValue("password123");
      getControl("confirmPassword")?.setValue("password456");
      getControl("termsAccepted")?.setValue(true);
      expect(component.registerForm.valid).toBeFalse();
      expect(component.registerForm.hasError("notSame")).toBeTrue();
    });

    it("should be invalid if terms are not accepted", () => {
      getControl("name")?.setValue("Test");
      getControl("email")?.setValue("test@test.com");
      getControl("password")?.setValue("password123");
      getControl("confirmPassword")?.setValue("password123");
      getControl("termsAccepted")?.setValue(false);
      expect(component.registerForm.valid).toBeFalse();
      expect(getControl("termsAccepted")?.hasError("required")).toBeTrue();
    });

    it("should be valid when all fields are correctly filled and terms accepted", () => {
      getControl("name")?.setValue("Valid Name");
      getControl("email")?.setValue("valid@email.com");
      getControl("password")?.setValue("password1234");
      getControl("confirmPassword")?.setValue("password1234");
      getControl("termsAccepted")?.setValue(true);
      expect(component.registerForm.valid).toBeTrue();
    });
  });

  describe("onSubmit", () => {
    beforeEach(() => {
      spyOn(router, "navigate").and.callThrough();
      spyOn(console, "error");
      spyOn(console, "info");
    });

    it("should not call http.post if form is invalid", () => {
      expect(component.registerForm.valid).toBeFalse();

      component.onSubmit();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe(
        "Please fill in all required fields and accept the terms and conditions.",
      );
      expect(component.successMessage).toBe("");
      httpMock.expectNone(`${apiUrl}/users/register`);
    });
  });
});
