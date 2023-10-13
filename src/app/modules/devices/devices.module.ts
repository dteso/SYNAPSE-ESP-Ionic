import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { DevicesComponent } from './devices.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { DeviceDetailModalModule } from 'src/app/components/device-detail-modal/device-detail-modal.module';
import { DeviceEditModalModule } from 'src/app/components/device-edit-modal/device-edit-modal.module';
import { Serial } from '@ionic-native/serial/ngx';
import { DeviceActionsModalModule } from 'src/app/components/device-actions-modal/device-actions-modal.module';
import { CustomModalModule } from 'src/app/components/custom-modal/custom-modal.module';



@NgModule({
  declarations: [DevicesComponent],
  providers: [SocketProviderConnect, Serial],
  imports: [
    CommonModule,
    IonicModule,
    DevicesRoutingModule,
    FormsModule,
    DeviceDetailModalModule,
    DeviceEditModalModule,
    DeviceActionsModalModule,
    CustomModalModule
  ], exports: [DevicesComponent]
})
export class DevicesModule { }
