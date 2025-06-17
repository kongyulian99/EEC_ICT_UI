import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemConstants } from 'src/app/shared/constants/systems.constant';

@Component({
  selector: 'app-header-student',
  templateUrl: './header-student.component.html',
  styleUrls: ['./header-student.component.scss']
})
export class HeaderStudentComponent implements OnInit {
  userFullName: string = '';

  constructor(
    private router: Router
  ) { }

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
