import { Injectable } from '@angular/core';
import * as urlParse from 'url-parse/dist/url-parse'; // https://github.com/unshiftio/url-parse/issues/150#issuecomment-403150854
import * as makePassword from '@webful/passwordmaker-lib';

import { Settings } from '../models/Settings';

@Injectable({
  providedIn: 'root'
})
export class PasswordsService {
  public getPassword(masterPassword: string, content: string, settings: Settings): string {
    const coreData = this.extractCoreData(content, settings);
    if (masterPassword === '' || coreData === '') {
      return '';
    }

    return makePassword({
      hashAlgorithm: settings.algorithm,
      masterPassword: masterPassword,
      data: coreData,
      length: settings.output_length,
      charset: settings.output_character_set,
    });
  }

  private extractCoreData(content: string, settings: Settings): string {
    if (!settings.domain_only) {
      return content; // Use URL or other input unmodified when `domain_only` is off.
    }

    // If we didn't get a protocol, assume this is an omission and add one before handing over to url-parse.
    const protocolRegex = /^[a-zA-Z]+:\/\//;
    if (!protocolRegex.test(content)) {
      content = `https://${content}`;
    }

    const parsedUrl = urlParse(content);
    const parsedHost = parsedUrl.hostname;

    // If the parsed host is local it's probably because we passed in dodgy input and the url-parse lib fell
    // back to its default input, the webview's local URL -> return blank output so no password is generated.
    if (parsedHost === 'localhost') {
      return '';
    }

    // IPs should have all 4 parts included for the hash.
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsedHost)) {
      return parsedHost;
    }

    // Most other hostnames should have their last 2 pieces used; a few common 2-level 'TLDs' use 3.
    return this.extractMainDomain(parsedHost);
  }

  /**
   * Get the main part of the domain, factoring in very common 2-level 'TLDs' where we need 3 rather than 2 parts.
   */
  private extractMainDomain(host: string): string {
    /**
     * @type {string[]} Define common reserved 2nd-level domains ONLY used at the 3rd and below level.
     */
    const commonTwoLevels = ['com.au', 'co.uk', 'ltd.uk', 'me.uk', 'net.uk', 'org.uk', 'plc.uk', 'sch.uk'];
    for (const index in commonTwoLevels) {
      if (host.endsWith('.' + commonTwoLevels[index])) {
        return host.split('.').slice(-3).join('.');
      }
    }

    return host.split('.').slice(-2).join('.');
  }
}
