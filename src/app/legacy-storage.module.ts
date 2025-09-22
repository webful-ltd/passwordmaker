import { NgModule, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Configuration token for legacy storage module
 */
export const LegacyStorageConfigToken = new InjectionToken<any>('LEGACY_STORAGE_CONFIG_TOKEN');

/**
 * Token that provides the legacy Storage instance. Use this when you need to
 * inject the old/configured storage separately from the app's primary
 * `Storage` provider (from IonicStorageModule).
 */
export const LEGACY_STORAGE = new InjectionToken<Storage>('LEGACY_STORAGE');

function provideLegacyStorage(platformId: Object, storageConfig: any) {
  return new Storage(storageConfig);
}

@NgModule({})
export class LegacyStorageModule {
  static forRoot(storageConfig: any = null) {
    return {
      ngModule: LegacyStorageModule,
      providers: [
        { provide: LegacyStorageConfigToken, useValue: storageConfig },
        { provide: LEGACY_STORAGE, useFactory: provideLegacyStorage, deps: [PLATFORM_ID, LegacyStorageConfigToken] },
      ],
    };
  }
}
