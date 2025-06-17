import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guard';

const routes: Routes = [
  // { path: '', loadChildren: () => import('./modules/portal-web/portal-web.module').then((m) => m.PortalWebModule) },
  { path: '', redirectTo: 'administration', pathMatch: 'full' },
  {
    path: 'administration',
    loadChildren: () =>
      import('./modules/administration/administration.module').then(
        (m) => m.AdministrationModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./modules/student/student.module').then((m) => m.StudentModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./modules/signup/signup.module').then((m) => m.SignupModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./modules/server-error/server-error.module').then(
        (m) => m.ServerErrorModule
      ),
  },
  {
    path: 'access-denied',
    loadChildren: () =>
      import('./modules/access-denied/access-denied.module').then(
        (m) => m.AccessDeniedModule
      ),
  },
  {
    path: 'not-found',
    loadChildren: () =>
      import('./modules/not-found/not-found.module').then(
        (m) => m.NotFoundModule
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
