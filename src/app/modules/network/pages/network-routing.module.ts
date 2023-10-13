
import { NgModule } from '@angular/core';
import { NetworkComponent } from './network.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'network',
    component: NetworkComponent,
    children: [
      {
        path: 'wifi',
        children: [
          {
            path: '',
            loadChildren: () => import('../components/wifi-logger/wifi-logger.module').then( m => m.WifiLoggerModule)
          }
        ]
      },
      {
        path: 'radio',
        children: [
          {
            path: '',
            loadChildren: () => import('../components/access-point/access-point.module').then( m => m.AccessPointModule)
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../components/network-settings/network-settings.module').then( m => m.NetworkSettingsModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/network/wifi',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/network/wifi',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetworkRoutingModule { } { }