import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientModalComponent } from './client-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { CustomModalModule } from '../custom-modal/custom-modal.module';

@NgModule({
  declarations: [ClientModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CustomModalModule
  ], providers: [ClientsService]
})
export class ClientModalModule { }
