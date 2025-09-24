import { Injectable, inject } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular/standalone';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { Storage } from '@ionic/storage-angular';
import { LEGACY_STORAGE } from './legacy-storage.module';
import { Subject } from 'rxjs';

import { CapacitorSqliteDriverService } from './capacitor-sqlite-driver.service';
import { Profile } from '../models/Profile';
import { Settings } from '../models/Settings';
import { SettingsAdvanced } from '../models/SettingsAdvanced';
import { SettingsSimple } from '../models/SettingsSimple';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private cloudSettings = inject(CloudSettings);
  private platform = inject(Platform);
  private storage = inject(Storage);
  // Optional legacy storage instance for migration. Code can reference
  // `this.legacyStorage` to read from the old storage while writes go to the
  // new one. This does not change existing behaviour until you start using it.
  private legacyStorage = inject(LEGACY_STORAGE, { optional: true });
  toast = inject(ToastController);

  private static storageKey = 'settings';

  ready = false;
  saveSubject: Subject<void> = new Subject<void>();
  private currentSettings: Settings;
  private currentPromise?: Promise<any>;

  async init() {
    // On Capacitor wait for platform/plugin readiness before attempting to
    // register the SQLite driver. On web, create immediately and fall back to
    // web drivers (IndexedDB/localStorage).
    if (this.platform.is('capacitor')) {
      await this.storage.defineDriver(CapacitorSqliteDriverService);
      await this.storage.create();
      console.log('Storage created (capacitor)');
      setTimeout(async () => {
        console.log('new storage keys are: ' + JSON.stringify(await this.storage.keys()));
      }, 2_000);
    } else {
      // Web: create immediately using IndexedDB/localStorage fallback
      await this.storage.create();
      console.log('Storage created (web)');
    }

    // Log and temporarily toast-alert which driver is in use
    console.log('Using storage driver ' + this.storage.driver);

    // Attempt migration from legacy storage (if present). Block init until migration
    // completes so callers that rely on `ready` will see migrated data.
    try {
      await this.migrateLegacySettings();
      console.log('Migrated if necessary');
    } catch (err) {
      console.error('Migration error', err);
      // Show a friendly toast but keep full details in console for diagnostics
      await this.toast.create({ message: 'Settings migration failed (see console for details)', duration: 6_000, position: 'middle', cssClass: 'error' })
        .then(t => t.present());

      console.log('Migration catch block');
    }

    // Mark ready after migration completes (successful or not)
    this.ready = true;
  }

  private async migrateLegacySettings(): Promise<boolean> {
    if (!this.legacyStorage) {
      console.log('skipped migrate actually, no legacy storage');
      return false; // No legacy provider configured
    }

    try {
      // Legacy storage should use the ionic/storage default drivers (IndexedDB, etc.).
      // Don't attempt to register the SQLite driver for the legacy provider — that
      // driver is only for the new storage instance.
      if (typeof this.legacyStorage.create === 'function') {
        try {
          await this.legacyStorage.create();
        } catch (e) {
          console.log('Legacy storage create failed', e);
          // ignore create errors from legacy storage
        }
      }

      console.log('legacy storage keys are: ' + JSON.stringify(await this.legacyStorage.keys()));

      const legacyValue = await this.legacyStorage.get(SettingsService.storageKey);
      if (legacyValue === null || legacyValue === undefined) {
        console.log('No legacy value found');
        return false; // nothing to migrate
      }

      console.log('legacy value found', legacyValue);

      const newValue = await this.storage.get(SettingsService.storageKey);
      // If new storage already has settings, avoid overwriting unless different
      if (newValue !== null && newValue !== undefined) {
        // If identical, just remove legacy key; if different, do not overwrite — log and skip
        const same = JSON.stringify(newValue) === JSON.stringify(legacyValue);
        if (same) {
          console.log('no-op, same value');

          if (this.legacyStorage.driver === this.storage.driver) {
            console.log('Same driver for both, will not migrate');
            return false;
          }

          await this.legacyStorage.remove(SettingsService.storageKey);
          await this.toast.create({ message: 'Legacy settings removed (already present in new storage)', duration: 6_000, position: 'middle' }).then(t => t.present());
          return true;
        }

        // Do not overwrite user's newer settings
        console.warn('Legacy settings exist but new storage already contains different settings. Skipping migration.');
        return false;
      }

      // Perform migration: write into new storage, confirm, then delete legacy copy
      console.log('migrating legacy settings', legacyValue);
      await this.storage.set(SettingsService.storageKey, legacyValue);
      // verify write
      const verify = await this.storage.get(SettingsService.storageKey);
      if (JSON.stringify(verify) === JSON.stringify(legacyValue)) {
        await this.legacyStorage.remove(SettingsService.storageKey);

        return true;
      }

      // If verification failed, remove the new value to avoid partial migration
      await this.storage.remove(SettingsService.storageKey).catch(() => {});
      throw new Error('Verification failed after writing migrated settings');
    } catch (err) {
      console.error('migrateLegacySettings error', err);
      throw err;
    }
  }

  public save(settings: Settings): Promise<any> {
    if (!settings) {
      return Promise.reject('No settings data');
    }

    this.currentPromise = this.currentSettings = null; // Ensure future `getCurrentSettings()` don't get old values

    // Trying to clone this breaks the storage `set()` and almost certainly Cloud Settings `save()`.
    delete settings.constructor;

    console.log('save is about to use', settings);
    const savePromise = this.storage.set(SettingsService.storageKey, settings);

    // Tell listening pages (e.g. Home) that the settings changed
    savePromise.then(() => {
      this.saveSubject.next();
      if (this.platform.is('capacitor')) { // No cloud settings without a device
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

        const clashingNameProfileIndex: number = settings.profiles.findIndex(thisProfile => (
          thisProfile.name === profile.name &&
          thisProfile.profile_id !== profile.profile_id
        ));
        if (clashingNameProfileIndex > -1) {
          reject(`Profile name "${profile.name}" is already in use`);
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

  /**
   * `instanceof` is safe for runtime users of the return value from this fn's promise, because
   * this fn constructs a new copy of the serialised settings and so the prototype chain is correct.
   * Don't use `storage.get()` without doing this as it will break the ability to distinguish
   * between Settings subclasses.
   */
  getCurrentSettings(): Promise<Settings> {
    if (this.currentPromise instanceof Promise) {
      return this.currentPromise;
    }

    if (this.currentSettings) {
      return Promise.resolve(this.currentSettings);
    }

    if (!this.ready) {
      console.log('getCurrentSettings called when we were not ready yet');

      return new Promise<Settings>((resolve) => {
        setTimeout(() => {
          if (!this.ready) {
            throw new Error('Storage not ready after 30 seconds');
          }
        }, 30000);
        // Not ready yet -> try again in 1s and resolve with result.
        setTimeout(() => this.getCurrentSettings().then(result => resolve(result)), 1000);
      });
    }

    const settingsService = this;


    console.log('Using storage ' + this.storage.driver);
    console.log('Using storage class ' + this.storage.constructor.name);
    console.log('Using storage', this.storage);

    this.currentPromise = this.storage.get(SettingsService.storageKey).then(settings => {
      if (settings === null) {
        console.log('No existing settings found');

        return new Promise(resolve => {
          if (!this.platform.is('capacitor')) { // No cloud settings without a device
            return resolve(this.loadDefaults());
          }

          this.cloudSettings.exists().then(exists => {
            if (exists) {
              this.cloudSettings.load()
                .then(loadedFromCloud => { // Success: load past settings
                  this.toast.create({
                    message: ('Previous settings loaded from backup'),
                    duration: 3000,
                    position: 'middle',
                    buttons: [{ text: 'OK', role: 'cancel' }],
                  }).then(successToast => successToast.present());

                  resolve(loadedFromCloud);
                })
                .catch(error => { // Load error
                  this.toast.create({
                    message: (`Could not load previous settings: ${error}`),
                    duration: 6000,
                    position: 'middle',
                    cssClass: 'error',
                    buttons: [{ text: 'OK', role: 'cancel' }],
                  }).then(errorToast => errorToast.present());

                  resolve(this.loadDefaults());
                });
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

      if (settings && settings.class === SettingsAdvanced.name) {
        loadedSettings = new SettingsAdvanced(new SettingsSimple());
      } else {
        loadedSettings = new SettingsSimple();
      }

      if (settings) {
        for (const key in loadedSettings) {
          if (settings[key] !== undefined) {
            loadedSettings[key] = settings[key];
          }
        }
        loadedSettings.class = settings.class;
      }

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
    console.log('Loading default settings');
    this.currentSettings = new SettingsSimple();
    return this.currentSettings;
  }
}
