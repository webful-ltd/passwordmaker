export class Settings {
  constructor(
    public output_character_set: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    public output_length: number = 15,
    public remember_minutes: number = 5,
    public algorithm: string = 'hmac-sha256',
    public domain_only: boolean = true,
  ) {}
}
