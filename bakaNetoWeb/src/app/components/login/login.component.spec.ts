import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login.component";

class RouterStub {
  navigate(commands: any[], extras?: any): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const apiUrl = "http://localhost:30081";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        CommonModule,
      ],
      providers: [{ provide: Router, useClass: RouterStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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

  it("should initialize loginForm with usernameOrEmail and password controls", () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.controls["usernameOrEmail"]).toBeDefined();
    expect(component.loginForm.controls["password"]).toBeDefined();
  });

  it("should make usernameOrEmail and password controls required", () => {
    const usernameControl = component.loginForm.controls["usernameOrEmail"];
    const passwordControl = component.loginForm.controls["password"];

    usernameControl.setValue("");
    passwordControl.setValue("");

    expect(usernameControl.hasError("required")).toBeTrue();
    expect(passwordControl.hasError("required")).toBeTrue();
  });

  it("should make the form invalid when controls are empty", () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it("should make the form valid when controls are filled", () => {
    component.loginForm.controls["usernameOrEmail"].setValue("test@test.com");
    component.loginForm.controls["password"].setValue("password123");
    expect(component.loginForm.valid).toBeTrue();
  });

  describe("onSubmit", () => {
    beforeEach(() => {
      spyOn(router, "navigate").and.callThrough();
      spyOn(window, "alert");
      spyOn(console, "log");
      spyOn(console, "error");
      spyOn(console, "info");
    });

    it("should not submit if form is invalid", () => {
      component.onSubmit();
      expect(component.errorMessage).toBe(
        "Please enter both email/username and password.",
      );
      expect(component.loading).toBeFalse();
      expect(router.navigate).not.toHaveBeenCalled();
      httpMock.expectNone(`${apiUrl}/users/login`);
    });

    it("should mark form as touched if submitted while invalid", () => {
      spyOn(component.loginForm, "markAllAsTouched");
      component.onSubmit();
      expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    });
  });
});
