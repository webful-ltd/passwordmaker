import { Component } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

import { SettingsService } from './settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private settings: SettingsService,
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
      StatusBar.setBackgroundColor({ color: '#a11692' });
    });
  }
}
