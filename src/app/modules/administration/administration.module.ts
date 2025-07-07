import { DxButtonModule, DxTextBoxModule, DxValidatorModule, DxValidationGroupModule, DxTreeListModule, DxToolbarModule } from 'devextreme-angular';
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationComponent } from './administration.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { NgbDropdownModule, NgbModalModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalChangePasswordComponent } from './components/modal-change-password/modal-change-password.component';
import { SharedDirectivesModule } from 'src/app/shared';

@NgModule({
  providers: [
    { provide: LOCALE_ID, useValue: 'vi' }
  ],
  declarations: [
    AdministrationComponent,
    HeaderComponent,
    SidebarComponent,
    ModalChangePasswordComponent
  ],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    NgbDropdownModule,
    NgbModalModule,
    NgbCollapseModule,
    DxButtonModule,
    DxTextBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTreeListModule,
    DxToolbarModule,
    SharedDirectivesModule
  ]
})
export class AdministrationModule { }
