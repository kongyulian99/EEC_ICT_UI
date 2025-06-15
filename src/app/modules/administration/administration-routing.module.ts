import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemConstants } from 'src/app/shared';
import { AdministrationComponent } from './administration.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },

      {
        path: 'systems',
        loadChildren: () =>
          import('./modules/systems/systems.module').then(
            (m) => m.SystemsModule
          ),
        data: {
          functionCode: SystemConstants.SYSTEM,
        },
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./modules/categories/categories.module').then(
            (m) => m.CategoriesModule
          ),
        data: {
          functionCode: SystemConstants.CATEGORIES,
        },
      },
      {
        path: 'user-info',
        loadChildren: () =>
          import('./modules/user-info/user-info.module').then(
            (m) => m.UserInfoModule
          ),
      },
      {
        path: 'exams',
        loadChildren: () =>
          import('./modules/exams/exams.module').then(
            (m) => m.ExamsModule
          ),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
