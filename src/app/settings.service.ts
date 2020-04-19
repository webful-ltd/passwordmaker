import { Injectable } from '@angular/core';
import { CloudSettings } from '@ionic-native/cloud-settings/ngx';
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

  constructor(private cloudSettings: CloudSettings, private storage: Storage) {}

  public save(settings: Settings): Promise<any> {
    if (!settings) {
      return Promise.reject('No settings data');
    }

    this.currentPromise = this.currentSettings = null; // Ensure future `getCurrentSettings()` don't get old values

    const settingsForPersist = settings;
    delete settingsForPersist.constructor; // Trying to clone this breaks the storage `set()`.

    const savePromise = this.storage.set(SettingsService.storageKey, settings);

    // Tell listening pages (e.g. Home) that the settings changed
    savePromise.then(() => {
      this.saveSubject.next();
      if (window.cordova) { // No cloud settings without a device
        this.cloudSettings.save(settings, true);
      }
    });

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

  public deleteProfile(profileId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCurrentSettings().then(settings => {
        if (!(settings instanceof SettingsAdvanced)) {
          return reject('Settings not of the expected type');
        }

        const existingProfileIndex: number = settings.profiles.findIndex(thisProfile => thisProfile.profile_id === profileId);
        settings.profiles.splice(existingProfileIndex, 1);

        // Ensure some surviving Profile is selected for the Make screen's next use
        settings.setActiveProfile(settings.profiles[0].profile_id);

        this.save(settings).then(saveResolveValue => {
          resolve(saveResolveValue);
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
        return new Promise(resolve => {
          if (!window.cordova) { // No cloud settings without a device
            return resolve(this.loadDefaults());
          }

          this.cloudSettings.exists().then(exists => {
            if (exists) {
              this.cloudSettings.load()
                .then(loadedFromCloud => resolve(loadedFromCloud)) // Load past settings
                .catch(() => resolve(this.loadDefaults())); // Load error
              return;
            }
            // Else existence check worked but no past settings in the cloud
            resolve(this.loadDefaults());
          }).catch(() => resolve(this.loadDefaults())); // Existence check error
        });
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

  /**
   * Initialise entire dictionary with default settings
   */
  private loadDefaults() {
    this.currentSettings = new SettingsSimple();
    return this.currentSettings;
  }
}
