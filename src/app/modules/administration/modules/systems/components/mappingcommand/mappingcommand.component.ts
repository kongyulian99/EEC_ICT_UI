import { FormMappingCommandDetailComponent } from './form/form-mappingcommand-detail.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  clone,
  NotificationService,
  SystemConstants,
  User,
} from 'src/app/shared';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseData } from 'src/app/shared/models';
import { MappingCommandService } from 'src/app/shared/services/mappingcommand.service';

@Component({
  selector: 'app-mappingcommand',
  templateUrl: './mappingcommand.component.html',
  styleUrls: ['./mappingcommand.component.scss'],
})
export class MappingCommandComponent implements OnInit {
  @ViewChild('detail', { static: false })
  detail!: FormMappingCommandDetailComponent;
  placeholderSearch = 'Nhập từ khoá ...';
  title = 'Danh sách MappingCommand';
  optionsBtnFilter = {
    icon: 'find',
    type: 'default',
    visible: true,
    onClick: this.onFilter.bind(this),
  };
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
  permissionCode = '';

  //data
  allData: any[] = [];
  currentEntity: any = {};
  user: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));

  constructor(
    private mappingcommandService: MappingCommandService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.loading = true;
    this.mappingcommandService
      .processCommand('MAPPING_COMMAND_GET_LIST', {
        Keyword: this.textSearch,
        PageIndex: this.pageIndex,
        PageSize: this.pageSize,
        PermissionCode: this.permissionCode
      })
      .subscribe({
        next: (response: any) => {
          if (response.ReturnStatus.Code == 0) {
            if (response.ReturnData.length > 0) {
              this.allData = response.ReturnData;
              this.focusKey = this.allData[0].ID;
              this.totalRows =
                this.allData.length > 0 ? this.allData[0].TotalRows : 0;
            } else {
              this.allData = [];
              this.focusKey = 0;
              this.currentEntity = {};
              setTimeout(() => {
                if (this.state != 'detail') {
                  this.detail.validationEntity.instance.reset();
                }
              }, 10);
              this.state = 'detail';
              this.totalRows = 0;
            }
          } else {
            this.notificationService.showError('Data loading error!');
            this.totalRows = 0;
          }
          this.loading = false;
        },
        error: (_) => {
          this.notificationService.showError('System error occurred!');
          this.totalRows = 0;
          this.loading = false;
        },
      });
  }

  // pagination
  handlePageChange(event: any) {
    // redirect to this page with query params
    this.pageIndex = event.page;
    this.loadData();
  }

  handlePageSizeChange(event: any) {
    // redirect to this page with query params
    this.pageSize = event.pageSize;
    this.pageIndex = 1;
    this.loadData();
  }
  onFilter() {
    this.loadData();
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
      this.mappingcommandService
        .processCommand('MAPPING_COMMAND_ADD', body)
        .subscribe((res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.detail.entity.ID = res.ReturnData;
            this.allData.unshift(this.detail.entity);
            this.focusKey = res.ReturnData.Data;
            this.totalRows++;
            this.state = 'detail';
          } else {
            this.notificationService.showError('Unsuccessful!');
          }
        });
    } else {
      this.mappingcommandService
        .processCommand('MAPPING_COMMAND_UPDATE', body)
        .subscribe((res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.notificationService.showSuccess('Update successful!');
            const index2 = this.allData.findIndex((o) => o.ID == body.ID);
            this.allData[index2] = this.detail.entity;
            this.state = 'detail';
          } else {
            this.notificationService.showError('Unsuccessful!');
          }
        });
    }
  }
  delete(id: number, name: string) {
    this.notificationService.showConfirmation(
      "Bạn có chắc chắn muốn xóa nhóm '" + name + "'?",
      () => {
        this.mappingcommandService
          .processCommand('MAPPING_COMMAND_DELETE', { ID: id })
          .subscribe({
            next: (response: any) => {
              if (response.ReturnStatus.Code == 0) {
                this.allData = this.allData.filter((o) => o.ID != id);
                this.notificationService.showSuccess(
                  "Successfully deleted group '" + name + "'!"
                );
              } else {
                this.notificationService.showError('Unsuccessful!');
              }
            },
            error: (_) => {
              this.notificationService.showError('System error!');
            },
          });
      }
    );
  }

  toggleDetail() {
    this.isShowDetail = !this.isShowDetail;
  }
  onFocusedRowChanged(e: any) {
    this.currentEntity = e.row.data;
    this.state = 'detail';
  }
}
