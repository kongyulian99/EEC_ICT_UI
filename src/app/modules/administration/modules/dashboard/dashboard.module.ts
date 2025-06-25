import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DxButtonModule, DxChartModule, DxDataGridModule, DxDateBoxModule, DxPieChartModule, DxScrollViewModule } from 'devextreme-angular';
import { ComponentsSharedModule, PipesModule, SharedDirectivesModule } from 'src/app/shared';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SummaryComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ComponentsSharedModule,
    DxButtonModule,
    DxDateBoxModule,
    DxChartModule,
    DxPieChartModule,
    DxDataGridModule,
    DxScrollViewModule,
    SharedDirectivesModule,
    PipesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
