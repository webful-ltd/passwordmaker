import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Profile } from '../models/Profile';
import { Pattern } from '../models/Pattern';

export interface ImportedProfile {
  title?: string;
  hashAlgorithm?: string;
  selectedCharset?: string;
  passwordLength?: number;
  username?: string;
  passwordPrefix?: string;
  passwordSuffix?: string;
  l33tLevel?: number;
  whereToUseL33t?: string;
  url_protocol?: boolean;
  url_subdomain?: boolean;
  url_domain?: boolean;
  url_path?: boolean;
  siteList?: string;
  patterns?: Pattern[];
  rdf_about?: string;
  description?: string;
}

export interface ImportResult {
  settings: any;
  profiles: ImportedProfile[];
}

/**
 * Adapted via Copilot/Claude from https://github.com/passwordmaker/chrome-passwordmaker/blob/aaf2ff8b08f2db251109edbda61ee5633643ad75/javascript/import.js
 * This file LGPL-3.0 licensed, see readme.
 */
@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private platform = inject(Platform);

  private readonly hashAlgorithmMap = new Map([
    ['hmac-sha256-fixed', 'hmac-sha256_fix'],
    ['md5-v0.6', 'md5_v6'],
    ['hmac-md5-v0.6', 'hmac-md5_v6']
  ]);

  private readonly attributeMap = new Map([
    ['about', { name: 'rdf_about' }],
    ['name', { name: 'title' }],
    ['timestamp', { name: 'timestamp', convert: (val: string) => parseInt(val) }],
    ['urlToUse', { name: 'strUseText' }],
    ['whereLeetLB', { name: 'whereToUseL33t' }],
    ['leetLevelLB', { name: 'l33tLevel', convert: (val: string) => parseInt(val) }],
    ['hashAlgorithmLB', { name: 'hashAlgorithm', convert: (val: string) => this.renameHashAlgorithm(val) }],
    ['passwordLength', { name: 'passwordLength', convert: (val: string) => parseInt(val) }],
    ['usernameTB', { name: 'username' }],
    ['counter', { name: 'modifier' }],
    ['charset', { name: 'selectedCharset' }],
    ['prefix', { name: 'passwordPrefix' }],
    ['suffix', { name: 'passwordSuffix' }],
    ['description', { name: 'description' }],
    ['protocolCB', { name: 'url_protocol', convert: this.strToBool }],
    ['subdomainCB', { name: 'url_subdomain', convert: this.strToBool }],
    ['domainCB', { name: 'url_domain', convert: this.strToBool }],
    ['pathCB', { name: 'url_path', convert: this.strToBool }]
  ]);

  /**
   * Read file content using modern File API with FileReader fallback
   */
  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size === 0) {
        reject(new Error('File appears to be empty'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('File too large (>5MB)'));
        return;
      }

      // Try the newer File.text() API first if available
      if ('text' in file && typeof file.text === 'function') {
        file.text()
          .then(resolve)
          .catch(error => {
            console.log('File.text() failed, trying FileReader:', error.message);
            this.fallbackToFileReader(file, resolve, reject);
          });
      } else {
        this.fallbackToFileReader(file, resolve, reject);
      }
    });
  }

  private fallbackToFileReader(file: File, resolve: (value: string) => void, reject: (reason?: any) => void): void {
    const reader = new FileReader();
    
    // Set up a timeout
    const timeout = setTimeout(() => {
      console.error('FileReader timed out');
      reject(new Error('File reading timed out after 15 seconds'));
    }, 15000);

    reader.onload = () => {
      clearTimeout(timeout);
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
    };

    reader.onabort = () => {
      clearTimeout(timeout);
      reject(new Error('File reading was cancelled'));
    };

    // Try reading as text with UTF-8 encoding
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      clearTimeout(timeout);
      reject(new Error(`Failed to start reading file: ${error.message}`));
    }
  }

  /**
   * Parse RDF/XML content and extract profiles and settings
   */
  parseRdfDocument(rdfContent: string): ImportResult {
    const profiles: ImportedProfile[] = [];
    let defaultProfile: ImportedProfile = {};
    let settings: any = {};

    try {
      const xmlDoc = new DOMParser().parseFromString(rdfContent, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      const descriptions = Array.from(xmlDoc.getElementsByTagName('RDF:Description'));
      
      descriptions.forEach((item) => {
        const prof: ImportedProfile = {};
        
        // Parse attributes
        Array.from(item.attributes).forEach(attr => {
          const attrName = attr.localName;
          const mapping = this.attributeMap.get(attrName);
          
          if (mapping) {
            const value = mapping.convert ? mapping.convert(attr.value) : attr.value;
            (prof as any)[mapping.name] = value;
          }
        });

        // Parse description element if present
        const descriptionElement = item.getElementsByTagName('NS1:description')[0];
        if (descriptionElement) {
          prof.description = descriptionElement.textContent || '';
        }

        // Parse site patterns
        prof.patterns = this.parseSitePatterns(item);

        // Categorize the profile
        if (prof.rdf_about === 'http://passwordmaker.mozdev.org/globalSettings') {
          settings = prof;
        } else if (prof.selectedCharset) {
          if (prof.rdf_about === 'http://passwordmaker.mozdev.org/defaults') {
            defaultProfile = prof;
          } else {
            profiles.push(prof);
          }
        }
      });

      // Handle Chrome vs Firefox export differences
      const fromChrome = !rdfContent.includes('http://passwordmaker.mozdev.org/remotes');
      
      if (fromChrome) {
        profiles.unshift(defaultProfile);
        // Merge default profile attributes with each profile
        profiles.forEach((profile, i) => {
          profiles[i] = { ...defaultProfile, ...profile };
        });
      }
      return {
        settings,
        profiles
      };

    } catch (error) {
      throw new Error(`Failed to parse RDF document: ${error.message}`);
    }
  }

  /**
   * Merge imported profiles with existing profiles, handling duplicates by name
   */
  mergeProfiles(existingProfiles: Profile[], importedProfiles: ImportedProfile[]): { profiles: Profile[], addedCount: number, updatedCount: number } {
    const converted = importedProfiles.map(imported => this.convertToProfile(imported));
    const result = [...existingProfiles];
    let addedCount = 0;
    let updatedCount = 0;

    converted.forEach(newProfile => {
      // Find existing profile with same name (case-insensitive)
      // Skip empty or undefined names
      const existingIndex = newProfile.name && newProfile.name.trim() 
        ? result.findIndex(existing => 
          existing.name && existing.name.toLowerCase() === newProfile.name.toLowerCase()
        )
        : -1;

      if (existingIndex >= 0) {
        // Profile exists - update it but keep the same profile_id
        const existingId = result[existingIndex].profile_id;
        newProfile.profile_id = existingId;
        result[existingIndex] = newProfile;
        updatedCount++;
      } else {
        // New profile - add it with a new ID (will be set by caller)
        result.push(newProfile);
        addedCount++;
      }
    });

    return { profiles: result, addedCount, updatedCount };
  }

  /**
   * Convert imported profile to our Profile model
   */
  convertToProfile(importedProfile: ImportedProfile): Profile {
    const profile = new Profile();
    
    // Map basic properties
    if (importedProfile.title) profile.name = importedProfile.title;
    if (importedProfile.hashAlgorithm) profile.algorithm = this.mapHashAlgorithm(importedProfile.hashAlgorithm);
    if (importedProfile.selectedCharset) profile.output_character_set_preset = importedProfile.selectedCharset;
    if (importedProfile.passwordLength) profile.output_length = importedProfile.passwordLength;
    if (importedProfile.username) profile.modifier = importedProfile.username;
    if (importedProfile.passwordPrefix) profile.prefix = importedProfile.passwordPrefix;
    if (importedProfile.passwordSuffix) profile.suffix = importedProfile.passwordSuffix;
    if (importedProfile.l33tLevel) profile.leet_level = importedProfile.l33tLevel;
    if (importedProfile.whereToUseL33t) profile.leet_location = this.mapLeetLocation(importedProfile.whereToUseL33t);
    
    // Handle domain_only mapping from URL components
    profile.domain_only = !importedProfile.url_path && !importedProfile.url_subdomain && !!importedProfile.url_domain;
    
    // Map patterns
    if (importedProfile.patterns && importedProfile.patterns.length > 0) {
      profile.patterns = importedProfile.patterns;
    }
    
    return profile;
  }

  /**
   * Export profiles to file using appropriate method based on platform
   */
  async exportProfilesToFile(profiles: Profile[]): Promise<void> {
    const rdfContent = this.generateRdfExport(profiles);
    const fileName = `passwordmaker-profiles-${new Date().toISOString().split('T')[0]}.xml`;

    if (this.platform.is('capacitor')) {
      // Use Capacitor Filesystem for mobile platforms
      await this.saveFileWithFilesystem(rdfContent, fileName);
    } else {
      // Use browser download for web platform
      this.downloadFileInBrowser(rdfContent, fileName);
    }
  }

  /**
   * Save file using Capacitor Filesystem (mobile platforms)
   */
  private async saveFileWithFilesystem(content: string, fileName: string): Promise<void> {
    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: content,
        // No one enum seemed quite right for both platforms, so going with:
        // on Android, Document: "it's the Public Documents folder, so it's accessible from other apps. ... On Android 11 or newer the app can only access the files/folders the app created."
        // on iOS, External: "the [general] Documents directory".
        // https://capacitorjs.com/docs/apis/filesystem#enums
        directory: this.platform.is('ios') ? Directory.External : Directory.Documents,
        encoding: Encoding.UTF8
      });

      // On some platforms, we can get the actual file URI
      console.log('File saved to:', result.uri);
    } catch (error) {
      console.error('Error saving file with Filesystem:', error);
      throw new Error(`Failed to save file: ${error.message || error}`);
    }
  }

  /**
   * Download file using browser (web platform)
   */
  private downloadFileInBrowser(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate RDF export content from profiles
   */
  generateRdfExport(profiles: Profile[]): string {
    let rdf = `<?xml version="1.0"?>
<RDF:RDF xmlns:NS1="http://passwordmaker.mozdev.org/rdf#"
         xmlns:NC="http://home.netscape.com/NC-rdf#"
         xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">`;

    profiles.forEach((profile, index) => {
      const about = index === 0 ? 'http://passwordmaker.mozdev.org/defaults' : `rdf:#$CHROME${index}`;
      
      // Build pattern attributes
      let patternAttrs = '';
      if (profile.patterns && profile.patterns.length > 0) {
        profile.patterns.forEach((pattern, patternIndex) => {
          if (pattern.enabled) {
            patternAttrs += `\n NS1:pattern${patternIndex}="${this.escapeXml(pattern.pattern)}"`;
            patternAttrs += `\n NS1:patternenabled${patternIndex}="true"`;
            patternAttrs += `\n NS1:patterndesc${patternIndex}="${this.escapeXml(pattern.description || '')}"`;
            patternAttrs += `\n NS1:patterntype${patternIndex}="${pattern.type}"`;
          }
        });
      }
      
      rdf += `
<RDF:Description RDF:about="${this.escapeXml(about)}"
 NS1:name="${this.escapeXml(profile.name)}"
 NS1:hashAlgorithmLB="${this.escapeXml(profile.algorithm)}"
 NS1:charset="${this.escapeXml(profile.output_character_set_preset)}"
 NS1:passwordLength="${profile.output_length}"
 NS1:usernameTB="${this.escapeXml(profile.modifier)}"
 NS1:prefix="${this.escapeXml(profile.prefix)}"
 NS1:suffix="${this.escapeXml(profile.suffix)}"
 NS1:leetLevelLB="${profile.leet_level}"
 NS1:whereLeetLB="${this.escapeXml(profile.leet_location)}"
 NS1:protocolCB="true"
 NS1:subdomainCB="${!profile.domain_only}"
 NS1:domainCB="true"
 NS1:pathCB="${!profile.domain_only}"${patternAttrs} />`;
    });

    rdf += `
<RDF:Seq RDF:about="http://passwordmaker.mozdev.org/accounts">`;
    
    profiles.forEach((_, index) => {
      const about = index === 0 ? 'http://passwordmaker.mozdev.org/defaults' : `rdf:#$CHROME${index}`;
      rdf += `
<RDF:li RDF:resource="${this.escapeXml(about)}"/>`;
    });

    rdf += `
</RDF:Seq>
</RDF:RDF>`;

    return rdf;
  }

  private parseSitePatterns(item: Element): Pattern[] {
    const patterns: string[] = [];
    const patternTypes: string[] = [];
    const patternEnabled: string[] = [];
    const patternDesc: string[] = [];
    
    Array.from(item.attributes).forEach(attr => {
      const attrName = attr.localName;
      const match = attrName.match(/pattern(|type|enabled|desc)(\d+)/);
      
      if (match) {
        const index = parseInt(match[2]);
        switch (match[1]) {
        case '':
          patterns[index] = attr.value;
          break;
        case 'type':
          patternTypes[index] = attr.value;
          break;
        case 'enabled':
          patternEnabled[index] = attr.value;
          break;
        case 'desc':
          patternDesc[index] = attr.value;
          break;
        }
      }
    });

    const result: Pattern[] = [];
    patterns.forEach((pattern, index) => {
      // Only import enabled patterns per Chrome PasswordMaker Pro RDF specification
      if (patternEnabled[index] === 'true' && pattern) {
        result.push({
          pattern,
          enabled: true,
          type: patternTypes[index] === 'regex' ? 'regex' : 'wildcard',
          description: patternDesc[index] || ''
        });
      }
    });

    return result;
  }

  private strToBool(value: string): boolean {
    return value === 'true';
  }

  private renameHashAlgorithm(algorithm: string): string {
    return this.hashAlgorithmMap.get(algorithm) || algorithm;
  }

  private mapHashAlgorithm(importedAlgorithm: string): 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' {
    // Map from imported format to our format
    const algorithmMap: { [key: string]: 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' } = {
      'hmac-sha256_fix': 'hmac-sha256',
      'md5_v6': 'md5',
      'hmac-md5_v6': 'hmac-md5'
    };
    
    const mapped = algorithmMap[importedAlgorithm];
    if (mapped) return mapped;
    
    // Validate that the algorithm is one of our supported types
    const validAlgorithms: Array<'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160'> = 
      ['hmac-sha256', 'sha256', 'hmac-sha1', 'sha1', 'hmac-md5', 'md5', 'hmac-ripemd160', 'ripemd160'];
    
    if (validAlgorithms.includes(importedAlgorithm as any)) {
      return importedAlgorithm as any;
    }
    
    // Default to hmac-sha256 if we can't map it
    return 'hmac-sha256';
  }

  private mapLeetLocation(importedLocation: string): 'none' | 'before-hashing' | 'after-hashing' | 'both' {
    // Map from imported format to our format
    const locationMap: { [key: string]: 'none' | 'before-hashing' | 'after-hashing' | 'both' } = {
      'off': 'none',
      'before': 'before-hashing',
      'after': 'after-hashing',
      'both': 'both'
    };
    return locationMap[importedLocation] || 'none';
  }

  private escapeXml(str: string): string {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}