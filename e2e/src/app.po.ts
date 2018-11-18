import { browser, by, element } from 'protractor';

export class AppPage {
  public maximise() {
    browser.driver.manage().window().setSize(900, 900);
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
    browser.waitForAngular();
    return element(by.css('app-home')).getText();
  }

  public populateIonicInput(elementName: string, value: (string|number)) {
    browser.waitForAngular();
    const ionicInput = element(by.css(`ion-input[ng-reflect-name="${elementName}"]`));
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

  public save() {
    const ionicSaveButton = element(by.css(`ion-button[name="save"]`));
    browser.waitForAngular();
    ionicSaveButton.click();
  }

  public getOutputPassword() {
    browser.waitForAngular();
    return element(by.css('div.output_password')).getText();
  }
}
