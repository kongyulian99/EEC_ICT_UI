import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SystemConstants } from 'src/app/shared/constants/systems.constant';
import { User } from 'src/app/shared';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdministrationComponent implements OnInit {
  @ViewChild('sidebar') sidebar: SidebarComponent;
  collapedSideBar: boolean = true;
  isAdmin: boolean = false;
  currentUser: User;

  constructor() {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    try {
      this.currentUser = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
      this.isAdmin = this.currentUser.Is_Admin;
    } catch (error) {
      console.error('Error loading user info:', error);
      this.isAdmin = false;
    }
  }

  receiveCollapsed($event: any) {
    this.collapedSideBar = $event;
  }
}
