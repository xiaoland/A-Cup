export interface RuleSet {
  id?: number;
  name: string;
  type: 'inline' | 'remote';
  format?: string;
  content: string;
  download_detour?: string;
  update_interval?: string;
}
