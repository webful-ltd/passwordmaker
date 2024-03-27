import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular/standalone';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { SettingsSimple } from '../models/SettingsSimple';

describe('AppComponent', () => {
  let platformIsSpy, platformReadySpy, platformSpy, storageSpy;
  const mockSettings = new SettingsSimple();

  beforeEach(waitForAsync(() => {
    platformIsSpy = false;
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', {
      is: platformIsSpy, // not capacitor / mobile
      ready: platformReadySpy,
    });
    storageSpy = jasmine.createSpyObj('Storage', {
      create: () => Promise.resolve(true),
      get: () => mockSettings,
      set: () => true,
    });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        CloudSettings,
        { provide: Platform, useValue: platformSpy },
        { provide: Storage, useValue: storageSpy },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialise the app', async () => {
    await TestBed.createComponent(AppComponent);

    expect(platformSpy.ready).toHaveBeenCalled();
  });
});
