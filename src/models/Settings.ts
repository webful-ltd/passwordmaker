export abstract class Settings {
  public remember_minutes = 5;

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
}
