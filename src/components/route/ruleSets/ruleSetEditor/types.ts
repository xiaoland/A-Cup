// Types for RuleSet Editor

export interface RuleSet {
  id?: number;
  name: string;
  type: 'inline' | 'remote';
  format: string;
  content: string;
  readableBy?: number[];
  writeableBy?: number[];
  download_detour?: string;
  update_interval?: string;
}

export interface SelectOption<T extends string = string> {
  title: string;
  value: T;
}

export const typeOptions: SelectOption[] = [
  { title: 'Inline', value: 'inline' },
  { title: 'Remote', value: 'remote' },
];

export const formatOptions: SelectOption[] = [
  { title: 'Source', value: 'source' },
  { title: 'Binary', value: 'binary' },
];
