import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { RoleService, SystemConstants, clone } from 'src/app/shared';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  isActive: boolean = false;
  @Input() collapsed: boolean = true;
  showMenu: string = '';
  pushRightClass: string = '';
  functions: any[] = [];

  // Mẫu dữ liệu userSideBarInfo với cấu trúc 2 tầng
  sampleUserSideBarInfo = [
    {
      ID: '1',
      cRoleName: 'System Management',
      cIconCss: 'fa-cogs',
      cUrl: '/administration/system',
      cParentId: null,
      IsActive: false,
      expand: false,
      children: [
        {
          ID: '11',
          cRoleName: 'Dashboard',
          cIconCss: 'fa-dashboard',
          cUrl: '/administration/system/dashboard',
          cParentId: '1',
          IsActive: false
        },
        {
          ID: '12',
          cRoleName: 'Settings',
          cIconCss: 'fa-wrench',
          cUrl: '/administration/system/settings',
          cParentId: '1',
          IsActive: false
        },
        {
          ID: '13',
          cRoleName: 'Reports',
          cIconCss: 'fa-bar-chart',
          cUrl: '/administration/system/reports',
          cParentId: '1',
          IsActive: false
        }
      ]
    },
    {
      ID: '4',
      cRoleName: 'Categories Management',
      cIconCss: 'fa-folder',
      cUrl: '/administration/categories',
      cParentId: null,
      IsActive: false,
      expand: false,
      children: [
        {
          ID: '41',
          cRoleName: 'Topics',
          cIconCss: 'fa-list-alt',
          cUrl: '/administration/categories/topics',
          cParentId: '4',
          IsActive: false
        }
      ]
    },
    {
      ID: '2',
      cRoleName: 'Practice Exams',
      cIconCss: 'fa-file-text',
      cUrl: '/administration/exams',
      cParentId: null,
      IsActive: false,
      expand: false,
      children: [
        {
          ID: '21',
          cRoleName: 'Exam List',
          cIconCss: 'fa-list',
          cUrl: '/administration/exams/manage',
          cParentId: '2',
          IsActive: false
        },
      ]
    },
    {
      ID: '3',
      cRoleName: 'User Management',
      cIconCss: 'fa-users',
      cUrl: '/administration/users',
      cParentId: null,
      IsActive: false,
      expand: false,
      children: [
        {
          ID: '31',
          cRoleName: 'User List',
          cIconCss: 'fa-list',
          cUrl: '/administration/users/list',
          cParentId: '3',
          IsActive: false
        },
        {
          ID: '32',
          cRoleName: 'Add User',
          cIconCss: 'fa-user-plus',
          cUrl: '/administration/users/add',
          cParentId: '3',
          IsActive: false
        },
        {
          ID: '33',
          cRoleName: 'Roles & Permissions',
          cIconCss: 'fa-lock',
          cUrl: '/administration/users/roles',
          cParentId: '3',
          IsActive: false
        }
      ]
    }
  ];

  userSideBarInfo: any = [];
  user: any = JSON.parse(
    localStorage.getItem(SystemConstants.CURRENT_USER) as string
  );
  @Output() collapsedEvent = new EventEmitter<boolean>();

  constructor(public router: Router, public roleService: RoleService) {
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
    this.showMenu = localStorage.getItem(SystemConstants.SIDEBAR_ID)??'';

    this.userSideBarInfo = this.sampleUserSideBarInfo;

    // this.roleService
    //   .processCommand('USER_GET_SIDEBAR', {})
    //   .subscribe((res: any) => {
    //     if (res.ReturnStatus.Code === 1) {
    //       let data = res.ReturnData.map((el) => {
    //         if (el.cParentId == '00000000-0000-0000-0000-000000000000') {
    //           return { ...el, cParentId: null, IsActive: false };
    //         } else {
    //           return el;
    //         }
    //       });

    //       let roleCap1 = data
    //         .filter((x) => x.cParentId == null)
    //         .map((el) => ({ ...el, children: [], expand: false }));
    //       let roleCap2 = data.filter((x) => x.cParentId != null);

    //       for (let i = 0; i < roleCap1.length; i++) {
    //         for (let j = 0; j < roleCap2.length; j++) {
    //           if (roleCap2[j].cParentId == roleCap1[i].ID) {
    //             roleCap1[i].children.push(roleCap2[j]);
    //           }
    //         }
    //       }
    //       let sideBarInfo = roleCap1;

    //       let roles = this.user.Roles;
    //       this.userSideBarInfo = [];

    //       sideBarInfo.forEach((fun: any) => {
    //         //fun.cRoleCode
    //         // tính toán role cấp 1
    //         // trường hợp role cấp 1 không có quyền display -> next
    //         let indexRoleCap1 = roles.findIndex(
    //           (r) =>
    //             r.cRoleCode == fun.cRoleCode &&
    //             r.permissions.findIndex(
    //               (per) => per.cPermissionCode === 'DISPLAY'
    //             ) > -1
    //         );
    //         if (indexRoleCap1 > -1) {
    //           // tính toán đối với role cấp 2
    //           let funWithoutChild = { ...fun, children: [] };

    //           fun.children.forEach((funLevel2: any) => {
    //             let roleCode = funLevel2.cRoleCode;

    //             roles.forEach((role: any) => {
    //               if (
    //                 role.cRoleCode == roleCode &&
    //                 role.permissions.findIndex(
    //                   (per: any) => per.cPermissionCode === 'DISPLAY'
    //                 ) > -1
    //               ) {
    //                 funWithoutChild.children.push(funLevel2);
    //               }
    //             });
    //           });

    //           this.userSideBarInfo.push(funWithoutChild);
    //         }
    //       });

    //       this.functions = this.userSideBarInfo;
    //       this.isActive = false;
    //       this.collapsed = false;
    //       this.pushRightClass = 'push-right';
    //       this.toggleCollapsed();
    //       const activeItem = data.filter(o => o.ID === this.showMenu)[0];
    //       this.activate(activeItem);
    //     }
    //   });
  }

  checkActive(item): boolean {
    if(item.children?.length > 0) {
      for(let i=0; i<item.children.length; i++) {
        if(this.showMenu === item.children[i].ID) {
          return true;
        }
      }
    } else {
      if(this.showMenu === item.ID) {
        return true;
      }
    }
    return false;
  }

  checkExpand(item): boolean {
    if(item.children?.length > 0) {
      for(let i=0; i<item.children.length; i++) {
        if(this.showMenu === item.children[i].ID) {
          return true;
        }
      }
    }
    return false;
  }

  eventCalled() {
    this.isActive = !this.isActive;
  }

  activate(item: any) {
    if(item?.children?.length > 0) {
      item.expand = !item.expand;
    } else if(item) {
      this.showMenu = item.ID;
      localStorage.setItem(SystemConstants.SIDEBAR_ID, this.showMenu);
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }

  isToggled(): boolean {
    const dom: Element | null = document.querySelector('body');
    return dom != null ? dom.classList.contains(this.pushRightClass) : false;
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }

  onLoggedout() {
    localStorage.removeItem('isLoggedin');
  }
}
