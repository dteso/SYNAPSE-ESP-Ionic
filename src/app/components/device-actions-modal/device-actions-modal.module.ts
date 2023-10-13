import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeviceActionsModalComponent } from './device-actions-modal.component';
import { CustomModalModule } from '../custom-modal/custom-modal.module';
import { SocketRquestModalModule } from '../socket-request-modal/socket-rquest-modal.module';


@NgModule({
  declarations: [DeviceActionsModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SocketRquestModalModule
  ],
})
export class DeviceActionsModalModule { }
