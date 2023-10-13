import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ToastController } from '@ionic/angular';
import { Observable, of, Subject } from 'rxjs';
import { LoaderService } from './loader.service';


const READ_STATUS = '>>>READ_STATUS';

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

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  bluetoothDevices = [];
  rawData: DataRow[] = [];
  rawDataSubject = new Subject<any>();
  lastStrSubject = new Subject<any>();
  btDevicesSubject = new Subject<any>();
  btConnected = new Subject<any>();

  str = '';
  lastStr = '';
  currentStr = '';
  codeInput = '';
  connectionMessage = READ_STATUS;
  idx: number;
  messageTypes = MessageTypes;
  currentDevice;

  connected = false;

  constructor(
    private readonly bt: BluetoothSerial,
    private readonly speechRecognition: SpeechRecognition,
    private readonly androidPermissions: AndroidPermissions,
    private readonly toaster: ToastController,
    public loaderService: LoaderService,
  ) { }

  async initBluetooth() {
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
              });
              this.getStoredDevices();
            },
            (err) =>
              this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
              )
          ).catch(err => console.error("No conectado aún"));
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
    // this.terminalFormReady = true;
  }

  send(message) {
    this.bt.write(message);
  }

  subscribe() {
    this.getMappedData();
  }

  isConnected() {
    return this.bt.isConnected();
  }


  getStoredDevices() {
    this.bt.list().then((devs) => {
      console.log(JSON.stringify(devs));
      this.bluetoothDevices.push(devs);
      this.btDevicesSubject.next(this.bluetoothDevices);
    });
  }

  getBtList() {
    return this.btDevicesSubject;
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
      //console.log(this.lastStr);
      this.lastStrSubject.next(this.lastStr);
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
      //console.log(this.rawData);
      this.rawDataSubject.next(this.rawData);
    });
  }


  connectToDevice(name: string, mac: string, messageOnConnection?) {
    this.loaderService.presentLoading(`Conectando con ${name}`);
    this.bt.connect(mac).subscribe(
      (connected) => {
        console.info('bluetooth connection: ', connected);
        if (connected === 'OK') {
          this.loaderService.hideLoading();
          this.connected = true;
          this.btConnected.next(true);
          this.currentDevice = { name, address: mac };
          //this.cdr.detectChanges();
        }
        if (messageOnConnection) {
          this.bt.write(messageOnConnection);
        }
        this.getMappedData();
        //this.cdr.detectChanges();
      },
      (err) => {
        this.loaderService.hideLoading();
        console.error('Conection Lost... ');
        this.btConnected.next(false);
        this.presentErrorAlert();
      }
    );
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

}
