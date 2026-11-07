import { inject, NgModule, provideAppInitializer } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import {
  IonicRouteStrategy,
  provideIonicAngular,
  IonApp,
  IonRouterOutlet,
} from "@ionic/angular";
import { Drivers } from "@ionic/storage";
import { IonicStorageModule } from "@ionic/storage-angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CapacitorSqliteDriverService } from "./capacitor-sqlite-driver.service";
import { SettingsService } from "./settings.service";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot({
      driverOrder: [CapacitorSqliteDriverService._driver, Drivers.IndexedDB],
    }),
    AppRoutingModule,
    IonApp,
    IonRouterOutlet,
  ],
  providers: [
    SettingsService,
    provideAppInitializer(() => inject(SettingsService).init()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
