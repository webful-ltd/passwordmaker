import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { Settings } from '../../models/Settings';
import { SettingsSimple } from '../../models/SettingsSimple';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  styleUrls: ['./settings.page.scss'],
  templateUrl: 'settings.page.html',
})

export class SettingsPage {
  public isDomainOnly: boolean;
  public hasAddedNumber: boolean;
  public settings: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private iab: InAppBrowser,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
    this.settings = this.formBuilder.group({
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

  ionViewWillEnter() {
    this.settingsService.getCurrentSettings()
      .then(settings => {
        this.settings.setValue(settings);
        // `ion-toggle` doesn't seem to get boolean values cascaded through like other reactive form
        // elements, so we need to set this manually and use with its `[checked]` attribute.
        this.isDomainOnly = settings.isDomainOnly();

        if (settings instanceof SettingsSimple) {
          this.hasAddedNumber = settings.added_number_on;
        }
      });
  }

  save({ value, valid }: { value: Settings, valid: boolean }) {
    if (!valid) {
      this.toast.create({
        message: ('Settings not valid. Is your chosen Length of passwords between 8 and 200?'),
        duration: 3500,
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
            duration: 3500,
            position: 'middle',
            cssClass: 'error',
            buttons: [{ text: 'OK', role: 'cancel'}],
          }).then(errorToast => errorToast.present());
        }
      );
  }

  toggleAddedNumber() {
    this.hasAddedNumber = this.settings.value['added_number_on'];
  }

  openHelp() {
    this.iab.create('https://passwordmaker.webful.uk/#settings', '_system');
  }
}
