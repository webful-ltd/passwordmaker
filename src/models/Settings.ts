export abstract class Settings {
  /**
   * Set for storage serialisation, as Ionic Storage doesn't know which TypeScript class we're saving.
   * {@link https://github.com/ionic-team/ionic-storage/issues/60}
   */
  class: string;

  master_password_hash = false;
  remember_minutes = 5;

  /**
   * Properties that are defined directly on the Settings base class (excluding 'class' which is for serialization).
   * Update this list whenever new properties are added to the Settings class.
   */
  private static readonly COMMON_SETTINGS_PROPERTIES = ['master_password_hash', 'remember_minutes'] as const;

  abstract getAlgorithm(): 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160';
  abstract getLeetLocation(): 'none' | 'before-hashing' | 'after-hashing' | 'both';
  abstract getLeetLevel(): number;
  abstract getModifier(): string;
  abstract getOutputCharacterSet(): string;
  abstract getOutputLength(): number;
  abstract getPostProcessingSuffix(): string; // Extends the normal PasswordMaker protocol due to a v1 app quirk.
  abstract getPrefix(): string;
  abstract getSuffix(): string;
  abstract isDomainOnly(): boolean;

  getCommonSettingsProperties(): readonly string[] {
    return Settings.COMMON_SETTINGS_PROPERTIES;
  }
}
