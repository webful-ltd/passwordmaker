import { Component, inject } from '@angular/core';
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
