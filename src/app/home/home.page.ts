import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import * as urlParse from 'url-parse/dist/url-parse'; // https://github.com/unshiftio/url-parse/issues/150#issuecomment-403150854
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
  public input: Input = new Input();
  public literal_input_warning = false;
  public output_password?: string;
  private expire_password_on_context_change = false;
  private expiry_timer_id: number;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private clipboard: Clipboard,
    private platform: Platform,
    private settingsService: SettingsService,
    public toast: ToastController,
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
      if (!settings.domain_only) {
        this.literal_input_warning = true;
      }

      this.output_password = this.makePassword(this.input.master_password, this.input.host, settings);
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

  private makePassword(masterPassword: string, host: string, settings: Settings): string {
    const coreData = this.extractCoreData(host, settings);
    if (coreData === '') {
      return '';
    }

    return makePassword({
      hashAlgorithm: settings.algorithm,
      masterPassword: masterPassword,
      data: coreData,
      length: settings.output_length,
      charset: settings.output_character_set,
    });
  }

  // TODO move host string manipulation helpers to a dedicated class
  private extractCoreData(host: string, settings: Settings): string {
    if (!settings.domain_only) {
      return host; // Use URL or other input unmodified when `domain_only` is off.
    }

    // If we didn't get a protocol, assume this is an omission and add one before handing over to url-parse.
    const protocolRegex = /^[a-zA-Z]+:\/\//;
    if (!protocolRegex.test(host)) {
      host = `https://${host}`;
    }

    const parsedUrl = urlParse(host);
    const parsedHost = parsedUrl.hostname;

    // If the parsed host is local it's probably because we passed in dodgy input and the url-parse lib fell
    // back to its default input, the webview's local URL -> return blank output so no password is generated.
    if (parsedHost === 'localhost') {
      return '';
    }

    // IPs should have all 4 parts included for the hash.
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsedHost)) {
      return parsedHost;
    }

    // Most other hostnames should have their last 2 pieces used; a few common 2-level 'TLDs' use 3.
    return this.extractMainDomain(parsedHost);
  }

  /**
   * Get the main part of the domain, factoring in very common 2-level 'TLDs' where we need 3 rather than 2 parts.
   */
  private extractMainDomain(host: string): string {
    /**
     * @type {string[]} Define common reserved 2nd-level domains ONLY used at the 3rd and below level.
     */
    const commonTwoLevels = ['com.au', 'co.uk', 'ltd.uk', 'me.uk', 'net.uk', 'org.uk', 'plc.uk', 'sch.uk'];
    for (const index in commonTwoLevels) {
      if (host.endsWith('.' + commonTwoLevels[index])) {
        return host.split('.').slice(-3).join('.');
      }
    }

    return host.split('.').slice(-2).join('.');
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
