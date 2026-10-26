import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import { CapacitorSqliteDriverService } from '../capacitor-sqlite-driver.service';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      imports: [
        IonicStorageModule.forRoot({
          driverOrder: [CapacitorSqliteDriverService._driver, Drivers.IndexedDB],
        }),
      ],
      providers: [
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
