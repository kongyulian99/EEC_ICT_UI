import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { BaseService } from './base.service';
import { SystemConstants } from '../constants/systems.constant';
import { User, UserLoginPayload, ReturnBaseInfo, AuthResponseInfo, GoogleLoginRequest } from '../interfaces/user.interface';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenService extends BaseService {
  private httpOptions = new HttpHeaders();
  private user!: User;
  private googleClientId = '1038360422975-97chu06kf2forivi1sohqm9ng9t4h9a6.apps.googleusercontent.com'; // Client ID Google

  constructor(private http: HttpClient,
    private notificationService: NotificationService,
    private router: Router
  ) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  login(user: UserLoginPayload) {
    console.log(environment.apiUrl);
    return this.http.post<ResponseData>(`${environment.apiUrl}/api/Auth/Login`, user, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  // Phương thức khởi tạo đăng nhập Google bằng OAuth 2.0 sử dụng chuyển hướng
  loginWithGoogle(): void {
    try {
      console.log('Bắt đầu đăng nhập Google bằng chuyển hướng...');

      // Các tham số cho OAuth 2.0
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      console.log('Redirect URI:', redirectUri);
      const scope = encodeURIComponent('email profile');
      const responseType = 'token id_token';
      const state = 'google_auth'; // Thêm state để nhận dạng callback

      // Sử dụng prompt=select_account để luôn hiển thị màn hình chọn tài khoản
      const oauthURL = `https://accounts.google.com/o/oauth2/auth?client_id=${this.googleClientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=select_account&state=${state}`;

      console.log('Chuyển hướng đến URL OAuth:', oauthURL);

      // Chuyển hướng trực tiếp đến trang đăng nhập Google
      window.location.href = oauthURL;
    } catch (error) {
      console.error('Lỗi khi chuyển hướng đến trang đăng nhập Google:', error);
      this.notificationService.showError('Không thể khởi tạo đăng nhập Google');
      // Dispatch sự kiện thất bại
      window.dispatchEvent(new CustomEvent('auth-failure'));
    }
  }

  // Xử lý callback từ Google sau khi chuyển hướng về
  handleGoogleRedirect(): boolean {
    console.log('Kiểm tra URL callback từ Google:', window.location.href);

    // Kiểm tra xem URL hiện tại có chứa access_token hoặc id_token trong hash
    const hash = window.location.hash.substring(1);

    // Kiểm tra query params cho state (để nhận dạng là callback từ Google)
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);
    const state = searchParams.get('state');

    console.log('Hash:', hash);
    console.log('Search:', search);
    console.log('State:', state);

    // Kiểm tra xem có phải là callback từ Google không (dựa vào hash và state)
    if (hash && (hash.includes('access_token=') || hash.includes('id_token='))) {
      console.log('Nhận được callback từ Google với hash:', hash);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');
      const callbackState = params.get('state');

      // Kiểm tra state nếu có (đảm bảo đây là callback của chúng ta)
      if (callbackState === 'google_auth' || !callbackState) {
        if (idToken || accessToken) {
          // Ưu tiên sử dụng idToken vì API backend yêu cầu idToken
          const tokenToUse = idToken || accessToken || '';
          console.log('Token nhận được từ Google:', tokenToUse.substring(0, 20) + '...');

          // Xử lý đăng nhập với token nhận được
          this.processGoogleLogin(tokenToUse);

          // Xóa hash từ URL để tránh đăng nhập lại nếu refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
      }
    }

    // Trường hợp đặc biệt: kiểm tra query string có chứa state=google_auth không
    // Đây là trường hợp Google chuyển hướng về với state nhưng token không nằm trong hash
    if (state === 'google_auth' && window.location.pathname.includes('/login')) {
      console.log('Nhận được callback từ Google với state nhưng không có hash');
      // Trong trường hợp này, có thể Google đã thêm token vào returnUrl
      // Xử lý như trong phiên bản trước
      const returnUrl = searchParams.get('returnUrl');

      if (returnUrl && returnUrl.includes('#access_token=')) {
        console.log('Nhận được token trong returnUrl:', returnUrl);

        // Trích xuất phần hash từ returnUrl
        const hashPartIndex = returnUrl.indexOf('#');
        if (hashPartIndex !== -1) {
          const hashPart = returnUrl.substring(hashPartIndex + 1);
          console.log('Hash part extracted:', hashPart);

          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          const idToken = params.get('id_token');

          if (idToken || accessToken) {
            // Ưu tiên sử dụng idToken vì API backend yêu cầu idToken
            const tokenToUse = idToken || accessToken || '';
            console.log('Token nhận được từ Google (returnUrl):', tokenToUse.substring(0, 20) + '...');

            // Xử lý đăng nhập với token nhận được
            this.processGoogleLogin(tokenToUse);

            // Xóa query params từ URL để tránh đăng nhập lại nếu refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
          }
        }
      }
    }

    return false;
  }

  // Xử lý token từ Google và gửi đến API backend
  processGoogleLogin(idToken: string): void {
    console.log('Bắt đầu xử lý đăng nhập Google với token:', idToken.substring(0, 20) + '...');
    const body: GoogleLoginRequest = { IdToken: idToken };

    // Log thông tin request trước khi gửi
    console.log('Gửi request đến API:', `${environment.apiUrl}/api/Auth/google-login`);
    console.log('Body request:', body);

    // Gửi request đến API
    this.http.post<ReturnBaseInfo<AuthResponseInfo>>(
      `${environment.apiUrl}/api/Auth/google-login`,
      body,
      { headers: this.httpOptions }
    )
    .pipe(
      catchError((error) => {
        console.error('API Error:', error);
        this.notificationService.showError('Đã xảy ra lỗi khi gọi API đăng nhập Google: ' + (error.message || 'Không xác định'));
        window.dispatchEvent(new CustomEvent('auth-failure'));
        return this.handleError(error);
      })
    )
    .subscribe({
      next: (response) => {
        console.log('API Response:', response);

        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          // Lưu thông tin người dùng vào localStorage
          localStorage.setItem(SystemConstants.CURRENT_USER, JSON.stringify(response.ReturnData));
          this.notificationService.showSuccess('Đăng nhập bằng Google thành công!');

          // Chuyển hướng dựa trên vai trò
          const user = response.ReturnData;
          console.log('User data received:', user);

          // Chuyển hướng ngay lập tức
          if (user.Is_Admin) {
            this.router.navigate(['administration']);
          } else {
            this.router.navigate(['student']);
          }

          // Dispatch sự kiện thành công
          window.dispatchEvent(new CustomEvent('auth-success'));
        } else {
          const errorMessage = response?.ReturnStatus?.Message || 'Không thể đăng nhập bằng Google';
          console.error('Lỗi đăng nhập:', errorMessage);
          this.notificationService.showError('Đăng nhập bằng Google thất bại: ' + errorMessage);
          // Dispatch sự kiện thất bại
          window.dispatchEvent(new CustomEvent('auth-failure'));
        }
      },
      error: (error) => {
        console.error('Lỗi đăng nhập Google:', error);
        this.notificationService.showError('Đã xảy ra lỗi khi đăng nhập bằng Google');
        // Dispatch sự kiện thất bại
        window.dispatchEvent(new CustomEvent('auth-failure'));
      }
    });
  }

  // Gửi ID token đến API backend
  googleLogin(idToken: string) {
    const body: GoogleLoginRequest = { IdToken: idToken };
    return this.http.post<ReturnBaseInfo<AuthResponseInfo>>(`${environment.apiUrl}/api/Auth/google-login`, body, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  refreshToken(refresh: string) {
    return this.http
    .post<ResponseData>(`${environment.apiUrl}/api/Auth/refreshtoken`, { RefrestToken: refresh },
      { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  isAuthenticated() {
    this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
    if (this.user) {
      return true;
    } else {
      return false;
    }
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem(SystemConstants.CURRENT_USER);
    this.router.navigate(['/login']);
  }

  get authorizationHeaderValue(): string | null {
    const currentUser = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
    if (currentUser) {
      return `${currentUser.AccessToken}`;
    }
    return null;
  }
}
