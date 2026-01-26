import { Pattern } from './Pattern';

export class Profile {
  public profile_id: number;
  public algorithm: 'hmac-sha256' | 'sha256' | 'hmac-sha1' | 'sha1' | 'hmac-md5' | 'md5' | 'hmac-ripemd160' | 'ripemd160' = 'hmac-sha256';
  public domain_only = true;
  public leet_level = 0; // 1 through 9 when in use
  public leet_location: 'none' | 'before-hashing' | 'after-hashing' | 'both' = 'none';
  public modifier = ''; // username / modifier
  public name = '';
  public output_character_set_custom = '';
  public output_character_set_preset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  public output_length = 15;
  public post_processing_suffix = '';
  public prefix = '';
  public suffix = '';
  public patterns: Pattern[] = [];
}
