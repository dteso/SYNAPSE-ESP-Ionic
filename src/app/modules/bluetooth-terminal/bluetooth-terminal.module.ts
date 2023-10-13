import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BluetoothTerminalComponent } from './bluetooth-terminal.component';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import { BluetoothTerminalRoutingModule } from './bluetooth-terminal-routing.module';
import { PdfService } from 'src/app/services/pdf.service';
import { ModalCommandsModule } from '../../components/modal-commands/modal-commands.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BluetoothTerminalRoutingModule,
    ReactiveFormsModule,
    ModalCommandsModule
  ],
  providers: [
    BluetoothSerial,
    AndroidPermissions,
    SpeechRecognition,
    PdfService
  ],
  declarations: [BluetoothTerminalComponent]
})
export class BluetoothTerminalModule {}
