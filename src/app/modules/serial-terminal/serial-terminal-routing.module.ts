import { NgModule } from '@angular/core';
import { SerialTerminalComponent } from './serial-terminal.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SerialTerminalComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SerialTerminalRoutingModule { }
