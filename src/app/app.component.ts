import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { PushService } from './services/push.service';
import { StorageService } from './services/storage.service';
import { SocketProviderConnect } from './services/web-socket.service';
import { SocketClient } from './models/socket-client-model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  logged;
  socketClient: SocketClient;

  constructor(private readonly storageService: StorageService, private readonly authService: AuthService, private platform: Platform,
    private pushService: PushService, private wsService: SocketProviderConnect) {
    this.authService.isAuthenticated$.subscribe(isLogged => {
      this.logged = isLogged;
    });
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.wsService.onConnect();
      this.pushService.configuracionInicial();
    });
  }
}
