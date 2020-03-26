import { Profile } from './Profile';
import { Settings } from './Settings';
import { SettingsSimple } from './SettingsSimple';

export class SettingsAdvanced extends Settings {
  public profiles: Profile[];
  private activeProfileId: number;

  constructor (settingsSimple: SettingsSimple) {
    super();

    this.remember_minutes = settingsSimple.remember_minutes;
    const firstProfile = new Profile();
    firstProfile.algorithm = settingsSimple.algorithm;
    firstProfile.output_character_set = settingsSimple.output_character_set;
    firstProfile.output_length = settingsSimple.output_length;
    firstProfile.leet_level = 0;
    firstProfile.leet_location = 'none';
    firstProfile.prefix = '';
    firstProfile.suffix = settingsSimple.added_number_on ? String(settingsSimple.added_number) : '';
    this.profiles = [firstProfile];
  }

  getAlgorithm(): 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' {
    return this.profiles[this.activeProfileId].algorithm;
  }

  getLeetLocation(): 'none' | 'before-hashing' | 'after-hashing' | 'both' {
    return this.profiles[this.activeProfileId].leet_location;
  }

  getLeetLevel(): number {
    return this.profiles[this.activeProfileId].leet_level;
  }

  getModifier(): string {
    return this.profiles[this.activeProfileId].modifier;
  }

  getOutputCharacterSet(): string {
    return this.profiles[this.activeProfileId].output_character_set;
  }

  getOutputLength(): number {
    return this.profiles[this.activeProfileId].output_length;
  }

  getPostProcessingSuffix() {
    return this.profiles[this.activeProfileId].post_processing_suffix;
  }

  getPrefix(): string {
    return this.profiles[this.activeProfileId].prefix;
  }

  getSuffix(): string {
    return this.profiles[this.activeProfileId].suffix;
  }

  isDomainOnly(): boolean {
    return this.profiles[this.activeProfileId].domain_only;
  }

  setActiveProfile(profileId: number) {
    this.activeProfileId = profileId;
  }
}
