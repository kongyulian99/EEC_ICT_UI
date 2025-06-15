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
    DxListModule,
    DxValidationSummaryModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxTagBoxModule
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { ComponentsSharedModule, PipesModule, SharedDirectivesModule } from 'src/app/shared';
import { FormsModule } from '@angular/forms';

import { ThongBaoChiDaoRoutingModule } from './thongbaochidao-routing.module';
import { ThongBaoChiDao_ThongBaoTabsComponent } from './thongbao-tabs/thongbao-tabs.component';
import { ThongBaoChiDao_ThongBaoNhanComponent } from './thongbao-nhan/thongbao-nhan.component';
import { ThongBaoChiDao_ThongBaoDaGuiComponent } from './thongbao-dagui/thongbao-dagui.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormThongBaoChiDaoComponent } from './form-thongbao/form-thongbaochidao.component';
import { FormThongBaoChiDaoViewComponent } from './form-thongbao-view/form-thongbaochidao-view.component';


@NgModule({
    declarations: [
        ThongBaoChiDao_ThongBaoTabsComponent,
        ThongBaoChiDao_ThongBaoNhanComponent,
        ThongBaoChiDao_ThongBaoDaGuiComponent,
        FormThongBaoChiDaoComponent,
        FormThongBaoChiDaoViewComponent
    ],
    imports: [
        CommonModule,
        ThongBaoChiDaoRoutingModule,
        ComponentsSharedModule,
        SharedDirectivesModule,
        PipesModule,
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
        DxListModule,
        DxValidationSummaryModule,
        DxDateBoxModule,
        FormsModule,
        DxDropDownBoxModule,
        DxTagBoxModule,
    ]
})
export class ThongBaoChiDaoModule { }
