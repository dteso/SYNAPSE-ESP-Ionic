import { NgModule } from '@angular/core';
import { SocketsClientComponent } from './sockets-client.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: SocketsClientComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocketsClientRoutingModule { }