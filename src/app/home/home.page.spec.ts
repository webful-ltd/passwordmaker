import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KeyboardMock, PlatformMock, ToastControllerMock } from 'ionic-mocks';

import { Platform, ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
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
  let clipboardSpy: Clipboard;

  beforeEach(waitForAsync(() => {
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicStorageModule.forRoot({
          driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
        }),
      ],
      providers: [
        { provide: Clipboard, useValue: clipboardSpy },
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
