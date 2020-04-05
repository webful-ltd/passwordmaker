import { TestBed, inject } from '@angular/core/testing';

import { PasswordsService } from './passwords.service';
import { SettingsSimple } from '../models/SettingsSimple';

// TODO test generation w/ leet, prefix, suffix, modifier, arbitrary charset
describe('PasswordsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PasswordsService]
    });
  });

  it('should work with default settings and a simple master password', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // Just uses 'example.com' in non-domain-only mode
      new SettingsSimple()
    )).toBe('rJeGcpSWpH36PMn');
  }));

  it('should work with a password containing non-ASCII', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      '☺',
      'https://user:pass@my.example.com:123/example', // Just uses 'example.com' in non-domain-only mode
      new SettingsSimple()
    )).toBe('q89H6EgYwsfboCA');
  }));

  it('should skip password generation with no master password', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('', 'example.com', new SettingsSimple())).toBe('');
  }));

  it('should skip password generation with no content input', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('test', '', new SettingsSimple())).toBe('');
  }));

  it('should skip password generation on localhost', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('test', 'http://localhost:1234/asd', new SettingsSimple())).toBe('');
  }));

  it('should use full URI in literal text mode', inject([PasswordsService], (service: PasswordsService) => {
    const settings = new SettingsSimple();
    settings.domain_only = false;

    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example',
      settings,
    )).toBe('fQxjm35n07fy1UF');
  }));

  it('should use more of domain when given a known 2nd-level domain', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.co.uk:123/example', // uses example.co.uk
      new SettingsSimple()
    )).toBe('i4vMR40KZwMD3vF');
  }));

  it('should correctly use a different output character set', inject([PasswordsService], (service: PasswordsService) => {
    const settings = new SettingsSimple();
    settings.output_character_set = '0123456789';

    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      settings,
    )).toBe('823117584057421');
  }));

  it('should correctly use a different algorithm', inject([PasswordsService], (service: PasswordsService) => {
    const settings = new SettingsSimple();
    settings.algorithm = 'md5';

    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      settings,
    )).toBe('DZF3hYPXEk25hyV');
  }));

  it('should correctly use a different output length', inject([PasswordsService], (service: PasswordsService) => {
    const settings = new SettingsSimple();
    settings.output_length = 30;

    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      settings,
    )).toBe('rJeGcpSWpH36PMn706JrNR9vNzr9Wj');
  }));

  it('should add a fixed number if configured', inject([PasswordsService], (service: PasswordsService) => {
    const settings = new SettingsSimple();
    settings.output_length = 30;
    settings.added_number_on = true;
    settings.added_number = 8;

    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      settings,
    )).toBe('rJeGcpSWpH36PMn706JrNR9vNzr9Wj8');
  }));
});
