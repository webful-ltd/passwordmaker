import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard';
import makePassword from '@webful/passwordmaker-lib';

import { Input } from '../../models/Input';
import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage implements OnInit {
  public clipboard_available = false;
  public input: Input = new Input('', '');
  public output_password: string;

  constructor(
    private clipboard: Clipboard,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {}

  public ngOnInit() {
    if (window.cordova && this.clipboard) { // no clipboard in-browser for now
      this.clipboard_available = true;
    }
  }

  public updatePassword() {
    return this.settingsService.getCurrentSettings().then(settings => {
      this.output_password = this.makePassword(this.input.master_password, this.input.domain, settings);
    });
  }

  public copy() {
    this.clipboard.copy(this.output_password).then(() => {
      this.toast.create({
        message: (`Copied to clipboard!`),
        duration: 2000,
        showCloseButton: true,
        closeButtonText: 'OK',
      }).then(successToast => successToast.present());
    });
  }

  private makePassword(masterPassword: string, domain: string, settings: Settings): string {
    return makePassword({
      hashAlgorithm: 'hmac-sha256',
      masterPassword: masterPassword,
      data: domain,
      length: settings.output_length,
      charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./'
    });
  }
}
