import { Component, inject } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  private platform = inject(Platform);

  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    // SettingsService.init() is handled by provideAppInitializer in app.module.ts
    // to ensure settings are ready before the app bootstraps

    if (this.platform.is('capacitor')) { // Don't crash on web platform.
      StatusBar.setBackgroundColor({ color: '#a11692' });
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Dark }); // "Light text for dark backgrounds."
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.toggleDarkTheme(prefersDark.matches);
    prefersDark.addEventListener('change', event => this.toggleDarkTheme(event.matches));
  }

  /**
   * @returns Whether dark mode class is now added.
   */
  toggleDarkTheme(shouldAdd: boolean): boolean {
    return document.body.classList.toggle('dark', shouldAdd);
  }
}
