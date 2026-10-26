import { Injectable, inject, signal, computed } from "@angular/core";
import { Platform, ToastController } from "@ionic/angular";
import { Storage } from "@ionic/storage-angular";
import { LEGACY_STORAGE } from "./legacy-storage.module";
import { Subject } from "rxjs";

import { CapacitorSqliteDriverService } from "./capacitor-sqlite-driver.service";
import { Profile } from "../models/Profile";
import { Settings } from "../models/Settings";
import { SettingsAdvanced } from "../models/SettingsAdvanced";
import { SettingsSimple } from "../models/SettingsSimple";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private platform = inject(Platform);
  private storage = inject(Storage);
  // Optional legacy storage instance for migration. Code can reference
  // `this.legacyStorage` to read from the old storage while writes go to the
  // new one. This does not change existing behaviour until you start using it.
  private legacyStorage = inject(LEGACY_STORAGE, { optional: true });
  toast = inject(ToastController);

  private static storageKey = "settings";

  ready = false;
  saveSubject: Subject<void> = new Subject<void>();

  private readonly _settings = signal<Settings | null>(null);
  readonly settings = this._settings.asReadonly();

  // Computed helper for convenience across components
  readonly isAdvancedMode = computed(
    () => this._settings() instanceof SettingsAdvanced
  );

  private initPromise?: Promise<void>;

  public hydrateSettings(settings: any): Settings {
    if (settings instanceof SettingsSimple || settings instanceof SettingsAdvanced) {
      return settings;
    }

    let loadedSettings: Settings;

    if (settings && settings.class === SettingsAdvanced.name) {
      loadedSettings = new SettingsAdvanced(new SettingsSimple());
    } else {
      loadedSettings = new SettingsSimple();
    }

    if (settings) {
      const loadedSettingsRecord = loadedSettings as unknown as Record<
        string,
        unknown
      >;
      for (const key of Object.keys(loadedSettingsRecord)) {
        if (settings[key] !== undefined) {
          if (key === "output_length" && typeof settings[key] === "string") {
            loadedSettingsRecord[key] = parseInt(settings[key], 10);
          } else {
            loadedSettingsRecord[key] = settings[key];
          }
        }
      }
      if (settings.profiles && loadedSettings instanceof SettingsAdvanced) {
        loadedSettings.profiles = settings.profiles;
      }
      loadedSettings.class =
        settings.class ||
        (loadedSettings instanceof SettingsAdvanced
          ? SettingsAdvanced.name
          : SettingsSimple.name);
    }

    return loadedSettings;
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // 1. Initialize storage drivers
      if (this.platform.is("capacitor")) {
        await this.storage.defineDriver(CapacitorSqliteDriverService);
        await this.storage.create();
        console.log("Storage created (capacitor)");
      } else {
        await this.storage.create();
        console.log("Storage created (web)");
      }

      console.log("Using storage driver " + this.storage.driver);

      // 2. Perform legacy migration if necessary
      try {
        await this.migrateLegacySettings();
      } catch (err) {
        console.error("Migration error", err);
        await this.toast
          .create({
            message: "Settings migration failed (see console for details)",
            duration: 6_000,
            position: "middle",
            cssClass: "error",
          })
          .then((t) => t.present());
      }

      // 3. Eagerly load and hydrate settings into the signal
      const initialSettings = await this.loadInitialSettings();
      this._settings.set(initialSettings);

      this.ready = true;
    })();

    return this.initPromise;
  }

  private async loadInitialSettings(): Promise<Settings> {
    const rawSettings = await this.storage.get(SettingsService.storageKey);

    if (rawSettings !== null && rawSettings !== undefined) {
      return this.hydrateSettings(rawSettings);
    }

    // Default fallback
    return new SettingsSimple();
  }

  private async migrateLegacySettings(): Promise<boolean> {
    if (!this.legacyStorage) {
      return false;
    }

    try {
      if (typeof this.legacyStorage.create === "function") {
        try {
          await this.legacyStorage.create();
        } catch {
          // ignore create errors from legacy storage
        }
      }

      const legacyValue = await this.legacyStorage.get(SettingsService.storageKey);
      if (legacyValue === null || legacyValue === undefined) {
        return false; // nothing to migrate
      }

      const newValue = await this.storage.get(SettingsService.storageKey);
      if (newValue !== null && newValue !== undefined) {
        const same = JSON.stringify(newValue) === JSON.stringify(legacyValue);
        if (same) {
          if (this.legacyStorage.driver === this.storage.driver) {
            return false;
          }
          await this.legacyStorage.remove(SettingsService.storageKey);
          return true;
        }
        return false;
      }

      await this.storage.set(SettingsService.storageKey, legacyValue);
      const verify = await this.storage.get(SettingsService.storageKey);
      if (JSON.stringify(verify) === JSON.stringify(legacyValue)) {
        await this.legacyStorage.remove(SettingsService.storageKey);
        return true;
      }

      // If verification failed, remove the new value to avoid partial migration
      await this.storage.remove(SettingsService.storageKey).catch(() => {});
      throw new Error("Verification failed after writing migrated settings");
    } catch (err) {
      console.error("migrateLegacySettings error", err);
      throw err;
    }
  }

  public async save(settings: Settings | any): Promise<any> {
    if (!settings) {
      return Promise.reject("No settings data");
    }

    // Always ensure we have a full Settings class instance with prototype methods
    const hydrated = this.hydrateSettings(settings);

    // Ensure clean serialization
    Reflect.deleteProperty(hydrated, "constructor");

    // Persist to storage
    const savePromise = await this.storage.set(SettingsService.storageKey, hydrated);

    // Update signal state immediately so all consumers receive a valid Settings instance
    this._settings.set(hydrated);

    // Notify legacy listeners
    this.saveSubject.next();

    return savePromise;
  }

  public async saveProfile(profile: Profile): Promise<any> {
    let settings = await this.getCurrentSettings();

    if (settings instanceof SettingsSimple) {
      settings = new SettingsAdvanced(settings);
    }

    if (!(settings instanceof SettingsAdvanced)) {
      throw new Error("Settings not of an expected type");
    }

    const clashingNameProfileIndex = settings.profiles.findIndex(
      (p) => p.name === profile.name && p.profile_id !== profile.profile_id
    );
    if (clashingNameProfileIndex > -1) {
      throw new Error(`Profile name "${profile.name}" is already in use`);
    }

    const existingProfileIndex = settings.profiles.findIndex(
      (p) => p.profile_id === profile.profile_id
    );
    const isExistingProfile = existingProfileIndex > -1;

    if (isExistingProfile) {
      settings.profiles.splice(existingProfileIndex, 1, profile);
    } else {
      settings.profiles.push(profile);
    }

    const saveResolveValue = await this.save(settings);
    return {
      saveResolveValue,
      action: isExistingProfile ? "updated" : "created",
    };
  }

  public async deleteProfile(profileId: number): Promise<any> {
    const settings = await this.getCurrentSettings();

    if (!(settings instanceof SettingsAdvanced)) {
      throw new Error("Settings not of the expected type");
    }

    const existingProfileIndex = settings.profiles.findIndex(
      (p) => p.profile_id === profileId
    );
    settings.profiles.splice(existingProfileIndex, 1);

    if (settings.profiles.length > 0) {
      settings.setActiveProfile(settings.profiles[0].profile_id);
    }

    return this.save(settings);
  }

  /**
   * Backward-compatible helper method.
   * Resolves immediately from the signal if already initialized,
   * or awaits initialization if accessed prematurely.
   */
  async getCurrentSettings(): Promise<Settings> {
    if (!this.ready) {
      await this.init();
    }
    const current = this._settings();
    if (current) {
      return current;
    }
    // Fallback if settings somehow remained uninitialized
    const loaded = await this.loadInitialSettings();
    this._settings.set(loaded);
    return loaded;
  }

  async getNextProfileId(): Promise<number> {
    const settings = await this.getCurrentSettings();
    if (!(settings instanceof SettingsAdvanced)) {
      return 1;
    }

    const highestExistingProfileId = Math.max(
      ...settings.profiles.map((profile) => profile.profile_id)
    );
    return highestExistingProfileId + 1;
  }

  get storageDriver(): string | null {
    return this.storage.driver;
  }
}
