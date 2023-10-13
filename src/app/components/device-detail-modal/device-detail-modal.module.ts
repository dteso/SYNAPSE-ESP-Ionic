import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { DeviceDetailModalComponent } from './device-detail-modal.component';
import { BluetoothService } from 'src/app/services/bluetooth.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NetworkService } from 'src/app/services/network.service';
import { Serial } from '@ionic-native/serial/ngx';
import { CustomModalModule } from '../custom-modal/custom-modal.module';



@NgModule({
  declarations: [DeviceDetailModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
  providers: [
    StorageService,
    NetworkService,
    BluetoothService,
    Serial,
    BluetoothSerial,
    SpeechRecognition,
    AndroidPermissions,
    CustomModalModule
  ]
})
export class DeviceDetailModalModule { }
