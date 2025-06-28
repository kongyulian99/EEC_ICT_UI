import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StudentComponent } from './student.component';
import { TestComponent } from './test/test.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';
import { ScoreDetailComponent } from './test/test-detail/score-detail/score-detail.component';

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
        path: 'test/:examId',
        component: TestDetailComponent
      },
      {
        path: 'test-detail',
        component: TestDetailComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'score-detail/:examId/:attemptId',
        component: ScoreDetailComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
