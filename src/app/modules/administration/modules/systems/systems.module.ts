import { ComponentsSharedModule } from './../../../../shared/components/components-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './components/users/users.component';
import { RolesComponent } from './components/roles/roles.component';
import { ActionsComponent, } from './components/permissions/permissions.component';
import { SystemsRoutingModule } from './systems-routing.module';
import { FormUserDetailComponent } from './components/users/form-user-detail/form-user-detail.component';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxListModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxScrollViewModule, DxSelectBoxModule, DxTabPanelModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxTreeListModule, DxValidationGroupModule, DxValidatorModule, DxDateBoxModule, DxValidationSummaryModule } from 'devextreme-angular';
import { FormRoleDetailComponent } from './components/roles/form-role-detail/form-role-detail.component';
import { PipesModule, SharedDirectivesModule } from 'src/app/shared';
import { GroupComponent } from './components/group/group.component';
import { FormGroupDetailComponent } from './components/group/form/form-group-detail.component';
import { GrantGroupComponent } from './components/grantgroup/grantgroup.component';
import { FormPermissionDetailComponent } from './components/permissions/form/form-permission-detail.component';
import { MappingCommandComponent } from './components/mappingcommand/mappingcommand.component';
import { FormMappingCommandDetailComponent } from './components/mappingcommand/form/form-mappingcommand-detail.component';



@NgModule({
  declarations: [
    UsersComponent,
    RolesComponent,
    ActionsComponent,
    FormPermissionDetailComponent,
    FormUserDetailComponent,
    FormRoleDetailComponent,
    GrantGroupComponent,
    GroupComponent,
    FormGroupDetailComponent,
    MappingCommandComponent,
    FormMappingCommandDetailComponent
  ],
  imports: [
    CommonModule,
    SystemsRoutingModule,
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
    DxListModule,
    DxDateBoxModule,
    DxValidationSummaryModule,
    PipesModule
  ]
})
export class SystemsModule { }
