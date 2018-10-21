import { browser, by, element } from 'protractor';

export class AppPage {
  public navigateToHome() {
    browser.get('/');
    browser.sleep(2500);
  }

  public navigateToSettings() {
    browser.get('/tabs/(settings:settings)');
    browser.sleep(2500);
  }

  public getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }

  public populateIonicInput(elementName: string, value: (string|number)) {
    const ionicInput = element(by.css(`ion-input[name="${elementName}"]`));

    // Because some fields use floating input labels, we need to click & wait for a UI update before interacting.
    ionicInput.click();
    browser.waitForAngular();

    // `clear()` wasn't allowed on `ion-input` or the native field, so backspace x20 to remove existing value.
    ionicInput.sendKeys('\b'.repeat(20) + value);
  }

  public populateIonicSelect(elementName: string, valueLabel: string) {
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
        }
      }).catch(error => {
        // If we already found the desired radio button in another elements from the `map` and
        // clicked OK, this one won't have an element to `getText()` from any more. This is fine
        // and we just need to catch the WebDriver error so the test can proceed.
      });
    });
  }

  public setIonicToggle(elementName: string, shouldBeChecked: boolean) {
    const ionicInput = element(by.css(`ion-toggle[name="${elementName}"]`));

    ionicInput.getAttribute('checked').then((currentValue: string) => {
      const isChecked: boolean = (currentValue === 'true');
      if (isChecked !== shouldBeChecked) {
        browser.waitForAngular();
        ionicInput.click();
      }
    });
  }

  public save() {
    const ionicSaveButton = element(by.css(`ion-button[name="save"]`));
    browser.waitForAngular();
    ionicSaveButton.click();
  }

  public getOutputPassword() {
    browser.waitForAngular();
    return element(by.css('span.output_password')).getText();
  }
}
