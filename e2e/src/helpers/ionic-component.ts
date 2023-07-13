export class IonicComponent {
  constructor(public selector: string | WebdriverIO.Element) {
  }

  get $() {
    return async ({ IonicPage }) => {
      if (typeof this.selector === 'string') {
        const activePage = await IonicPage.active();
        return activePage.$(this.selector);
      }

      return this.selector;
    };
  }
}
