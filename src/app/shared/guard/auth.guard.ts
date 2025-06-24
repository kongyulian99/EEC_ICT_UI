import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenService } from '../services/auth.service';
import { SystemConstants } from '../constants/systems.constant';
// import * as jwt_decode from 'jwt-decode';
import jwt_decode from "jwt-decode";

@Injectable()
export class AuthGuard {

  constructor(private router: Router, private authService: AuthenService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Kiểm tra xem user đã đăng nhập chưa
    if (this.authService.isAuthenticated()) {
      // Lấy thông tin người dùng từ localStorage
      const user: any = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);

      // Lấy route data
      const targetModule = route.data['targetModule'] as string ?? '';

      // Kiểm tra quyền admin
      const isAdmin = user.Is_Admin === true;

      // Xử lý chuyển hướng dựa vào quyền và module đích
      if (targetModule) {
        // Nếu đã chỉ định cụ thể module cần truy cập
        if (targetModule === 'admin' && !isAdmin) {
          // Nếu cố gắng truy cập module admin nhưng không có quyền
          this.router.navigate(['/student/dashboard']);
          return false;
        } else if (targetModule === 'student' && isAdmin) {
          // Nếu admin cố gắng truy cập module student
          // Vẫn cho phép - admin có thể xem module student
          return true;
        }
        // Các trường hợp khác - cho phép truy cập
        return true;
      } else {
        // Nếu không chỉ định module cụ thể, chuyển hướng về module phù hợp
        if (isAdmin) {
          // Nếu URL hiện tại không bắt đầu bằng /administration thì chuyển hướng
          if (!state.url.startsWith('/administration')) {
            this.router.navigate(['/administration/dashboard']);
            return false;
          }
        } else {
          // Nếu URL hiện tại không bắt đầu bằng /student thì chuyển hướng
          if (!state.url.startsWith('/student')) {
            this.router.navigate(['/student/dashboard']);
            return false;
          }
        }
        return true;
      }
    } else {
      // Nếu chưa đăng nhập, chuyển hướng đến trang login
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
  }
}