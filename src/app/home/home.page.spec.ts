import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import { CapacitorSqliteDriverService } from '../capacitor-sqlite-driver.service';
import { HomePageComponent } from './home.page';
import { SettingsService } from '../settings.service';
import { SettingsSimple } from '../../models/SettingsSimple';

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

  it('should show help paragraphs when show_home_help is true', async () => {
    const settingsService = TestBed.inject(SettingsService);
    const settings = new SettingsSimple();
    settings.show_home_help = true;
    vi.spyOn(settingsService, 'settings').mockReturnValue(settings);
    vi.spyOn(settingsService, 'getCurrentSettings').mockResolvedValue(settings);

    await component.update();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const helpParagraphs = compiled.querySelectorAll('p.help');
    expect(helpParagraphs.length).toBe(2);
  });

  it('should hide help paragraphs when show_home_help is false', async () => {
    const settingsService = TestBed.inject(SettingsService);
    const settings = new SettingsSimple();
    settings.show_home_help = false;
    vi.spyOn(settingsService, 'settings').mockReturnValue(settings);
    vi.spyOn(settingsService, 'getCurrentSettings').mockResolvedValue(settings);

    await component.update();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const helpParagraphs = compiled.querySelectorAll('p.help');
    expect(helpParagraphs.length).toBe(0);
  });
});
