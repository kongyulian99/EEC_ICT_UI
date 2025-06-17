import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExamsRoutingModule } from './exams-routing.module';
import { ManageExamsComponent } from './manage-exams/manage-exams.component';
import { DxButtonModule, DxDataGridModule, DxTextBoxModule, DxNumberBoxModule, DxPopupModule, DxScrollViewModule, DxTextAreaModule, DxToolbarModule, DxValidatorModule, DxValidationGroupModule, DxLoadPanelModule, DxSelectBoxModule, DxRadioGroupModule } from 'devextreme-angular';
import { ComponentsSharedModule, SharedDirectivesModule } from 'src/app/shared';
import { ExamDetailComponent } from './manage-exams/exam-detail/exam-detail.component';
import { QuestionDetailComponent } from './manage-exams/exam-detail/question-detail/question-detail.component';

@NgModule({
  declarations: [
    ManageExamsComponent,
    ExamDetailComponent,
    QuestionDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ExamsRoutingModule,
    ComponentsSharedModule,
    SharedDirectivesModule,
    // DevExtreme modules
    DxButtonModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxScrollViewModule,
    DxTextAreaModule,
    DxToolbarModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxLoadPanelModule,
    DxSelectBoxModule,
    DxRadioGroupModule
  ]
})
export class ExamsModule { }
