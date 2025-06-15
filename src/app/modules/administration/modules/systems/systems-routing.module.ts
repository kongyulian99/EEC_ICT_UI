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
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'roles',
        component: RolesComponent,
        data: {
            RoleCode: 'ROLE_MANAGEMENT'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'group',
        component: GroupComponent,
        data: {
            RoleCode: 'GROUP_MANAGEMENT'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'actions',
        component: ActionsComponent,
        data: {
            RoleCode: 'ACTION_MANAGEMENT'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'grantgroup',
        component: GrantGroupComponent,
        data: {
            RoleCode: 'GRANTGROUP'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'mappingcommand',
        component: MappingCommandComponent,
        data: {
            RoleCode: 'LOG_MANAGEMENT'
        },
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemsRoutingModule {}
