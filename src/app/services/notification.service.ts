import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly apiService: ApiService) { }

  getByLoggedUser(): Observable<any> {
    return this.apiService.get('onesignal/my-notifications');
  }

  setManyAsRead(body): Observable<any> {
    return this.apiService.patch('onesignal/set-many-to-read', { messagesIdList: body });
  }
}
