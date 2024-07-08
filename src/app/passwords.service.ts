import { Injectable } from '@angular/core';
import makePassword from '@webful/passwordmaker-lib';
import isSecondLevelDomain from '2ldcheck';

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

    const password = makePassword({
      charset: settings.getOutputCharacterSet(),
      data: coreData,
      hashAlgorithm: settings.getAlgorithm(),
      l33tLevel: settings.getLeetLevel(),
      length: settings.getOutputLength(),
      masterPassword: masterPassword,
      modifier: settings.getModifier(),
      prefix: settings.getPrefix(),
      suffix: settings.getSuffix(),
      whereToUseL33t: settings.getLeetLocation(),
    });

    return `${password}${settings.getPostProcessingSuffix()}`;
  }

  private extractCoreData(content: string, settings: Settings): string {
    if (!settings.isDomainOnly()) {
      return content; // Use URL or other input unmodified when `domain_only` is off.
    }

    // If we didn't get a protocol, assume this is an omission and add one before handing over to url-parse.
    const protocolRegex = /^[a-zA-Z]+:\/\//;
    if (!protocolRegex.test(content)) {
      content = `https://${content}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(content);
    } catch (ex) {
      return '';
    }

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
    const numPieces = isSecondLevelDomain(host) ? 3 : 2;

    return host.split('.').slice(-numPieces).join('.');
  }
}
