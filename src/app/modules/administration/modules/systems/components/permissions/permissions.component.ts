import { Component, DebugEventListener, OnInit, ViewChild } from '@angular/core';
import { clone, FunctionService, NotificationService, PermissionService, RoleService, SystemConstants, User } from 'src/app/shared';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
import { Permission, PermissionScreen, PermissionUpdateRequest, ResponseData } from 'src/app/shared/models';
import { FormPermissionDetailComponent } from './form/form-permission-detail.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class ActionsComponent  {
  @ViewChild('detail', { static: false }) detail!: FormPermissionDetailComponent;
  placeholderSearch = 'Nhập tên hành động ...';
  title = 'Danh sách hành động';
  optionsBtnFilter = {
    icon: 'find',
    type: 'default',
    visible: true,
    onClick: this.onFilter.bind(this)
  }
  dxButtonConfig = dxButtonConfig;

  isShowDetail = true;
  focusKey: any = 0;
 
  state: string = 'detail';
  autoNavigateToFocusedRow = true;
  loading = false;

  //pagination
  pageSize: number = PaginatorConfig.pageSize;
  pageSizes: number[] = PaginatorConfig.allowedPageSizes;
  pageIndex: number = 1;
  totalRows: number = 0;

  textSearch: string = '';

  //data
  allData: any[] = [];
  listData: any[] = [];
  currentEntity: any = {};
  user: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));

  constructor(
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.getInitial();
  }
  loadData() {
    this.loading = true;
    this.permissionService.processCommand('PERMISSION_LIST', { Keyword: this.textSearch }).subscribe({
      next: (response: any) => {
        if (response.ReturnStatus.Code == 0) {
          if (response.ReturnData.length > 0) {
            this.allData = response.ReturnData;
            this.paging();
            this.focusKey = this.listData[0].ID;
          } else {
            this.listData = [];
            this.focusKey = 0;
            this.currentEntity = {};
            setTimeout(() => {
              if (this.state != 'detail') {
                this.detail.validationEntity.instance.reset();
              }
            }, 10);
            this.state = 'detail';
          }
          this.totalRows = response.ReturnData.length;
        } else {
          this.notificationService.showError('Data loading error!');
          this.totalRows = 0;
        }
        this.loading = false;
      },
      error: _ => {
        this.notificationService.showError('System error occurred!');
        this.totalRows = 0;
        this.loading = false;
      }
    });
  }
  getInitial() {
    const paramsFromRouter = this.route.snapshot.queryParamMap;
    let queryParams: any = {};
    if (!paramsFromRouter.get('pageSize')) { queryParams.pageSize = this.pageSize.toString() };
    if (!paramsFromRouter.get('pageIndex')) { queryParams.pageIndex = this.pageIndex.toString() };
    if (!paramsFromRouter.get('textSearch')) { queryParams.textSearch = this.textSearch };
    this.router.navigate(['./administration/systems/actions'], { queryParams, queryParamsHandling: 'merge' }).then(() => {
      this.getParams();
      this.loadData();
    });
  }
  getParams() {
    const queryParams = this.route.snapshot.queryParamMap;
    const queryPageSize = queryParams.get('pageSize');
    const queryPageIndex = queryParams.get('pageIndex');
    const queryText = queryParams.get('textSearch');

    this.pageSize = queryPageSize && !isNaN(parseInt(queryPageSize, 10)) && PaginatorConfig.allowedPageSizes.includes(parseInt(queryPageSize, 10))
      ? parseInt(queryPageSize, 10)
      : PaginatorConfig.pageSize;
    this.pageIndex = queryPageIndex && parseInt(queryPageIndex, 10) > 0 ? parseInt(queryPageIndex, 10) : 1;
    this.textSearch = queryText && queryText.length > 0 ? queryText : '';
  }
  // pagination
  paging() {
    const fromIndex = this.pageSize * (this.pageIndex - 1);
    const toIndex = fromIndex + this.pageSize;
    this.listData = this.allData.slice(fromIndex, toIndex);
  }
  pageChanged(event: any) {
    if (this.totalRows > 0) {
      this.router.navigate(['./administration/systems/actions'], { queryParams: { pageIndex: event.page }, queryParamsHandling: 'merge' })
        .then(() => this.paging());
    }
  }
  pageSizeChanged(event: any) {
    if (this.totalRows > 0) {
      this.router.navigate(['./administration/systems/actions'], { queryParams: { pageSize: event.pageSize }, queryParamsHandling: 'merge' })
        .then(() => this.paging());
    }
  }
  onFilter() {
    this.router.navigate(['./administration/systems/actions'], { queryParams: { textSearch: this.textSearch }, queryParamsHandling: 'merge' })
      .then(() => this.loadData());
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



    if (this.state == 'insert') {
      this.permissionService.processCommand('PERMISSION_ADD', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.detail.entity.ID = res.ReturnData;
              this.listData.unshift(this.detail.entity);
              this.allData.unshift(this.detail.entity);
              this.focusKey = res.ReturnData.Data;
              this.totalRows++;
            } else {
              this.notificationService.showError('Unsuccessful!');
            }
          }
        )

    } else {
      this.permissionService.processCommand('PERMISSION_UPDATE', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.notificationService.showSuccess('Update successful!');
              const index1 = this.listData.findIndex(o => o.ID == body.ID)
              this.listData[index1] = this.detail.entity;
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
    this.notificationService.showConfirmation("Bạn có chắc chắn muốn xóa nhóm '" + name + "'?", () => {
      this.permissionService.processCommand('PERMISSION_DELETE', { ID: id }).subscribe({
        next: (response: any) => {
          if (response.ReturnStatus.Code == 0) {
            this.listData = this.listData.filter(o => o.ID != id);
            this.allData = this.allData.filter(o => o.ID != id);
            this.notificationService.showSuccess("Successfully deleted group '" + name + "'!");
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
