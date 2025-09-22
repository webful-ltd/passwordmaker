import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CapacitorSqliteDriverService } from './capacitor-sqlite-driver.service';
import { LegacyStorageModule } from './legacy-storage.module';
import { SettingsService } from './settings.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot({
      driverOrder: [CapacitorSqliteDriverService._driver, Drivers.IndexedDB]
    }),
    // Provide a separate legacy storage instance so both old and new storage
    // implementations can be injected during a migration.
    LegacyStorageModule.forRoot({
      driverOrder: [Drivers.IndexedDB],
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
