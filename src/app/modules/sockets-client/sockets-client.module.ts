import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SocketsClientRoutingModule } from './sockets-client-routing.module';
import { SocketsClientComponent } from './sockets-client.component';
import { FormsModule } from '@angular/forms';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { ReversePipe } from 'src/app/pipes/reverse.pipe';

@NgModule({
  declarations: [SocketsClientComponent, ReversePipe],
  providers: [SocketProviderConnect],
  imports: [
    CommonModule,
    IonicModule,
    SocketsClientRoutingModule,
    FormsModule
  ]
})
export class SocketsClientModule { }
