import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms';
import { DxButtonModule } from 'devextreme-angular';
import { GoogleLoginProvider } from 'angularx-social-login';
import { SocialAuthServiceConfig } from 'angularx-social-login';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    DxButtonModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '1038360422975-97chu06kf2forivi1sohqm9ng9t4h9a6.apps.googleusercontent.com',
              {
                scope: 'email',
                plugin_name: 'login',
                oneTapEnabled: false,
              }
            ),
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig
    }
  ]
})
export class LoginModule { }
