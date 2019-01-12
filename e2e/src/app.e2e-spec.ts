import { AppPage } from './app.po';

describe('PasswordMaker', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.maximise();
    page.startOnHomePath();
  });

  it('should display the master password field label', () => {
    expect(page.getHomeText()).toContain('Master password');
  });

  it('should generate the right password for the default settings', () => {
    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toEqual('rJeGcpSWpH36PMn');
  });

  it('should generate the right password with domain_only switched off', () => {
    page.navigateToTab('settings');
    expect(page.setIonicToggle('domain_only', false)).toEqual(true);
    page.save();

    page.navigateToTab('home');
    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "my.example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toEqual('RRC4KZEH8mzHfd6');
  });

  it('should generate the right password with an altered length, characters and algorithm', () => {
    page.navigateToTab('settings');
    page.populateIonicInput('output_length', 25);
    expect(page.populateIonicSelect('output_character_set', 'Letters')).toEqual(true);
    expect(page.populateIonicSelect('algorithm', 'SHA1')).toEqual(true);
    expect(page.setIonicToggle('domain_only', true)).toEqual(true);
    page.save();

    page.navigateToTab('home');
    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "example.com" with letters charset, 25 length, SHA1.
    expect(page.getOutputPassword()).toEqual('wddqcgQOWiMBbFeTSlsQawkuB');
  });

  it('should generate the right password with an altered length, characters, algorithm and domain_only off', () => {
    page.navigateToTab('settings');
    page.populateIonicInput('output_length', 25);
    expect(page.populateIonicSelect('output_character_set', 'Letters')).toEqual(true);
    expect(page.populateIonicSelect('algorithm', 'SHA1')).toEqual(true);
    expect(page.setIonicToggle('domain_only', false)).toEqual(true);
    page.save();

    page.navigateToTab('home');
    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    // Check for correct output for "my.example.com" with letters charset, 25 length, SHA1.
    expect(page.getOutputPassword()).toEqual('PSZKuWvFAtVWNoIqfBsAHnEOr');
    expect(page.getHomeText()).toContain(`If you didn't change this on purpose`); // non-domain_only warning
  });

  it('should update output password with new settings automatically, and show the added number slider when appropriate', () => {
    page.populateIonicInput('host', 'my.example.com');
    page.populateIonicInput('master_password', 'test');

    page.navigateToTab('settings');
    expect(page.populateIonicSelect('output_character_set', 'Alphanumeric')).toEqual(true);
    expect(page.populateIonicSelect('algorithm', 'HMAC-SHA256')).toEqual(true);
    page.populateIonicInput('output_length', 30);
    expect(page.setIonicToggle('domain_only', true)).toEqual(true);

    // Expect added number slider to be hidden when linked toggle is off
    page.confirmRangeVisibility('added_number', false);
    expect(page.setIonicToggle('added_number_on', true)).toEqual(true);

    // Expect added number slider to be visible when linked toggle is on
    page.confirmRangeVisibility('added_number', true); // Leave the range slider at default position, so it saves as 0

    page.save();

    page.navigateToTab('home');
    // Check for correct output for "example.com" with alphanumeric charset, 30 length, HMAC-SHA256.
    expect(page.getOutputPassword()).toEqual('rJeGcpSWpH36PMn706JrNR9vNzr9Wj0');
    expect(page.getHomeText()).not.toContain(`If you didn't change this on purpose`); // no non-domain_only warning
  });
});
