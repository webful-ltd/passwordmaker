import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { KeyboardMock, PlatformMock, ToastControllerMock } from 'ionic-mocks';
import { Platform, ToastController } from '@ionic/angular';
import { CloudSettings } from '@ionic-native/cloud-settings/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { HomePage } from './home.page';

declare global {
  interface Window {
    clearTimeout: (handle?: number) => void;
    setTimeout: (callback: () => any, interval: number) => any;
  }
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicStorageModule.forRoot({
          driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
        }),
      ],
      providers: [
        CloudSettings,
        { provide: Keyboard, useValue: KeyboardMock.instance() },
        { provide: Platform, useValue: PlatformMock },
        { provide: ToastController, useValue: ToastControllerMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
