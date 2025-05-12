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

  describe("Password Match Validation", () => {
    it('should have "notSame" error when password and confirmPassword do not match', () => {
      getControl("password")?.setValue("password123");
      getControl("confirmPassword")?.setValue("password456");
      expect(component.registerForm.hasError("notSame")).toBeTrue();
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
        "Please fill in all required fields and accept the terms and conditions."
      );
      expect(component.successMessage).toBe("");
      httpMock.expectNone(`${apiUrl}/users/register`);
    });

    it("should validate password and confirmPassword match", () => {
      const group = component.registerForm;
      group.controls["password"].setValue("password123");
      group.controls["confirmPassword"].setValue("password123");
      expect(component.passwordMatchValidator(group)).toBeNull();

      group.controls["confirmPassword"].setValue("password456");
      expect(component.passwordMatchValidator(group)).toEqual({ notSame: true });
    });
  });
});
