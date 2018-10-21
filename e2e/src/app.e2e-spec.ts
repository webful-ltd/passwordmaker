import { AppPage } from './app.po';

describe('new App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the master password field label', () => {
    page.navigateToHome();

    expect(page.getParagraphText()).toContain('Master password');
  });

  it('should generate the right password for the default settings', () => {
    page.navigateToHome();

    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toEqual('rJeGcpSWpH36PMn');
  });

  it('should generate the right password with domain_only switched off', () => {
    page.navigateToSettings();
    page.setIonicToggle('domain_only', false);
    page.save();

    page.navigateToHome();

    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "my.example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toEqual('RRC4KZEH8mzHfd6');
  });

  it('should generate the right password with an altered length, characters and algorithm', () => {
    page.navigateToSettings();
    page.populateIonicInput('output_length', 25);
    page.populateIonicSelect('output_character_set', 'Letters').then(() => {
      page.populateIonicSelect('algorithm', 'SHA1').then(() => {
        page.setIonicToggle('domain_only', true);
        page.save();

        page.navigateToHome();
        page.populateIonicInput('host', 'my.example.com');
        page.populateIonicInput('master_password', 'test');

        // Check for correct output for "example.com" with letters charset, 25 length, SHA1.
        expect(page.getOutputPassword()).toEqual('wddqcgQOWiMBbFeTSlsQawkuB');
      });
    });
  });

  it('should generate the right password with an altered length, characters, algorithm and literal text handling', () => {
    page.navigateToSettings();
    page.populateIonicInput('output_length', 25);
    page.populateIonicSelect('output_character_set', 'Letters').then(() => {
      page.populateIonicSelect('algorithm', 'SHA1').then(() => {
        page.setIonicToggle('domain_only', false);
        page.save();

        page.navigateToHome();
        page.populateIonicInput('host', 'my.example.com');
        page.populateIonicInput('master_password', 'test');

        // Check for correct output for "my.example.com" with letters charset, 25 length, SHA1.
        expect(page.getOutputPassword()).toEqual('PSZKuWvFAtVWNoIqfBsAHnEOr');
      });
    });
  });
});
