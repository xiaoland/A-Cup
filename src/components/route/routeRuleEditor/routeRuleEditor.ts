// Types for Route Rule Editor

export interface RouteRule {
  action?: string;
  outbound?: string;
  domain?: string[];
  domain_suffix?: string[];
  domain_keyword?: string[];
  domain_regex?: string[];
  rule_set?: string[];
  [key: string]: any;
}

export interface SelectOption<T extends string = string> {
  title: string;
  value: T;
}

export const actionOptions: SelectOption[] = [
  { title: 'Route', value: 'route' },
  { title: 'Direct', value: 'direct' },
  { title: 'Block', value: 'block' },
  { title: 'DNS', value: 'dns' },
];
