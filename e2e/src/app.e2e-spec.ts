AppPage = require('./app.po');

let page: typeof AppPage;

describe('PasswordMaker', () => {
  beforeAll(async () => {
    await browser.pause(3000);
  });

  beforeEach(async () => {
    page = new AppPage();
    await page.setBrowser(browser);
    await page.maximise();
    await page.startOnHomePath();
    await browser.pause(500); // CI needs a bit of time for interactible elements.
  });

  it('should display the master password field label', async () => {
    expect(await page.getHomeText()).toContain('Master password');
  });

  it('should generate the right password for the default settings', async () => {
    await page.populateIonicInput('host', 'my.example.com');
    await page.populateIonicInput('master_password', 'test');

    // Check for correct output for "example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(await page.getOutputPassword()).toEqual('rJeGcpSWpH36PMn');
    expect(await page.getHomeText()).not.toContain(`Your URL or domain doesn't look one`);
  });

  it('should warn about non-domain input when appropriate', async () => {
    await page.populateIonicInput('host', 'myexample');
    await page.populateIonicInput('master_password', 'test');

    expect(await page.getHomeText()).toContain(`Your URL or domain doesn't look one`);
  });

  it('should permit an output length of 200', async () => {
    await page.navigateToTab('settings');
    await page.populateIonicInput('output_length', 200);

    expect(await page.getSaveButtonDisabledStatus()).toBe(false);
    expect(await page.getSettingsText()).not.toContain('Settings not valid.');
  });

  it('should not permit an output length of 201', async () => {
    await page.navigateToTab('settings');
    await page.populateIonicInput('output_length', 201);

    await browser.pause(200); // Give UI a little time to update – button status update check was flaky otherwise.

    expect(await page.getSaveButtonDisabledStatus()).toBe(true);
    expect(await page.getSettingsText()).toContain('Settings not valid.');
  });

  it('should generate the right password with domain_only switched off', async () => {
    await page.navigateToTab('settings');
    expect(await page.setIonicToggle('domain_only', false)).toEqual(true);    
    expect(await page.save()).toEqual(true);

    await page.navigateToTab('home');
    await browser.pause(1500); // Give toast time to auto dismiss
    await page.populateIonicInput('host', 'my.example.com');
    await page.populateIonicInput('master_password', 'test');

    // Check for correct output for "my.example.com" with alphanumeric charset, 15 length, HMAC-SHA256.
    expect(await page.getOutputPassword()).toEqual('RRC4KZEH8mzHfd6');
  });

  it('should generate the right password with an altered length, characters and algorithm', async () => {
    await page.navigateToTab('settings');
    await page.populateIonicInput('output_length', 25);
    expect(await page.populateIonicSelect('output_character_set', 'Letters')).toEqual(true);
    expect(await page.populateIonicSelect('algorithm', 'SHA1')).toEqual(true);
    expect(await page.setIonicToggle('domain_only', true)).toEqual(true);
    expect(await page.save()).toEqual(true);

    await page.navigateToTab('home');
    await browser.pause(1500); // Give toast time to auto dismiss
    await page.populateIonicInput('host', 'my.example.com');
    await page.populateIonicInput('master_password', 'test');

    // Check for correct output for "example.com" with letters charset, 25 length, SHA1.
    expect(await page.getOutputPassword()).toEqual('wddqcgQOWiMBbFeTSlsQawkuB');
  });

  it('should generate the right password with an altered length, characters, algorithm and domain_only off', async () => {
    await page.navigateToTab('settings');
    await page.populateIonicInput('output_length', '25');
    expect(await page.populateIonicSelect('output_character_set', 'Letters')).toEqual(true);
    expect(await page.populateIonicSelect('algorithm', 'SHA1')).toEqual(true);
    expect(await page.setIonicToggle('domain_only', false)).toEqual(true);
    expect(await page.save()).toEqual(true);

    await page.navigateToTab('home');
    await browser.pause(1500); // Give toast time to auto dismiss
    await page.populateIonicInput('host', 'my.example.com');
    await page.populateIonicInput('master_password', 'test');

    // Check for correct output for "my.example.com" with letters charset, 25 length, SHA1.
    expect(await page.getOutputPassword()).toEqual('PSZKuWvFAtVWNoIqfBsAHnEOr');
    expect(await page.getHomeText()).toContain(`If you didn't change this on purpose`); // non-domain_only warning
  });

  it('should update output password with new settings automatically, and show the added number slider when appropriate', async () => {
    await page.populateIonicInput('host', 'my.example.com');
    await page.populateIonicInput('master_password', 'test');

    await page.navigateToTab('settings');
    expect(await page.populateIonicSelect('output_character_set', 'Alphanumeric')).toEqual(true);
    expect(await page.populateIonicSelect('algorithm', 'HMAC-SHA256')).toEqual(true);
    await page.populateIonicInput('output_length', 30);
    expect(await page.setIonicToggle('domain_only', true)).toEqual(true);

    // Expect added number slider to be hidden when linked toggle is off
    await page.confirmRangeVisibility('added_number', false);
    expect(await page.setIonicToggle('added_number_on', true)).toEqual(true);

    // Expect added number slider to be visible when linked toggle is on
    await page.confirmRangeVisibility('added_number', true); // Leave the range slider at default position, so it saves as 0

    expect(await page.save()).toEqual(true);

    await page.navigateToTab('home');
    await browser.pause(1500); // Give toast time to auto dismiss
    // Check for correct output for "example.com" with alphanumeric charset, 30 length, HMAC-SHA256.
    expect(await page.getOutputPassword()).toEqual('rJeGcpSWpH36PMn706JrNR9vNzr9Wj0');
    expect(await page.getHomeText()).not.toContain(`If you didn't change this on purpose`); // no non-domain_only warning
  });
});
