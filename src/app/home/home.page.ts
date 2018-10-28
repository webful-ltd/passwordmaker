import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Events, Platform, ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import { Input } from '../../models/Input';
import { PasswordsService } from '../passwords.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.page.scss'],
  templateUrl: 'home.page.html',
})
export class HomePage implements OnInit {
  public clipboard_available = false;
  public input: Input = new Input();
  public literal_input_warning = false;
  public output_password?: string;
  private expire_password_on_context_change = false;
  private expiry_timer_id: number;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private clipboard: Clipboard,
    private events: Events,
    private platform: Platform,
    private passwordsService: PasswordsService,
    private settingsService: SettingsService,
    public toast: ToastController,
    private zone: NgZone,
  ) {}

  public ngOnInit() {
    if (window.cordova) {
      // For now, no clipboard in-browser - API support not wide + no plugin support
      if (this.clipboard) {
        this.clipboard_available = true;
      }

      // And no clearing master password in-browser as context switching events are
      // less usable, and we don't officially target a web build as yet
      this.platform.pause.subscribe(() => {
        this.contextChange();
      });
      this.platform.resume.subscribe(() => {
        this.contextChange();
        this.updateView();
      });
    }

    this.updatePassword();

    this.events.subscribe('settingsSaved', () => { this.updatePassword(); });
  }

  public updatePassword() {
    if (this.input.master_password.length === 0 || this.input.host.length === 0) {
      this.output_password = null;
      return;
    }

    if (this.input.master_password.length > 0) {
      this.updateExpiryTimer();
    }

    this.settingsService.getCurrentSettings().then(settings => {
      this.literal_input_warning = !settings.domain_only;
      this.output_password = this.passwordsService.getPassword(this.input.master_password, this.input.host, settings);
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

  private updateExpiryTimer() {
    this.expire_password_on_context_change  = false;

    if (this.expiry_timer_id) {
      window.clearTimeout(this.expiry_timer_id);
      this.expiry_timer_id = null;
    }

    this.settingsService.getCurrentSettings().then(settings => {
      if (settings.remember_minutes > 0) {
        // "Don't let me into my zone": Because the expire flag is always used in conjunction with
        // other UI events, we don't need Angular to be tracking for this timeout. And if we allow
        // it to do so, e2e tests break with default values (non-zero save password minutes) because
        // they're always waiting several minutes for Angular to finish resolving this event.
        this.zone.runOutsideAngular(() => {
          this.expiry_timer_id = window.setTimeout(() => {
            this.expire_password_on_context_change = true;
          }, settings.remember_minutes * 60000);
        });
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
