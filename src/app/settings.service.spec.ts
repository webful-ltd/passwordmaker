import { TestBed, inject } from "@angular/core/testing";
import { CloudSettings } from "@awesome-cordova-plugins/cloud-settings/ngx";
import { Storage } from "@ionic/storage-angular";

import { SettingsService } from "./settings.service";
import { SettingsSimple } from "../models/SettingsSimple";

describe("SettingsService", () => {
  let storageSpy: any;
  const mockSettings = new SettingsSimple();

  beforeEach(() => {
    storageSpy = {
      get: vi
        .fn()
        .mockName("Storage.get")
        .mockReturnValue(() => mockSettings),
      set: vi
        .fn()
        .mockName("Storage.set")
        .mockReturnValue(() => true),
    };
    TestBed.configureTestingModule({
      providers: [
        CloudSettings,
        SettingsService,
        { provide: Storage, useValue: storageSpy },
      ],
    });
  });

  it("should be created", inject(
    [SettingsService],
    (service: SettingsService) => {
      expect(service).toBeTruthy();
    }
  ));
});
