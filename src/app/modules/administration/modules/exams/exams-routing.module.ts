import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageExamsComponent } from './manage-exams/manage-exams.component';
import { ExamDetailComponent } from './manage-exams/exam-detail/exam-detail.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'manage',
    pathMatch: 'full'
  },
  {
    path: 'manage',
    component: ManageExamsComponent
  },
  {
    path: 'detail',
    component: ExamDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamsRoutingModule { }
