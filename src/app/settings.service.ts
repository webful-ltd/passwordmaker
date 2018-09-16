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
        // Initialise with some default settings
        settingsService.currentSettings = new Settings('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 15);
      } else {
        settingsService.currentSettings = settings;
      }

      return settingsService.currentSettings;
    });

    return this.currentPromise;
  }
}
