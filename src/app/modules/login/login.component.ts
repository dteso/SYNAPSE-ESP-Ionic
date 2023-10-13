import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialUser } from 'angularx-social-login';
import { AuthService } from 'src/app/services/auth.service';
import { PushService } from 'src/app/services/push.service';

interface Auth {
  name: String;
  password: String;
  email: String;
  appKey?: String;
  notificationId?: String;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginUser: Auth;
  socialUser: SocialUser;
  isLoggedin: boolean;
  submitted = false;

  registerView = false;
  loginView = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly pushService: PushService,
  ) {
    this.loginForm = this.formBuilder.group({
      name: [{ value: '', disabled: this.loginView }, Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.required],
      appKey: ['']
    });
  }

  ngOnInit(): void {
    this.authService.clearAuth();
  }

  async register() {
    this.submitted = true;
    if (!this.loginForm.invalid) {
      this.loginUser = {
        name: this.loginForm.controls.name.value,
        password: this.loginForm.controls.password.value,
        email: this.loginForm.controls.email.value,
        appKey: this.loginForm.controls.appKey.value,
        notificationId: await this.pushService.getUserIdOneSignal()
      }
      //console.info(this.loginUser);
      this.authService.registerAuth(this.loginUser);
      this.isLoggedin = true;
      this.loginForm.reset();
    }
    return;
  }


  async login() {
    this.submitted = true;
    if (!this.loginForm.invalid) {
      this.loginUser = {
        name: this.loginForm.controls.name.value,
        password: this.loginForm.controls.password.value,
        email: this.loginForm.controls.email.value,
        notificationId: await this.pushService.getUserIdOneSignal()
      }
      //console.info(this.loginUser);
      this.authService.tryAuth(this.loginUser);
      this.loginForm.reset();
      this.submitted = false;
    }
    //console.log(this.loginForm);
    return;
  }

  logout(): void {
    this.authService.clearAuth();
    this.isLoggedin = false;
    this.router.navigate(['/']);
  }

  showRegisterView() {
    this.loginForm.controls.name.enable();
    this.loginForm.controls.name.setValue('');
    this.loginView = false;
    this.registerView = true;
  }

  showLoginView() {
    this.loginView = true;
    this.registerView = false;
    this.loginForm.controls.name.disable();
  }

  resotoreViews() {
    this.loginView = false;
    this.registerView = false;
    this.submitted = false;
  }

}
