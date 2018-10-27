import { TestBed, inject } from '@angular/core/testing';

import { PasswordsService } from './passwords.service';
import { Settings } from '../models/Settings';

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
      new Settings()
    )).toBe('rJeGcpSWpH36PMn');
  }));

  it('should work with a password containing non-ASCII', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      '☺',
      'https://user:pass@my.example.com:123/example', // Just uses 'example.com' in non-domain-only mode
      new Settings()
    )).toBe('q89H6EgYwsfboCA');
  }));

  it('should skip password generation with no master password', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('', 'example.com', new Settings())).toBe('');
  }));

  it('should skip password generation with no content input', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('test', '', new Settings())).toBe('');
  }));

  it('should skip password generation on localhost', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword('test', 'http://localhost:1234/asd', new Settings())).toBe('');
  }));

  it('should use full URI in literal text mode', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example',
      new Settings('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 15, 0, 'hmac-sha256', false)
    )).toBe('fQxjm35n07fy1UF');
  }));

  it('should use more of domain when given a known 2nd-level domain', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.co.uk:123/example', // uses example.co.uk
      new Settings()
    )).toBe('i4vMR40KZwMD3vF');
  }));

  it('should correctly use a different output character set', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      new Settings('0123456789', 15, 0, 'hmac-sha256', true)
    )).toBe('823117584057421');
  }));

  it('should correctly use a different algorithm', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      new Settings('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 15, 0, 'md5', true)
    )).toBe('DZF3hYPXEk25hyV');
  }));

  it('should correctly use a different output length', inject([PasswordsService], (service: PasswordsService) => {
    expect(service.getPassword(
      'test',
      'https://user:pass@my.example.com:123/example', // uses example.com
      new Settings('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 30, 0, 'hmac-sha256', true)
    )).toBe('rJeGcpSWpH36PMn706JrNR9vNzr9Wj');
  }));
});
