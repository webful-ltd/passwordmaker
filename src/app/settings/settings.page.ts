import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Browser } from '@capacitor/browser';
import { LoadingController, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircleOutline,
  close,
  cog,
  downloadOutline,
  help,
  informationCircleOutline,
  shareOutline,
  warning,
} from 'ionicons/icons';

import { Profile } from '../../models/Profile';
import { ProfilePageComponent } from '../profile/profile.page';
import { Settings } from '../../models/Settings';
import { SettingsAdvanced } from '../../models/SettingsAdvanced';
import { SettingsService } from '../settings.service';
import { SettingsSimple } from '../../models/SettingsSimple';
import { ImportService } from '../import.service';

@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.page.scss'],
  templateUrl: 'settings.page.html',
  standalone: false
})

export class SettingsPageComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  loadingController = inject(LoadingController);
  modalController = inject(ModalController);
  protected settingsService = inject(SettingsService);
  private importService = inject(ImportService);
  toast = inject(ToastController);

  settingsForm: FormGroup;
  advanced_mode = false;
  profiles: Profile[] = [];
  settingsLoaded = false;

  advancedConfirmationButtons = [
    {
      text: 'Use Advanced mode permanently',
      icon: cog.toString(),
      handler: () => this.addFirstProfile(),
    }, {
      text: 'Learn more first',
      icon: help.toString(),
      handler: () => this.openAdvancedInfo(),
    }
    , {
      text: 'Cancel',
      icon: close.toString(),
      role: 'cancel',
    },
  ];
  isAdvancedConfirmationOpen = false;

  private loading: HTMLIonLoadingElement;

  constructor() {
    this.settingsForm = this.formBuilder.group({
      algorithm: ['hmac-sha256', Validators.required],
      domain_only: [true],
      output_character_set: ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'],
      output_length: [15, [
        Validators.required,
        Validators.pattern('[0-9]+'),
        Validators.min(8),
        Validators.max(200),
      ]],
      remember_minutes: [5, Validators.required],
      added_number_on: [false],
      added_number: [0],
    });
    addIcons({
      addCircleOutline,
      checkmarkCircleOutline,
      cog,
      downloadOutline,
      informationCircleOutline,
      shareOutline,
      warning,
    });
  }

  async ngOnInit() {
    this.loading = await this.loadingController.create();
    await this.loading.present();
    this.update();
  }

  /**
   * Upgrade the app settings to `SettingsAdvanced`, which includes creating profile #0
   * with ID 1, and open that profile for editing.
   */
  async addFirstProfile() {
    let settings: Settings;
    try {
      settings = await this.settingsService.getCurrentSettings();
    } catch (err) {
      this.toast.create({
        message: (`Could not load settings for profile creation: ${err.message}`),
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
      this.loading.dismiss();

      return;
    }

    if (settings instanceof SettingsAdvanced) {
      // Things have got confused and we should just use the existing advanced settings' first profile.
      this.editProfile(settings.profiles[0], 1);
      return;
    }

    if (settings instanceof SettingsSimple) {
      const advancedSettings = new SettingsAdvanced(settings);
      this.settingsService.save(advancedSettings).then(() => {
        this.editProfile(advancedSettings.profiles[0], advancedSettings.profiles.length);
      });
    }
  }

  async editNewProfile() {
    this.settingsService.getNextProfileId().then(async nextProfileId => {
      const newProfile = new Profile();
      newProfile.profile_id = nextProfileId;

      const modal = await this.modalController.create({
        component: ProfilePageComponent,
        componentProps: { profileModel: newProfile }
      });
      modal.onWillDismiss().then(() => this.update());

      return await modal.present();
    });
  }

  async editProfile(profile: Profile, profileCount: number) {
    const modal = await this.modalController.create({
      component: ProfilePageComponent,
      componentProps: { profileModel: profile, profileCount },
    });
    modal.onWillDismiss().then(() => this.update());

    return await modal.present();
  }

  confirmEnableAdvanced() {
    this.isAdvancedConfirmationOpen = true;
  }

  dismissEnableAdvanced() {
    this.isAdvancedConfirmationOpen = false;
  }

  async save({ value, valid }: { value: Settings, valid: boolean }) {
    if (!valid) {
      this.toast.create({
        message: ('Settings not valid. Please check fields are complete and that your chosen Length is between 8 and 200 characters.'),
        duration: 8000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());

      return;
    }

    let saveReadyValue = value;
    if (this.advanced_mode) {
      saveReadyValue = await this.settingsService.getCurrentSettings();
      saveReadyValue.remember_minutes = value.remember_minutes;
    }

    this.settingsService.save(saveReadyValue)
      .then(
        () => {
          this.toast.create({
            message: ('Settings saved!'),
            duration: 2000,
            position: 'middle',
            buttons: [{ text: 'OK', role: 'cancel' }],
          }).then(successToast => successToast.present());
        },
        (reason) => {
          this.toast.create({
            message: (`Error: ${reason}`),
            duration: 6000,
            position: 'middle',
            cssClass: 'error',
            buttons: [{ text: 'OK', role: 'cancel' }],
          }).then(errorToast => errorToast.present());
        }
      );
  }

  openHelp() {
    Browser.open({ url: 'https://passwordmaker.webful.uk/#settings' });
  }

  openAdvancedInfo() {
    Browser.open({ url: 'https://passwordmaker.webful.uk/#advanced' });
  }

  importSettings(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      // File is already selected, just log it for now
      console.log('Import settings file selected:', files[0]);
    }
  }

  async confirmImport(file: File) {
    if (!file) {
      this.toast.create({
        message: 'Please select a file to import',
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Importing settings...'
    });
    await loading.present();

    try {
      console.log('Starting import process for file:', file.name, 'Size:', file.size);
      
      // Read the file content using import service
      const fileContent = await this.importService.readFileContent(file);
      
      console.log('File content read, length:', fileContent.length);
      console.log('First 200 chars:', fileContent.substring(0, 200));
      
      // Parse the RDF using our import service
      console.log('About to parse RDF document...');
      const importResult = this.importService.parseRdfDocument(fileContent);
      console.log('RDF parsing complete, found profiles:', importResult.profiles.length);
      
      if (!importResult.profiles || importResult.profiles.length === 0) {
        throw new Error('No profiles found in the import file');
      }

      // Get current settings to determine if we're in advanced mode
      console.log('Getting current settings...');
      const currentSettings = await this.settingsService.getCurrentSettings();
      console.log('Current settings type:', currentSettings.constructor.name);
      
      if (currentSettings instanceof SettingsSimple) {
        console.log('Upgrading to advanced mode and merging profiles...');
        // Upgrade to advanced mode first
        const advancedSettings = new SettingsAdvanced(currentSettings);
        
        // Merge imported profiles with existing (default) profile
        const mergeResult = this.importService.mergeProfiles(advancedSettings.profiles, importResult.profiles);
        
        // Assign profile IDs to new profiles
        let nextId = 1;
        mergeResult.profiles.forEach(profile => {
          if (!profile.profile_id) {
            profile.profile_id = nextId++;
          }
        });
        
        advancedSettings.profiles = mergeResult.profiles;
        console.log(`Saving advanced settings with ${mergeResult.addedCount} new and ${mergeResult.updatedCount} updated profiles...`);
        await this.settingsService.save(advancedSettings);
        console.log('Advanced settings saved successfully');
        
        await loading.dismiss();
        this.toast.create({
          message: `Imported: ${mergeResult.addedCount} new, ${mergeResult.updatedCount} updated profile(s)`,
          duration: 3000,
          position: 'middle',
          buttons: [{ text: 'OK', role: 'cancel' }],
        }).then(successToast => successToast.present());
        
      } else if (currentSettings instanceof SettingsAdvanced) {
        console.log('Merging profiles with existing advanced settings...');
        
        // Merge imported profiles with existing profiles
        const mergeResult = this.importService.mergeProfiles(currentSettings.profiles, importResult.profiles);
        
        // Assign profile IDs to new profiles
        const nextId = await this.settingsService.getNextProfileId();
        let idCounter = nextId;
        mergeResult.profiles.forEach(profile => {
          if (!profile.profile_id) {
            profile.profile_id = idCounter++;
          }
        });
        
        currentSettings.profiles = mergeResult.profiles;
        console.log(`Saving updated settings with ${mergeResult.addedCount} new and ${mergeResult.updatedCount} updated profiles...`);
        await this.settingsService.save(currentSettings);
        console.log('Updated settings saved successfully');
        
        await loading.dismiss();
        this.toast.create({
          message: `Imported: ${mergeResult.addedCount} new, ${mergeResult.updatedCount} updated profile(s)`,
          duration: 3000,
          position: 'middle',
          buttons: [{ text: 'OK', role: 'cancel' }],
        }).then(successToast => successToast.present());
      }

      // Refresh the settings display
      console.log('Calling update to refresh settings display...');
      this.update();
      console.log('Import fully completed!');
      
    } catch (error) {
      console.error('Import failed at step:', error);
      console.error('Full error details:', error.message, error.stack);
      await loading.dismiss();
      
      this.toast.create({
        message: `Import failed: ${error.message}`,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
    }
  }

  async exportSettings() {
    try {
      const currentSettings = await this.settingsService.getCurrentSettings();
      
      if (currentSettings instanceof SettingsSimple) {
        this.toast.create({
          message: 'Please upgrade to Advanced mode to export settings',
          position: 'middle',
          cssClass: 'error',
          buttons: [{ text: 'OK', role: 'cancel' }],
        }).then(errorToast => errorToast.present());
        return;
      }

      // Use platform-aware export method
      await this.importService.exportProfilesToFile((currentSettings as SettingsAdvanced).profiles);

      this.toast.create({
        message: 'Settings exported successfully',
        duration: 2000,
        position: 'middle',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(successToast => successToast.present());
      
    } catch (error) {
      this.toast.create({
        message: `Export failed: ${error.message}`,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
    }
  }





  private async update() {
    let settings: Settings;
    try {
      settings = await this.settingsService.getCurrentSettings();
    } catch (err) {
      this.toast.create({
        message: (`Could not load settings for update: ${err.message}`),
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
      this.loading.dismiss();

      return;
    }

    this.advanced_mode = (settings instanceof SettingsAdvanced);

    // If we have more than one setting become common between the top level of the two
    // Settings types, we may want to DRY up the logic between initialisation here
    // and the preparation for calling SettingsService.save(). Doesn't seem too crucial for now.
    // TODO probably improve when doing https://github.com/webful-ltd/passwordmaker/issues/92
    // console.log('class check', settings.hasOwnProperty('output_character_set'));
    const formValues: any = {
      remember_minutes: settings.remember_minutes,
    };

    if (settings instanceof SettingsSimple) {
      formValues.added_number_on = settings.added_number_on;
      if (settings.added_number_on) {
        formValues.added_number = settings.added_number;
      } else {
        formValues.added_number = undefined;
      }
      formValues.algorithm = settings.getAlgorithm();
      formValues.domain_only = settings.isDomainOnly();
      formValues.output_character_set = settings.getOutputCharacterSet();
      formValues.output_length = settings.getOutputLength();
    } else if (settings instanceof SettingsAdvanced) {
      this.profiles = settings.profiles;
    }

    this.settingsForm.patchValue(formValues);

    this.settingsLoaded = true;
    if (this.loading) {
      this.loading.dismiss();
    }
  }
}
