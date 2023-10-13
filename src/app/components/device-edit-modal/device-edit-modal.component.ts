/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DevicesService } from 'src/app/services/devices/devices.service';
import { CustomModalComponent } from '../custom-modal/custom-modal.component';
import { SocketRquestModalComponent } from '../socket-request-modal/socket-rquest-modal.component';
import { Observable, of } from 'rxjs';
import { InfraredService } from 'src/app/services/infrared.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-client-modal',
  templateUrl: './device-edit-modal.component.html',
  styleUrls: ['./device-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceEditModalComponent {

  device;
  modal;

  clientForm: FormGroup;

  editedName = '';

  showMain: Observable<any>;
  showActions: Observable<any>;
  showGpio: Observable<any>;
  showSetup: Observable<any>;

  socketServerUrl;
  wsResponseReceived = false;

  private readonly DELETE_CONFIRMATION_MSG =
    // eslint-disable-next-line max-len
    'Confirma que desea borrar el dispositivo? Recuerde que en caso de querer grabarlo de nuevo deberá hacerlo desde la propia instalación donde se encuentre el dispositivo.';

  constructor(
    private readonly modalController: ModalController,
    private readonly router: Router,
    private readonly devicesService: DevicesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly irService: InfraredService,
    protected socketService: SocketProviderConnect,
  ) {
    this.showMain = of(true);
  }


  ionViewWillEnter() {
    console.log('Device: ', this.device);
    this.setInitialConditions();
    this.manageWebsocketsConnection();
  }


  async dismiss(entity) {
    await this.modalController.dismiss({
      // eslint-disable-next-line quote-props
      'dismissed': true,
      // eslint-disable-next-line quote-props
      'closePayload': entity
    });
  }


  showConfirmationModal(device) {
    this.presentConfirmationModal(device);
  }

  async deleteDevice(device) {
    // this.devicesService.deleteById(device.uid).subscribe(operation => {
    //   this.dismiss({ operation: 'D', uid: device.uid });
    //   this.presentAlert('Dispositivo borrado correctamente',
    //     'El dispositivo se ha eliminado de la lista de nebulizadores',
    //     'alert-success-class',
    //     "../../../assets/icons/dark-success.apng");
    // });
    setTimeout(() => {
      this.dismiss({ operation: 'D', uid: device.uid });
      this.presentSocketRequestModal(`${device.name}`, `Enviando solicitud a dispositivo ${device.name.toUpperCase()} para ser BORRADO...`,
        'alert-request-class',
        '../../../assets/icons/dark-success.apng');
    }, 200);
  }

  onSegmentChange(event) {
    console.log('EVENT', event.detail.value);
    if (event.detail.value === 'info') {
      this.showMain = of(true);
      this.showActions = of(false);
      this.showSetup = of(false);
      this.showGpio = of(false);
    } else if (event.detail.value === 'actions') {
      this.showActions = of(true);
      this.showMain = of(false);
      this.showSetup = of(false);
      this.showGpio = of(false);
    } else if (event.detail.value === 'setup') {
      this.showSetup = of(true);
      this.showMain = of(false);
      this.showActions = of(false);
      this.showGpio = of(false);
    } else if (event.detail.value === 'gpio') {
      this.showGpio = of(true);
      this.showMain = of(false);
      this.showActions = of(false);
      this.showSetup = of(false);
    }
    this.cdr.detectChanges();
  }


  async presentSocketRequestModal(title, message, cssClass, iconUrl) {
    this.modal = await this.modalController.create({
      component: SocketRquestModalComponent,
      cssClass, //'alert-request-class',
      componentProps: {
        title,
        message,
        detectResponseEnabled: true,
        icon: {
          url: iconUrl
        },
        buttons: [
          {
            caption: 'Ok',
            value: 'Y',
            color: '#FFFFFF',
            background: '#223240'
          }
        ]
      }
    });
    return await this.modal.present();
  }


  async updateDeviceName(device) {
    const body = {
      appKey: device.appKey,
      MAC: device.MAC,
      name: this.editedName
    };
    this.devicesService.updateDeviceName(body).subscribe(operation => {
      this.dismiss({ operation: 'update', uid: operation._id, name: this.editedName });
      this.presentAlert('Dispositivo actualizado correctamente', 'Se ha actualizado correctamente el nombre del dispositivo',
        'alert-success-class',
        '../../../assets/icons/dark-success.apng');
    });
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

  navigateClient(id) {
    this.router.navigate([`/customer/${id}`]);
    this.dismiss({});
  }

  manageWebsocketsConnection() {
    this.socketService.onConnect();

    this.socketService.socketMessage.subscribe(message => {
      console.log(message);

      if (message.event === 'COMMAND_RESPONSE' && message.response?.status === 'OK' && message.response?.command === '#>LISTEN_IR') {
        console.log(message.event);
        this.wsResponseReceived = true;
      }
      this.cdr.detectChanges();
      this.wsResponseReceived = false;
    });

    //this.requestStatusFromDevices();
  }

  async presentConfirmationModal(device) {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass: 'custom-modal-class',
      componentProps: {
        title: 'Confirmar borrado',
        message: this.DELETE_CONFIRMATION_MSG,
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
      if (res && res.data && res.data.selection === 'Y') {
        this.deleteDevice(device);
      }
    });
    return await this.modal.present();
  }


  private setInitialConditions() {
    this.socketServerUrl = this.socketService.getSocketServerUrl();

    this.showMain = of(true);
    this.showActions = of(false);
    this.showGpio = of(false);
    this.showSetup = of(false);
  }


}
