import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BluetoothTerminalComponent } from './bluetooth-terminal.component';

const routes: Routes = [
  {
    path: '',
    component: BluetoothTerminalComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BluetoothTerminalRoutingModule {}
