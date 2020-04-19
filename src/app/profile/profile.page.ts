import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';

import { Profile } from '../../models/Profile';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @Input() profileModel: Profile;
  @Input() profileCount: number; // Total profiles so far

  profile: FormGroup;

  private profileId: number;

  constructor(
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    public modalController: ModalController,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
    this.profile = this.formBuilder.group({
      name: ['', Validators.required], // TODO check unique
      output_length: [15, [
        Validators.required,
        Validators.pattern('[0-9]+'),
        Validators.min(8),
        Validators.max(200),
      ]],
      output_character_set_preset: ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'],
      output_character_set_custom: ['', this.requireIfNoPresetValidator],
      algorithm: ['hmac-sha256', Validators.required],
      leet_location: ['none'],
      leet_level: [1],
      modifier: [''],
      prefix: [''],
      suffix: [''],
      post_processing_suffix: [''],
      domain_only: [true],
    });

    // We need to ensure that setting the character set away from Custom clears any
    // validation error on the custom characters field.
    this.profile.get('output_character_set_preset').valueChanges.subscribe(() => {
      this.profile.get('output_character_set_custom').updateValueAndValidity();
    });
  }

  ngOnInit() {
    const formValues: any = this.profileModel;
    if (formValues.output_character_set_preset === 'none') {
      formValues.output_character_set_custom = formValues.output_character_set_custom;
    }

    this.profileId = formValues.profile_id;

    this.profile.patchValue(formValues);
  }

  save({ value, valid }: { value: Profile, valid: boolean }) {
    if (!valid) {
      this.toast.create({
        message: ('Profile not valid. Please review options highlighted with a pink underline and check your chosen Length is between 8 and 200 characters.'),
        duration: 8000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel'}],
      }).then(errorToast => errorToast.present());

      return;
    }

    if (!this.profileId) {
      this.toast.create({
        message: ('Error: Profile ID missing'),
        duration: 6000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel'}],
      }).then(errorToast => errorToast.present());

      return;
    }

    value.profile_id = this.profileId;
    this.settingsService.saveProfile(value)
      .then(
        () => {
          this.toast.create({
            message: ('Profile saved!'),
            duration: 3000,
            position: 'middle',
            buttons: [{ text: 'OK', role: 'cancel'}],
          }).then(successToast => successToast.present());
          this.close();
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

  async confirmDelete() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Are you sure you want to delete this profile?',
      buttons: [{
        text: 'Delete permanently',
        icon: 'trash-outline',
        handler: () => this.delete(),
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
      }]
    });
    await actionSheet.present();
  }

  delete() {
    this.settingsService.deleteProfile(this.profileId)
      .then(
        () => {
          this.toast.create({
            message: ('Profile deleted!'),
            duration: 3000,
            position: 'middle',
            buttons: [{ text: 'OK', role: 'cancel'}],
          }).then(successToast => successToast.present());
          this.close();
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

  close() {
    this.modalController.dismiss();
  }

  requireIfNoPresetValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('output_character_set_preset').value === 'none') {
      return Validators.required(formControl);
    }

    return null;
  }
}
