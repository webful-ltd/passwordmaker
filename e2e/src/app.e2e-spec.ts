import { AppPage } from './app.po';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display master password field label', () => {
    page.navigateToHome();

    expect(page.getParagraphText()).toContain('Master password');
  });

  it('should generate the right password for the default settings', () => {
    page.navigateToHome();

    page.populateIonicInput('host', 'example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toContain('rJeGcpSWpH36PMn');
  });
});
