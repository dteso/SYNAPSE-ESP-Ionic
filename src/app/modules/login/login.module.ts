import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';
import { GoogleLoginProvider, SocialAuthService, SocialAuthServiceConfig } from 'angularx-social-login';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoginRoutingModule,
    IonicModule
  ],
  providers:[
    // {
    //   provide: 'SocialAuthServiceConfig',
    //   useValue: {
    //     autoLogin: false,
    //     providers: [
    //       {
    //         id: GoogleLoginProvider.PROVIDER_ID,
    //         provider: new GoogleLoginProvider(
    //           '701057228806-ufi5firl5mvb324vonmru12ns7cm3e4l.apps.googleusercontent.com'
    //         )
    //       }
    //     ]
    //   } as SocialAuthServiceConfig,
    // },
    SocialAuthService,
    ApiService,
    StorageService,
    AuthService
  ]
})
export class LoginModule { }
