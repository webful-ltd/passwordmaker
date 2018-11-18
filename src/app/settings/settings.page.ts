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
  public isDomainOnly: boolean;
  public settings: FormGroup;

  constructor(
    private events: Events,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
    this.settings = this.formBuilder.group({
      algorithm: ['hmac-sha256', Validators.required],
      domain_only: [true],
      output_character_set: ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'],
      output_length: [15, [Validators.required, Validators.pattern('[0-9]+')]],
      remember_minutes: [5, Validators.required],
    });
  }

  ionViewWillEnter() {
    this.settingsService.getCurrentSettings()
      .then(settings => {
        this.settings.setValue(settings);
        // `ion-toggle` doesn't seem to get boolean values cascaded through like other reactive form
        // elements, so we need to set this manually and use with its `[checked]` attribute.
        this.isDomainOnly = settings.domain_only;
      });
  }

  save({ value, valid }: { value: Settings, valid: boolean }) {
    if (!valid) {
      this.toast.create({
        message: ('Settings not valid. Is your chosen output length a number?'),
        duration: 3500,
        position: 'top',
        cssClass: 'error',
        showCloseButton: true,
        closeButtonText: 'OK',
      }).then(errorToast => errorToast.present());

      return;
    }

    this.settingsService.save(value)
      .then(
        () => {
          this.events.publish('settingsSaved');
          this.toast.create({
            message: ('Settings saved!'),
            duration: 2000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'OK',
          }).then(successToast => successToast.present());
        },
        (reason) => {
          this.toast.create({
            message: (`Error: ${reason}`),
            duration: 3500,
            position: 'top',
            cssClass: 'error',
            showCloseButton: true,
            closeButtonText: 'OK',
          }).then(errorToast => errorToast.present());
        }
      );
  }
}
