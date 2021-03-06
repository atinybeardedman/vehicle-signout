import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SelectVehicleComponent } from './core/components/select-vehicle/select-vehicle.component';
import { LoginComponent } from './core/login/login.component';
import { redirectUnauthorizedTo, canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectAuthorizedToHome = () => redirectLoggedInTo([''])
const routes: Routes = [
  {path: '', component: SelectVehicleComponent, ...canActivate(redirectUnauthorizedToLogin)},
  {path: 'vehicle', loadChildren: () => import('./signout-view/signout-view.module').then(m => m.SignoutViewModule), ...canActivate(redirectUnauthorizedToLogin)},
  {path: 'my-signouts', loadChildren: () => import('./manage-signouts/manage-signout.module').then(m => m.ManageSignoutModule), ...canActivate(redirectUnauthorizedToLogin)},
  {path: 'login', component: LoginComponent, ...canActivate(redirectAuthorizedToHome)}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
})
export class RoutingModule { }
