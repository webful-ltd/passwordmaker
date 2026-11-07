import { TestBed, inject } from "@angular/core/testing";
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

  it("should hydrate legacy SettingsSimple without show_home_help with default true", inject(
    [SettingsService],
    (service: SettingsService) => {
      const legacyRaw = {
        class: "SettingsSimple",
        added_number_on: false,
        added_number: 0,
        algorithm: "hmac-sha256",
        domain_only: true,
        output_character_set: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        output_length: 15,
        remember_minutes: 5,
        master_password_hash: false,
      };

      const hydrated = service.hydrateSettings(legacyRaw);
      expect(hydrated instanceof SettingsSimple).toBe(true);
      expect(hydrated.show_home_help).toBe(true);
    }
  ));

  it("should hydrate legacy SettingsAdvanced without show_home_help with default true", inject(
    [SettingsService],
    (service: SettingsService) => {
      const legacyRaw = {
        class: "SettingsAdvanced",
        active_profile_id: 1,
        remember_minutes: 5,
        master_password_hash: false,
        profiles: [
          {
            profile_id: 1,
            name: "Default",
            algorithm: "hmac-sha256",
            domain_only: true,
            leet_level: 0,
            leet_location: "none",
            modifier: "",
            output_character_set_custom: "",
            output_character_set_preset: "alphanumeric",
            output_length: 15,
            password_hash: "",
            post_processing_suffix: "",
            prefix: "",
            suffix: "",
            url_patterns: [],
          },
        ],
      };

      const hydrated = service.hydrateSettings(legacyRaw);
      expect(hydrated.show_home_help).toBe(true);
    }
  ));

  it("should hydrate Settings with show_home_help set to false", inject(
    [SettingsService],
    (service: SettingsService) => {
      const rawSimple = {
        class: "SettingsSimple",
        show_home_help: false,
      };
      const hydratedSimple = service.hydrateSettings(rawSimple);
      expect(hydratedSimple.show_home_help).toBe(false);

      const rawAdvanced = {
        class: "SettingsAdvanced",
        show_home_help: false,
        active_profile_id: 1,
        profiles: [{ profile_id: 1, name: "Default" }],
      };
      const hydratedAdvanced = service.hydrateSettings(rawAdvanced);
      expect(hydratedAdvanced.show_home_help).toBe(false);
    }
  ));
});
