import { Component, OnInit } from "@angular/core";
import { NotificationService, PermissionService, RoleService } from "src/app/shared";
import { GroupService } from "src/app/shared/services/group.service";

@Component({
    selector: 'app-grantgroup',
    templateUrl: './grantgroup.component.html',
    styleUrls: ['./grantgroup.component.scss']
})
export class GrantGroupComponent implements OnInit {

    dmRoleExPermission = []; dmRoleExPermissionFlat = [];
    dmGroup = [];
    dmPermission = [];


    selectedGroupId = ''; selectedGroupData = {};
    constructor(
        private roleService: RoleService,
        private groupService: GroupService,
        private permissionService: PermissionService,
        private notificationService: NotificationService
    ) { }
    ngOnInit(): void {
        this.loadAllDanhMuc();
    }


    loadAllDanhMuc() {
        this.groupService.processCommand('GROUP_LIST', { Keyword: "" })
            .subscribe(
                (res: any) => {
                    if (res.ReturnStatus.Code === 0) {
                        this.dmGroup = res.ReturnData;
                        this.selectedGroupId = this.dmGroup[0].ID;
                        this.loadDataSelectedGroup(this.selectedGroupId);
                    }
                }
            )
        this.roleService.processCommand('ROLE_LIST_EXPERMISSIONSINROLE', {})
            .subscribe(
                (res: any) => {
                    if (res.ReturnStatus.Code === 0) {
                        this.dmRoleExPermissionFlat = res.ReturnData;
                        console.log(this.dmRoleExPermissionFlat)

                        let data = res.ReturnData.map(el => {
                            if (el.cParentId == '00000000-0000-0000-0000-000000000000') {
                                return { ...el, cParentId: null }
                            } else {
                                return el;
                            }
                        });

                        let roleCap1 = data.filter(x => x.cParentId == null).map(el => ({ ...el, children: [] })).sort((a, b) => a.cSTT - b.cSTT);
                        let roleCap2 = data.filter(x => x.cParentId != null).sort((a, b) => a.cSTT - b.cSTT);

                        for (let i = 0; i < roleCap1.length; i++) {
                            for (let j = 0; j < roleCap2.length; j++) {
                                if (roleCap2[j].cParentId == roleCap1[i].fkRoleId) {
                                    roleCap1[i].children.push(roleCap2[j]);
                                }
                            }
                        }
                        this.dmRoleExPermission = roleCap1;

                    }
                }
            )
        this.permissionService.processCommand('PERMISSION_LIST', {})
            .subscribe(
                (res: any) => {
                    if (res.ReturnStatus.Code === 0) {
                        this.dmPermission = res.ReturnData;
                    }
                }
            )
    }

    checkExistPermissionInRole(rolePermissions, permissionId) {
        return rolePermissions.findIndex(x => x.fkPermissionId == permissionId) > -1
    }


    selectGroupCheckBox(event, groupId) {
        if (event.value) {
            this.selectedGroupId = groupId;
            this.loadDataSelectedGroup(groupId);
        }
    }

    loadDataSelectedGroup(groupId) {
        this.groupService.processCommand('GROUP_INFO_EXROLEINFO', { ID: groupId })
            .subscribe(
                (res: any) => {
                    if (res.ReturnStatus.Code === 0) {
                        let groupData = res.ReturnData;
                        let data = {};
                        // debugger;
                        for (let i = 0; i < this.dmRoleExPermissionFlat.length; i++) {
                            if (!data[this.dmRoleExPermissionFlat[i].fkRoleId]) data[this.dmRoleExPermissionFlat[i].fkRoleId] = {};
                            for (let j = 0; j < this.dmPermission.length; j++) {
                                let indexRole = groupData.roles?.findIndex(x => x.fkRoleId == this.dmRoleExPermissionFlat[i].fkRoleId);

                                let indexPer = -1;

                                if (indexRole > -1) {
                                    if (!groupData.roles[indexRole].permissions) {
                                        groupData.roles[indexRole].permissions = [];
                                    }
                                    indexPer = groupData.roles[indexRole].permissions.findIndex(x => x.fkPermissionId == this.dmPermission[j].ID);
                                }

                                data[this.dmRoleExPermissionFlat[i].fkRoleId][this.dmPermission[j].ID] = indexRole > -1 && indexPer > -1;
                            }
                        }


                        this.selectedGroupData = data;
                    }
                }
            )
    }




    changePermission(event, roleId, permissionId) {
        if (this.selectedGroupId && this.selectedGroupData[roleId][permissionId] != event.value) {

            let relevantRolesIds = this.dmRoleExPermissionFlat.filter(x => x.cParentId == roleId || x.fkRoleId == roleId).map(el => el.fkRoleId);
            // if (childRoles.length == 0) {

            // }

            let idsNotHavePermission = [];
            relevantRolesIds.forEach((ID) => {
                
                let index = this.dmRoleExPermissionFlat.findIndex(x => x.fkRoleId == ID);
                if (index > -1) {
                    if (!this.dmRoleExPermissionFlat[index].permissions || this.dmRoleExPermissionFlat[index].permissions.length == 0) {
                        idsNotHavePermission.push(ID);
                    } else {
                        let indexPer = this.dmRoleExPermissionFlat[index].permissions.findIndex(x => x.fkPermissionId == permissionId);
                        if (indexPer < 0) {
                            idsNotHavePermission.push(ID);
                        }
                    }
                }
            })
            
            relevantRolesIds = relevantRolesIds.filter(ID => idsNotHavePermission.findIndex(x => x == ID) < 0);


            this.groupService.processCommand('GROUP_CHANGE_PERMISSION', {
                GroupId: this.selectedGroupId,
                RoleIds: relevantRolesIds.join(','),
                PermissionId: permissionId,
                Value: event.value
            })
                .subscribe(
                    (res: any) => {
                        if (res.ReturnStatus.Code === 0) {
                            this.notificationService.showSuccess('Changes saved successfully');

                            relevantRolesIds.forEach((ID) => {
                                this.selectedGroupData[ID][permissionId] = event.value;
                            })

                        }
                    }
                )
        }

    }

}
