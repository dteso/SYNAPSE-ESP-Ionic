import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './home.component';
import { ClientsModule } from '../clients/clients.module';
import { DevicesModule } from '../devices/devices.module';
import { DeviceEditModalModule } from 'src/app/components/device-edit-modal/device-edit-modal.module';
import { CustomModalModule } from 'src/app/components/custom-modal/custom-modal.module';



@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IonicModule,
    ClientsModule,
    DevicesModule,
    DeviceEditModalModule,
    CustomModalModule
  ]
})
export class HomeModule { }
