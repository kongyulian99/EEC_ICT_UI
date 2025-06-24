import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentComponent } from './student.component';
import { TestComponent } from './test/test.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';
const routes: Routes = [
  {
    path: '',
    component: StudentComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'test',
        component: TestComponent
      },
      {
        path: 'test-detail',
        component: TestDetailComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
