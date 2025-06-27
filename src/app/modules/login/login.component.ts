import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenService, FileService, NotificationService, SystemConstants, User } from 'src/app/shared';
import { dxButtonConfig } from 'src/app/shared/config';
import { ResponseData } from 'src/app/shared/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public username: string = '';
  public password: string = '';
  private user: User;
  loading: boolean = false;
  dxButtonConfig = dxButtonConfig;

  // Thêm các thuộc tính cho form đăng ký
  isLoginForm: boolean = true;
  registerData = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  registerLoading: boolean = false;
  googleLoading: boolean = false;

  constructor(
    private router: Router,
    private fileService: FileService,
    private authService: AuthenService,
    private notificationService: NotificationService,
  ) { }


  ngOnInit() {
    // Kiểm tra xem URL hiện tại có phải là callback từ Google không
    console.log('Login component initialized, checking for Google callback...');

    // Kiểm tra nếu có hash hoặc state=google_auth trong URL
    const hasHash = window.location.hash && (
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('id_token=')
    );

    const hasGoogleState = new URLSearchParams(window.location.search).get('state') === 'google_auth';

    if (hasHash || hasGoogleState) {
      console.log('Phát hiện callback từ Google, xử lý đăng nhập...');
      this.googleLoading = true;

      // Xử lý callback từ Google
      const hasProcessed = this.authService.handleGoogleRedirect();
      if (hasProcessed) {
        console.log('Đã xử lý callback từ Google thành công');
        // Đã xử lý callback từ Google, reset trạng thái loading
        this.googleLoading = false;
      } else {
        console.log('Không thể xử lý callback từ Google');
        this.googleLoading = false;
        this.notificationService.showError('Không thể xác thực với Google. Vui lòng thử lại.');
      }
    } else {
      // Không phải là callback từ Google, reset trạng thái loading nếu có
      this.googleLoading = false;
    }
  }

  onLoggedIn() {
    if(this.loading){
        return;
    }
    this.loading = true;
    this.authService.login({ Username: this.username, Password: this.password}).subscribe({
        next: (response: ResponseData) => {
            if (response.ReturnStatus.Code === -1) {
                this.notificationService.showError(response.ReturnStatus.Message);
                this.loading = false;
            } else if (response.ReturnStatus.Code === 1) {
                this.user = response.ReturnData;

                localStorage.removeItem(SystemConstants.CURRENT_USER);
                localStorage.setItem(SystemConstants.CURRENT_USER, JSON.stringify(this.user));

                setTimeout(() => {
                    // Kiểm tra xem người dùng có phải là admin không
                    if (this.user.Is_Admin) {
                        this.router.navigate(['administration']).then(() => {
                            this.loading = false;
                        });
                    } else {
                        this.router.navigate(['student']).then(() => {
                            this.loading = false;
                        });
                    }
                }, 1000);
                this.notificationService.showSuccess('Login successfully!');
            } else {
                this.loading = false;
            }

        },
        error: (error: any) => {
          this.loading = false;
          this.notificationService.showError('System errorr!');
        }
    });
  }

  // Phương thức đăng nhập bằng Google
  signInWithGoogle(): void {
    if (this.googleLoading) {
      return;
    }

    this.googleLoading = true;
    console.log('Bắt đầu quá trình đăng nhập bằng Google...');

    try {
      // Gọi phương thức loginWithGoogle từ authService để chuyển hướng
      this.authService.loginWithGoogle();

      // Lưu ý: Không cần thiết lập timeout hoặc event listeners vì chúng ta sẽ chuyển hướng trang
      // Trạng thái loading sẽ được reset khi quay lại trang sau khi xác thực
    } catch (error: any) {
      console.error('Lỗi khởi tạo đăng nhập Google:', error);
      this.notificationService.showError('Không thể khởi tạo đăng nhập Google: ' + (error.message || 'Lỗi không xác định'));
      this.googleLoading = false;
    }
  }

  // Phương thức chuyển đổi giữa form đăng nhập và đăng ký
  toggleForm() {
    this.isLoginForm = !this.isLoginForm;
    // Reset các trường dữ liệu
    if (this.isLoginForm) {
      this.username = '';
      this.password = '';
    } else {
      this.registerData = {
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      };
    }
  }

  // Phương thức xử lý đăng ký
  onRegister() {
    if (this.registerLoading) {
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.notificationService.showError('Mật khẩu xác nhận không khớp!');
      return;
    }

    this.registerLoading = true;

    // Giả lập API đăng ký (thay bằng API thực tế sau)
    setTimeout(() => {
      this.registerLoading = false;
      this.notificationService.showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      this.isLoginForm = true;
    }, 1500);

    // Thay thế bằng API thực tế
    /*
    this.authService.register(this.registerData).subscribe({
      next: (response: ResponseData) => {
        this.registerLoading = false;
        if (response.ReturnStatus.Code === 1) {
          this.notificationService.showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
          this.isLoginForm = true;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
      },
      error: (error: any) => {
        this.registerLoading = false;
        this.notificationService.showError('Lỗi hệ thống!');
      }
    });
    */
  }

  downloadTLHDSD(){
  // window.open(`${environment.apiUrl}/DataSupport/TLHDSD/TLHDSD.zip`);
  // window.open(`${environment.BASE_API}/DataSupport/TLHDSD/Tài liệu HDSD - phiên bản đơn vị - VPB.docx`);
  }

  downloadGoogleChrome (index: number) {
      switch( index){
          case 1:
              this.download('ChromeStandaloneSetup64.exe',);
              break;
          case 2:
              this.download('ChromeStandaloneSetup.exe',);
              break;
      }
  }
  download(file: string, fileName?: string){
    this.fileService.download('/DataSupport/Chrome/',file).subscribe({
      next: (res: Blob)=>{
        var reader = new FileReader();
        reader.readAsDataURL(res);
        let that = this;
        reader.onloadend = function() {
          const linkSource = `${reader.result}`;
          const downloadLink = document.createElement("a");
          downloadLink.href = linkSource;
          downloadLink.download = fileName??file;
          downloadLink.click();
        }
      }
    });
  }
}
