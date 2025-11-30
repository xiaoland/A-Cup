// Shared types for A-Cup extension

export interface OSSConfig {
	endpoint: string;
	accessKeyId: string;
	accessKeySecret: string;
	bucket: string;
}

export interface SingBoxProfile {
	log?: LogConfig;
	dns?: DNSConfig;
	inbounds?: Inbound[];
	outbounds?: Outbound[];
	route?: RouteConfig;
	experimental?: ExperimentalConfig;
}

export interface LogConfig {
	disabled?: boolean;
	level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'panic';
	output?: string;
	timestamp?: boolean;
}

export interface DNSConfig {
	servers?: DNSServer[];
	rules?: DNSRule[];
	final?: string;
	strategy?: 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
}

export interface DNSServer {
	tag: string;
	address: string;
	address_resolver?: string;
	address_strategy?: 'prefer_ipv4' | 'prefer_ipv6' | 'ipv4_only' | 'ipv6_only';
	detour?: string;
}

export interface DNSRule {
	domain?: string[];
	domain_suffix?: string[];
	domain_keyword?: string[];
	domain_regex?: string[];
	geosite?: string[];
	rule_set?: string[];
	server?: string;
}

export interface Inbound {
	type: string;
	tag: string;
	listen?: string;
	listen_port?: number;
	[key: string]: unknown;
}

export interface Outbound {
	type: string;
	tag: string;
	server?: string;
	server_port?: number;
	[key: string]: unknown;
}

export interface RouteConfig {
	rules?: RouteRule[];
	rule_set?: RuleSet[];
	final?: string;
	auto_detect_interface?: boolean;
	default_interface?: string;
}

export interface RouteRule {
	inbound?: string[];
	network?: string[];
	protocol?: string[];
	domain?: string[];
	domain_suffix?: string[];
	domain_keyword?: string[];
	geosite?: string[];
	geoip?: string[];
	ip_cidr?: string[];
	port?: number[];
	rule_set?: string[];
	outbound?: string;
	[key: string]: unknown;
}

export interface RuleSet {
	type: 'local' | 'remote';
	tag: string;
	format?: 'source' | 'binary';
	path?: string;
	url?: string;
	download_detour?: string;
	update_interval?: string;
}

export interface ExperimentalConfig {
	cache_file?: {
		enabled?: boolean;
		path?: string;
		cache_id?: string;
		store_fakeip?: boolean;
	};
	clash_api?: {
		external_controller?: string;
		external_ui?: string;
		secret?: string;
		default_mode?: string;
	};
}
