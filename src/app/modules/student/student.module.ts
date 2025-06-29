import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './test/test.component';
import {
  DxPopupModule,
  DxButtonModule,
  DxTextBoxModule,
  DxLoadPanelModule,
  DxDataGridModule,
  DxChartModule,
  DxPolarChartModule,
  DxTreeMapModule,
  DxPieChartModule,
  DxTooltipModule
} from 'devextreme-angular';
import { HeaderStudentComponent } from './components/header-student/header-student.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ScoreDetailComponent } from './test/test-detail/score-detail/score-detail.component';
import { ComponentsSharedModule } from 'src/app/shared';


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
    FormsModule,
    DxPopupModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxLoadPanelModule,
    DxChartModule,
    DxPolarChartModule,
    DxTreeMapModule,
    DxPieChartModule,
    DxTooltipModule,
    NgbDropdownModule,
    ComponentsSharedModule,
    StudentRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StudentModule { }
