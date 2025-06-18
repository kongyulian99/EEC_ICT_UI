import { SystemConstants } from 'src/app/shared/constants/systems.constant';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { RolesComponent } from './components/roles/roles.component';
import { ActionsComponent } from './components/permissions/permissions.component';
import { AuthGuard } from 'src/app/shared/guard';
import { GroupComponent } from './components/group/group.component';
import { GrantGroupComponent } from './components/grantgroup/grantgroup.component';
import { MappingCommandComponent } from './components/mappingcommand/mappingcommand.component';
// import { NhapLieuExcelTabsComponent } from './components/nhaplieu-excel/nhaplieu-tabs/nhaplieu-excel-tabs.component';

const routes: Routes = [
    {
        path: '',
        component: UsersComponent
    },
    {
        path: 'users',
        component: UsersComponent,
        data: {
            RoleCode: 'USER_MANAGEMENT'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemsRoutingModule {}
