import { Component } from '@angular/core';
import makePassword from '@webful/passwordmaker-lib';

import { Input } from '../../models/Input';
import { Settings } from '../../models/Settings';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
})
export class HomePage {
  public input: Input = new Input('', '');
  public output_password: string;

  constructor(
    private settingsService: SettingsService,
  ) {}

  public updatePassword() {
    return this.settingsService.getCurrentSettings().then(settings => {
      this.output_password = this.makePassword(this.input.master_password, this.input.domain, settings);
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
