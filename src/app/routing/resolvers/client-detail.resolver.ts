import { Injectable } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ClientsService } from 'src/app/services/clients/clients.service';

@Injectable({
    providedIn: 'root'
})
export class ClientDetailResolver implements Resolve<any> {

    constructor(private readonly clientsService: ClientsService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const customerId = route.params.id;
        return this.clientsService.getDeviceDetailWithDevices(customerId);
    }
}
