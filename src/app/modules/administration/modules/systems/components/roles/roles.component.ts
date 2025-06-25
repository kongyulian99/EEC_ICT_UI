import { FormRoleDetailComponent } from './form-role-detail/form-role-detail.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { clone, NotificationService, RoleService, SystemConstants, User } from 'src/app/shared';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseData } from 'src/app/shared/models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  @ViewChild('detail', { static: false }) detail!: FormRoleDetailComponent;
  placeholderSearch = 'Enter function name...';
  title = 'Function List';

  dxButtonConfig = dxButtonConfig;

  isShowDetail = true;
  focusKey: any = 0;
  state: string = 'detail';
  autoNavigateToFocusedRow = true;
  loading = false;

  //pagination

  textSearch: string = '';

  //data
  allData: any[] = [];
  currentEntity: any = {};
  user: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));

  constructor(
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.loading = true;
    this.roleService.processCommand('ROLE_LIST', {}).subscribe({
      next: (response: any) => {
        if (response.ReturnStatus.Code == 1) {
          if (response.ReturnData.length > 0) {
            this.allData = response.ReturnData.map(el => {
              if (el.cParentId == '00000000-0000-0000-0000-000000000000') return { ...el, cParentId: null}
              else return el;
            });

            this.focusKey = this.allData[0].ID;
          } else {
            this.allData = [];
            this.focusKey = 0;
            this.currentEntity = {};
            this.state = 'detail';
          }
        } else {
          this.notificationService.showError('Data loading error!');
        }
        this.loading = false;
      },
      error: _ => {
        this.notificationService.showError('System error occurred!');
        this.loading = false;
      }
    });
  }



  add() {
    this.detail.entity = {};
    this.state = 'insert';
    this.detail.validationEntity.instance.reset();
  }
  edit() {
    this.state = 'edit';
  }
  cancel() {
    this.detail.entity = clone(this.currentEntity);
    this.state = 'detail';
  }
  save() {
    const check = this.detail.validationEntity.instance.validate();
    if (!check.isValid || this.detail.existName) {
      this.notificationService.showError('Invalid input information!');
      return;
    }
    const body = clone(this.detail.entity);

    if (body.cParentId == null) {
      body.cParentId = '00000000-0000-0000-0000-000000000000';
    }


    if (this.state == 'insert') {
      body.cStatus = 1;
      this.roleService.processCommand('ROLE_ADD', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.detail.entity.ID = res.ReturnData;
              this.allData.unshift(this.detail.entity);
              this.focusKey = res.ReturnData.Data;
              this.state = 'detail';
            } else {
              this.notificationService.showError('Unsuccessful!');
            }
          }
        )

    } else {
      this.roleService.processCommand('ROLE_UPDATE', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.notificationService.showSuccess('Updated successfully!');
              const index2 = this.allData.findIndex(o => o.ID == body.ID)
              this.allData[index2] = this.detail.entity;
              this.state = 'detail';
            } else {
              this.notificationService.showError('Unsuccessful!');
            }
          }
        )
    }
  }
  delete(id: number, name: string) {
    this.notificationService.showConfirmation("Are you sure you want to delete function '" + name + "'?", () => {
      this.roleService.processCommand('ROLE_DELETE', { ID: id }).subscribe({
        next: (response: any) => {
          if (response.ReturnStatus.Code == 0) {
            this.allData = this.allData.filter(o => o.ID != id);
            this.notificationService.showSuccess("Successfully deleted function '" + name + "'!");
          } else {
            this.notificationService.showError('Unsuccessful!');
          }
        },
        error: _ => {
          this.notificationService.showError('System error!')
        }
      })
    })
  }

  toggleDetail() {
    this.isShowDetail = !this.isShowDetail;
  }
  onFocusedRowChanged(e: any) {
    this.currentEntity = e.row.data;
    this.state = 'detail'
  }

}
