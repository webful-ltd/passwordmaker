import { Component, inject } from '@angular/core';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular/standalone';

import { SettingsService } from './settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  private platform = inject(Platform);
  private settings = inject(SettingsService);

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    // This is async but we don't need to wait for it to get Platform setup ready.
    // `SettingsService` itself `await`s and knows when it's ready. As well as
    // slowing down real app init slightly, waiting here prevents `AppComponent`
    // unit tests checking for Platform-ready event side effects as easily.
    this.settings.init();

    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) { // Don't crash on web platform.
        // Probably only working on iOS and Android <=14 right now, see `capacitor.config.ts` notes.
        StatusBar.setBackgroundColor({ color: '#a11692' });
      }

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.toggleDarkTheme(prefersDark.matches);
      prefersDark.addEventListener('change', event => this.toggleDarkTheme(event.matches));
    });
  }

  /**
   * @returns Whether dark mode class is now added.
   */
  toggleDarkTheme(shouldAdd: boolean): boolean {
    return document.body.classList.toggle('dark', shouldAdd);
  }
}
