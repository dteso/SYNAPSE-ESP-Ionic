/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-console */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ModalController, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { LoaderService } from 'src/app/services/loader.service';
import { PdfService } from 'src/app/services/pdf.service';
import { StorageService } from 'src/app/services/storage.service';
import { ModalCommandsComponent } from '../../components/modal-commands/modal-commands.component';


const READ_STATUS = '#>SET_MODE:M';

interface DataRow {
  id: number;
  content: string;
  type: string; // sent / received
  timestamp: Date;
}

const MessageTypes = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
};

@Component({
  selector: 'app-bluetooth-teminal',
  templateUrl: 'bluetooth-terminal.component.html',
  styleUrls: ['bluetooth-terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BluetoothTerminalComponent implements OnInit {
  @ViewChild('terminal') terminal: HTMLElement;

  bluetoothDevices = [];
  rawData: DataRow[] = [];
  rawDataSubject = new Observable<any>();
  str = '';
  lastStr = '';
  currentStr = '';
  codeInput = '';
  connectionMessage = READ_STATUS;
  idx: number;
  messageTypes = MessageTypes;

  connected = false;

  terminalForm: FormGroup;

  headerVisible = true;

  currentDevice = {
    name: '',
    address: '',
  };

  modal;
  terminalFormReady: boolean;

  constructor(
    private readonly bt: BluetoothSerial,
    private readonly androidPermissions: AndroidPermissions,
    private readonly cdr: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
    public loaderService: LoaderService,
    private readonly speechRecognition: SpeechRecognition,
    private readonly pdfService: PdfService,
    private readonly modalController: ModalController,
    private readonly storageService: StorageService,
    private readonly router: Router,
    private readonly toaster: ToastController
  ) {
    this.idx = 0;
    this.terminalForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }
  async ngOnInit() {
    await this.androidPermissions
      .requestPermissions([
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
      ])
      .then(() => {
        this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(
            (result) => {
              console.log('Has permission?', result.hasPermission);
              this.bt.isConnected().then((connected) => {
                this.getMappedData();
                this.connected = connected;
                this.bt.write(this.connectionMessage);
                this.cdr.detectChanges();
              });
              this.getStoredDevices();
            },
            (err) =>
              this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
              )
          );
      });
    await this.speechRecognition.hasPermission().then((hasPermission) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission().then(
          () => {
            console.log('Granted');
          },
          () => {
            console.log('Denied');
          }
        );
      }
    });
    this.terminalFormReady = true;
  }

  startSpeechRecognition() {
    const options = {}; // Optional
    this.speechRecognition.startListening().subscribe((matches) => {
      console.log(matches[0]);
      this.idx++;
      this.rawData.unshift({
        id: this.idx,
        content: matches[0],
        type: MessageTypes.SENT,
        timestamp: new Date(),
      });
      this.bt.write(matches[0]);
    });
  }

  onSubmit() {
    if (!this.terminalForm.invalid) {
      this.idx++;
      this.rawData.unshift({
        id: this.idx,
        content: this.terminalForm.controls.message.value,
        type: MessageTypes.SENT,
        timestamp: new Date(),
      });
      this.bt.write(this.terminalForm.controls.message.value);
      this.terminalForm.controls.message.reset();
    }
  }

  getStoredDevices() {
    this.bt.list().then((devs) => {
      console.log(JSON.stringify(devs));
      this.bluetoothDevices.push(devs);
      this.cdr.detectChanges();
    });
  }

  clearConsole() {
    this.rawData = [];
    this.rawDataSubject = of(this.rawData);
    this.idx = 0;
    this.cdr.detectChanges();
  }

  openNativeBluettothSettings() {
    this.bt.showBluetoothSettings();
  }

  connectToDevice(name: string, mac: string, messageOnConnection?) {
    this.loaderService.presentLoading(`Conectando con ${name}`);
    this.bt.connect(mac).subscribe(
      (connected) => {
        console.info('bluetooth connection: ', connected);
        if (connected === 'OK') {
          this.loaderService.hideLoading();
          this.connected = true;
          this.currentDevice = { name, address: mac };
          this.bt.write(this.connectionMessage);
          this.router.navigateByUrl('/devices');
          this.cdr.detectChanges();
        }
        if (messageOnConnection) {
          this.bt.write(messageOnConnection);
        }
        this.getMappedData();
        this.cdr.detectChanges();
      },
      (err) => {
        this.loaderService.hideLoading();
        console.error('Conection Lost... ');
        this.presentErrorAlert();
      }
    );
  }

  disconnect() {
    this.bt
      .disconnect()
      .then((res) => {
        console.info('Disconnected... ' + res);
        this.connected = false;
        this.currentDevice = null;
        this.lastStr = null;
        this.rawData = [];
        this.rawDataSubject = null;
        this.getStoredDevices();
      })
      .catch((err) => console.error('Unable to disconnect'));
  }

  generatePdf() {
    this.pdfService.generatePDF(this.rawData);
  }

  async presentModal() {
    this.modal = await this.modalController.create({
      component: ModalCommandsComponent,
      cssClass: 'my-custom-class'
    });
    this.modal.onDidDismiss().then(res => {
      console.log(res.data.command);
      this.idx++;
      this.rawData.unshift({
        id: this.idx,
        content: res.data.command,
        type: MessageTypes.SENT,
        timestamp: new Date(),
      });
      this.bt.write(res.data.command);
    });
    return await this.modal.present();
  }



  getMappedData() {
    this.bt.subscribeRawData().subscribe((res) => {
      const view = new Uint8Array(res);
      if (view.length >= 1) {
        for (let i = 0; i < view.length; i++) {
          //if we received a \n, the message is complete, display it
          if (view[i] == 13 || view[i] == 0) {
            this.lastStr = this.str;
            this.str = '';
            this.cdr.detectChanges();
          }
          // if not, concatenate with the begening of the message
          else {
            let temp_str = String.fromCharCode(view[i]);
            let str_esc = escape(temp_str);
            this.codeInput = unescape(str_esc);
            this.str += unescape(str_esc);
          }
        }
      }
      console.log(this.lastStr);
      if (this.currentStr !== this.lastStr && this.lastStr !== '') {
        this.idx++;
        this.rawData.unshift({
          id: this.idx,
          content: this.lastStr,
          type: MessageTypes.RECEIVED,
          timestamp: new Date()
        });
        this.currentStr = this.lastStr;
      } else {
        this.lastStr = '';
      }
      this.rawDataSubject = of(this.rawData);
      this.cdr.detectChanges();
    });
  }

  async presentErrorAlert() {
    const toast = await this.toaster.create({
      message: 'Se ha perdido la conexión con el dispositivo bluetooth',
      duration: 5000,
      position: 'top',
      color: 'danger',
    });

    await toast.present();
  }

  collapseHeader() {
    this.headerVisible = !this.headerVisible
  }
}
