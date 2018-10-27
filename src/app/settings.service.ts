import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Settings } from '../models/Settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private currentSettings: Settings;
  private currentPromise?: Promise<any>;

  constructor(private storage: Storage) {}

  public save(settings: Settings): Promise<any> {
    this.currentPromise = this.currentSettings = null; // Ensure future `getCurrentSettings()` don't get old values

    return this.storage.set('settings', settings);
  }

  public getCurrentSettings(): Promise<Settings> {
    if (this.currentPromise instanceof Promise) {
      return this.currentPromise;
    }

    if (this.currentSettings) {
      return Promise.resolve(this.currentSettings);
    }

    const settingsService = this;

    this.currentPromise = this.storage.get('settings').then(settings => {
      if (settings === null) {
        // Initialise with default settings
        settingsService.currentSettings = new Settings();
      } else {
        settingsService.currentSettings = settings;
      }

      return settingsService.currentSettings;
    });

    return this.currentPromise;
  }
}
