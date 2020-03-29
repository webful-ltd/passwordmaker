import { SettingsSimple } from '../models/SettingsSimple';
import { SettingsAdvanced } from './SettingsAdvanced';

describe('SettingsAdvanced', () => {
  it('should correctly create from SettingsSimple', () => {
    const settingsSimple = new SettingsSimple();

    settingsSimple.added_number_on = true;
    settingsSimple.added_number = 4;
    settingsSimple.algorithm = 'md5';
    settingsSimple.domain_only = false;
    settingsSimple.output_character_set = '0123456789';
    settingsSimple.output_length = 13;
    settingsSimple.remember_minutes = 3;

    // This constructor should set up the first profile with ID 1 and set that to be active.
    const settingsAdvanced = new SettingsAdvanced(settingsSimple);

    // Check values from simple settings apply to the first profile and pull through to the getters...
    expect(settingsAdvanced.getAlgorithm()).toBe('md5');
    expect(settingsAdvanced.isDomainOnly()).toBe(false);
    expect(settingsAdvanced.getOutputCharacterSet()).toBe('0123456789');
    expect(settingsAdvanced.getOutputLength()).toBe(13);
    expect(settingsAdvanced.getPostProcessingSuffix()).toBe('4');
    expect(settingsAdvanced.getRememberMinutes()).toBe(3);

    // ...and check defaults are as expected
    expect(settingsAdvanced.getLeetLevel()).toBe(0);
    expect(settingsAdvanced.getLeetLocation()).toBe('none');
    expect(settingsAdvanced.getModifier()).toBe('');
    expect(settingsAdvanced.getPrefix()).toBe('');
    expect(settingsAdvanced.getSuffix()).toBe('');
  });

  it('should have all getters work when instantiated with defaults', () => {
    // Instantiation can only be via an 'upgrade' from SettingsSimple, but that can
    // use all its defaults this way.
    const settings = new SettingsAdvanced(new SettingsSimple());

    expect(settings.getAlgorithm()).toBe('hmac-sha256');
    expect(settings.getLeetLocation()).toBe('none');
    expect(settings.getLeetLevel()).toBe(0);
    expect(settings.getModifier()).toBe('');
    expect(settings.getOutputCharacterSet()).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    expect(settings.getOutputLength()).toBe(15);
    expect(settings.getPostProcessingSuffix()).toBe('');
    expect(settings.getPrefix()).toBe('');
    expect(settings.getRememberMinutes()).toBe(5);
    expect(settings.getSuffix()).toBe('');
    expect(settings.isDomainOnly()).toBe(true);
  });

  it('should have all getters work when properties set to non-defaults', () => {
    const settings = new SettingsAdvanced(new SettingsSimple());
    settings.remember_minutes = 0;
    settings.profiles[0].algorithm = 'md5';
    settings.profiles[0].leet_location = 'both';
    settings.profiles[0].leet_level = 9;
    settings.profiles[0].modifier = 'myMod';
    settings.profiles[0].output_character_set = 'xyz123';
    settings.profiles[0].output_length = 7;
    settings.profiles[0].post_processing_suffix = '!!';
    settings.profiles[0].prefix = 'zxc';
    settings.profiles[0].suffix = 'vbn';
    settings.profiles[0].domain_only = false;

    // Profile ID 1, at index 0, should be the active one after the above instantiation.
    expect(settings.getAlgorithm()).toBe('md5');
    expect(settings.getLeetLocation()).toBe('both');
    expect(settings.getLeetLevel()).toBe(9);
    expect(settings.getModifier()).toBe('myMod');
    expect(settings.getOutputCharacterSet()).toBe('xyz123');
    expect(settings.getOutputLength()).toBe(7);
    expect(settings.getPostProcessingSuffix()).toBe('!!');
    expect(settings.getPrefix()).toBe('zxc');
    expect(settings.getRememberMinutes()).toBe(0);
    expect(settings.getSuffix()).toBe('vbn');
    expect(settings.isDomainOnly()).toBe(false);
  });
});
