import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './test/test.component';
import { DxPopupModule, DxButtonModule, DxTextBoxModule, DxLoadPanelModule, DxDataGridModule, DxChartModule } from 'devextreme-angular';
import { ComponentsSharedModule } from 'src/app/shared';
import { HeaderStudentComponent } from './components/header-student/header-student.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ScoreDetailComponent } from './test/test-detail/score-detail/score-detail.component';


@NgModule({
  declarations: [
    StudentComponent,
    DashboardComponent,
    TestComponent,
    HeaderStudentComponent,
    TestDetailComponent,
    ScoreDetailComponent
  ],
  imports: [
    CommonModule,
    DxPopupModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxLoadPanelModule,
    DxChartModule,
    NgbDropdownModule,
    ComponentsSharedModule,
    StudentRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StudentModule { }
