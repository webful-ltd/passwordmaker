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

  async initializeApp() {
    await this.platform.ready();
    await this.settings.init();

    if (this.platform.is('capacitor')) { // Don't crash on web platform.
      StatusBar.setBackgroundColor({ color: '#a11692' });
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
