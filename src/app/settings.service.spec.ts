import { TestBed, inject } from '@angular/core/testing';

import { Storage } from '@ionic/storage';

import { SettingsService } from './settings.service';
import { Settings } from '../models/Settings';

describe('SettingsService', () => {
  let storageSpy: Storage;
  const mockSettings = new Settings('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 15, 0);

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('Storage', { get: () => mockSettings, set: () => true});
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: Storage, useValue: storageSpy },
      ]
    });
  });

  it('should be created', inject([SettingsService], (service: SettingsService) => {
    expect(service).toBeTruthy();
  }));
});
