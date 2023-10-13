import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfraredFormModalComponent } from './infrared-form-modal.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [InfraredFormModalComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [InfraredFormModalComponent]
})
export class InfraredFormModalModule { }
