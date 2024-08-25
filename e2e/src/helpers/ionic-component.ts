export class IonicComponent {
  constructor(public selector: string) {
  }

  get $() {
    return async ({ IonicPage }) => {
      const activePage = await IonicPage.active();
      return activePage.$(this.selector);
    };
  }
}
