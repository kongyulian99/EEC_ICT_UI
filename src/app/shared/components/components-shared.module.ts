import { DxButtonModule, DxTextBoxModule, DxTextAreaModule, DxSelectBoxModule, DxToolbarModule, DxScrollViewModule, DxPopupModule, DxTreeViewModule, DxDropDownBoxModule, DxDateBoxModule, DxValidatorModule, DxValidationGroupModule, DxDataGridModule, DxTagBoxModule, DxTreeListModule, DxLoadPanelModule, DxNumberBoxModule, DxButtonGroupModule, DxTemplateModule, DxCheckBoxModule, DxDropDownButtonModule } from 'devextreme-angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorComponent } from './paginator/paginator.component';
import { StepsComponent } from './steps/steps.component';
import { MultiImagesComponent } from './multi-images/multi-images.component';
import { PipesModule } from '../pipes';
import { HttpClientModule } from '@angular/common/http';
import { MoreFilterComponent } from './more-filter/more-filter.component';
import { GenericPageComponent } from './generic-page/generic-page.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ViewCkeditorComponent } from './view-ckeditor/view-ckeditor.component';
import { CustomCkEditorComponent } from './custom-ckeditor/custom-ckeditor.component';
import { DropDownThang } from './dropdown-thang/dropdown-thang.component';
import { DropDownTrangthai } from './dropdown-trangthai/dropdown-trangthai.component';
import { DxListModule } from 'devextreme-angular';
import { DropDownQuy } from './dropdown-quy/dropdown-quy.component';
import { SlideshowImagesComponent } from './slideshow-image/slideshow-image.component';
import { TailieuDinhkemComponent } from './tailieu-dinhkem/tailieu-dinhkem.component';
import { GenericTableComponent } from './generic-table/generic-table.component';
import { DropDownPermission } from './dropdown-permission/dropdown-permission.component';

@NgModule({
  declarations: [
    PaginatorComponent,
    StepsComponent,
    MultiImagesComponent,
    MoreFilterComponent,
    GenericPageComponent,
    // EditorCkeditorComponent,
    ViewCkeditorComponent,
    CustomCkEditorComponent,
    GenericPageComponent,
    DropDownThang,
    DropDownQuy,
    DropDownTrangthai,
    SlideshowImagesComponent,
    TailieuDinhkemComponent,
    GenericTableComponent,
    DropDownPermission
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgbPaginationModule,
        // Dev
    DxButtonModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxToolbarModule,
    DxSelectBoxModule,
    DxScrollViewModule,
    DxButtonModule,
    DxTextBoxModule,
    DxPopupModule,
    PipesModule,
    DxTreeViewModule,
    DxDataGridModule,
    DxDropDownBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTagBoxModule,
    DxValidationGroupModule,
    DxTreeListModule,
    DxLoadPanelModule,
    CKEditorModule,
    DxListModule,
    DxNumberBoxModule,
    DxButtonGroupModule,
    DxTemplateModule,
    DxCheckBoxModule,
    DxDropDownButtonModule
  ],
  exports: [
    PaginatorComponent,
    StepsComponent,
    MultiImagesComponent,
    MoreFilterComponent,
    // EditorCkeditorComponent,
    ViewCkeditorComponent,
    CustomCkEditorComponent,
    GenericPageComponent,
    DropDownThang,
    DropDownQuy,
    DropDownTrangthai,
    SlideshowImagesComponent,
    TailieuDinhkemComponent,
    GenericTableComponent,
    DropDownPermission,
  ]
})
export class ComponentsSharedModule { }
