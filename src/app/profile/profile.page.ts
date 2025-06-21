import { Component, OnInit, Input, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, key, informationCircleOutline, warning, checkmarkCircleOutline, trashOutline } from 'ionicons/icons';

import { Profile } from '../../models/Profile';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePageComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  modalController = inject(ModalController);
  private settingsService = inject(SettingsService);
  toast = inject(ToastController);

  @Input() profileModel: Profile;
  @Input() profileCount: number; // Total profiles so far

  deleteConfirmationButtons = [{
    text: 'Delete permanently',
    icon: trashOutline.toString(),
    handler: () => this.delete(),
  }, {
    text: 'Cancel',
    icon: close.toString(),
    role: 'cancel',
  }];
  isDeleteConfirmationOpen = false;
  profile: FormGroup;

  private profileId: number;

  constructor() {
    this.profile = this.formBuilder.group({
      name: ['', [Validators.required]], // Uniqueness is checked in save() to keep things performant
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
    addIcons({ close, key, informationCircleOutline, warning, checkmarkCircleOutline, trashOutline });
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
        message: ('Profile not valid. Please check fields above are complete including name, and that your chosen Length is between 8 and 200 characters.'),
        duration: 8000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());

      return;
    }

    if (!this.profileId) {
      this.toast.create({
        message: ('Error: Profile ID missing'),
        duration: 6000,
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
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
            buttons: [{ text: 'OK', role: 'cancel' }],
          }).then(successToast => successToast.present());
          this.close();
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

  confirmDelete() {
    this.isDeleteConfirmationOpen = true;
  }

  dismissDelete() {
    this.isDeleteConfirmationOpen = false;
  }

  delete() {
    this.settingsService.deleteProfile(this.profileId)
      .then(
        () => {
          this.toast.create({
            message: ('Profile deleted!'),
            duration: 3000,
            position: 'middle',
            buttons: [{ text: 'OK', role: 'cancel' }],
          }).then(successToast => successToast.present());
          this.close();
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

  close() {
    this.modalController.dismiss();
  }

  private requireIfNoPresetValidator(outputCharacterSetCustomControl: AbstractControl) {
    if (!outputCharacterSetCustomControl.parent) {
      return null;
    }

    if (outputCharacterSetCustomControl.parent.get('output_character_set_preset').value === 'none') {
      return Validators.required(outputCharacterSetCustomControl);
    }

    return null;
  }
}
