import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceEditModalComponent } from './device-edit-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomModalModule } from '../custom-modal/custom-modal.module';
import { SocketRquestModalModule } from '../socket-request-modal/socket-rquest-modal.module';
import { InfraredService } from 'src/app/services/infrared.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { InfraredCodesModule } from './components/infrared-codes/infrared-codes.module';


@NgModule({
  declarations: [DeviceEditModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    SocketRquestModalModule,
    CustomModalModule,
    InfraredCodesModule,
  ], providers: [
    InfraredService,
    SocketProviderConnect]
})
export class DeviceEditModalModule { }
