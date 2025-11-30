import type { SingBoxProfile } from '@a-cup/shared';
import {
	type CompletionItem,
	CompletionItemKind,
	type Position,
} from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Enum values for various sing-box configuration fields
 */
const ENUMS = {
	logLevel: [
		{ value: 'trace', description: 'Most verbose logging' },
		{ value: 'debug', description: 'Debug level logging' },
		{ value: 'info', description: 'Informational messages' },
		{ value: 'warn', description: 'Warning messages' },
		{ value: 'error', description: 'Error messages only' },
		{ value: 'fatal', description: 'Fatal errors only' },
		{ value: 'panic', description: 'Panic level only' },
	],
	dnsStrategy: [
		{ value: 'prefer_ipv4', description: 'Prefer IPv4 addresses' },
		{ value: 'prefer_ipv6', description: 'Prefer IPv6 addresses' },
		{ value: 'ipv4_only', description: 'Only use IPv4 addresses' },
		{ value: 'ipv6_only', description: 'Only use IPv6 addresses' },
	],
	inboundType: [
		{ value: 'tun', description: 'TUN interface inbound' },
		{ value: 'mixed', description: 'Mixed SOCKS/HTTP proxy inbound' },
		{ value: 'socks', description: 'SOCKS proxy inbound' },
		{ value: 'http', description: 'HTTP proxy inbound' },
		{ value: 'redirect', description: 'Redirect inbound (Linux)' },
		{ value: 'tproxy', description: 'TProxy inbound (Linux)' },
		{ value: 'direct', description: 'Direct inbound' },
		{ value: 'shadowsocks', description: 'Shadowsocks server' },
		{ value: 'vmess', description: 'VMess server' },
		{ value: 'trojan', description: 'Trojan server' },
		{ value: 'naive', description: 'NaiveProxy server' },
		{ value: 'hysteria', description: 'Hysteria server' },
		{ value: 'shadowtls', description: 'ShadowTLS server' },
		{ value: 'vless', description: 'VLESS server' },
		{ value: 'tuic', description: 'TUIC server' },
		{ value: 'hysteria2', description: 'Hysteria2 server' },
		{ value: 'anytls', description: 'AnyTLS server' },
	],
	outboundType: [
		{ value: 'direct', description: 'Direct connection' },
		{ value: 'block', description: 'Block connection' },
		{ value: 'dns', description: 'DNS outbound' },
		{ value: 'socks', description: 'SOCKS proxy client' },
		{ value: 'http', description: 'HTTP proxy client' },
		{ value: 'shadowsocks', description: 'Shadowsocks client' },
		{ value: 'vmess', description: 'VMess client' },
		{ value: 'vless', description: 'VLESS client' },
		{ value: 'trojan', description: 'Trojan client' },
		{ value: 'wireguard', description: 'WireGuard client' },
		{ value: 'hysteria', description: 'Hysteria client' },
		{ value: 'shadowtls', description: 'ShadowTLS client' },
		{ value: 'tuic', description: 'TUIC client' },
		{ value: 'hysteria2', description: 'Hysteria2 client' },
		{ value: 'anytls', description: 'AnyTLS client' },
		{ value: 'tor', description: 'Tor client' },
		{ value: 'ssh', description: 'SSH client' },
		{ value: 'selector', description: 'Manual selector' },
		{ value: 'urltest', description: 'URL test auto-selector' },
	],
	ruleSetType: [
		{ value: 'local', description: 'Local rule set file' },
		{ value: 'remote', description: 'Remote rule set URL' },
	],
	ruleSetFormat: [
		{ value: 'source', description: 'Source JSON format' },
		{ value: 'binary', description: 'Binary compiled format' },
	],
	tunStack: [
		{ value: 'system', description: 'System network stack' },
		{ value: 'gvisor', description: 'gVisor user-space stack' },
		{ value: 'mixed', description: 'Mixed stack mode' },
	],
	network: [
		{ value: 'tcp', description: 'TCP only' },
		{ value: 'udp', description: 'UDP only' },
	],
	transportType: [
		{ value: 'http', description: 'HTTP transport' },
		{ value: 'ws', description: 'WebSocket transport' },
		{ value: 'quic', description: 'QUIC transport' },
		{ value: 'grpc', description: 'gRPC transport' },
		{ value: 'httpupgrade', description: 'HTTP Upgrade transport' },
	],
	shadowsocksMethod: [
		{ value: 'none', description: 'No encryption' },
		{ value: 'aes-128-gcm', description: 'AES-128-GCM' },
		{ value: 'aes-192-gcm', description: 'AES-192-GCM' },
		{ value: 'aes-256-gcm', description: 'AES-256-GCM' },
		{ value: 'chacha20-ietf-poly1305', description: 'ChaCha20-IETF-Poly1305' },
		{
			value: 'xchacha20-ietf-poly1305',
			description: 'XChaCha20-IETF-Poly1305',
		},
		{
			value: '2022-blake3-aes-128-gcm',
			description: 'Shadowsocks 2022 AES-128',
		},
		{
			value: '2022-blake3-aes-256-gcm',
			description: 'Shadowsocks 2022 AES-256',
		},
		{
			value: '2022-blake3-chacha20-poly1305',
			description: 'Shadowsocks 2022 ChaCha20',
		},
	],
	routeAction: [
		{ value: 'route', description: 'Route to specified outbound' },
		{ value: 'reject', description: 'Reject the connection' },
		{ value: 'hijack-dns', description: 'Hijack DNS to internal resolver' },
		{ value: 'sniff', description: 'Sniff protocol' },
		{ value: 'resolve', description: 'Resolve domain to IP' },
	],
	rejectMethod: [
		{ value: 'default', description: 'Default reject method' },
		{ value: 'drop', description: 'Drop packets silently' },
	],
};

/**
 * Represents location context within a JSON document
 */
interface JsonPathContext {
	path: string[];
	isValue: boolean;
	currentKey: string | null;
	inArray: boolean;
	arrayIndex: number;
}

/**
 * Parse the JSON document text and extract tags from the configuration
 */
export function extractTags(text: string): {
	inboundTags: string[];
	outboundTags: string[];
	dnsServerTags: string[];
	ruleSetTags: string[];
} {
	const result = {
		inboundTags: [] as string[],
		outboundTags: [] as string[],
		dnsServerTags: [] as string[],
		ruleSetTags: [] as string[],
	};

	try {
		const config = JSON.parse(text) as SingBoxProfile;

		// Extract inbound tags
		if (Array.isArray(config.inbounds)) {
			for (const inbound of config.inbounds) {
				if (typeof inbound?.tag === 'string' && inbound.tag) {
					result.inboundTags.push(inbound.tag);
				}
			}
		}

		// Extract outbound tags
		if (Array.isArray(config.outbounds)) {
			for (const outbound of config.outbounds) {
				if (typeof outbound?.tag === 'string' && outbound.tag) {
					result.outboundTags.push(outbound.tag);
				}
			}
		}

		// Extract DNS server tags
		if (config.dns && Array.isArray(config.dns.servers)) {
			for (const server of config.dns.servers) {
				if (typeof server?.tag === 'string' && server.tag) {
					result.dnsServerTags.push(server.tag);
				}
			}
		}

		// Extract rule set tags
		if (config.route && Array.isArray(config.route.rule_set)) {
			for (const ruleSet of config.route.rule_set) {
				if (typeof ruleSet?.tag === 'string' && ruleSet.tag) {
					result.ruleSetTags.push(ruleSet.tag);
				}
			}
		}
	} catch {
		// If JSON parsing fails, return empty arrays
	}

	return result;
}

/**
 * Get the JSON path context at a given position in the document
 */
export function getJsonPathContext(
	text: string,
	offset: number,
): JsonPathContext {
	const path: string[] = [];
	let isValue = false;
	let currentKey: string | null = null;
	let inArray = false;
	let arrayIndex = -1;

	// Track bracket/brace nesting
	const stack: Array<{ type: 'object' | 'array'; key: string | null }> = [];
	let i = 0;
	let lastKey: string | null = null;
	let afterColon = false;

	while (i < offset) {
		const char = text[i];

		// Skip whitespace
		if (/\s/.test(char)) {
			i++;
			continue;
		}

		// Handle strings
		if (char === '"') {
			const startQuote = i;
			i++; // Skip opening quote
			let str = '';
			while (i < text.length && text[i] !== '"') {
				if (text[i] === '\\' && i + 1 < text.length) {
					i += 2; // Skip escaped character
				} else {
					str += text[i];
					i++;
				}
			}
			i++; // Skip closing quote

			// Determine if this string is a key or value
			if (
				stack.length > 0 &&
				stack[stack.length - 1].type === 'object' &&
				!afterColon
			) {
				lastKey = str;
			}

			// If we're past the offset, check if we're in this string
			if (startQuote <= offset && offset <= i) {
				isValue = afterColon;
				currentKey = afterColon ? lastKey : null;
			}
			continue;
		}

		// Handle object start
		if (char === '{') {
			if (afterColon && lastKey) {
				path.push(lastKey);
			}
			stack.push({ type: 'object', key: lastKey });
			lastKey = null;
			afterColon = false;
			inArray = false;
			i++;
			continue;
		}

		// Handle object end
		if (char === '}') {
			if (stack.length > 0) {
				const popped = stack.pop();
				if (
					popped?.key &&
					path.length > 0 &&
					path[path.length - 1] === popped.key
				) {
					path.pop();
				}
			}
			// Reset state after closing brace
			if (stack.length > 0) {
				const current = stack[stack.length - 1];
				inArray = current.type === 'array';
			}
			i++;
			continue;
		}

		// Handle array start
		if (char === '[') {
			if (afterColon && lastKey) {
				path.push(lastKey);
			}
			stack.push({ type: 'array', key: lastKey });
			lastKey = null;
			afterColon = false;
			inArray = true;
			arrayIndex = 0;
			i++;
			continue;
		}

		// Handle array end
		if (char === ']') {
			if (stack.length > 0) {
				const popped = stack.pop();
				if (
					popped?.key &&
					path.length > 0 &&
					path[path.length - 1] === popped.key
				) {
					path.pop();
				}
			}
			// Reset state after closing bracket
			if (stack.length > 0) {
				const current = stack[stack.length - 1];
				inArray = current.type === 'array';
			} else {
				inArray = false;
			}
			arrayIndex = -1;
			i++;
			continue;
		}

		// Handle colon (key-value separator)
		if (char === ':') {
			afterColon = true;
			currentKey = lastKey;
			i++;
			continue;
		}

		// Handle comma
		if (char === ',') {
			afterColon = false;
			lastKey = null;
			if (inArray) {
				arrayIndex++;
			}
			i++;
			continue;
		}

		i++;
	}

	// Check if we're currently at a value position (after colon)
	isValue = afterColon;
	if (afterColon) {
		currentKey = lastKey;
	}

	return {
		path,
		isValue,
		currentKey,
		inArray,
		arrayIndex,
	};
}

/**
 * Create completion items from enum values
 */
function createEnumCompletions(
	enumValues: Array<{ value: string; description: string }>,
	kind: CompletionItemKind = CompletionItemKind.EnumMember,
): CompletionItem[] {
	return enumValues.map((item, index) => ({
		label: item.value,
		kind,
		detail: item.description,
		insertText: item.value,
		sortText: String(index).padStart(3, '0'),
	}));
}

/**
 * Create completion items from tag references
 */
function createTagCompletions(
	tags: string[],
	detail: string,
	kind: CompletionItemKind = CompletionItemKind.Reference,
): CompletionItem[] {
	return tags.map((tag, index) => ({
		label: tag,
		kind,
		detail,
		insertText: tag,
		sortText: String(index).padStart(3, '0'),
	}));
}

/**
 * Get completions for a specific JSON path and context
 */
export function getCompletions(
	document: TextDocument,
	position: Position,
): CompletionItem[] {
	const text = document.getText();
	const offset = document.offsetAt(position);
	const context = getJsonPathContext(text, offset);
	const tags = extractTags(text);

	const items: CompletionItem[] = [];
	const pathStr = context.path.join('.');

	// If we're editing a value
	if (context.isValue && context.currentKey) {
		const key = context.currentKey;

		// Log level
		if (pathStr === 'log' && key === 'level') {
			return createEnumCompletions(ENUMS.logLevel);
		}

		// DNS strategy
		if (
			(pathStr === 'dns' && key === 'strategy') ||
			(pathStr.startsWith('dns.servers') && key === 'address_strategy')
		) {
			return createEnumCompletions(ENUMS.dnsStrategy);
		}

		// DNS final - suggest DNS server tags
		if (pathStr === 'dns' && key === 'final') {
			return createTagCompletions(
				tags.dnsServerTags,
				'DNS server tag',
				CompletionItemKind.Reference,
			);
		}

		// DNS server detour - suggest outbound tags
		if (pathStr.startsWith('dns.servers') && key === 'detour') {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}

		// DNS server address_resolver - suggest DNS server tags
		if (pathStr.startsWith('dns.servers') && key === 'address_resolver') {
			return createTagCompletions(
				tags.dnsServerTags,
				'DNS server tag',
				CompletionItemKind.Reference,
			);
		}

		// DNS rules server - suggest DNS server tags
		if (pathStr.startsWith('dns.rules') && key === 'server') {
			return createTagCompletions(
				tags.dnsServerTags,
				'DNS server tag',
				CompletionItemKind.Reference,
			);
		}

		// Inbound type
		if (pathStr === 'inbounds' && key === 'type') {
			return createEnumCompletions(ENUMS.inboundType, CompletionItemKind.Class);
		}

		// Inbound stack (TUN)
		if (pathStr === 'inbounds' && key === 'stack') {
			return createEnumCompletions(ENUMS.tunStack);
		}

		// Outbound type
		if (pathStr === 'outbounds' && key === 'type') {
			return createEnumCompletions(
				ENUMS.outboundType,
				CompletionItemKind.Class,
			);
		}

		// Shadowsocks method
		if (pathStr === 'outbounds' && key === 'method') {
			return createEnumCompletions(ENUMS.shadowsocksMethod);
		}

		// Transport type
		if (pathStr === 'outbounds.transport' && key === 'type') {
			return createEnumCompletions(ENUMS.transportType);
		}

		// Network field
		if (key === 'network') {
			return createEnumCompletions(ENUMS.network);
		}

		// Selector/URLTest outbounds array - suggest outbound tags
		if (pathStr === 'outbounds.outbounds' && context.inArray) {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}

		// Selector default - suggest outbound tags
		if (pathStr === 'outbounds' && key === 'default') {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}

		// Route final - suggest outbound tags
		if (pathStr === 'route' && key === 'final') {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}

		// Route rules outbound - suggest outbound tags
		if (pathStr.startsWith('route.rules') && key === 'outbound') {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}

		// Route rules inbound array - suggest inbound tags
		if (pathStr === 'route.rules.inbound' && context.inArray) {
			return createTagCompletions(
				tags.inboundTags,
				'Inbound tag',
				CompletionItemKind.Reference,
			);
		}

		// Route rules action
		if (pathStr.startsWith('route.rules') && key === 'action') {
			return createEnumCompletions(ENUMS.routeAction);
		}

		// Route rules rule_set array - suggest rule set tags
		if (pathStr === 'route.rules.rule_set' && context.inArray) {
			return createTagCompletions(
				tags.ruleSetTags,
				'Rule set tag',
				CompletionItemKind.Reference,
			);
		}

		// Rule set type
		if (pathStr === 'route.rule_set' && key === 'type') {
			return createEnumCompletions(ENUMS.ruleSetType, CompletionItemKind.Class);
		}

		// Rule set format
		if (pathStr === 'route.rule_set' && key === 'format') {
			return createEnumCompletions(ENUMS.ruleSetFormat);
		}

		// Rule set download_detour - suggest outbound tags
		if (pathStr === 'route.rule_set' && key === 'download_detour') {
			return createTagCompletions(
				tags.outboundTags,
				'Outbound tag',
				CompletionItemKind.Reference,
			);
		}
	}

	return items;
}

/**
 * Resolve a completion item with additional details
 */
export function resolveCompletionItem(item: CompletionItem): CompletionItem {
	// Add more detailed documentation based on the item
	if (item.detail?.includes('tag')) {
		item.documentation = {
			kind: 'markdown',
			value: `Reference to a defined ${item.detail}.\n\nEnsure this tag matches an existing definition in the configuration.`,
		};
	}
	return item;
}
