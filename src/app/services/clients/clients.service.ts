import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(private readonly apiService: ApiService) { }

  get(): Observable<any> {
    return this.apiService.get('customers');
  }

  getByLoggedUser(): Observable<any> {
    return this.apiService.get('customers/my-user');
  }


  getDeviceDetailWithDevices(customerId): Observable<any> {
    return this.apiService.get(`customers/id/${customerId}`);
  }

  post(body: object = {}): Observable<any> {
    return this.apiService.post('customers', body);
  }

  createByLoggedUser(body: object = {}): Observable<any> {
    return this.apiService.post('customers/my-user', body);
  }

  deleteClientById(id): Observable<any> {
    return this.apiService.delete(`customers/id`, id);
  }

  updateClientById(id, body: object = {}): Observable<any> {
    return this.apiService.put(`customers/id/${id}`, body);
  }
}
