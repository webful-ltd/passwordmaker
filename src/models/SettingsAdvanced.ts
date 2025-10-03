import { Profile } from './Profile';
import { Settings } from './Settings';
import { SettingsSimple } from './SettingsSimple';

export class SettingsAdvanced extends Settings {
  profiles: Profile[] = [];

  active_profile_id: number;

  constructor (settingsSimple: SettingsSimple) {
    super();

    this.class = this.constructor.name;

    for (const key of settingsSimple.getCommonSettingsProperties()) {
      this[key] = settingsSimple[key];
    }

    const firstProfile = new Profile();
    firstProfile.profile_id = 1;
    firstProfile.name = 'Default';
    firstProfile.algorithm = settingsSimple.algorithm;
    firstProfile.domain_only = settingsSimple.domain_only;
    firstProfile.output_character_set_preset = settingsSimple.output_character_set;
    firstProfile.output_length = settingsSimple.output_length;
    firstProfile.post_processing_suffix = settingsSimple.added_number_on ? String(settingsSimple.added_number) : '';

    this.profiles.push(firstProfile);

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
    const profile = this.getProfile();

    if (profile.output_character_set_preset === 'none') {
      return profile.output_character_set_custom;
    }

    return profile.output_character_set_preset;
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
    this.active_profile_id = profileId;
  }

  private getProfile(): Profile {
    return this.profiles.find(thisProfile => thisProfile.profile_id === this.active_profile_id);
  }
}
