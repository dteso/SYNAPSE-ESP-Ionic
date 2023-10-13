import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InfraredService {

  constructor(private readonly apiService: ApiService) { }

  getIrCodes(appKey): Observable<any> {
    return this.apiService.get('infrared/appKey/' + appKey);
  }

}
