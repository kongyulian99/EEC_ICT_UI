import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { lastValueFrom } from 'rxjs';
import { clone, NotificationService, PermissionService, RoleService } from 'src/app/shared';
import { dxButtonConfig } from 'src/app/shared/config';

@Component({
  selector: 'app-form-role-detail',
  templateUrl: './form-role-detail.component.html',
  styleUrls: ['./form-role-detail.component.scss'],
})
export class FormRoleDetailComponent implements OnInit {
  @ViewChild('validationEntity', { static: false })
  validationEntity!: DxValidationGroupComponent;
  @Input() entity: any = {};
  @Input() listData: any[] = [];
  @Input() state = 'detail';
  existName = false;
  allMaCap1 = [];
  listPermissionsInRole: any = [];
  allPermission = [];
  listPermissionsNotInRole: any = [];

  popupVisible = false;
  dxButtonConfig = dxButtonConfig;
  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private notificationService: NotificationService
  ) {
    this.validationAsync = this.validationAsync.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['listData']) {
      this.allMaCap1 = [
        {
          ID: null,
          cRoleName: '------',
          cRoleCode: '------',
          cParentId: '',
          cStatus: 1,
          cSTT: 1,
        },
        ...this.listData.filter(
          (x) =>
            x.cParentId == null ||
            x.cParentId === '00000000-0000-0000-0000-000000000000'
        ),
      ];
    }

    if (changes['entity']) {
      if (this.state != 'insert') {
        this.roleService
          .processCommand('ROLE_GET_PERMISSIONSINROLE', { ID: this.entity.ID })
          .subscribe((res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.listPermissionsInRole = res.ReturnData;
              this.listPermissionsNotInRole = this.allPermission
                .filter(
                  (x) =>
                    this.listPermissionsInRole.findIndex(
                      (el) => el.fkPermissionId == x.ID
                    ) < 0
                )
                .map((el) => ({ ...el, fkPermissionId: el.ID, check: false }));
            }
          });
      } else {
        this.listPermissionsInRole = [];
      }
    }
  }
  ngOnInit(): void {
    this.loadAllDanhMuc();
  }

  loadAllDanhMuc() {
    this.permissionService
      .processCommand('PERMISSION_LIST', {})
      .subscribe((res: any) => {
        if (res.ReturnStatus.Code === 0) {
          this.allPermission = res.ReturnData;
        }
      });
  }

  async validationAsync() {
    // const body = {
    //   ID: this.entity.ID ? this.entity.ID : 0,
    //   cRoleName: this.entity.
    // }
    // if(this.state != 'detail'){
    //   const value$ = this.roleService.checkName(body)
    //   let value!: any;
    //   value = await lastValueFrom(value$);
    //   if(value.Data==1){
    //     this.existName = false;
    //   } else {
    //     this.existName = true;
    //   }
    //   return value.Data==1;
    // } else {
    //   this.existName = false;
    //   return true;
    // }
  }
  openPermissionForm() {
    this.popupVisible = true;
  }

  savePermission() {
    let list = this.listPermissionsNotInRole
      .filter((el) => el.check)
      .map((el) => ({
        fkRoleId: this.entity.ID,
        fkPermissionId: el.fkPermissionId,
        cPermissionName: el.cPermissionName,
      }));

    this.roleService
      .processCommand('ROLE_ADD_PERMISSIONSINROLE', list)
      .subscribe((res: any) => {
        if (res.ReturnStatus.Code === 0) {
          this.popupVisible = false;
          let listAddID = res.ReturnData;
          this.listPermissionsNotInRole = this.listPermissionsNotInRole.filter(
            (x) =>
              listAddID.findIndex(
                (el) => x.fkPermissionId == el.fkPermissionId
              ) < 0
          );
          this.listPermissionsInRole = [
            ...this.listPermissionsInRole,
            ...listAddID,
          ];
        }
      });
  }

  // deletePermission (permissionID) {
  //   this.roleService.processCommand('ROLE_DELETE_PERMISSIONSINROLE', {  ID: permissionID })
  //     .subscribe(
  //       (res: any) => {
  //         if (res.ReturnStatus.Code === 0) {
  //           this.notificationService.showSuccess('Xoá thông tin thành công');
  //           this.listPermissionsInRole = this.listPermissionsInRole.filter(x => x.ID !== permissionID);
  //         }
  //       }
  //     )
  // }

  deletePermission(permissionID) {
    this.roleService
      .processCommand('ROLE_DELETE_PERMISSIONSINROLE', { ID: permissionID })
      .subscribe((res: any) => {
        if (res.ReturnStatus.Code === 0) {
          this.notificationService.showSuccess('Xoá thông tin thành công');
          let index = this.listPermissionsInRole.findIndex(
            (x) => x.ID == permissionID
          );
          let obj = clone(this.listPermissionsInRole[index]);

          this.listPermissionsInRole = this.listPermissionsInRole.filter(
            (x) => x.ID !== permissionID
          );
          this.listPermissionsNotInRole = [
            ...this.listPermissionsNotInRole,
            obj,
          ];
        }
      });
  }
}
