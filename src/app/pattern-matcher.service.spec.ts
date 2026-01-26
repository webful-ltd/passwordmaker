import { TestBed } from '@angular/core/testing';
import { PatternMatcherService } from './pattern-matcher.service';
import { Profile } from '../models/Profile';
import { Pattern } from '../models/Pattern';

describe('PatternMatcherService', () => {
  let service: PatternMatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatternMatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('extractDomain', () => {
    it('should extract domain from http URL', () => {
      expect(service.extractDomain('http://example.com')).toBe('example.com');
    });

    it('should extract domain from https URL', () => {
      expect(service.extractDomain('https://www.example.com')).toBe('www.example.com');
    });

    it('should return input if not a URL', () => {
      expect(service.extractDomain('example.com')).toBe('example.com');
    });

    it('should handle empty input', () => {
      expect(service.extractDomain('')).toBe('');
    });
  });

  describe('patternMatches', () => {
    it('should match exact wildcard domain', () => {
      const pattern: Pattern = {
        pattern: 'example.com',
        enabled: true,
        type: 'wildcard'
      };
      expect(service['patternMatches'](pattern, 'example.com')).toBe(true);
    });

    it('should match wildcard pattern with asterisk', () => {
      const pattern: Pattern = {
        pattern: '*.example.com',
        enabled: true,
        type: 'wildcard'
      };
      expect(service['patternMatches'](pattern, 'www.example.com')).toBe(true);
      expect(service['patternMatches'](pattern, 'api.example.com')).toBe(true);
      expect(service['patternMatches'](pattern, 'example.com')).toBe(false);
    });

    it('should match regex pattern', () => {
      const pattern: Pattern = {
        pattern: 'https?://.*\\.example\\.com/.*',
        enabled: true,
        type: 'regex'
      };
      expect(service['patternMatches'](pattern, 'https://www.example.com/path')).toBe(true);
      expect(service['patternMatches'](pattern, 'http://api.example.com/v1')).toBe(true);
      expect(service['patternMatches'](pattern, 'example.com')).toBe(false);
    });

    it('should be case-insensitive for wildcard patterns', () => {
      const pattern: Pattern = {
        pattern: 'Example.Com',
        enabled: true,
        type: 'wildcard'
      };
      expect(service['patternMatches'](pattern, 'example.com')).toBe(true);
      expect(service['patternMatches'](pattern, 'EXAMPLE.COM')).toBe(true);
    });

    it('should handle disabled patterns', () => {
      const pattern: Pattern = {
        pattern: 'example.com',
        enabled: false,
        type: 'wildcard'
      };
      // Note: patternMatches doesn't check enabled status, that's in profileMatchesHost
      expect(service['patternMatches'](pattern, 'example.com')).toBe(true);
    });

    it('should handle invalid regex gracefully', () => {
      const pattern: Pattern = {
        pattern: '[invalid(regex',
        enabled: true,
        type: 'regex'
      };
      
      // Suppress console.error for this test
      const consoleErrorSpy = spyOn(console, 'error');
      
      expect(service['patternMatches'](pattern, 'example.com')).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('profileMatchesHost', () => {
    it('should return false if profile has no patterns', () => {
      const profile = new Profile();
      profile.patterns = [];
      expect(service.profileMatchesHost(profile, 'example.com')).toBe(false);
    });

    it('should return true if any pattern matches', () => {
      const profile = new Profile();
      profile.patterns = [
        { pattern: 'other.com', enabled: true, type: 'wildcard' },
        { pattern: 'example.com', enabled: true, type: 'wildcard' }
      ];
      expect(service.profileMatchesHost(profile, 'example.com')).toBe(true);
    });

    it('should skip disabled patterns', () => {
      const profile = new Profile();
      profile.patterns = [
        { pattern: 'example.com', enabled: false, type: 'wildcard' }
      ];
      expect(service.profileMatchesHost(profile, 'example.com')).toBe(false);
    });

    it('should extract domain when domain_only is true', () => {
      const profile = new Profile();
      profile.domain_only = true;
      profile.patterns = [
        { pattern: '*.example.org', enabled: true, type: 'wildcard' }
      ];
      
      // Should match when input is a full URL
      expect(service.profileMatchesHost(profile, 'https://test.example.org/asdf')).toBe(true);
      expect(service.profileMatchesHost(profile, 'http://api.example.org/path')).toBe(true);
      
      // Should also match when input is just a domain
      expect(service.profileMatchesHost(profile, 'test.example.org')).toBe(true);
    });

    it('should not extract domain when domain_only is false', () => {
      const profile = new Profile();
      profile.domain_only = false;
      profile.patterns = [
        { pattern: 'https://test.example.org/asdf', enabled: true, type: 'wildcard' }
      ];
      
      // Should match the full URL
      expect(service.profileMatchesHost(profile, 'https://test.example.org/asdf')).toBe(true);
      
      // Should not match just the domain
      expect(service.profileMatchesHost(profile, 'test.example.org')).toBe(false);
    });
  });

  describe('findMatchingProfile', () => {
    it('should return null if no profiles', () => {
      expect(service.findMatchingProfile('example.com', [])).toBeNull();
    });

    it('should return first matching profile', () => {
      const profile1 = new Profile();
      profile1.profile_id = 1;
      profile1.name = 'Profile 1';
      profile1.patterns = [
        { pattern: 'example.com', enabled: true, type: 'wildcard' }
      ];

      const profile2 = new Profile();
      profile2.profile_id = 2;
      profile2.name = 'Profile 2';
      profile2.patterns = [
        { pattern: 'example.com', enabled: true, type: 'wildcard' }
      ];

      const result = service.findMatchingProfile('example.com', [profile1, profile2]);
      expect(result).toBe(profile1);
    });

    it('should return null if no patterns match', () => {
      const profile = new Profile();
      profile.patterns = [
        { pattern: 'other.com', enabled: true, type: 'wildcard' }
      ];

      expect(service.findMatchingProfile('example.com', [profile])).toBeNull();
    });

    it('should handle complex patterns', () => {
      const profile = new Profile();
      profile.profile_id = 1;
      profile.patterns = [
        { pattern: '*.google.com', enabled: true, type: 'wildcard' }
      ];

      expect(service.findMatchingProfile('mail.google.com', [profile])).toBe(profile);
      expect(service.findMatchingProfile('www.google.com', [profile])).toBe(profile);
      expect(service.findMatchingProfile('google.com', [profile])).toBeNull();
    });
  });
});
