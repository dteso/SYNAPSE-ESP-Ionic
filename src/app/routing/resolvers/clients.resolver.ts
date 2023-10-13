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
export class ClientsResolver implements Resolve<any> {

    constructor(private readonly clientsService: ClientsService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.clientsService.getByLoggedUser();
    }
}
