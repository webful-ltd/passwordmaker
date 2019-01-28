import { browser, by, element } from 'protractor';

export class AppPage {
  public maximise() {
    browser.driver.manage().window().setSize(600, 900);
  }

  public startOnHomePath() {
    browser.get('/');
  }

  /**
   * Navigate to a tab in the same way a user would.
   *
   * @param tab Label for the destination tab
   */
  public navigateToTab(tabName: string) {
    const tab = element(by.css(`ion-tab-button[tab="${tabName}"]`));
    tab.click();
    browser.waitForAngular();
    browser.pause(1000); // Travis builds had intermittent trouble on next step without a fixed pause
  }

  public getHomeText() {
    return this.getPageText('home');
  }

  public getSettingsText() {
    return this.getPageText('settings');
  }

  public populateIonicInput(elementName: string, value: (string|number)) {
    browser.waitForAngular();
    const ionicInput = element(by.css(`input[name="${elementName}"]`));
    ionicInput.click();

    // `clear()` wasn't allowed on `ion-input` or the native field, so backspace x20 to remove existing value.
    ionicInput.sendKeys('\b'.repeat(20) + value);
  }

  public populateIonicSelect(elementName: string, valueLabel: string): Promise<boolean> {
    return new Promise(resolve => {
      const ionicSelect = element(by.css(`ion-select[name="${elementName}"]`));
      browser.waitForAngular();
      ionicSelect.click();
      browser.sleep(400); // Wait for elements to be available and visible

      return element.all(by.css('div.alert-radio-group > button')).map(possibleRadio => {
        possibleRadio.getText().then(possibleRadioText => {
          if (possibleRadioText === valueLabel) {
            possibleRadio.click();
            element(by.buttonText('OK')).click();

            browser.sleep(200); // Wait for overlay's close animation so it doesn't steal focus
            resolve(true);
          }
        }).catch(error => {
          // If we already found the desired radio button in another elements from the `map` and
          // clicked OK, this one won't have an element to `getText()` from any more. This is fine
          // and we just need to catch the WebDriver error so the test can proceed.
        });
      });
    });
  }

  public setIonicToggle(elementName: string, shouldBeChecked: boolean): Promise<boolean> {
    const ionicInput = element(by.css(`ion-toggle[name="${elementName}"]`));

    return new Promise<boolean>(resolve => {
      ionicInput.getAttribute('checked').then((currentValue: string) => {
        const isChecked: boolean = (currentValue === 'true');
        if (isChecked !== shouldBeChecked) {
          browser.waitForAngular();
          ionicInput.click();
        }
        resolve(true);
      });
    });
  }

  public save(): Promise<boolean> {
    const ionicSaveButton = element(by.css(`ion-button[name="save"]`));

    return new Promise<boolean>(resolve => {
      // Scroll to the bottom of the content, so we don't have to make the browser viewport
      // huge to avoid the tab bar stealing focus when clicking Save. https://stackoverflow.com/a/47580259/2803757
      const ionicSaveButtonWebElement = ionicSaveButton.getWebElement();
      browser.executeScript(
        `arguments[0].scrollIntoView({behavior: "smooth", block: "end"});`,
        ionicSaveButtonWebElement,
      );

      // As the scrolling happens with custom JS and 'outside' the normal E2E event flow, a
      // short explicit sleep seems to be needed for the scroll to complete before we try to
      // click() the button. Waiting for `executeScript()`'s promise resolution wasn't sufficient.
      browser.sleep(500);

      ionicSaveButton.click().then(() => resolve(true));
    });
  }

  public getSaveButtonDisabledStatus(): Promise<boolean> {
    const ionicSaveButton = element(by.css(`ion-button[name="save"]`));

    return new Promise<boolean>(resolve => {
      ionicSaveButton.getAttribute('disabled').then(disabledValue => {
        resolve(!!disabledValue);
      });
    });
  }

  public getOutputPassword() {
    browser.waitForAngular();
    return element(by.css('div.output_password')).getText();
  }

  public confirmRangeVisibility(elementName: string, expectedToBeVisible: boolean) {
    browser.sleep(400); // Wait for elements to be available and visible
    expect(element(by.css(`ion-range[ng-reflect-name="${elementName}"]`)).isPresent()).toBe(expectedToBeVisible);
  }

  private getPageText(pageName: string) {
    browser.waitForAngular();

    return element(by.css(`app-${pageName}`)).getText();
  }
}
