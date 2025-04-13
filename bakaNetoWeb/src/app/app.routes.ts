import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { AccountRecoveryComponent } from "./components/account-recovery/account-recovery.component";
import { ProfileUpdateComponent } from "./components/profile-update/profile-update.component";

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "account-recovery",
    component: AccountRecoveryComponent,
  },
  { path: "profile-update", component: ProfileUpdateComponent },
];
