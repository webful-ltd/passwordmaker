import { IonicPage } from './ionic-page.ts';

export class Ionic$ {
  static async $(selector: string): Promise<WebdriverIO.Element> {
    const activePage = await IonicPage.active();
    return activePage.$(selector);
  }

  static async $$(selector: string): Promise<WebdriverIO.Element[]> {
    const activePage = await IonicPage.active();
    return activePage.$$(selector);
  }
}
