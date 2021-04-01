import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { CloudSettings } from '@ionic-native/cloud-settings/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsService } from './settings.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
    }),
    AppRoutingModule,
  ],
  providers: [
    Clipboard,
    CloudSettings,
    Keyboard,
    InAppBrowser,
    SettingsService,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
