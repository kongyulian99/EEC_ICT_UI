import { DxButtonModule, DxTextBoxModule, DxNumberBoxModule, DxToolbarModule, DxDataGridModule, DxSelectBoxModule, DxScrollViewModule, DxTextAreaModule, DxValidationGroupModule, DxValidatorModule, DxLoadPanelModule, DxTreeListModule, DxPopupModule, DxCheckBoxModule, DxRadioGroupModule, DxTabPanelModule, DxListModule, DxTreeViewModule, DxDropDownBoxModule, DxFormModule } from 'devextreme-angular';
import { ComponentsSharedModule } from './../../../../shared/components/components-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesRoutingModule } from './categories-routing.module';
import { SharedDirectivesModule } from 'src/app/shared';
import { TopicsComponent } from './topics/topics.component';

@NgModule({
  declarations: [

    TopicsComponent
  ],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    ComponentsSharedModule,
    SharedDirectivesModule,
        //3rd
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxToolbarModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxScrollViewModule,
    DxTextAreaModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxTreeListModule,
    DxTreeViewModule,
    DxPopupModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxTabPanelModule,
    DxPopupModule,
    DxListModule,
    DxDropDownBoxModule,
    DxFormModule,
    ComponentsSharedModule
  ]
})
export class CategoriesModule { }

