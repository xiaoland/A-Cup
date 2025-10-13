import type { RouteRule } from '../routeRuleEditor/types';

export interface Route {
  rules?: RouteRule[];
  rule_set?: number[];
  final?: string;
  auto_detect_interface?: boolean;
  override_android_vpn?: boolean;
  default_interface?: string;
  default_mark?: number;
  default_domain_resolver?: string;
  default_network_strategy?: string;
  default_network_type?: string[];
  default_fallback_network_type?: string[];
  default_fallback_delay?: string;
}