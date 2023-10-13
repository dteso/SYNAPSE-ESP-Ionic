import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { InfraredService } from 'src/app/services/infrared.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { InfraredFormModalComponent } from './infrared-form-modal/infrared-form-modal.component';

@Component({
  selector: 'app-infrared-codes',
  templateUrl: './infrared-codes.component.html',
  styleUrls: ['./infrared-codes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfraredCodesComponent implements OnInit, OnChanges {

  @Input() device: any;
  @Input() wsResponseReceived: any;

  irCodes: any[] = [];
  _irCodes = new Observable<any>();

  modal;


  listeningIr: Observable<boolean>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly irService: InfraredService,
    protected socketService: SocketProviderConnect,
    private readonly modalController: ModalController,
  ) {
    this.listeningIr = of(false);
  }

  ionViewWillEnter() {
    console.log('Device: ', this.device);
    this.manageWebsocketsConnection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wsResponseReceived && changes.wsResponseReceived.currentValue) {
      this.listeningIr = of(false);
      this.getCodes();
      this.cdr.detectChanges();
    }
  }

  ngOnInit() { this.getCodes(); }

  getCodes() {
    this.irService.getIrCodes(this.device.appKey).subscribe(res => {
      // eslint-disable-next-line no-underscore-dangle
      this._irCodes = of(res.irDataList);
      this.cdr.detectChanges();
    });
  }

  async startIrReading() {
    await this.openIrFormModal();
  }


  async openIrFormModal() {
    this.modal = await this.modalController.create({
      component: InfraredFormModalComponent,
      cssClass: 'infrared-form-class',
      componentProps: {}
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res.data.irDataForm.value);
      this.listeningIr = of(true);
      this.cdr.detectChanges();
      this.sendIrListeningRequest(res.data.irDataForm.value);
    });
    return await this.modal.present();
  }

  manageWebsocketsConnection() {
    this.socketService.onConnect();

    this.socketService.socketMessage.subscribe(message => {
      console.log(message);
      this.cdr.detectChanges();
    });

    //this.requestStatusFromDevices();
  }

  sendIrListeningRequest(irUserData) {
    const commandMessage = {
      event: 'REQUEST',
      target: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        MAC: this.device.MAC
      },
      data: {
        payload: `#>LISTEN_IR:${JSON.stringify(irUserData)}`,
        appKey: this.device.appKey
      },
      payload: `#>LISTEN_IR:${JSON.stringify(irUserData)}`,
    };
    this.socketService.send(commandMessage);
  }


  sendIrCode(irCode) {
    const commandMessage = {
      event: 'REQUEST',
      target: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        MAC: this.device.MAC
      },
      data: {
        payload: `#>SEND_IR:${JSON.stringify(irCode)}`,
        appKey: this.device.appKey
      },
      payload: `#>SEND_IR:${JSON.stringify(irCode)}`,
    };
    this.socketService.send(commandMessage);
  }

}
