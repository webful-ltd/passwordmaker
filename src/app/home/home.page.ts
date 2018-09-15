import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import makePassword from '@webful/passwordmaker-lib';

import { Input } from '../../models/Input';
import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  public theinput: Input = new Input('', '');
  public output_password: string;

  constructor(
    private settingsService: SettingsService,
  ) {}

  public updatePassword() {
    return this.settingsService.getCurrentSettings().then(settings => {
      this.output_password = this.makePassword(this.theinput.master_password, this.theinput.domain, settings);
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
