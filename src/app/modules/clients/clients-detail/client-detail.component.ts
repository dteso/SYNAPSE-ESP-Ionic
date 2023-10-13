import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
import { ClientModalComponent } from 'src/app/components/client-modal/client-modal.component';
import { CustomModalComponent } from 'src/app/components/custom-modal/custom-modal.component';
import { DeviceEditModalComponent } from 'src/app/components/device-edit-modal/device-edit-modal.component';
import { Device } from 'src/app/models/device.model';
import { SocketClient } from 'src/app/models/socket-client-model';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { StorageService } from 'src/app/services/storage.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientDetailComponent {

  modal;

  socketServerUrl;
  socketClient: SocketClient;
  message;

  deviceDeleted;

  subscription: Subscription;

  showDevices: Observable<any>;
  showManagements: Observable<any>;
  showEvents: Observable<any>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly storageService: StorageService,
    protected socketService: SocketProviderConnect,
    private clientService: ClientsService,
    private readonly router: Router,
    private readonly modalController: ModalController,
  ) { }

  client;

  _devices = new Observable<any>(); // TODO cambiar a Customer/Client el any
  devices = [];

  ionViewWillEnter() {
    this.setInitialConditions();
    this.socketService.onConnect(this.socketClient);
    this.message = "PENNY";
    this.sendMessage();
    this.manageWebsocketsConnection();
    this.getDataFromResolver();
  }

  getDataFromResolver() {
    this.subscription = this.route.data
      .subscribe(data => {
        const routeData: any = data;
        console.log("DATA in resolver: " + JSON.stringify(routeData));
        this.client = routeData.preLoad?.customer;
        console.log(this.client);

        this.devices = routeData.preLoad?.devices;
        this._devices = of(this.devices);
        console.log(this.devices);
        this.cdr.detectChanges();
      });
  }

  sendMessage() {
    if (this.message) {
      this.storageService.getItem('USER').then(item => {
        let commandMessage = {
          event: "USER_COMMAND",
          data: {
            payload: this.message,
            appKey: item.user.appKey
          }
        }
        this.socketService.send(commandMessage);
        this.message = "";
      });
    }
  }

  private setInitialConditions() {
    this.socketServerUrl = this.socketService.getSocketServerUrl();
    this.socketClient = this.initSocketClientData();
    this.showDevices = of(true);
    this.showManagements = of(false);
    this.showEvents = of(false);
  }


  initSocketClientData(): SocketClient {
    return {
      type: "CONNECTION",
      room: "GENERAL",
      user: "NOT_LOGGED_YET"
    }
  }


  private manageWebsocketsConnection() {
    let macList: string[] = [];

    this.socketService.socketMessage.subscribe(message => {

      const event: any = message.event;
      const deviceData: Device = message.data;

      let isDevice: boolean = message.data != null && message.data.MAC !== undefined && event === 'MESSAGE';

      macList = isDevice ? this.devices.map(device => device.MAC) : [];
      const macSet = new Set(macList);

      this.updateDeviceStatus(deviceData);

      this.cdr.detectChanges();
    });
  }

  showDeviceDetails(event) {
    this.presentDeviceEditModal(event);
  }

  async presentDeviceEditModal(device) {
    this.modal = await this.modalController.create({
      component: DeviceEditModalComponent,
      cssClass: 'devices-edit-modal-class',
      componentProps: {
        device
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res.data.closePayload && res.data.closePayload.operation === 'D') {
        this.deviceDeleted = { ...res };
        this.devices = this.devices.filter(dev =>
          dev.uid !== this.deviceDeleted.data.closePayload?.uid
        );
        this._devices = of(this.devices);
        this.cdr.detectChanges();
      } else if (res.data.closePayload && res.data.closePayload.operation === 'update') {
        const updatedDeviceIdx = this.devices.findIndex(dev =>
          dev.uid !== res.data.closePayload?.uid
        );
        this.devices[updatedDeviceIdx].name = res.data.closePayload?.name;
        this._devices = of(this.devices);
        this.cdr.detectChanges();
      }
    });
    return await this.modal.present();
  }

  private updateDeviceStatus(deviceData: Device) {

    let deviceToUpdateIdx = this.devices?.findIndex(device => device.MAC === deviceData.MAC);

    if (deviceToUpdateIdx > -1) {

      deviceData.customer = this.devices[deviceToUpdateIdx].customer;
      deviceData.uid = this.devices[deviceToUpdateIdx].uid;
      deviceData.name = deviceData.name ? deviceData.name : this.devices[deviceToUpdateIdx].name;
      deviceData.minLevelReached = deviceData.minLevelReached ? deviceData.minLevelReached : this.devices[deviceToUpdateIdx].minLevelReached;
      deviceData.lastEvent = new Date();
      deviceData.lastRefill = deviceData.lastRefill ? deviceData.lastRefill : this.devices[deviceToUpdateIdx].lastRefill;

      this.devices[deviceToUpdateIdx] = deviceData;
    }

    this._devices = of(this.devices);
  }

  onSegmentChange(event) {
    console.log('EVENT', event.detail.value);
    if (event.detail.value === 'devices') {
      this.showDevices = of(true);
      this.showManagements = of(false);
      this.showEvents = of(false);
    } else if (event.detail.value === 'managements') {
      this.showDevices = of(false);
      this.showManagements = of(true);
      this.showEvents = of(false);
    } else if (event.detail.value === 'events') {
      this.showDevices = of(false);
      this.showManagements = of(false);
      this.showEvents = of(true);
    }
    this.cdr.detectChanges();
  }

  async deleteClient() {
    this.clientService.deleteClientById(this.client.uid).subscribe(res => {
      this.presentSuccessAlert();
      this.router.navigate((['customers']));
    });
  }

  verifyClientForDelete() {
    if (this.devices.length) {
      this.presentErrorAlert();
    } else {
      this.presentConfirmationModal();
    }
  }

  async presentConfirmationModal() {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'custom-modal-class',
      showBackdrop: false,
      componentProps: {
        title: 'Confirmar borrado',
        message: '¿Confirma que desea borrar el cliente? La acción no podrá deshacerse si confirma.',
        buttons: [
          {
            caption: 'Sí',
            value: 'Y',
            color: '#223240',
            background: '#76E596'
          }, {
            caption: 'No',
            value: 'N',
            color: '#223240',
            background: '#E74859'
          }
        ]
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res && res.data && res.data.selection === 'Y') this.deleteClient();
    });
    return await this.modal.present();
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
        this.client = res.data.closePayload;
        this.client.uid = clientId;
        this.cdr.detectChanges();
      }
    });
    return await this.modal.present();
  }

  async presentSuccessAlert() {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'alert-success-class',
      componentProps: {
        title: '¡Cliente borrado!',
        message: 'El cliente se ha borrado de la lista.',
        icon: {
          url: "../../../assets/icons/dark-success.apng"
        },
        buttons: [
          {
            caption: 'Ok',
            value: 'Y',
            color: '#223240',
            background: '#76E596'
          }
        ]
      }
    });
    return await this.modal.present();
  }


  async presentErrorAlert() {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'alert-danger-class',
      componentProps: {
        title: 'Hay dispositivos asociados',
        message: 'Debe borrar previamente los dispositivos asociados para poder eliminar el cliente.',
        icon: {
          url: "../../../assets/icons/warning-dark.apng"
        },
        buttons: [
          {
            caption: 'CERRAR',
            value: 'Y',
            color: '#223240',
            background: '#ed4a53'
          }
        ]
      }
    });
    return await this.modal.present();
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
