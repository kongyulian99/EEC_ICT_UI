import { NgModule } from '@angular/core';
import { 
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
  DxPopupModule, 
  DxCheckBoxModule, 
  DxRadioGroupModule, 
  DxTabPanelModule, 
  DxListModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { BieudoRoutingModule } from './bieudo-routing.module';
import { ComponentsSharedModule, SharedDirectivesModule } from 'src/app/shared';



@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    BieudoRoutingModule,
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
    DxPopupModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxTabPanelModule,
    DxPopupModule,
    DxListModule
  ]
})
export class BieudoModule { }
