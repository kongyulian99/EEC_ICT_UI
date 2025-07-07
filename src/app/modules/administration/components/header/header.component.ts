import { ModalChangePasswordComponent } from './../modal-change-password/modal-change-password.component';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AuthenService,
  NotificationService,
  RoleService,
  SystemConstants,
  User,
} from 'src/app/shared';
import { SignalrService } from 'src/app/shared/services/signalr.services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // @ViewChild(ModalChangePasswordComponent,{static: true}) comptChangePassword!: ModalChangePasswordComponent;
  public pushRightClass: string = '';
  public user: any; // Changed from User to any to accommodate additional properties
  @Input() isAdmin: boolean = false;
  public isNavbarCollapsed = true;

  countThongBaoChiDao = 0;
  listThongBaoChuaXem: any = [];

  userSideBarInfo: any[] = [];

  // Mẫu dữ liệu để test
  sampleUserSideBarInfo = [
    {
      ID: '1', cRoleName: 'System Management', cIconCss: 'fa-cogs', cUrl: null, children: [
        { ID: '14', cRoleName: 'Users', cIconCss: 'fa-users', cUrl: '/administration/systems/users' }
      ]
    },
    {
      ID: '4', cRoleName: 'Categories', cIconCss: 'fa-folder', cUrl: null, children: [
        { ID: '41', cRoleName: 'Topics', cIconCss: 'fa-list-alt', cUrl: '/administration/categories/topics' }
      ]
    },
    {
      ID: '2', cRoleName: 'Exams', cIconCss: 'fa-file-text', cUrl: '/administration/exams/manage'
    },
    {
      ID: '5', cRoleName: 'Dashboard', cIconCss: 'fa-bar-chart', cUrl: '/administration/dashboard'
    }
  ];

  constructor(
    public router: Router,
    private modalService: NgbModal,
    private roleService: RoleService
  ) {
    this.router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        window.innerWidth <= 992 &&
        this.isToggled()
      ) {
        this.toggleSidebar();
      }
    });
  }

  ngOnInit() {
    this.pushRightClass = 'push-right';
    this.user = JSON.parse(
      localStorage.getItem(SystemConstants.CURRENT_USER) as string
    );

    // Thêm email nếu chưa có
    if (this.user && !this.user.User_Email) {
      this.user.User_Email = 'admin@igcse-hub.com';
    }

    // Sử dụng dữ liệu mẫu cho mục đích phát triển
    this.userSideBarInfo = this.sampleUserSideBarInfo;
    // NOTE: Bạn có thể bỏ comment đoạn code bên dưới để lấy dữ liệu menu từ API
    /*
    this.roleService.processCommand('USER_GET_SIDEBAR', {}).subscribe((res: any) => {
      if (res.ReturnStatus.Code === 1) {
        let data = res.ReturnData.map(el => el.cParentId == '00000000-0000-0000-0000-000000000000' ? { ...el, cParentId: null } : el);
        let roleCap1 = data.filter(x => x.cParentId == null).map(el => ({ ...el, children: [] }));
        let roleCap2 = data.filter(x => x.cParentId != null);
        roleCap1.forEach(parent => {
          parent.children = roleCap2.filter(child => child.cParentId == parent.ID);
        });
        this.userSideBarInfo = roleCap1;
      }
    });
    */
  }

  // Lấy chữ cái đầu tiên của họ và tên để hiển thị trong avatar
  getInitials(fullName: string): string {
    if (!fullName) return 'U';

    const names = fullName.split(' ').filter(n => n.length > 0);
    if (names.length === 0) return 'U';

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  isToggled(): boolean {
    const dom: Element | null = document.querySelector('body');
    return dom != null ? dom.classList.contains(this.pushRightClass) : false;
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
    this.onToggle.emit();
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }
  onChangePassword() {
    this.modalService.open(ModalChangePasswordComponent, { backdrop: 'static', animation: false });
  }

  onLoggedout() {
    localStorage.removeItem(SystemConstants.CURRENT_USER);
    localStorage.removeItem(SystemConstants.SIDEBAR_ID);
  }

  @Output() onToggle = new EventEmitter();

  toggleCollapseSidebar() {
    this.onToggle.emit();
  }
}
