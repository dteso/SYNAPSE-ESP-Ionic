import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  isLoggedin;
  currentRoute: string;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.currentRoute = this.router.url;

    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if (event instanceof NavigationStart) {
            this.currentRoute = event.url;
          }
        });
  }

  isHomePage() {
    return this.currentRoute === '/home';
  }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(logged => {
      this.isLoggedin = logged;
    });
  }

  onMenuToggleRequest() {
    console.log('Toggle request');
  }

  logout(): void {
    this.authService.clearAuth();
    this.isLoggedin = false;
    this.router.navigate(['/']);
  }

  goHome() {
    this.router.navigate(['home']);
  }

}
