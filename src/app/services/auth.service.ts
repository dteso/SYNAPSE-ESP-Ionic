import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoaderService } from './screen-loader.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();
  public currentUser$ = new Observable<any>();
  public currentToken;


  constructor
    (
      private readonly apiService: ApiService,
      private readonly storageService: StorageService,
      private readonly router: Router,
      private readonly screenLoaderService: LoaderService
    ) { }


  get isLoggedIn() {
    if (this.storageService.getItem('USER')) {
      this.isAuthenticatedSubject$.next(true);
    }
    return this.isAuthenticated$;
  }

  registerAuth(registerUser) {
    this.apiService.post("users", registerUser).subscribe(res => {
      //console.log(res);
      this.storageService.setItem("USER", res);
      this.isAuthenticatedSubject$.next(true);
      this.currentUser$ = of(res.user);
      this.currentToken = res.token;
      this.router.navigate(['/home']);
    });
  }

  tryAuth(loginUser) {
    this.screenLoaderService._loading$.next(true);
    this.apiService.post("login", loginUser).subscribe(res => {
      //console.log(res);
      this.storageService.setItem("USER", res);
      this.isAuthenticatedSubject$.next(true);
      this.currentUser$ = of(res.user);
      this.currentToken = res.token;
      this.router.navigate(['/home']);
      this.screenLoaderService._loading$.next(false);
    });
  }

  clearAuth() {
    this.storageService.clear('USER');
    this.isAuthenticatedSubject$.next(false);
    this.currentUser$ = new Observable<any>();
    this.currentToken = null;
    this.router.navigate(['login']);
  }

}

