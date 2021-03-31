import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { SettingsService } from './settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private settings: SettingsService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // This is async but we don't need to wait for it to get Platform setup ready.
    // `SettingsService` itself `await`s and knows when it's ready. As well as
    // slowing down real app init slightly, waiting here prevents `AppComponent`
    // unit tests checking for Platform-ready event side effects as easily.
    this.settings.init();

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#a11692');
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
  }
}
