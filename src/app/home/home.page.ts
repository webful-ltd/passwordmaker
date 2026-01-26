import { ChangeDetectorRef, Component, NgZone, OnInit, effect, inject } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, Platform, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, warning, copy } from 'ionicons/icons';

import { Input } from '../../models/Input';
import { PasswordsService } from '../passwords.service';
import { Settings } from '../../models/Settings';
import { SettingsAdvanced } from '../../models/SettingsAdvanced';
import { SettingsService } from '../settings.service';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.page.scss'],
  templateUrl: 'home.page.html',
  standalone: false
})
export class HomePageComponent implements OnInit {
  private changeDetector = inject(ChangeDetectorRef);
  loadingController = inject(LoadingController);
  private passwordsService = inject(PasswordsService);
  private platform = inject(Platform);
  private settingsService = inject(SettingsService);
  private shareService = inject(ShareService);
  toast = inject(ToastController);
  private zone = inject(NgZone);

  advanced_mode = false;
  clipboard_available = false;
  input: Input = new Input();
  literal_input_warning = false;
  non_domain_warning = false;
  output_password?: string;
  settings: Settings;

  private expire_password_on_context_change = false;
  private expiry_timer_id: number;
  private loading: HTMLIonLoadingElement;
  protected master_password_hash?: string;

  constructor() {
    addIcons({ informationCircleOutline, warning, copy });

    // React to shared text by populating the host field
    effect(() => {
      const sharedHost = this.shareService.sharedHost();
      if (sharedHost) {
        this.input.host = sharedHost;
        this.shareService.clearSharedHost();
        this.update();
      }
    });
  }

  async ngOnInit() {
    this.loading = await this.loadingController.create();
    await this.loading.present();

    if (this.platform.is('capacitor')) {
      // @capacitor/clipboard "is not implemented on web Wrapper" for now.
      this.clipboard_available = true;

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

    this.update();

    this.settingsService.saveSubject.subscribe(() => { this.update(); });
  }

  async update() {
    let settings: Settings;
    try {
      settings = await this.settingsService.getCurrentSettings();
    } catch (err) {
      this.toast.create({
        message: (`Could not load settings: ${err.message}`),
        position: 'middle',
        cssClass: 'error',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(errorToast => errorToast.present());
      this.loading.dismiss();

      return;
    }

    this.settings = settings;
    if (settings instanceof SettingsAdvanced) {
      this.advanced_mode = true;
      this.input.active_profile_id = settings.active_profile_id;
    }

    if (this.input.master_password.length === 0 || this.input.host.length === 0) {
      this.output_password = null;
      this.non_domain_warning = false;
      if (this.loading) {
        this.loading.dismiss();
      }

      return;
    }

    this.non_domain_warning = (this.input.host.indexOf('.') === -1);

    if (settings.master_password_hash) {
      this.master_password_hash = this.passwordsService.hashMasterPassword(this.input.master_password);
    } else {
      this.master_password_hash = null;
    }

    if (this.input.master_password.length > 0) {
      this.updateExpiryTimer();
    }

    this.literal_input_warning = !settings.isDomainOnly();

    if (!settings.isDomainOnly()) {
      // If we're showing the general literal input warning, the non-domain warning is not really relevant
      // as we're not going to pull out a domain anyway.
      this.non_domain_warning = false;
    }

    this.output_password = this.passwordsService.getPassword(
      this.input.master_password,
      this.input.host,
      settings,
    );

    if (this.loading) {
      this.loading.dismiss();
    }
  }

  switchProfile(event: any) {
    if (this.settings instanceof SettingsAdvanced) {
      this.settings.setActiveProfile(event.detail.value);
      this.settingsService.save(this.settings);
    }
  }

  copy() {
    Clipboard.write({ string: this.output_password }).then(() => {
      this.toast.create({
        message: ('Copied to clipboard!'),
        duration: 2000,
        position: 'middle',
        buttons: [{ text: 'OK', role: 'cancel' }],
      }).then(successToast => successToast.present());
    });
  }

  /**
   * Helper to add a more intuitive way to tell your device you're done inputting and efficiently hide
   * the keyboard to see the password and Copy button.
   */
  hideKeyboard() {
    if (this.platform.is('capacitor')) {
      Keyboard.hide();
    }
  }

  get advancedSettings(): SettingsAdvanced {
    return this.settings as SettingsAdvanced;
  }

  private updateExpiryTimer() {
    this.expire_password_on_context_change = false;

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
