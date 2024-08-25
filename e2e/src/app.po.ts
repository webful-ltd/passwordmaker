import { IonicInput } from './helpers/ionic-input.js';

export class AppPage {
  private browser: WebdriverIO.Browser;

  /**
   * @param {WebdriverIO.BrowserObject} browser   Global auto browser object.
   */
  setBrowser(browser: WebdriverIO.Browser) {
    this.browser = browser;
  };

  async maximise() {
    await this.browser.setWindowSize(600, 900);
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
    await browser.pause(500); // Ensure elements all ready on the new page before proceeding.
  };

  async getHomeText() {
    return this.getPageText('home');
  };

  async getSettingsText() {
    return this.getPageText('settings');
  };

  async populateIonicInput(elementName: string, value: (string|number)) {
    const ionicInput = new IonicInput(elementName);
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

            // ion-select OK button, inside the alert group overlay, now has its copy in an inner span.
            // But Webdriver.io v9+ is smart enough that we can just click whatever has 'OK' text.
            await $('=OK').click();

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
      const currentValue = await $(ionicInput).$('input[type="checkbox"]').getAttribute('aria-checked');

      if (currentValue === shouldBeChecked.toString()) {
        resolve(true);
        return;
      }

      await ionicInput.click();
      resolve(true);
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
    const outputElement = $('div.output_password');
    await outputElement.waitForExist();
    await outputElement.waitForStable();

    return outputElement.getText();
  };

  async confirmRangeVisibility(elementName: string, expectedToBeVisible: boolean) {
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
