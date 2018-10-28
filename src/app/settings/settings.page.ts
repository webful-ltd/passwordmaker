import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Events, ToastController } from '@ionic/angular';

import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
})

export class SettingsPage {
  public settings: Settings;
  public settingsForm: FormGroup;

  constructor(
    private events: Events,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
    this.settingsForm = this.formBuilder.group({
      output_character_set: ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./'],
      output_length: [15, Validators.pattern('[0-9]+')],
      remember_minutes: [5, Validators.required],
      algorithm: ['hmac-sha256', Validators.required],
      domain_only: [true],
    });
  }

  ionViewWillEnter() {
    this.settingsService.getCurrentSettings()
      .then(settings => this.settings = settings);
  }

  save() {
    this.settingsService.save(this.settings)
      .then(
        () => {
          this.events.publish('settingsSaved');
          this.toast.create({
            message: (`Settings saved!`),
            duration: 2000,
            showCloseButton: true,
            closeButtonText: 'OK',
          }).then(successToast => successToast.present());
        },
        (reason) => {
          this.toast.create({
            message: (`Error: ${reason}`),
            duration: 3500,
            cssClass: 'error',
            showCloseButton: true,
            closeButtonText: 'OK',
          }).then(errorToast => errorToast.present());
        }
      );
  }
}
