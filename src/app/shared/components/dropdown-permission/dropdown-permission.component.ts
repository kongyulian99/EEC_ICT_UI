import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DxTreeViewComponent } from 'devextreme-angular';
import { SystemConstants } from '../../constants';
import { PermissionService } from '../../services/permission.service';
import { finalize } from 'rxjs';
import { NotificationService } from '../../services';

@Component({
  selector: 'app-dropdown-permission',
  templateUrl: './dropdown-permission.component.html',
})
export class DropDownPermission implements OnInit {
  @ViewChild(DxTreeViewComponent, { static: false }) treeView: any;
  @Input() permissionCode: any = '';
  // @Input() items: any = [];
  @Input() readOnly = false;
  @Input() isValidate = false;
  @Input() stylingMode = 'outlined';
  @Input() label = '';
  @Input() showAll = false;
  isTreeBoxOpened = false;

  filterPermission: any = '';

  // lstPermissionFilter: any = [];
  // configFilterPermission: any = {};

  user: any = {};
  items: any = [];

  @Output() permissionCodeChange = new EventEmitter<any>();
  constructor(
    private permissionService: PermissionService,
    private ref: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(
      localStorage.getItem(SystemConstants.CURRENT_USER) as string
    );
    this.loadData();
  }

  loadData() {
    this.permissionService.processCommand('PERMISSION_LIST', { Keyword: '' })
    // .pipe(
    //   finalize(() => {
    //     this.loading = false;
    //   })
    // )
    .subscribe(
      (response: any) => {
        if (response.ReturnStatus.Code == 0) {
          this.items = response.ReturnData;
          if(this.showAll) {
            this.items.unshift({cPermissionCode: '', cPermissionName: 'All'});
          }
        } else {
          this.notificationService.showError('Data loading error!');
        }
      },
      (_: any) => {
        this.notificationService.showError('System error occurred!');
      }
    );
  }

  onValueChanged(event) {
    this.permissionCodeChange.emit(event.value);
  }
}
