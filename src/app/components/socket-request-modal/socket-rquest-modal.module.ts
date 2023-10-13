import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketRquestModalComponent } from './socket-rquest-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';



@NgModule({
  declarations: [SocketRquestModalComponent],
  providers: [SocketProviderConnect],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule
  ],
})
export class SocketRquestModalModule { }
