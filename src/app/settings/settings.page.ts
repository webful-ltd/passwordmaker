import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Browser } from '@capacitor/browser';
import { LoadingController, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircleOutline,
  close,
  cog,
  help,
  informationCircleOutline,
  warning,
} from 'ionicons/icons';

import { Profile } from '../../models/Profile';
import { ProfilePageComponent } from '../profile/profile.page';
import { Settings } from '../../models/Settings';
import { SettingsAdvanced } from '../../models/SettingsAdvanced';
import { SettingsService } from '../settings.service';
import { SettingsSimple } from '../../models/SettingsSimple';

@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.page.scss'],
  templateUrl: 'settings.page.html',
})

export class SettingsPageComponent implements OnInit {
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

  constructor(
    private formBuilder: FormBuilder,
    public loadingController: LoadingController,
    public modalController: ModalController,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
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
      informationCircleOutline,
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

  save({ value, valid }: { value: Settings, valid: boolean }) {
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

    this.settingsService.save(value)
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
