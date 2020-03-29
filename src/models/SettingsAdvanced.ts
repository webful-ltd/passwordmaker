import { Profile } from './Profile';
import { Settings } from './Settings';
import { SettingsSimple } from './SettingsSimple';

export class SettingsAdvanced extends Settings {
  public profiles: Profile[] = [];
  private activeProfileId: number;

  constructor (settingsSimple: SettingsSimple) {
    super();

    this.remember_minutes = settingsSimple.remember_minutes;

    const firstProfile = new Profile();
    firstProfile.id = 1;
    firstProfile.algorithm = settingsSimple.algorithm;
    firstProfile.domain_only = settingsSimple.domain_only;
    firstProfile.output_character_set = settingsSimple.output_character_set;
    firstProfile.output_length = settingsSimple.output_length;
    firstProfile.post_processing_suffix = settingsSimple.added_number_on ? String(settingsSimple.added_number) : '';

    this.profiles = [firstProfile];

    this.setActiveProfile(1);
  }

  getAlgorithm(): 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' {
    return this.getProfile().algorithm;
  }

  getLeetLocation(): 'none' | 'before-hashing' | 'after-hashing' | 'both' {
    return this.getProfile().leet_location;
  }

  getLeetLevel(): number {
    return this.getProfile().leet_level;
  }

  getModifier(): string {
    return this.getProfile().modifier;
  }

  getOutputCharacterSet(): string {
    return this.getProfile().output_character_set;
  }

  getOutputLength(): number {
    return this.getProfile().output_length;
  }

  getPostProcessingSuffix() {
    return this.getProfile().post_processing_suffix;
  }

  getPrefix(): string {
    return this.getProfile().prefix;
  }

  getSuffix(): string {
    return this.getProfile().suffix;
  }

  isDomainOnly(): boolean {
    return this.getProfile().domain_only;
  }

  setActiveProfile(profileId: number) {
    this.activeProfileId = profileId;
  }

  private getProfile(): Profile {
    return this.profiles.find(thisProfile => thisProfile.id === this.activeProfileId);
  }
}
