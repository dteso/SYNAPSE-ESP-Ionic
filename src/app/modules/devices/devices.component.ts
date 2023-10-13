/* eslint-disable no-underscore-dangle */
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { bindCallback, Observable, of } from 'rxjs';
import { CustomModalComponent } from 'src/app/components/custom-modal/custom-modal.component';
import { DeviceActionsModalComponent } from 'src/app/components/device-actions-modal/device-actions-modal.component';
import { DeviceActionUtils } from 'src/app/components/device-actions-modal/device-actions.utils';
import { DeviceDetailModalComponent } from 'src/app/components/device-detail-modal/device-detail-modal.component';
import { DeviceEditModalComponent } from 'src/app/components/device-edit-modal/device-edit-modal.component';
import { Device } from 'src/app/models/device.model';
import { SocketClient } from 'src/app/models/socket-client-model';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { DevicesService } from 'src/app/services/devices/devices.service';
import { LoaderService } from 'src/app/services/screen-loader.service';
import { StorageService } from 'src/app/services/storage.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent {

  socketServerUrl;
  socketClient: SocketClient;
  message;

  devices: Device[] = [];
  _devices = new Observable<any>();

  fullDevices = [];

  _clients = new Observable<any>(); // TODO cambiar a Customer/Client el any
  clients = [];

  modal;

  showAsList: Observable<any>;
  showAsCards: Observable<any>;

  bluetoothConnected = false;
  serialConnected = false;

  deviceDeleted;

  filtro;

  constructor(
    protected socketService: SocketProviderConnect,
    private readonly modalController: ModalController,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly btService: BluetoothService,
    private readonly router: Router,
    private readonly screenLoaderService: LoaderService,
    private readonly devicesService: DevicesService
  ) { }

  ionViewWillEnter() {
    this.setInitialConditions();
    this.manageWebsocketsConnection();

    this.getDataFromResolver();
    this.btService.isConnected().then(isConnected => {
      this.bluetoothConnected = isConnected;
    });
    this.storageService.getSerialConnected().subscribe(connected => {
      this.serialConnected = connected;
    });
  }

  requestStatusFromDevices() {
    this.sendMessage('PENNY');
  }


  sendMessage(msg: string) {
    if (msg) {
      this.storageService.getItem('USER').then(item => {
        const commandMessage = {
          event: 'USER_COMMAND',
          data: {
            payload: msg,
            appKey: item.user.appKey
          }
        };
        this.socketService.send(commandMessage);
        msg = '';
      });
    }
  }

  // ionViewWillLeave() {
  //   this.socketService.unsubscribe();
  // }

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

  showDeviceDetails(device) {
    this.presentDeviceEditModal(device);
  }

  showDeviceActions(device) {
    this.presentDeviceActionsModal(device);
  }


  navigateClient(id) {
    this.router.navigate([`/customer/${id}`]);
  }


  filterDevices() {
    console.log(this.filtro);

    this.devices = this.fullDevices;
    this._devices = of(this.devices);
    console.log('Original devices', this.devices);

    const filtereDevices = this.devices.filter(device => device.name.toUpperCase().indexOf(this.filtro.toUpperCase()) > -1);
    this._devices = of(filtereDevices);
    this.devices = filtereDevices;

    console.log('Filtered devices', filtereDevices);

    this.cdr.detectChanges();
  }

  async deleteDevice(device) {
    const operationObj = {
      data: {
        selection: {
          operation: 'D'
        }
      }
    };
    this.sendCommandFromSelection(device, operationObj);

    this.devicesService.deleteById(device.uid).subscribe(operation => {
      this.modal.dismiss({ operation: 'delete', uid: device.uid });
      this.updateDeviceListAfterDeleteOne(device);

      // this.socketService.unsubscribe();
      // this.manageWebsocketsConnection();

      this.presentAlert('Dispositivo borrado correctamente',
        'El dispositivo se ha eliminado de la lista de nebulizadores',
        'alert-success-class',
        '../../../assets/icons/dark-success.apng');
    });
  }



  /** MODALES ***/
  /**
   * Abre el modal para CONEXIÓN de nuevo dispositivo
   *
   * @returns
   */
  async presentModal() {
    this.modal = await this.modalController.create({
      component: DeviceDetailModalComponent,
      cssClass: 'devices-modal-class',
      componentProps: {
        clientsOptions: this.clients
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res.data.closePayload) {
        this.devices.push(res.data.closePayload);
        this._devices = of(this.devices);
        console.log(this.devices);

        this.requestStatusFromDevices();
        this.cdr.detectChanges();
      }

    });
    return await this.modal.present();
  }

  /**
   * Abre modal INFORMATIVO con detalle para poder borrar
   *
   * @param device
   * @returns
   */
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
        this.deleteDevice(device);
        this.updateDevicelistAfterDelete(res);
      } else if (res.data.closePayload && res.data.closePayload.operation === 'update') {
        this.updateDeviceListAfterUpdate(res);
      }
      this.requestStatusFromDevices();
      this.cdr.detectChanges();
    });
    return await this.modal.present();
  }


  /**
   * Abre el modal de acciones.Recibe la acción seleccionada para llevar a cabo para su tratamiendo
   *
   * @param device
   * @returns
   */
  async presentDeviceActionsModal(device) {
    this.modal = await this.modalController.create({
      component: DeviceActionsModalComponent,
      cssClass: 'modal-actions-class',
      showBackdrop: false,
      componentProps: {
        title: device.name,
        message: 'Selecciona el estado que deseas asignar al dispositivo.',
        device,
        buttons: DeviceActionUtils.DEVICE_ACTION_BUTTONS
      }
    });

    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res.data.selection.operation !== null) {
        this.sendCommandFromSelection(device, res);
        if (res.data.selection && res.data.selection.operation === 'D') {
          this.deleteDevice(device);
        }
      }
    });
    return await this.modal.present();
  }

  async presentAlert(title, message, cssClass, iconUrl) {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass, //'alert-success-class',
      componentProps: {
        title,
        message,
        icon: {
          url: iconUrl
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

  private setInitialConditions() {
    this.showAsList = of(true);
    this.showAsCards = of(false);
    this.socketServerUrl = this.socketService.getSocketServerUrl();
  }

  private manageWebsocketsConnection() {
    this.socketService.onConnect();

    this.socketService.socketMessage.subscribe(message => {
      const deviceData: Device = message.data;
      this.updateDeviceStatus(deviceData);
      this.cdr.detectChanges();
    });

    this.requestStatusFromDevices();
  }

  private getDataFromResolver() {
    // TODO: probar regactorización con switchMap o sucedáneo
    this.screenLoaderService._loading$.next(true);
    this.route.data
      .subscribe(data => {
        const routeData: any = data;
        console.log('DATA in resolver: ', routeData);

        this._clients = routeData.preLoad?.clients;
        this._devices = routeData.preLoad?.devices;
        this.fullDevices = this.devices;

        this._clients.subscribe(clients => {
          this.clients = clients.dbCustomers;
          console.log(this.clients);
          this.cdr.detectChanges();
        });

        this._devices.subscribe(devices => {
          this.devices = devices.dbDevices;
          this.fullDevices = this.devices;
          console.log(this.devices);
          this.screenLoaderService._loading$.next(false);
          this.cdr.detectChanges();
        });
      });
  }


  private updateDeviceStatus(deviceData: Device) {

    const deviceToUpdateIdx = this.devices?.findIndex(device => device.MAC === deviceData.MAC);

    if (deviceToUpdateIdx > -1) {

      deviceData.customer = this.devices[deviceToUpdateIdx].customer;
      deviceData.uid = this.devices[deviceToUpdateIdx].uid;
      deviceData.name = deviceData.name ? deviceData.name : this.devices[deviceToUpdateIdx].name;
      deviceData.minLevelReached = deviceData.minLevelReached ?
        deviceData.minLevelReached : this.devices[deviceToUpdateIdx].minLevelReached;
      deviceData.lastEvent = new Date();
      deviceData.lastRefill = deviceData.lastRefill ? deviceData.lastRefill : this.devices[deviceToUpdateIdx].lastRefill;

      this.devices[deviceToUpdateIdx] = deviceData;
    }

    this._devices = of(this.devices);
  }

  private sendCommandFromSelection(device: any, res: any) {
    this.storageService.getItem('USER').then(item => {
      const commandMessage = {
        event: 'REQUEST',
        target: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          MAC: device.MAC
        },
        data: {
          payload: res.data.selection.operation === 'D' ? `#>FULL_FLASH` : `#>SET_MODE:${res.data.selection.operation}`,
          appKey: item.user.appKey
        },
        payload: res.data.selection.operation === 'D' ? `#>FULL_FLASH` : `#>SET_MODE:${res.data.selection.operation}`,
      };
      this.socketService.send(commandMessage);
      this.message = '';
    });
  }

  private updateDeviceListAfterUpdate(res: any) {
    const updatedDeviceIdx = this.devices.findIndex(dev => dev.uid !== res.data.closePayload?.uid
    );
    this.devices[updatedDeviceIdx].name = res.data.closePayload?.name;
    this._devices = of(this.devices);
    this.cdr.detectChanges();
  }

  private updateDevicelistAfterDelete(res: any) {
    this.deviceDeleted = { ...res };
    this.devices = this.devices.filter(dev => dev.uid !== this.deviceDeleted.data.closePayload?.uid
    );
    this.fullDevices = this.devices;
    this._devices = of(this.devices);
    this.cdr.detectChanges();
  }

  private updateDeviceListAfterDeleteOne(device: any) { //TODO: Refactor con funcionalidad superior
    this.devices = this.devices.filter(dev => dev.uid !== device.uid
    );
    this.fullDevices = this.devices;
    this._devices = of(this.devices);
    this.cdr.detectChanges();
  }




}
