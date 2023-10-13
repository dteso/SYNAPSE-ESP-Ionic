import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Clientes', url: '/customers', icon: 'people' },
    { title: 'Devices', url: '/devices', icon: 'hardware-chip' },
    { title: 'Bluetooth', url: '/bluetooth-terminal', icon: 'bluetooth' },
    { title: 'USB', url: '/serial-terminal', icon: 'terminal' },
    { title: 'Log', url: '/sockets-client', icon: 'cloud-circle' },

  ];

  public labels = ['Bluetooth', 'Serial', 'Mqtt Client', 'Http Client'];

  constructor() { }

  ngOnInit() { }


}
