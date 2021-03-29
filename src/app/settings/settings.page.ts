import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { Profile } from '../../models/Profile';
import { ProfilePage } from '../profile/profile.page';
import { Settings } from '../../models/Settings';
import { SettingsAdvanced } from '../../models/SettingsAdvanced';
import { SettingsService } from '../settings.service';
import { SettingsSimple } from '../../models/SettingsSimple';

@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.page.scss'],
  templateUrl: 'settings.page.html',
})

export class SettingsPage implements OnInit {
  settingsForm: FormGroup;
  advanced_mode = false;
  profiles: Profile[] = [];
  settingsLoaded = false;

  private loading: HTMLIonLoadingElement;

  constructor(
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    private iab: InAppBrowser,
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
  }

  async ngOnInit() {
    this.loading = await this.loadingController.create();
    this.loading.present();
    this.update();
  }

  /**
   * Upgrade the app settings to `SettingsAdvanced`, which includes creating profile #0
   * with ID 1, and open that profile for editing.
   */
  addFirstProfile() {
    this.settingsService.getCurrentSettings().then((settings: Settings) => {
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
    });
  }

  async editNewProfile() {
    this.settingsService.getNextProfileId().then(async nextProfileId => {
      const newProfile = new Profile();
      newProfile.profile_id = nextProfileId;

      const modal = await this.modalController.create({
        component: ProfilePage,
        componentProps: { profileModel: newProfile }
      });
      modal.onWillDismiss().then(() => this.update());

      return await modal.present();
    });
  }

  async editProfile(profile: Profile, profileCount: number) {
    const modal = await this.modalController.create({
      component: ProfilePage,
      componentProps: { profileModel: profile, profileCount },
    });
    modal.onWillDismiss().then(() => this.update());

    return await modal.present();
  }

  async confirmEnableAdvanced() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Are you sure you want to use Advanced mode?',
      buttons: [{
        text: 'Use Advanced mode permanently',
        icon: 'cog',
        handler: () => this.addFirstProfile(),
      }, {
        text: 'Learn more first',
        icon: 'help',
        handler: () => this.openAdvancedInfo(),
      }
      , {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  save({ value, valid }: { value: Settings, valid: boolean }) {
    if (!valid) {
      this.toast.create({
        message: ('Settings not valid. Please review options highlighted with a pink underline and check your chosen Length is between 8 and 200 characters.'),
        duration: 8000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel'}],
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
            buttons: [{ text: 'OK', role: 'cancel'}],
          }).then(successToast => successToast.present());
        },
        (reason) => {
          this.toast.create({
            message: (`Error: ${reason}`),
            duration: 6000,
            position: 'middle',
            cssClass: 'error',
            buttons: [{ text: 'OK', role: 'cancel'}],
          }).then(errorToast => errorToast.present());
        }
      );
  }

  openHelp() {
    this.iab.create('https://passwordmaker.webful.uk/#settings', '_system');
  }

  openAdvancedInfo() {
    this.iab.create('https://passwordmaker.webful.uk/#advanced', '_system');
  }

  private update() {
    this.settingsService.getCurrentSettings()
      .then(settings => {
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
      });
  }
}
