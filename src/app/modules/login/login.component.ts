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

  constructor(
    private router: Router,
    private fileService: FileService,
    private authService: AuthenService,
    private notificationService: NotificationService
  ) { }


  ngOnInit() { }

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
                    this.router.navigate(['administration']).then(()=>{
                        this.loading = false;
                    });
                    // this.router.navigate(['/administration/dashboard']).then(()=>{
                    //     this.loading = false;
                    // });
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
