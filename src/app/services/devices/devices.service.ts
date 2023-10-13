import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  constructor(private readonly apiService: ApiService) { }

  createDevice(body: object = {}): Observable<any> {
    return this.apiService.post('devices/register', body);
  }

  updateDeviceName(body: object = {}): Observable<any> {
    return this.apiService.patch('devices/name', body);
  }

  getByLoggedUser(): Observable<any> {
    return this.apiService.get('devices/my-user');
  }

  deleteById(uid): Observable<any> {
    return this.apiService.delete('devices', uid);
  }

}
