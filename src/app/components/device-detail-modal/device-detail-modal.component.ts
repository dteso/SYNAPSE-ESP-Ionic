/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Serial } from '@ionic-native/serial/ngx';
import { ModalController, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { DevicesService } from 'src/app/services/devices/devices.service';
import { LoaderService } from 'src/app/services/loader.service';
import { NetworkService } from 'src/app/services/network.service';
import { StorageService } from 'src/app/services/storage.service';
import { CustomModalComponent } from '../custom-modal/custom-modal.component';

enum STATUS {
  INITIAL,
  STA_LISTEN,
  STA_DONE,
  WIFI_CONNECTION_DONE,
  CONFIG_SET_LISTEN,
  SAVING_DEVICE,
  COMPLETED,
  CONFIG_DONE
}

interface DataRow {
  id: number;
  content: string;
  type: string; // sent / received
  timestamp: Date;
}

// interface Process {
//   launchProcessCmd: number;
//   content: string;
//   type: string; // sent / received
//   completed: boolean;
// }


const MessageTypes = {
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',
};

@Component({
  selector: 'app-device-detail-modal',
  templateUrl: './device-detail-modal.component.html',
  styleUrls: ['./device-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceDetailModalComponent implements OnInit {

  deviceForm: FormGroup;
  bluetootDevicesList;
  devicesLoaded = false;

  currentStep;
  onForward = true;
  bluetoothConnected = new Observable<boolean>();

  status = 0;

  data;

  MAC = '';
  ip = '';
  isOnline = false;
  connected = false; // For wifi in phone enabled

  newDevice;

  bluetoothDevice;

  clientsOptions;

  appKey;


  /*SERIAL*/
  serialData = {
    data: '',
    connected: false,
    str: '',
    lastStr: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };
  str = '';
  lastStr = '';
  currentStr = '';
  idx: number;
  messageTypes = MessageTypes;
  rawData: DataRow[] = [];
  codeInput = '';

  processStarted = false; // indica si se ha iniciado el proceso de conexión por el puerto serie

  modal;


  constructor(
    public loaderService: LoaderService,
    private readonly formBuilder: FormBuilder,
    private readonly modalController: ModalController,
    private readonly btService: BluetoothService,
    private readonly cdr: ChangeDetectorRef,
    private readonly devicesService: DevicesService,
    private readonly toastController: ToastController,
    private readonly networkService: NetworkService,
    private readonly androidPermissions: AndroidPermissions,
    private readonly serial: Serial,
    private readonly storageService: StorageService,
  ) {
    this.deviceForm = this.formBuilder.group({
      ssid: [{ value: '', disabled: false }, Validators.required],
      pass: [{ value: '', disabled: false }, Validators.required],
      MAC: [{ value: '', disabled: false }, Validators.required],
      ip: [{ value: '', disabled: false }, Validators.required],
      name: [{ value: '', disabled: false }, Validators.required],
      customer: [{ value: '', disabled: false }, Validators.required],
      minLevelReached: [{ value: '', disabled: false }],
      appKey: [{ value: '', disabled: false }]
    });


  }

  async ngOnInit() {
    this.storageService.getItem('USER').then(data => {
      this.appKey = data.user.appKey;
      this.deviceForm.controls.appKey.setValue(this.appKey);
    });

    this.currentStep = 1;

    /** BLUETOOTH **/
    this.beginBluetooth();

    /** SERIE ***/
    await this.beginUSB();
  }

  logForm() {
    console.log(this.deviceForm.value);
  }

  nextStep() {
    this.logForm();

    if (this.isStep1() && this.status === STATUS.INITIAL) {
      this.setWifiParameters();
      this.status = STATUS.STA_LISTEN;
    }

    if (this.isStep2() && this.deviceForm.valid) {
      this.setDeviceConfig();
      this.status = STATUS.CONFIG_SET_LISTEN;
    }
    this.onForward = true;
  }

  previousStep() {
    this.currentStep--;
    this.onForward = false;
    this.cdr.detectChanges();
  }

  // flags para step actual
  isStep1() {
    return this.currentStep === 1;
  }

  isStep2() {
    return this.currentStep === 2;
  }

  isStep3() {
    return this.currentStep === 3;
  }

  async dismiss() {
    if (this.isStep3()) {
      await this.modalController.dismiss({
        'dismissed': true,
        'closePayload': this.newDevice
      });
    }
    await this.modalController.dismiss({
      'dismissed': true
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


  /*** SERIAL ****/
  runSerialPort() {
    this.serial.requestPermission(
      {
        vid: '10c4',
        pid: 'ea60',
        driver: 'Cp21xxSerialDriver' // pendiente de generar archivo configurable para establecer aquí el seleccionado en la aplicación
      }
    ).then(() => {
      this.serial.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: true,
        rts: true,
        sleepOnPause: false
      }).then(() => {
        console.log('Serial connection opened');
        this.serialData.connected = true;
        this.storageService.setSerialConnected(true);
        this.bluetoothConnected = of(true);
        this.getMappedData();
      });
    }).catch((error: any) => {
      this.serialData.connected = false;
      this.storageService.setSerialConnected(false);
      this.serialData.data = 'CONNECTION [ko]';
      this.cdr.detectChanges();
      console.log(error);
    });
  }

  getMappedData() {
    this.serial.registerReadCallback().subscribe((data) => {
      const view = new Uint8Array(data);
      if (view.length >= 1) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < view.length; i++) {
          //if we received a \n, the message is complete, display it
          // eslint-disable-next-line eqeqeq
          if (view[i] == 13 || view[i] == 0) {
            this.lastStr = this.str;
            this.str = '';
            this.cdr.detectChanges();
          }
          // if not, concatenate with the begening of the message
          else {
            const temp_str = String.fromCharCode(view[i]);
            const str_esc = escape(temp_str);
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
        this.data = this.lastStr;  // Establecemos la data en el data principal (debería ser última señal)
      } else {
        this.lastStr = '';
      }
      this.data = this.lastStr; // Establecemos la data en el data principal (debería ser última señal)
      this.checkData();
      this.cdr.detectChanges();
    });
  }


  /**
   * BLUETOOTH
   */
  private beginBluetooth() {
    this.btService.subscribe();
    this.btService.isConnected().then(isConnected => {
      this.bluetoothConnected = of(isConnected);
      this.btService.lastStrSubject.subscribe(res => {
        this.data = res;
        this.cdr.detectChanges();
        this.checkData();
        this.bluetoothDevice = this.btService.bluetoothDevices;
      });
    }).catch(e => {
      console.error('ERROR: No conectado a bluetooth');
      this.bluetoothConnected = of(false);
    });
    console.log(this.clientsOptions);

    this.networkService.getSSID().then(res => {
      if (res) {
        this.connected = true;
        console.log('got SSID!');
      }
      this.deviceForm.controls.ssid.setValue(res);
    });
  }

  /**
   * USB
   */
  private async beginUSB() {
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
              this.runSerialPort();
            },
            (err) => this.androidPermissions.requestPermission(
              this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
            )
          );
      });
  }

  private setWifiParameters() {
    const command = `#>SET_NETWORK: {"staSsid": "${this.deviceForm.controls.ssid.value.trim()}", "staPass": "${this.deviceForm.controls.pass.value.trim()}"}\n`;
    this.btService.send(command);
    if (this.serialData.connected && !this.processStarted) {
      this.processStarted = true;
      setTimeout(() => {
        this.serial.write(command);
      }, 100);
    }
    this.loaderService.presentLoading('Conectando dispositivo a red local...');
  }


  private setDeviceConfig() {
    const deviceData = {
      appKey: this.appKey,
      type: 'DEV',
      name: this.deviceForm.controls.name.value.trim()
    };
    this.logForm();
    this.btService.send(`#>SET_CONFIG:${JSON.stringify(deviceData)}\n`);
    if (this.serialData.connected) {
      setTimeout(() => {
        this.serial.write(`#>SET_CONFIG:${JSON.stringify(deviceData)}\n`);
      }, 100);
    }
    this.loaderService.presentLoading('Guardando datos en dispositivo...');
  }



  private checkData() {
    console.log('>>> SERIAL DATA --> ', this.data);

    this.getMacFormData(this.data);

    switch (this.status) {

      case STATUS.STA_LISTEN:
        this.listenForWifiConnectionSuccess();
        break;

      case STATUS.WIFI_CONNECTION_DONE:
        this.loaderService.hideLoading();
        this.currentStep = 2; // En el step 2 se setea el nombre al submitear
        break;

      case STATUS.CONFIG_SET_LISTEN:
        this.listenForConfigSet();
        break;

      case STATUS.CONFIG_DONE:
        this.saveDevice();
        break;

      case STATUS.SAVING_DEVICE:
        break;

      case STATUS.COMPLETED:
        this.loaderService.hideLoading();
        this.currentStep = 3;

    }
  }

  private listenForWifiConnectionSuccess() {
    if (this.data.indexOf('[ESP_INFO] STA_ONLINE: ') > 0) {
      const initialIndex = 24;
      this.isOnline = true;
      this.ip = this.data.substring(initialIndex, this.data.length).trim();
      this.deviceForm.controls.ip.setValue(this.ip);
      this.status = STATUS.WIFI_CONNECTION_DONE;
    }
  }

  private listenForConfigSet() {
    if (this.data.indexOf(`[ESP_INFO] LOADED CONFIGURATION:`) > 0) {
      const initialIndex = 33;
      const dataResponse = this.data.substring(initialIndex, this.data.length).trim();
      const dataResponseObj = JSON.parse(dataResponse);

      if (dataResponseObj.appKey === this.appKey) {
        this.status = STATUS.CONFIG_DONE;
      }
    }
  }


  private saveDevice() {
    if (this.status !== STATUS.SAVING_DEVICE) {
      this.devicesService.createDevice(this.deviceForm.value).subscribe(res => {
        if (res.ok === true) {
          this.newDevice = res.dbDevice;
          this.status = STATUS.COMPLETED;
        } else {
          this.presentAlert('Error añadiendo dispositivo',
            'Ocurrió un error mientras se creaba el dispositivo',
            'alert-danger-class',
            '../../../assets/icons/warning-dark.apng');
          this.modalController.dismiss();
        }
        this.cdr.detectChanges();
        this.loaderService.hideLoading();
      });
      this.status = STATUS.SAVING_DEVICE;
    }
  }

  // Obtiene la MAC del dispositivo en el stream de datos en los reboots generados por los comandos de seteo
  private getMacFormData(data) {
    if (data.indexOf('DEVICE_MAC:') > 0) {
      const initialIndex = 12;
      this.MAC = this.data.substring(initialIndex, data.length).trim();
      this.deviceForm.controls.MAC.setValue(this.MAC);
      console.log('MAC::::::::::::::::::::::::::::::::::::::::::::::::> ', this.MAC);
    }
  }




}
