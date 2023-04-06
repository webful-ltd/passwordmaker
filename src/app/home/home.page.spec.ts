import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlatformMock, ToastControllerMock } from 'ionic-mocks';
import { Platform, ToastController } from '@ionic/angular';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { HomePageComponent } from './home.page';

declare global {
  interface Window {
    clearTimeout: (handle?: number) => void;
    setTimeout: (callback: () => any, interval: number) => any;
  }
}

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      imports: [
        IonicStorageModule.forRoot({
          driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB],
        }),
      ],
      providers: [
        CloudSettings,
        { provide: Platform, useValue: PlatformMock },
        { provide: ToastController, useValue: ToastControllerMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
