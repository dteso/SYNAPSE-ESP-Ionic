import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginModule } from './modules/login/login.module';
import { NetworkModule } from './modules/network/pages/network.module';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { StorageService } from './services/storage.service';
import { HammerConfig } from './services/hammer-config.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NotificationService } from './services/notification.service';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { LoaderModule } from './core/loader/loader.module';
import { SocketProviderConnect } from './services/web-socket.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    LoginModule,
    NetworkModule,
    IonicStorageModule.forRoot({}),
    HammerModule,
    LoaderModule
  ],
  providers: [
    WifiWizard2,
    StorageService,
    NotificationService,
    SocketProviderConnect,
    OneSignal,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }, {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }, { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
