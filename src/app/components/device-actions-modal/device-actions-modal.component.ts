import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DevicesService } from 'src/app/services/devices/devices.service';
import { CustomModalComponent } from '../custom-modal/custom-modal.component';
import { SocketRquestModalComponent } from '../socket-request-modal/socket-rquest-modal.component';
import { DeviceActionUtils } from './device-actions.utils';


@Component({
  selector: 'app-device-actions-modal',
  templateUrl: './device-actions-modal.component.html',
  styleUrls: ['./device-actions-modal.component.scss'],
})
export class DeviceActionsModalComponent implements OnInit {

  title = 'default title';
  message;
  buttons;
  device;
  style;
  icon;
  modal;

  constructor(
    private readonly modalController: ModalController,
  ) { }

  ngOnInit() { }

  async dismiss(value) {
    console.log('dismissValue', value);
    await this.modalController.dismiss({
      // eslint-disable-next-line quote-props
      'selection': value,
    });

  }

  async setOnclosePayload(selectedValue) {
    switch (selectedValue) {
      case 'D':
        this.presentConfirmationModalOperation(
          this.device, 'modal-actions-confirm',
          DeviceActionUtils.DELETE_DEVICE_TITLE,
          DeviceActionUtils.DELETE_DEVICE_MSG,
          DeviceActionUtils.DELETE_DEVICE_BUTTONS
        );
        break;
      case 'B':
        this.presentConfirmationModalOperation(
          this.device,
          'modal-actions-confirm',
          DeviceActionUtils.BYPASS_DEVICE_TITLE,
          DeviceActionUtils.BYPASS_DEVICE_MSG,
          DeviceActionUtils.BYPASS_DEVICE_BUTTONS);
        break;
      case 'Q':
        this.presentConfirmationModalOperation(
          this.device,
          'modal-actions-confirm',
          DeviceActionUtils.TO_QUARENTINE_TITLE,
          DeviceActionUtils.TO_QUARENTINE_MSG,
          DeviceActionUtils.TO_QUARENTINE_BUTTONS
        );
        break;
      case 'L':
        await this.presentConfirmationModalOperation(
          this.device,
          'modal-actions-confirm',
          DeviceActionUtils.LOCK_DEVICE_TITLE,
          DeviceActionUtils.LOCK_DEVICE_MSG,
          DeviceActionUtils.LOCK_DEVICE_BUTTONS
        );
        break;
      case 'N':
        await this.presentConfirmationModalOperation(
          this.device,
          'modal-actions-confirm',
          DeviceActionUtils.RESTORE_DEVICE_TITLE,
          DeviceActionUtils.RESTORE_DEVICE_MSG,
          DeviceActionUtils.RESTORE_DEVICE_BUTTONS);
        break;
      default:
        break;

    }
  }

  async presentConfirmationModalOperation(device, cssClass, title, message, buttons) {
    this.modal = await this.modalController.create({
      component: CustomModalComponent,
      cssClass,
      componentProps: {
        title,
        message,
        buttons,
        style: {
          contentColor: 'black'
        }
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
      if (res.data.selection !== null) {
        this.sendCommand(res.data.selection, device);
      } else {
        this.dismiss(null);
      }

    });

    return await this.modal.present();
  }

  async sendCommand(selection, device) {
    setTimeout(() => {

      this.dismiss({ operation: selection, uid: device.uid }); //Esta operación se controlad en DEVICES.COMPONENT.TS

      let strStatus = '';
      switch (selection) {
        case 'D':
          strStatus = 'BORRADO';
          break;
        case 'B':
          strStatus = 'ANULADO';
          break;
        case 'Q':
          strStatus = 'PUESTO EN CUARENTENA';
          break;
        case 'L':
          strStatus = 'BLOQUEADO';
          break;
        case 'N':
          strStatus = 'RESTAURADO';
          break;
        default:
          break;
      }
      this.presentSocketRequestModal(
        `${device.name}`,
        `Enviando solicitud a dispositivo ${device.name.toUpperCase()}
          para ser ${strStatus.toUpperCase()}...`,
        'alert-request-class',
        '../../../assets/icons/dark-success.apng');
    }, 200);
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


  getButtonStyle(button) {
    return `color: ${button.value === this.device.mode ? button.color : '#FFFFFF'}; --background: ${button.background};`;
  }

  getModalStyle() {
    return `color: ${this.style?.color}; --background: ${this.style?.background}; text-align: ${this.style?.textAlignment}; padding: 3rem;`;
  }

  getContentColor() {
    return `margin-top: 1rem; padding: 1.2rem; color: ${this.style?.contentColor}`;
  }

  getSelectedModeStyle(button) {
    return `color: ${button.color}; text-align: center; font-size: 12px;`;
  }

}
