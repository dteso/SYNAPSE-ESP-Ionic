import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { ModalCommandsComponent } from 'src/app/components/modal-commands/modal-commands.component';
import { LoaderService } from 'src/app/services/loader.service';
import { PdfService } from 'src/app/services/pdf.service';
import { StorageService } from 'src/app/services/storage.service';
import { Serial } from '@ionic-native/serial/ngx';
import { Router } from '@angular/router';


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

@Component({
  selector: 'app-serial-terminal',
  templateUrl: './serial-terminal.component.html',
  styleUrls: ['./serial-terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerialTerminalComponent implements OnInit {

  @ViewChild('terminal') terminal: HTMLElement;

  serialData = {
    data: '',
    connected: false,
    str: '',
    lastStr: '',
    fullStr: '',
    codeInput: '',
    message: '',
  };

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

  currentDevice = {
    name: '',
    address: '',
  };

  modal;
  terminalFormReady: boolean;

  constructor(
    private readonly bt: BluetoothSerial,
    private readonly serial: Serial,
    private readonly androidPermissions: AndroidPermissions,
    private readonly cdr: ChangeDetectorRef,
    private readonly formBuilder: FormBuilder,
    public loaderService: LoaderService,
    private readonly speechRecognition: SpeechRecognition,
    private readonly pdfService: PdfService,
    private readonly modalController: ModalController,
    private readonly router: Router,
    private readonly storageService: StorageService
  ) {
    this.serialData = {
      data: '',
      connected: false,
      str: '',
      lastStr: '',
      fullStr: '',
      codeInput: '',
      message: '',
    };
  }

  async ngOnInit() {
    this.idx = 0;
    this.terminalForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
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
      this.serial.write(matches[0]);
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
      this.serial.write(this.terminalForm.controls.message.value);
      this.terminalForm.controls.message.reset();
    }
  }

  clearConsole() {
    this.rawData = [];
    this.rawDataSubject = of(this.rawData);
    this.idx = 0;
    this.cdr.detectChanges();
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
        if (!this.serialData.connected) {
          this.router.navigateByUrl('/serial-terminal')
        }
        this.serialData.connected = true;
        this.storageService.setSerialConnected(true);
        this.getMappedData();
      });
    }).catch((error: any) => {
      this.serialData.connected = false;
      this.storageService.setSerialConnected(false);
      this.serialData.data = "CONNECTION [ko]";
      this.cdr.detectChanges();
      console.log(error);
    });
  }

  disconnect() {
    this.serialData.connected = false;
    this.storageService.setSerialConnected(false);
    this.serial.close();
    this.clearConsole();
    this.cdr.detectChanges();
  }

  getMappedData() {
    this.serial.registerReadCallback().subscribe((data) => {
      const view = new Uint8Array(data);
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

}


