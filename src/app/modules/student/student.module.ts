import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './test/test.component';
import { DxPopupModule, DxButtonModule, DxTextBoxModule, DxLoadPanelModule, DxDataGridModule } from 'devextreme-angular';
import { ComponentsSharedModule } from 'src/app/shared';
import { HeaderStudentComponent } from './components/header-student/header-student.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';


@NgModule({
  declarations: [
    StudentComponent,
    DashboardComponent,
    TestComponent,
    HeaderStudentComponent,
    TestDetailComponent
  ],
  imports: [
    CommonModule,
    DxPopupModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxLoadPanelModule,
    ComponentsSharedModule,
    StudentRoutingModule
  ]
})
export class StudentModule { }
