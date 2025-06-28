import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemConstants } from 'src/app/shared/constants/systems.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header-student',
  templateUrl: './header-student.component.html',
  styleUrls: ['./header-student.component.scss']
})
export class HeaderStudentComponent implements OnInit {
  userFullName: string = '';
  userAvatar: string = '';

  constructor(
    private router: Router,
    private modalService: NgbModal
  ) {
    // Get user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) || '{}');
    this.userFullName = currentUser.Full_Name || 'User';

    // Get avatar if available
    const userObj: any = currentUser;
    this.userAvatar = userObj.Avatar || '';
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    try {
      const userInfo = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
      if (userInfo) {
        this.userFullName = userInfo.Full_Name || 'Học sinh';
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      this.userFullName = 'Học sinh';
    }
  }

  onChangePassword(): void {
    this.router.navigate(['/student/change-password']);
  }

  onLoggedout(): void {
    localStorage.removeItem(SystemConstants.CURRENT_USER);
    localStorage.removeItem(SystemConstants.SIDEBAR_ID);
    this.router.navigate(['/login']);
  }
}
