import { ComponentFixture, TestBed, fakeAsync, tick, flush, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { IonInput, IonSelect, IonToggle, IonRange, provideIonicAngular, LoadingController } from '@ionic/angular/standalone';
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
  let loadingController: LoadingController;
  let mockLoading: any;

  beforeEach(waitForAsync(() => {
    // Create a mock loading element
    mockLoading = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    };

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
    loadingController = TestBed.inject(LoadingController);
    
    // Mock the LoadingController's create method
    spyOn(loadingController, 'create').and.returnValue(Promise.resolve(mockLoading));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up auto-save subscription after settings are loaded', fakeAsync(async () => {
    // Mock getCurrentSettings to return a SettingsSimple instance
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(new SettingsSimple()));
    
    await component.ngOnInit();
    tick(); // Process any remaining async operations
    
    expect(component['formChangesSubscription']).toBeDefined();
  }));

  it('should auto-save settings when form changes and is valid', fakeAsync(async () => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    spyOn(settingsService, 'save').and.returnValue(Promise.resolve());
    
    await component.ngOnInit();
    tick(); // Process any remaining async operations
    
    // Simulate form change
    component.settingsForm.patchValue({ remember_minutes: 7 });
    tick(1000); // Wait for debounce
    
    expect(settingsService.save).toHaveBeenCalled();
  }));

  it('should not auto-save when form is invalid', fakeAsync(async () => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    spyOn(settingsService, 'save').and.returnValue(Promise.resolve());
    
    await component.ngOnInit();
    tick(); // Process any remaining async operations
    
    // Make form invalid by setting output_length to an invalid value
    component.settingsForm.patchValue({ output_length: 5 }); // Below minimum of 8
    tick(1000); // Wait for debounce
    
    expect(settingsService.save).not.toHaveBeenCalled();
  }));

  it('should clean up subscription on destroy', fakeAsync(async () => {
    const mockSettings = new SettingsSimple();
    spyOn(settingsService, 'getCurrentSettings').and.returnValue(Promise.resolve(mockSettings));
    
    await component.ngOnInit();
    tick(); // Process any remaining async operations
    
    const subscription = component['formChangesSubscription'];
    expect(subscription).toBeDefined();
    spyOn(subscription!, 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(subscription!.unsubscribe).toHaveBeenCalled();
  }));
});
