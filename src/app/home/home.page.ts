import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import makePassword from '@webful/passwordmaker-lib';

import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage implements AfterViewInit {
  public password: string;
  public ready = false;

  constructor(
    private settingsService: SettingsService,
  ) {}

  ngAfterViewInit() {
    console.log('after view init');
    this.ready = true;

    this.updatePassword();
  }

  public updatePassword() {
    console.log('gP called');

    if (!this.ready) {
      console.log('gP not ready yet');
      return null;
    }

    console.log('getting password');
    return this.settingsService.getCurrentSettings().then(settings => {
      this.password = this.makePassword('AsdAsdSecret', 'google.com', settings);
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
