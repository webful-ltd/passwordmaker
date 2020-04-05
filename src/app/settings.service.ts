import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

import { Profile } from '../models/Profile';
import { Settings } from '../models/Settings';
import { SettingsAdvanced } from '../models/SettingsAdvanced';
import { SettingsSimple } from '../models/SettingsSimple';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private static storageKey = 'settings';

  public saveSubject: Subject<void> = new Subject<void>();
  private currentSettings: Settings;
  private currentPromise?: Promise<any>;

  constructor(private storage: Storage) {}

  public save(settings: Settings): Promise<any> {
    if (!settings) {
      return Promise.reject('No settings data');
    }

    this.currentPromise = this.currentSettings = null; // Ensure future `getCurrentSettings()` don't get old values

    const settingsForPersist = settings;
    delete settingsForPersist.constructor; // Trying to clone this breaks the storage `set()`.

    const savePromise = this.storage.set(SettingsService.storageKey, settings);

    // Tell listening pages (e.g. Home) that the settings changed
    savePromise.then(() => this.saveSubject.next());

    return savePromise;
  }

  public saveProfile(profile: Profile): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCurrentSettings().then(settings => {
        if (settings instanceof SettingsSimple) {
          settings = new SettingsAdvanced(settings);
        }

        if (!(settings instanceof SettingsAdvanced)) {
          return reject('Settings not of an expected type');
        }

        const existingProfileIndex: number = settings.profiles.findIndex(thisProfile => thisProfile.profile_id === profile.profile_id);
        const isExistingProfile: boolean = (existingProfileIndex > -1);

        if (isExistingProfile) {
          settings.profiles.splice(existingProfileIndex, 1, profile);
        } else {
          settings.profiles.push(profile);
        }

        this.save(settings).then(saveResolveValue => {
          resolve({
            saveResolveValue,
            action: isExistingProfile ? 'updated' : 'created',
          });
        });
      });
    });
  }

  public getCurrentSettings(): Promise<Settings> {
    if (this.currentPromise instanceof Promise) {
      return this.currentPromise;
    }

    if (this.currentSettings) {
      return Promise.resolve(this.currentSettings);
    }

    const settingsService = this;

    this.currentPromise = this.storage.get(SettingsService.storageKey).then(settings => {
      if (settings === null) {
        // Initialise entire dictionary with default settings
        settingsService.currentSettings = new SettingsSimple();

        return settingsService.currentSettings;
      }

      // Set up the correct class, and 'upgrade' settings data to add defaults for any
      // newly-supported keys since the last save
      let loadedSettings: Settings;

      if (settings.class === SettingsAdvanced.name) {
        loadedSettings = new SettingsAdvanced(new SettingsSimple());
      } else {
        loadedSettings = new SettingsSimple();
      }

      for (const key in loadedSettings) {
        if (settings[key] !== undefined) {
          loadedSettings[key] = settings[key];
        }
      }
      loadedSettings.class = settings.class;
      settingsService.currentSettings = loadedSettings;

      return settingsService.currentSettings;
    });

    return this.currentPromise;
  }

  getNextProfileId(): Promise<number> {
    return new Promise(resolve => {
      this.getCurrentSettings().then(settings => {
        if (!(settings instanceof SettingsAdvanced)) {
          resolve(1);
          return;
        }

        const highestExistingProfileId = Math.max.apply(Math, settings.profiles.map(profile => profile.profile_id));
        resolve(highestExistingProfileId + 1);
      });
    });
  }
}
