import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class HomeResolver implements Resolve<any> {

  constructor(private readonly notificationService: NotificationService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    const user = window.sessionStorage.getItem("USER");
    return {
      user: of(user),
      notifications: this.notificationService.getByLoggedUser()
    }
  }
}
