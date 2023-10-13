import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
import { ClientModalComponent } from 'src/app/components/client-modal/client-modal.component';
import { CustomModalComponent } from 'src/app/components/custom-modal/custom-modal.component';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { LoaderService } from 'src/app/services/screen-loader.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit {

  _clients = new Observable<any>(); // TODO cambiar a Customer/Client el any
  clients = [];

  fullClients = [];

  modal;

  showAsList: Observable<any>;
  showAsCards: Observable<any>;

  subscription: Subscription;

  filtro;

  constructor(
    private readonly modalController: ModalController,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private router: Router,
    private readonly screenLoaderService: LoaderService
  ) {

  }

  ngOnInit() {
    this.screenLoaderService._loading$.next(true);
    this.showAsList = of(true);
    this.showAsCards = of(false);
    this.cdr.detectChanges();
    this.subscription = this.route.data
      .subscribe(data => {
        const routeData: any = data;
        console.log("DATA in resolver: " + JSON.stringify(routeData));
        this.clients = routeData.preLoad?.dbCustomers;

        this._clients = of(this.clients);
        this.fullClients = JSON.parse(JSON.stringify(this.clients));

        console.log(this.clients);
        this.screenLoaderService._loading$.next(false);
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async openClientModal() {
    this.modal = await this.modalController.create({
      component: ClientModalComponent,
      cssClass: 'clients-modal-class'
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res.data.closePayload) {
        this.clients.push(res.data.closePayload);

        this._clients = of(this.clients);
        this.fullClients = JSON.parse(JSON.stringify(this.clients));

        console.log(this.clients);
        this.cdr.detectChanges();
      }
    });
    return await this.modal.present();
  }

  onSegmentChange(event) {
    console.log('EVENT', event.detail.value);
    if (event.detail.value === 'list') {
      this.showAsList = of(true);
      this.showAsCards = of(false);
    } else if (event.detail.value === 'cards') {
      this.showAsCards = of(true);
      this.showAsList = of(false);
    }
    this.cdr.detectChanges();
  }

  async openEditionModal(client, clientId) {
    this.modal = await this.modalController.create({
      component: ClientModalComponent,
      cssClass: 'clients-modal-class',
      componentProps: {
        client // client: client 
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res.data.closePayload);
      if (res.data.closePayload) {
        let clientUpdatedIdx = this.clients.findIndex(client => client.uid === clientId);
        console.log(clientUpdatedIdx)
        this.clients[clientUpdatedIdx] = res.data.closePayload;
        this.clients[clientUpdatedIdx].uid = clientId;
        // this.clients.push(res.data.closePayload);

        this._clients = of(this.clients);
        this.fullClients = JSON.parse(JSON.stringify(this.clients));

        console.log(this.clients);
        this.cdr.detectChanges();
      }
    });
    return await this.modal.present();
  }

  navigateCustomerDetail(clientId) {
    this.router.navigate([`/customer/${clientId}`]);
  }

  filterCustomers() {
    this.clients = this.fullClients;
    this._clients = of(this.clients);

    const filteredClients = this.clients.filter(client => client.name.toUpperCase().indexOf(this.filtro.toUpperCase()) > -1);
    this._clients = of(filteredClients);

    this.cdr.detectChanges();
  }

  async presentNotAvailableModal() {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'alert-warning-class',
      componentProps: {
        title: 'Opción no disponible',
        message: 'Esta opción no está disponible por el momento. Estoy trabajando en ello ;)',
        icon: {
          url: "../../../assets/icons/warning-dark.apng"
        },
        buttons: [
          {
            caption: 'Ok',
            value: 'Y',
            color: '#223240',
            background: '#f29006'
          }
        ]
      }
    });
    return await this.modal.present();
  }
}
