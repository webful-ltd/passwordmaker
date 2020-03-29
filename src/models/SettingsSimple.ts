import { Settings } from './Settings';

export class SettingsSimple extends Settings {
  public added_number_on = false;
  public added_number?: number;
  public algorithm: 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' = 'hmac-sha256';
  public domain_only = true;
  public output_character_set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  public output_length = 15;

  constructor() {
    super();
  }

  getAlgorithm(): 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' {
    return this.algorithm;
  }

  getLeetLocation(): 'none' | 'before-hashing' | 'after-hashing' | 'both' {
    return 'none';
  }

  getLeetLevel(): number {
    return 0;
  }

  getModifier(): string {
    return '';
  }

  getOutputCharacterSet(): string {
    return this.output_character_set;
  }

  getOutputLength(): number {
    return this.output_length;
  }

  getPostProcessingSuffix(): string {
    if (this.added_number_on) {
      return String(this.added_number);
    }

    return '';
  }

  getPrefix(): string {
    return '';
  }

  getSuffix(): string {
    return '';
  }

  isDomainOnly(): boolean {
    return this.domain_only;
  }
}
