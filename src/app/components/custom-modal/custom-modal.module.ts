import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomModalComponent } from './custom-modal.component';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';



@NgModule({
  declarations: [CustomModalComponent],
  providers: [SocketProviderConnect],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
})
export class CustomModalModule { }
