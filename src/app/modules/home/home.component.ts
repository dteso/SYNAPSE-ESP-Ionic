import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable, of, Subscription } from 'rxjs';
import { CustomModalComponent } from 'src/app/components/custom-modal/custom-modal.component';
import { DeviceEditModalComponent } from 'src/app/components/device-edit-modal/device-edit-modal.component';
import { literals } from 'src/app/config/const/literals';
import { DevicesService } from 'src/app/services/devices/devices.service';
import { NotificationService } from 'src/app/services/notification.service';
import { LoaderService } from 'src/app/services/screen-loader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  subscription: Subscription;

  selectedNotifications = [];

  CONSTANTS = literals;

  inSelectionMode = false;

  showNews: Observable<any>;
  showRead: Observable<any>;

  _messages = new Observable<any>(); // TODO cambiar a Customer/Client el any
  messages = [];

  _notReadMessages = new Observable<any>(); // TODO cambiar a Customer/Client el any
  notReadMessages = [];

  _readMessages = new Observable<any>(); // TODO cambiar a Customer/Client el any
  readMessages = [];

  modal;
  selectedDevice;


  constructor(
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly modalController: ModalController,
    private readonly devicesService: DevicesService,
    private readonly screenLoaderService: LoaderService
  ) { }


  ionViewWillEnter() {
    this.showNews = of(true);
    this.getDataFromResolver();
  }


  getDataFromResolver() {
    this.screenLoaderService._loading$.next(true);
    this.route.data
      .subscribe(data => {
        const routeData: any = data;

        console.log("DATA in resolver: ", routeData);

        routeData.preLoad?.notifications.subscribe(data => {

          this.messages = data.response ? data.response.messages : [];

          this.messages.forEach(message => message.isSelected = false);

          this.notReadMessages = this.messages.filter(msg => msg.read === false);
          this.readMessages = this.messages.filter(msg => msg.read === true);

          let reversed = this.notReadMessages.reverse();
          this._notReadMessages = of(reversed);

          reversed = this.readMessages.reverse();
          this._readMessages = of(reversed);
          this.screenLoaderService._loading$.next(false);
          this.cdr.detectChanges();
        });
      });
  }

  navigateLogin() {
    this.router.navigate(['login']);
    this.inSelectionMode = false;
    this.selectedNotifications = [];
  }

  navigateClient(id) {
    this.router.navigate([`/customer/${id}`]);
    this.inSelectionMode = false;
    this.selectedNotifications = [];
  }

  onPress(notification) {
    if (!this.inSelectionMode) {
      console.log(notification);
      this.inSelectionMode = true;
      notification.isSelected = true;
    }
    const searchedIndex = this.messages.findIndex(msg => msg._id == notification._id);
    this.selectedNotifications.push(notification._id);
    this.messages[searchedIndex].isSelected = true;

    console.log('Selected items', this.selectedNotifications);
  }

  onClick(notification) {
    if (notification.isSelected) {
      const deleteIndex = this.selectedNotifications.findIndex(id => notification._id == id);
      this.selectedNotifications.splice(deleteIndex, 1);
      notification.isSelected = false;

      if (this.selectedNotifications.length === 0) this.inSelectionMode = false;

    } else if (!notification.isSelected && this.inSelectionMode) {
      const searchedIndex = this.messages.findIndex(msg => msg._id == notification._id);
      this.selectedNotifications.push(notification._id);
      this.messages[searchedIndex].isSelected = true;
    }
    console.log('Selected items', this.selectedNotifications);
    this.cdr.detectChanges();
  }

  markSelectedsAsRead() {
    this.notificationService.setManyAsRead(this.selectedNotifications).subscribe(res => {
      this.selectedNotifications = [];
      this.inSelectionMode = false;
      this.messages = res.response.messages;

      this.notReadMessages = this.messages.filter(msg => msg.read === false);
      this.readMessages = this.messages.filter(msg => msg.read === true);

      let reversed = this.notReadMessages.reverse();
      this._notReadMessages = of(reversed);

      reversed = this.readMessages.reverse();
      this._readMessages = of(reversed);

      this.cdr.detectChanges();
    });
  }

  onSegmentChange(event) {
    console.log('EVENT', event.detail.value);
    if (event.detail.value === 'notRead') {
      this.showNews = of(true);
      this.showRead = of(false);
    } else if (event.detail.value === 'alreadyRead') {
      this.showRead = of(true);
      this.showNews = of(false);
    }
    this.cdr.detectChanges();
  }

  setSelectedDeviceFromNotification() {
    this.screenLoaderService._loading$.next(true);
    const notification = this.messages.filter(message => message.isSelected === true)[0];
    this.devicesService.getByLoggedUser().subscribe(response => {
      const devices = response.dbDevices;
      this.selectedDevice = devices.filter(device => device.uid === notification.device)[0];
      this.screenLoaderService._loading$.next(false);
    });
  }

  async presentDeviceEditModal() {
    this.modal = await this.modalController.create({
      component: DeviceEditModalComponent,
      cssClass: 'devices-edit-modal-class',
      componentProps: {
        device: this.selectedDevice
      }
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res);
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
