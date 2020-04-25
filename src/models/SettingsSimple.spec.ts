import { SettingsSimple } from './SettingsSimple';

describe('SettingsSimple', () => {
  it('should have all getters work when instantiated with defaults', () => {
    const settings = new SettingsSimple();

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
    const settings = new SettingsSimple();
    settings.algorithm = 'md5';
    settings.output_character_set = '0123456789';
    settings.output_length = 7;
    settings.added_number_on = true;
    settings.added_number = 8;
    settings.domain_only = false;
    settings.remember_minutes = 0;

    expect(settings.getAlgorithm()).toBe('md5');
    expect(settings.getLeetLocation()).toBe('none');
    expect(settings.getLeetLevel()).toBe(0);
    expect(settings.getModifier()).toBe('');
    expect(settings.getOutputCharacterSet()).toBe('0123456789');
    expect(settings.getOutputLength()).toBe(7);
    expect(settings.getPostProcessingSuffix()).toBe('8');
    expect(settings.getPrefix()).toBe('');
    expect(settings.getRememberMinutes()).toBe(0);
    expect(settings.getSuffix()).toBe('');
    expect(settings.isDomainOnly()).toBe(false);
  });
});
