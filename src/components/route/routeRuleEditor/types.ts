export interface RouteRule {
  action?: string;
  outbound?: string;
  domain?: string[];
  domain_suffix?: string[];
  domain_keyword?: string[];
  domain_regex?: string[];
  rule_set?: string[];
}