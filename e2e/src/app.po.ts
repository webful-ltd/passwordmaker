import { browser, by, element } from 'protractor';

export class AppPage {
  navigateToHome() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.deepCss('app-root ion-content')).getText();
  }

  populateIonicInput(elementName: string, value: string) {
    const ionicInput = element(by.css(`ion-input[name="${elementName}"]`));

    // Because some fields use floating input labels, we need to click & wait for a UI update before interacting.
    ionicInput.click();
    browser.waitForAngular();
    ionicInput.sendKeys(value);
  }

  getOutputPassword() {
    return element(by.css('span.output_password')).getText();
  }
}
