import { Injectable } from '@angular/core';
import { Profile } from '../models/Profile';
import { Pattern } from '../models/Pattern';

/**
 * Service for matching URLs/domains against profile patterns
 */
@Injectable({
  providedIn: 'root'
})
export class PatternMatcherService {

  /**
   * Find the first profile that matches the given host/URL
   * @param host The URL or domain to match
   * @param profiles Array of profiles to search
   * @returns The matching profile, or null if no match found
   */
  findMatchingProfile(host: string, profiles: Profile[]): Profile | null {
    if (!host || !profiles || profiles.length === 0) {
      return null;
    }

    // Iterate through profiles to find first match
    for (const profile of profiles) {
      if (this.profileMatchesHost(profile, host)) {
        return profile;
      }
    }

    return null;
  }

  /**
   * Check if a profile's patterns match the given host
   * @param profile The profile to check
   * @param host The host/URL to match against
   * @returns true if any pattern in the profile matches
   */
  profileMatchesHost(profile: Profile, host: string): boolean {
    if (!profile.patterns || profile.patterns.length === 0) {
      return false;
    }

    return profile.patterns.some(pattern => 
      pattern.enabled && this.patternMatches(pattern, host)
    );
  }

  /**
   * Check if a single pattern matches the host
   * @param pattern The pattern to check
   * @param host The host/URL to match
   * @returns true if the pattern matches
   */
  private patternMatches(pattern: Pattern, host: string): boolean {
    if (!pattern || !pattern.pattern || !host) {
      return false;
    }

    try {
      if (pattern.type === 'regex') {
        // For regex patterns, compile and test
        const regex = new RegExp(pattern.pattern);
        return regex.test(host);
      } else {
        // For wildcard patterns, convert to regex by escaping special regex chars
        // except asterisk (*) which we convert to .* for wildcard matching
        const escapedPattern = pattern.pattern
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        
        const regex = new RegExp(`^${escapedPattern}$`, 'i'); // Case-insensitive
        return regex.test(host);
      }
    } catch (error) {
      console.error('Error matching pattern:', pattern, error);
      return false;
    }
  }

  /**
   * Extract domain from URL if it's a full URL
   * @param input The input string (URL or domain)
   * @returns The domain portion
   */
  extractDomain(input: string): string {
    if (!input) {
      return '';
    }

    try {
      // If it starts with http:// or https://, parse as URL
      if (input.match(/^https?:\/\//i)) {
        const url = new URL(input);
        return url.hostname;
      }
      
      // Otherwise assume it's already a domain
      return input;
    } catch (error) {
      // If URL parsing fails, return the original input
      return input;
    }
  }
}
