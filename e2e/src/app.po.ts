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
    // Give the app time to initialize before any interactions
    await browser.pause(3000);
    // Wait for the home page host input to exist
    await browser.waitUntil(
      async () => {
        const hostInput = await $('ion-input[name="host"]');
        return await hostInput.isExisting();
      },
      {
        timeout: 30000,
        timeoutMsg: 'Home page host input did not exist within 30 seconds'
      }
    );
    // Also wait for any loading spinner to disappear
    await this.waitForLoadingToDisappear();
  };

  /**
   * Wait for any ion-loading element to disappear from the page.
   */
  async waitForLoadingToDisappear() {
    await browser.waitUntil(
      async () => {
        const loadings = await $$('ion-loading');
        if (loadings.length === 0) {
          return true;
        }
        // Check if any loading element is still displayed
        for (const loading of loadings) {
          if (await loading.isDisplayed()) {
            return false;
          }
        }
        return true;
      },
      {
        timeout: 30000,
        timeoutMsg: 'Loading spinner did not disappear within 30 seconds'
      }
    );
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
    
    // Wait for any loading spinner to disappear
    await this.waitForLoadingToDisappear();
    
    // Additional wait for settings page form to be ready
    if (tabName === 'settings') {
      await browser.waitUntil(
        async () => {
          // The form content only renders when settingsLoaded is true
          const outputLengthInput = await $('ion-input[name="output_length"]');
          const domainOnlyToggle = await $('ion-toggle[name="domain_only"]');
          return (await outputLengthInput.isExisting()) || (await domainOnlyToggle.isExisting());
        },
        {
          timeout: 30000,
          timeoutMsg: 'Settings page form content did not load within 30 seconds'
        }
      );
    }
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
      await ionicSelect.click();
      await ionicSelect.waitForStable();
      await browser.pause(500); // CI needs a bit of extra time for options to be ready.

      // Should be only the activated select's "radio"s on screen.
      const possibleRadios = await $$('>>> ion-radio');
      possibleRadios.map(possibleRadio => {
        possibleRadio.getText().then(async possibleRadioText => {
          if (possibleRadioText === valueLabel) {
            possibleRadio.click();
            resolve(true);
          }
        }).catch(error => {
          // If we already found the desired item in another element from the `map` and
          // pressed it, this one won't have an element to `getText()` from any more. This is fine
          // and we just need to catch the WebDriver error so the test can proceed.
        });
      });
    });
  };

  async setIonicToggle(elementName: string, shouldBeChecked: boolean): Promise<boolean> {
    const ionicToggle = await $(`ion-toggle[name="${elementName}"]`);
    await ionicToggle.waitForExist({ timeout: 5000 });
    await ionicToggle.waitForDisplayed({ timeout: 5000 });

    const checkbox = await ionicToggle.$('input[type="checkbox"]');
    const currentValue = await checkbox.getAttribute('aria-checked');

    if (currentValue === shouldBeChecked.toString()) {
      return true;
    }

    await ionicToggle.click();
    return true;
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
    const rangeElements = await $$(`ion-range[name="${elementName}"]`);
    expect(await rangeElements.length).toEqual(expectedToBeVisible ? 1 : 0);
  };

  async getPageText(pageName: string): Promise<string> {
    return (await $(`app-${pageName}`)).getText();
  };
}
