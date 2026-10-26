import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage-angular";

import { AppComponent } from "./app.component";
import { SettingsSimple } from "../models/SettingsSimple";

describe("AppComponent", () => {
  let platformIsSpy, platformReadySpy, storageSpy;
  let platformSpy: any;
  const mockSettings = new SettingsSimple();

  beforeEach(async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    platformIsSpy = false;
    platformReadySpy = Promise.resolve();
    platformSpy = {
      is: vi.fn().mockName("Platform.is").mockReturnValue(platformIsSpy),
      ready: vi
        .fn()
        .mockName("Platform.ready")
        .mockReturnValue(platformReadySpy),
    };
    storageSpy = {
      create: vi
        .fn()
        .mockName("Storage.create")
        .mockReturnValue(() => Promise.resolve(true)),
      get: vi
        .fn()
        .mockName("Storage.get")
        .mockReturnValue(() => mockSettings),
      set: vi
        .fn()
        .mockName("Storage.set")
        .mockReturnValue(() => true),
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: Storage, useValue: storageSpy },
      ],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should initialise the app", async () => {
    await TestBed.createComponent(AppComponent);

    expect(platformSpy.ready).toHaveBeenCalled();
  });
});
