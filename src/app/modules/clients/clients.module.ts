import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsComponent } from './clients.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientModalModule } from 'src/app/components/client-modal/client-modal.module';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { CoreModule } from 'src/app/core/core.module';
import { CustomModalModule } from 'src/app/components/custom-modal/custom-modal.module';


@NgModule({
  declarations: [ClientsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    ReactiveFormsModule,
    ClientsRoutingModule,
    ClientModalModule,
    CustomModalModule
  ],
  providers: [
    ClientsService
  ],
  exports: [ClientsComponent]
})
export class ClientsModule { }
