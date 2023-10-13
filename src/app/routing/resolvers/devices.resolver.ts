import { Injectable } from '@angular/core';
import {
    Router, Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { DevicesService } from 'src/app/services/devices/devices.service';

@Injectable({
    providedIn: 'root'
})
export class DevicesResolver implements Resolve<any> {

    constructor(private readonly clientsService: ClientsService, private readonly devicesService: DevicesService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        return {
            clients: this.clientsService.getByLoggedUser(), // CLIENTES
            devices: this.devicesService.getByLoggedUser()  // DISPOSITIVOS
        }
    }
}
