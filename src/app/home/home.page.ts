import { Component } from '@angular/core';
import makePassword from '@webful/passwordmaker-lib';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  public password: string;

  ionViewDidEnter() {
    this.password = this.makePassword('AsdAsdSecret', 'google.com');
  }

  private makePassword(masterPassword: string, domain: string): string {
    return makePassword({
      hashAlgorithm: 'hmac-sha256',
      masterPassword: masterPassword,
      data: domain,
      length: 20,
      charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:";\'<>?,./'
    });
  }
}
