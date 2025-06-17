import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// DevExtreme
import {
  DxButtonModule,
  DxDataGridModule,
  DxTextBoxModule,
  DxTextAreaModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxPopupModule,
  DxLoadPanelModule,
  DxScrollViewModule,
  DxFileUploaderModule,
  DxTooltipModule,
  DxValidatorModule,
  DxValidationGroupModule,
  DxRadioGroupModule,
  DxSwitchModule,
  DxListModule,
  DxTabsModule,
  DxAccordionModule,
  DxTemplateModule,
  DxGalleryModule,
  DxDropDownBoxModule,
  DxTreeViewModule,
  DxBoxModule,
  DxTagBoxModule,
  DxContextMenuModule,
  DxMenuModule,
  DxToolbarModule,
  DxDropDownButtonModule,
  DxFormModule
} from 'devextreme-angular';

// Components
import { GenericPageComponent } from './components/generic-page/generic-page.component';
import { ViewCkeditorComponent } from './components/view-ckeditor/view-ckeditor.component';
import { AfterViewInitDirective } from './directives/after-view-init.directive';

const COMPONENTS = [
  GenericPageComponent,
  ViewCkeditorComponent
];

const DIRECTIVES = [
  AfterViewInitDirective
];

const DEVEXTREME_MODULES = [
  DxButtonModule,
  DxDataGridModule,
  DxTextBoxModule,
  DxTextAreaModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxPopupModule,
  DxLoadPanelModule,
  DxScrollViewModule,
  DxFileUploaderModule,
  DxTooltipModule,
  DxValidatorModule,
  DxValidationGroupModule,
  DxRadioGroupModule,
  DxSwitchModule,
  DxListModule,
  DxTabsModule,
  DxAccordionModule,
  DxTemplateModule,
  DxGalleryModule,
  DxDropDownBoxModule,
  DxTreeViewModule,
  DxBoxModule,
  DxTagBoxModule,
  DxContextMenuModule,
  DxMenuModule,
  DxToolbarModule,
  DxDropDownButtonModule,
  DxFormModule
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...DIRECTIVES
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ...DEVEXTREME_MODULES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ...DEVEXTREME_MODULES,
    ...COMPONENTS,
    ...DIRECTIVES
  ]
})
export class SharedModule { }
