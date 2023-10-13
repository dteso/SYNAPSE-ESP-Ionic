import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './routing/guards/auth.guard';
import { ClientDetailResolver } from './routing/resolvers/client-detail.resolver';
import { ClientsResolver } from './routing/resolvers/clients.resolver';
import { DevicesResolver } from './routing/resolvers/devices.resolver';
import { HomeResolver } from './routing/resolvers/home.resolver';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule),
    resolve: { preLoad: HomeResolver }
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'bluetooth-terminal',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/bluetooth-terminal/bluetooth-terminal.module').then(m => m.BluetoothTerminalModule)
  },
  {
    path: 'serial-terminal',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/serial-terminal/serial-terminal.module').then(m => m.SerialTerminalModule)
  },
  {
    path: 'network',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/network/pages/network.module').then(m => m.NetworkModule)
  },
  {
    path: 'sockets-client',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/sockets-client/sockets-client.module').then(m => m.SocketsClientModule)
  },
  {
    path: 'devices',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/devices/devices.module').then(m => m.DevicesModule),
    resolve: { preLoad: DevicesResolver }
  },
  {
    path: 'customers',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/clients/clients.module').then(m => m.ClientsModule),
    resolve: { preLoad: ClientsResolver }
  },
  {
    path: 'customer/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/clients/clients-detail/client-detail.module').then(m => m.ClientDetailModule),
    resolve: { preLoad: ClientDetailResolver }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
