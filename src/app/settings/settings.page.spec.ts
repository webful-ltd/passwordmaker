import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { IonInput, IonSelect, IonToggle, IonRange, provideIonicAngular } from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import { CapacitorSqliteDriverService } from '../capacitor-sqlite-driver.service';
import { SettingsPageComponent } from './settings.page';
import { SettingsService } from '../settings.service';
import { SettingsSimple } from '../../models/SettingsSimple';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;
  let settingsService: SettingsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPageComponent],
      imports: [
        IonInput,
        IonSelect,
        IonToggle,
        IonRange,
        IonicStorageModule.forRoot({
          driverOrder: [CapacitorSqliteDriverService._driver, Drivers.IndexedDB],
        }),
        ReactiveFormsModule,
      ],
      providers: [
        CloudSettings,
        SettingsService,
        provideIonicAngular(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up auto-save subscription after settings are loaded', fakeAsync(() => {
    // Mock getCurrentSettings to return a SettingsSimple instance
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(new SettingsSimple()));
    
    component.ngOnInit();
    tick();
    
    expect(component['formChangesSubscription']).toBeDefined();
  }));

  it('should auto-save settings when form changes and is valid', fakeAsync(() => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    spyOn(settingsService, 'save').and.returnValue(Promise.resolve());
    
    component.ngOnInit();
    tick();
    
    // Simulate form change
    component.settingsForm.patchValue({ remember_minutes: 7 });
    tick(1000); // Wait for debounce
    
    expect(settingsService.save).toHaveBeenCalled();
  }));

  it('should not auto-save when form is invalid', fakeAsync(() => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    spyOn(settingsService, 'save').and.returnValue(Promise.resolve());
    
    component.ngOnInit();
    tick();
    
    // Make form invalid by setting output_length to an invalid value
    component.settingsForm.patchValue({ output_length: 5 }); // Below minimum of 8
    tick(1000); // Wait for debounce
    
    expect(settingsService.save).not.toHaveBeenCalled();
  }));

  it('should clean up subscription on destroy', fakeAsync(() => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    
    component.ngOnInit();
    tick();
    
    const subscription = component['formChangesSubscription'];
    spyOn(subscription!, 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  }));
});
