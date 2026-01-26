export interface Pattern {
  pattern: string;
  enabled: boolean;
  type: 'wildcard' | 'regex';
  description?: string;
}
