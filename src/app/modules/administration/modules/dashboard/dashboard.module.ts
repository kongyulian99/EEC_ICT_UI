import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DxButtonModule, DxChartModule, DxCheckBoxModule, DxDateBoxModule, DxNumberBoxModule, DxPieChartModule, DxPopupModule, DxScrollViewModule, DxSelectBoxModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxTreeListModule } from 'devextreme-angular';
import { SummaryComponent } from './summary/summary.component';
import { ComponentsSharedModule, PipesModule, SharedDirectivesModule } from 'src/app/shared';

@NgModule({
  declarations: [
    DashboardComponent,
    SummaryComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    DxToolbarModule,
    DxButtonModule,
    SharedDirectivesModule,
    ComponentsSharedModule,
    PipesModule,
    DxChartModule,
    DxPieChartModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxTreeListModule,
    DxCheckBoxModule,
    DxScrollViewModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxTextBoxModule,
  ]
})
export class DashboardModule { }
