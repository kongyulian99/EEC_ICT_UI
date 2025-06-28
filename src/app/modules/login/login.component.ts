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

  // Add properties for registration form
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
    // Check if the current URL is a callback from Google
    console.log('Login component initialized, checking for Google callback...');

    // Check if there is a hash or state=google_auth in the URL
    const hasHash = window.location.hash && (
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('id_token=')
    );

    const hasGoogleState = new URLSearchParams(window.location.search).get('state') === 'google_auth';

    if (hasHash || hasGoogleState) {
      console.log('Google callback detected, processing login...');
      this.googleLoading = true;

      // Process Google callback
      const hasProcessed = this.authService.handleGoogleRedirect();
      if (hasProcessed) {
        console.log('Google callback processed successfully');
        // Google callback processed, reset loading state
        this.googleLoading = false;
      } else {
        console.log('Could not process Google callback');
        this.googleLoading = false;
        this.notificationService.showError('Could not authenticate with Google. Please try again.');
      }
    } else {
      // Not a Google callback, reset loading state if any
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
                    // Check if user is admin
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
          this.notificationService.showError('System error!');
        }
    });
  }

  // Method to sign in with Google
  signInWithGoogle(): void {
    if (this.googleLoading) {
      return;
    }

    this.googleLoading = true;
    console.log('Starting Google login process...');

    try {
      // Call loginWithGoogle method from authService to redirect
      this.authService.loginWithGoogle();

      // Note: No need to set timeout or event listeners as we will redirect the page
      // Loading state will be reset when returning to the page after authentication
    } catch (error: any) {
      console.error('Error initiating Google login:', error);
      this.notificationService.showError('Could not initiate Google login: ' + (error.message || 'Unknown error'));
      this.googleLoading = false;
    }
  }

  // Method to toggle between login and registration forms
  toggleForm() {
    this.isLoginForm = !this.isLoginForm;
    // Reset data fields
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

  // Method to handle registration
  onRegister() {
    if (this.registerLoading) {
      return;
    }

    // Check confirm password
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.notificationService.showError('Confirm password does not match!');
      return;
    }

    this.registerLoading = true;

    // Simulate registration API (replace with actual API later)
    setTimeout(() => {
      this.registerLoading = false;
      this.notificationService.showSuccess('Registration successful! Please log in.');
      this.isLoginForm = true;
    }, 1500);

    // Replace with actual API
    /*
    this.authService.register(this.registerData).subscribe({
      next: (response: ResponseData) => {
        this.registerLoading = false;
        if (response.ReturnStatus.Code === 1) {
          this.notificationService.showSuccess('Registration successful! Please log in.');
          this.isLoginForm = true;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
      },
      error: (error: any) => {
        this.registerLoading = false;
        this.notificationService.showError('System error!');
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
