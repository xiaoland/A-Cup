import type { SingBoxProfile } from '@a-cup/shared';
import {
	type CompletionItem,
	CompletionItemKind,
	type Position,
} from 'vscode-languageserver/node.js';
import type { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * This LSP provides only reference completions (tags) and generation completions.
 * Static key/value completions are handled by VSCode's JSON LSP with sing-box schema.
 * See: https://github.com/BlackDuty/sing-box-schema
 */

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
 * Get completions for a specific JSON path and context.
 * Only provides reference completions (tags).
 * Static value completions are handled by VSCode's JSON LSP with sing-box schema.
 */
export function getCompletions(
	document: TextDocument,
	position: Position,
): CompletionItem[] {
	const text = document.getText();
	const offset = document.offsetAt(position);
	const context = getJsonPathContext(text, offset);
	const tags = extractTags(text);

	const pathStr = context.path.join('.');

	// Only provide reference completions (tags)
	if (context.isValue && context.currentKey) {
		const key = context.currentKey;

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

		// Route rules rule_set array - suggest rule set tags
		if (pathStr === 'route.rules.rule_set' && context.inArray) {
			return createTagCompletions(
				tags.ruleSetTags,
				'Rule set tag',
				CompletionItemKind.Reference,
			);
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

	return [];
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
