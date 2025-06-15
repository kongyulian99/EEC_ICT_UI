import { Component, OnInit, ViewChild } from '@angular/core';
import { clone, NotificationService, SystemConstants, User, UserService } from 'src/app/shared';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseData } from 'src/app/shared/models';
import { FormUserDetailComponent } from './form-user-detail/form-user-detail.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  @ViewChild('detail', { static: false }) detail!: FormUserDetailComponent;
  placeholderSearch = 'Nhập tên người dùng ...';
  title = 'Danh sách người dùng';
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
  maDonVi : any = '';
  //data
  allData: any[] = [];
  listData: any[] = [];
  currentEntity: any = {};
  user: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));

  constructor(
    private userService: UserService,
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
    this.userService.processCommand('USER_LIST', { Keyword: this.textSearch, MaDonVi: this.maDonVi }).subscribe({
      next: (response: any) => {
        if (response.ReturnStatus.Code == 1) {
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
          this.notificationService.showError('Dữ liệu tải lỗi!');
          this.totalRows = 0;
        }
        this.loading = false;
      },
      error: _ => {
        this.notificationService.showError('Hệ thống xảy ra lỗi!');
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
    if (!paramsFromRouter.get('maDonVi')) { queryParams.maDonVi = this.maDonVi };
    this.router.navigate(['./administration/systems/users'], { queryParams, queryParamsHandling: 'merge' }).then(() => {
      this.getParams();
      this.loadData();
    });
  }
  getParams() {
    const queryParams = this.route.snapshot.queryParamMap;
    const queryPageSize = queryParams.get('pageSize');
    const queryPageIndex = queryParams.get('pageIndex');
    const queryText = queryParams.get('textSearch');
    const queryMaDonVi = queryParams.get('maDonVi');

    this.pageSize = queryPageSize && !isNaN(parseInt(queryPageSize, 10)) && PaginatorConfig.allowedPageSizes.includes(parseInt(queryPageSize, 10))
      ? parseInt(queryPageSize, 10)
      : PaginatorConfig.pageSize;
    this.pageIndex = queryPageIndex && parseInt(queryPageIndex, 10) > 0 ? parseInt(queryPageIndex, 10) : 1;
    this.textSearch = queryText && queryText.length > 0 ? queryText : '';
    this.maDonVi = queryMaDonVi && queryMaDonVi.length > 0 ? queryMaDonVi : '';
  }
  // pagination
  paging() {
    const fromIndex = this.pageSize * (this.pageIndex - 1);
    const toIndex = fromIndex + this.pageSize;
    this.listData = this.allData.slice(fromIndex, toIndex);
  }
  pageChanged(event: any) {
    if (this.totalRows > 0) {
      this.router.navigate(['./administration/systems/users'], { queryParams: { pageIndex: event.page }, queryParamsHandling: 'merge' })
        .then(() => this.paging());
    }
  }
  pageSizeChanged(event: any) {
    if (this.totalRows > 0) {
      this.router.navigate(['./administration/systems/users'], { queryParams: { pageSize: event.pageSize, pageIndex: 1 }, queryParamsHandling: 'merge' })
        .then(() => this.paging());
    }
  }
  onFilter() {
    this.router.navigate(['./administration/systems/users'], { queryParams: { textSearch: this.textSearch, maDonVi: this.maDonVi, pageIndex: 1 }, queryParamsHandling: 'merge' })
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
      this.notificationService.showError('Thông tin nhập không hợp lệ!');
      return;
    }
    const body = clone({
      ...this.detail.entity,
      DonViQuanLyTrucTiep: this.detail.entity.DonViQuanLyTrucTiep.join(',')
    });


    if (this.state == 'insert') {
      let salt = this.makeSalt(8);
      body.cSalt = salt;
      body.cStatus = 1;
      this.userService.processCommand('USER_ADD', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.detail.entity.ID = res.ReturnData;
              this.listData.unshift(this.detail.entity);
              this.allData.unshift(this.detail.entity);
              this.focusKey = res.ReturnData.Data;
              this.state = 'edit';
              this.totalRows++;
            } else {
              this.notificationService.showError('Không thành công!');
            }
          }
        )

    } else {
      this.userService.processCommand('USER_UPDATE', body)
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.notificationService.showSuccess('Cập nhật thành công!');
              const index1 = this.listData.findIndex(o => o.ID == body.ID)
              this.listData[index1] = this.detail.entity;
              const index2 = this.allData.findIndex(o => o.ID == body.ID)
              this.allData[index2] = this.detail.entity;
              this.state = 'detail';
            } else {
              this.notificationService.showError('Không thành công!');
            }
          }
        )
    }
  }
  delete(id: number, name: string) {
    this.notificationService.showConfirmation("Bạn có chắc chắn muốn xóa user '" + name + "'?", () => {
      this.userService.processCommand('USER_DELETE', { ID: id }).subscribe({
        next: (response: any) => {
          if (response.ReturnStatus.Code == 0) {
            this.listData = this.listData.filter(o => o.ID != id);
            this.allData = this.allData.filter(o => o.ID != id);
            this.notificationService.showSuccess("Đã xóa thành công user '" + name + "'!");
          } else {
            this.notificationService.showError('Không thành công!');
          }
        },
        error: _ => {
          this.notificationService.showError('Lỗi hệ thống!')
        }
      })
    })
  }

  toggleDetail() {
    this.isShowDetail = !this.isShowDetail;
  }
  onFocusedRowChanged(e: any) {
    this.currentEntity = this.listData.length > 0 ? clone(this.listData.filter(x => x.ID == e)[0]) : {};
    this.state = 'detail'
  }




  makeSalt(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }


  resetPassword (username) {
    this.notificationService.showConfirmation('Chắc chắn thay đổi mật khẩu người dùng ' + username + ' về mật khẩu mặc định Abc123?', () => {
      this.userService.processCommand('USER_RESET_PASSWORD', { cUserName: username })
        .subscribe(
          (res: any) => {
            if (res.ReturnStatus.Code === 0) {
              this.notificationService.showSuccess('Thay đổi mật khẩu thành công về mật khẩu Abc123 thành công');
            }
          }
        )
    })
  }
}
