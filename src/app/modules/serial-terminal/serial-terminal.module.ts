import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SerialTerminalRoutingModule } from './serial-terminal-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalCommandsModule } from 'src/app/components/modal-commands/modal-commands.module';
import { SerialTerminalComponent } from './serial-terminal.component';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { PdfService } from 'src/app/services/pdf.service';
import { Serial } from '@ionic-native/serial/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ModalCommandsModule,
    SerialTerminalRoutingModule
  ], providers: [
    BluetoothSerial,
    AndroidPermissions,
    SpeechRecognition,
    PdfService,
    Serial
  ],
  declarations: [SerialTerminalComponent]
})
export class SerialTerminalModule { }
