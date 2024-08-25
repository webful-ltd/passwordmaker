import { IonicComponent } from './ionic-component.ts';
import { Ionic$ } from './ionic$.ts';
import { ElementActionOptions } from './definitions.ts';

export class IonicInput extends IonicComponent {
  constructor(name: string) {
    super(`ion-input[name=${name}`);
  }

  async setValue(
    value: string,
    { visibilityTimeout = 5000 }: ElementActionOptions = {}
  ) {
    const el = await Ionic$.$(this.selector);
    await el.waitForDisplayed({ timeout: visibilityTimeout });

    const ionTags = ['ion-input', 'ion-textarea'];
    if (ionTags.indexOf(await el.getTagName()) >= 0) {
      const input = await el.$('input,textarea');
      await input.setValue(value);
    } else {
      return el.setValue(value);
    }
  }

  async getValue({ visibilityTimeout = 5000 }: ElementActionOptions = {}) {
    const el = await Ionic$.$(this.selector);
    await el.waitForDisplayed({ timeout: visibilityTimeout });

    const ionTags = ['ion-input', 'ion-textarea'];
    if (ionTags.indexOf(await el.getTagName()) >= 0) {
      const input = await el.$('input,textarea');
      return input.getValue();
    } else {
      return el.getValue();
    }
  }
}
