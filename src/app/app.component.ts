import { Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorShareTarget, ShareReceivedEvent } from '@capgo/capacitor-share-target';
import { Platform } from '@ionic/angular/standalone';
import { ShareService } from './share.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false
})
export class AppComponent {
  private platform = inject(Platform);
  private shareService = inject(ShareService);

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

    if (Capacitor.isNativePlatform()) {
      CapacitorShareTarget.addListener('shareReceived', event => this.receiveShareEvent(event));
    }
  }

  receiveShareEvent(event: ShareReceivedEvent) {
    if (!event.texts || event.texts.length === 0) {
      return;
    }

    console.log('Received shared text: ', event.texts[0]);
    this.shareService.setSharedHost(event.texts[0]);
  }

  /**
   * @returns Whether dark mode class is now added.
   */
  toggleDarkTheme(shouldAdd: boolean): boolean {
    return document.body.classList.toggle('dark', shouldAdd);
  }
}
