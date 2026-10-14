import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { CloudSettings } from "@awesome-cordova-plugins/cloud-settings/ngx";
import {
  IonInput,
  IonSelect,
  IonToggle,
  IonRange,
  provideIonicAngular,
  LoadingController,
} from "@ionic/angular";
import { Drivers } from "@ionic/storage";
import { IonicStorageModule } from "@ionic/storage-angular";

import { CapacitorSqliteDriverService } from "../capacitor-sqlite-driver.service";
import { SettingsPageComponent } from "./settings.page";
import { SettingsService } from "../settings.service";
import { SettingsSimple } from "../../models/SettingsSimple";

describe("SettingsPageComponent", () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;
  let settingsService: SettingsService;
  let loadingController: LoadingController;
  let mockLoading: any;

  beforeEach(() => {
    // Create a mock loading element
    mockLoading = {
      present: vi.fn().mockName("present").mockResolvedValue(undefined),
      dismiss: vi.fn().mockName("dismiss").mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      declarations: [SettingsPageComponent],
      imports: [
        IonInput,
        IonSelect,
        IonToggle,
        IonRange,
        IonicStorageModule.forRoot({
          driverOrder: [
            CapacitorSqliteDriverService._driver,
            Drivers.IndexedDB,
          ],
        }),
        ReactiveFormsModule,
      ],
      providers: [CloudSettings, SettingsService, provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    loadingController = TestBed.inject(LoadingController);

    // Mock the LoadingController's create method
    vi.spyOn(loadingController, "create").mockResolvedValue(mockLoading);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set up auto-save subscription after settings are loaded", async () => {
    // Mock getCurrentSettings to return a SettingsSimple instance
    vi.spyOn(settingsService, "getCurrentSettings").mockResolvedValue(
      new SettingsSimple()
    );

    await component.ngOnInit();

    expect(component["formChangesSubscription"]).toBeDefined();
  });

  it("should auto-save settings when form changes and is valid", async () => {
    const mockSettings = new SettingsSimple();
    vi.spyOn(settingsService, "getCurrentSettings").mockResolvedValue(
      mockSettings
    );
    vi.spyOn(settingsService, "save").mockResolvedValue(undefined);

    await component.ngOnInit();

    // Simulate form change
    component.settingsForm.patchValue({ remember_minutes: 7 });

    expect(settingsService.save).toHaveBeenCalled();
  });

  it("should not auto-save when form is invalid", async () => {
    const mockSettings = new SettingsSimple();
    vi.spyOn(settingsService, "getCurrentSettings").mockResolvedValue(
      mockSettings
    );
    vi.spyOn(settingsService, "save").mockResolvedValue(undefined);

    await component.ngOnInit();

    // Make form invalid by setting output_length to an invalid value
    component.settingsForm.patchValue({ output_length: 5 }); // Below minimum of 8

    expect(settingsService.save).not.toHaveBeenCalled();
  });

  it("should clean up subscription on destroy", async () => {
    const mockSettings = new SettingsSimple();
    vi.spyOn(settingsService, "getCurrentSettings").mockResolvedValue(
      mockSettings
    );

    await component.ngOnInit();

    const subscription = component["formChangesSubscription"];
    expect(subscription).toBeDefined();
    vi.spyOn(subscription!, "unsubscribe").mockReturnValue(undefined);

    component.ngOnDestroy();

    expect(subscription!.unsubscribe).toHaveBeenCalled();
  });
});
