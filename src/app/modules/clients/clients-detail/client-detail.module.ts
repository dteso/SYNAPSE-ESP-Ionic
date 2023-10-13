import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientDetailComponent } from './client-detail.component';
import { ClientDetailRoutingModule } from './client-detail-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { CoreModule } from 'src/app/core/core.module';
import { CustomModalModule } from 'src/app/components/custom-modal/custom-modal.module';



@NgModule({
  declarations: [ClientDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    ReactiveFormsModule,
    ClientDetailRoutingModule,
    CustomModalModule
  ], providers: [
    SocketProviderConnect
  ]
})
export class ClientDetailModule { }
