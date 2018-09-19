import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import makePassword from '@webful/passwordmaker-lib';

import { Input } from '../../models/Input';
import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.page.scss'],
  templateUrl: 'home.page.html',
})
export class HomePage implements OnInit {
  public clipboard_available = false;
  public input: Input = new Input('', '');
  public output_password?: string;
  private expire_password_on_context_change = false;
  private expiry_timer_id: number;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private clipboard: Clipboard,
    private platform: Platform,
    private settingsService: SettingsService,
    public toast: ToastController,
  ) {
    this.platform.pause.subscribe(() => {
      this.contextChange();
    });
    this.platform.resume.subscribe(() => {
      this.contextChange();
      this.updateView();
    });
  }

  public ngOnInit() {
    if (window.cordova && this.clipboard) { // no clipboard in-browser for now
      this.clipboard_available = true;
    }
  }

  public updatePassword() {
    this.updateExpiryTimer();

    if (this.input.master_password.length === 0 || this.input.domain.length === 0) {
      this.output_password = null;
      return;
    }

    this.settingsService.getCurrentSettings().then(settings => {
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
      charset: settings.output_character_set,
    });
  }

  private updateExpiryTimer() {
    this.expire_password_on_context_change  = false;

    if (this.expiry_timer_id) {
      window.clearTimeout(this.expiry_timer_id);
      this.expiry_timer_id = null;
    }

    this.settingsService.getCurrentSettings().then(settings => {
      if (settings.remember_minutes > 0) {
        this.expiry_timer_id = window.setTimeout(() => {
          this.expire_password_on_context_change = true;
        }, settings.remember_minutes * 60000);
      } else {
        this.expire_password_on_context_change = true;
      }
    });
  }

  private contextChange() {
    if (this.expire_password_on_context_change) {
      this.input.master_password = '';
      this.expire_password_on_context_change = false;
      this.output_password = null;
    }
  }

  private updateView() {
    this.changeDetector.detectChanges();
  }
}
