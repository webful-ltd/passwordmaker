import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SettingsService } from './settings.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot({
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
    }),
    AppRoutingModule,
    IonApp,
    IonRouterOutlet
  ],
  providers: [
    CloudSettings,
    SettingsService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
