import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfraredCodesComponent } from './infrared-codes.component';
import { IonicModule } from '@ionic/angular';
import { InfraredService } from 'src/app/services/infrared.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';
import { InfraredFormModalModule } from './infrared-form-modal/infrared-form-modal.module';



@NgModule({
  declarations: [InfraredCodesComponent],
  imports: [
    CommonModule,
    IonicModule,
    InfraredFormModalModule
  ],
  providers: [InfraredService, SocketProviderConnect],
  exports: [InfraredCodesComponent]
})
export class InfraredCodesModule { }
