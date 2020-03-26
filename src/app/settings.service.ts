import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

import { Settings } from '../models/Settings';
import { SettingsSimple } from '../models/SettingsSimple';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public saveSubject: Subject<void> = new Subject<void>();
  private currentSettings: Settings;
  private currentPromise?: Promise<any>;

  constructor(private storage: Storage) {}

  public save(settings: Settings): Promise<any> {
    if (!settings) {
      return Promise.reject('No settings data');
    }

    this.currentPromise = this.currentSettings = null; // Ensure future `getCurrentSettings()` don't get old values

    const savePromise = this.storage.set('settings', settings);

    // Tell listening pages (e.g. Home) that the settings changed
    savePromise.then(() => this.saveSubject.next());

    return savePromise;
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
      const defaultSettings = new SettingsSimple();
      if (settings === null) {
        // Initialise entire dictionary with default settings
        settingsService.currentSettings = defaultSettings;
      } else {
        // 'Upgrade' settings data to add defaults for any newly-supported keys since the last save
        for (const key in defaultSettings) {
          if (settings[key] === undefined) {
            settings[key] = defaultSettings[key];
          }
        }
        settingsService.currentSettings = settings;
      }

      return settingsService.currentSettings;
    });

    return this.currentPromise;
  }
}
