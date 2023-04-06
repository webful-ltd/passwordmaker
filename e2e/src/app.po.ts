const IonicInput = require('./helpers/ionic-input');

class AppPage {
  private browser: WebdriverIO.Browser;

  /**
   * @param {WebdriverIO.BrowserObject} browser   Global auto browser object.
   */
  setBrowser(browser: WebdriverIO.Browser) {
    this.browser = browser;
  };

  async maximise() {
    await browser.setWindowSize(600, 900);
  };

  async startOnHomePath() {
    await browser.url('/');
  };

  /**
   * Navigate to a tab in the same way a user would.
   *
   * @param {string} tab Label for the destination tab
   */
  async navigateToTab(tabName: string) {
    const tab = await $(`ion-tab-button[tab="${tabName}"]`);
    await tab.click();
    await browser.pause(1400); // Ensure elements all ready on the new page before proceeding.
  };

  async getHomeText() {
    return this.getPageText('home');
  };

  async getSettingsText() {
    return this.getPageText('settings');
  };

  async populateIonicInput(elementName: string, value: (string|number)) {
    const ionicInput = new IonicInput(`input[name="${elementName}"]`);
    await ionicInput.setValue(value.toString());
  };

  // We can probably replace this with the helper element + its select(...) at some point, but we'll
  // still need some custom logic to work out which numeric item index to pass in.
  populateIonicSelect(elementName: string, valueLabel: string): Promise<boolean> {
    return new Promise(async resolve => {
      const ionicSelect = await $(`ion-select[name="${elementName}"]`);
      ionicSelect.click();
      await browser.pause(400); // Wait for select to be interactible.

      return $$('div.alert-radio-group > button').map(possibleRadio => {
        possibleRadio.getText().then(async possibleRadioText => {
          if (possibleRadioText === valueLabel) {
            possibleRadio.click();
            await $('button*=OK').click();
            await browser.pause(200); // Wait for overlay's close animation so it doesn't steal focus
            resolve(true);
          }
        }).catch(error => {
          // If we already found the desired radio button in another elements from the `map` and
          // clicked OK, this one won't have an element to `getText()` from any more. This is fine
          // and we just need to catch the WebDriver error so the test can proceed.
        });
      });
    });
  };

  async setIonicToggle(elementName: string, shouldBeChecked: boolean): Promise<boolean> {
    const ionicInput = await $(`ion-toggle[name="${elementName}"]`);

    return new Promise<boolean>(async resolve => {
      await ionicInput.getAttribute('aria-checked').then(async (currentValue: string) => {
        const isChecked: boolean = (currentValue === 'true');
        if (isChecked !== shouldBeChecked) {
          await ionicInput.click();
        }
        resolve(true);
      });
    });
  };

  async save(): Promise<boolean> {
    const ionicSaveButton = await $(`ion-button[name="save"]`);

    return new Promise<boolean>(async resolve => {
      await ionicSaveButton.click().then(() => resolve(true));
    });
  };

  async getSaveButtonDisabledStatus(): Promise<boolean> {
    const ionicSaveButton = await $(`ion-button[name="save"]`);

    return new Promise<boolean>(async resolve => {
      await ionicSaveButton.getAttribute('disabled').then(disabledValue => {
        resolve(!!disabledValue);
      });
    });
  };

  async getOutputPassword() {
    // With the Ionic + Angular + Chromedriver updates August 2019, browser.waitForAngular() alone
    // seemed to stop working for ensuring that div.output_password is available, so had to add an
    // explicit pause here too.
    await browser.pause(200);

    return $('div.output_password').getText();
  };

  async confirmRangeVisibility(elementName: string, expectedToBeVisible: boolean) {
    await browser.pause(400); // Wait for elements to be available and visible
    if (expectedToBeVisible) {
      expect($(`ion-range[ng-reflect-name="${elementName}"]`)).toExist();
    } else {
      expect($(`ion-range[ng-reflect-name="${elementName}"]`)).not.toExist();
    }
  };

  async getPageText(pageName: string): Promise<string> {
    return (await $(`app-${pageName}`)).getText();
  };
}

module.exports = AppPage
