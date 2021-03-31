import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { CloudSettings } from '@ionic-native/cloud-settings/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { SettingsSimple } from '../models/SettingsSimple';
import { SettingsService } from './settings.service';

describe('AppComponent', () => {

  let platformReadySpy, platformSpy, statusBarSpy, splashScreenSpy, storageSpy;
  const mockSettings = new SettingsSimple();

  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });
    statusBarSpy = jasmine.createSpyObj('StatusBar', ['backgroundColorByHexString', 'styleDefault', 'styleLightContent']);
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
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
        { provider: SettingsService, useValue: jasmine.createSpyObj('SettingsService', {
          init: () => true,
        })},
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: StatusBar, useValue: statusBarSpy },
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
    expect(statusBarSpy.styleDefault).toHaveBeenCalled();
    expect(splashScreenSpy.hide).toHaveBeenCalled();
  });
});
