export class Input {
  constructor(
    public host: string = '',
    public master_password: string = '',
    public active_profile_id?: number,
  ) {}
}
