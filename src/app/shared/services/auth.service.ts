import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { SystemConstants } from '../constants/systems.constant';
import { User, UserLoginPayload } from '../interfaces/user.interface';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root' // ADDED providedIn root here.
})
export class AuthenService extends BaseService {
  private httpOptions = new HttpHeaders();
  private user!: User;

  constructor(private http: HttpClient,
    private notificationService: NotificationService,
    private router: Router
    ) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }
  login(user: UserLoginPayload) {
    // const body = {
    //   UserName: username,
    //   Password: password
    // };
    console.log(environment.apiUrl);
    return this.http.post<ResponseData>(`${environment.apiUrl}/api/Auth/Login`, user, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  refreshToken(refresh: string) {
    return this.http
    .post<ResponseData>(`${environment.apiUrl}/api/Auth/refreshtoken`, { RefrestToken: refresh },
      { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
      // .pipe(map((response: ResponseData)=>{
      //   if(response.ReturnStatus.Code != 1){
      //     this.notificationService.showError('Hết phiên đăng nhập!');
      //       this.router.navigate(['/login']);
      //   }
      //   return response;
      // }))
  }


  isAuthenticated() {
    this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
    if (this.user) {
      return true;
    } else {
      return false;
    }
  }

  // logout() {
  //   const RefreshToken = this.user.refresh_token + SystemConstants.KEY_SECRET;
  //   return this.http.post<ResponseData>(`${environment.apiUrl}/api/users/logout/${RefreshToken}`,
  //     { headers: this.httpOptions })
  //     .pipe(catchError(this.handleError));
  // }

  get authorizationHeaderValue(): string | null {
    const currentUser = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
    if (currentUser) {
      return `${currentUser.AccessToken}`;
    }
    return null;
  }
}
