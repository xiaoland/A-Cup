import { describe, expect, it } from 'vitest';
import { CompletionItemKind } from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
	extractTags,
	getCompletions,
	getJsonPathContext,
	resolveCompletionItem,
} from './completion.js';

describe('extractTags', () => {
	it('should extract inbound tags', () => {
		const config = JSON.stringify({
			inbounds: [
				{ type: 'mixed', tag: 'mixed-in' },
				{ type: 'tun', tag: 'tun-in' },
			],
		});
		const tags = extractTags(config);
		expect(tags.inboundTags).toEqual(['mixed-in', 'tun-in']);
	});

	it('should extract outbound tags', () => {
		const config = JSON.stringify({
			outbounds: [
				{ type: 'direct', tag: 'direct-out' },
				{ type: 'vmess', tag: 'proxy' },
				{ type: 'selector', tag: 'select' },
			],
		});
		const tags = extractTags(config);
		expect(tags.outboundTags).toEqual(['direct-out', 'proxy', 'select']);
	});

	it('should extract DNS server tags', () => {
		const config = JSON.stringify({
			dns: {
				servers: [
					{ tag: 'cloudflare', address: '1.1.1.1' },
					{ tag: 'google', address: '8.8.8.8' },
				],
			},
		});
		const tags = extractTags(config);
		expect(tags.dnsServerTags).toEqual(['cloudflare', 'google']);
	});

	it('should extract rule set tags', () => {
		const config = JSON.stringify({
			route: {
				rule_set: [
					{ type: 'remote', tag: 'geosite-cn' },
					{ type: 'local', tag: 'custom-rules' },
				],
			},
		});
		const tags = extractTags(config);
		expect(tags.ruleSetTags).toEqual(['geosite-cn', 'custom-rules']);
	});

	it('should handle empty config', () => {
		const tags = extractTags('{}');
		expect(tags.inboundTags).toEqual([]);
		expect(tags.outboundTags).toEqual([]);
		expect(tags.dnsServerTags).toEqual([]);
		expect(tags.ruleSetTags).toEqual([]);
	});

	it('should handle invalid JSON gracefully', () => {
		const tags = extractTags('invalid json');
		expect(tags.inboundTags).toEqual([]);
		expect(tags.outboundTags).toEqual([]);
		expect(tags.dnsServerTags).toEqual([]);
		expect(tags.ruleSetTags).toEqual([]);
	});

	it('should handle missing tag property', () => {
		const config = JSON.stringify({
			inbounds: [{ type: 'mixed' }],
			outbounds: [{ type: 'direct' }],
		});
		const tags = extractTags(config);
		expect(tags.inboundTags).toEqual([]);
		expect(tags.outboundTags).toEqual([]);
	});
});

describe('getJsonPathContext', () => {
	it('should identify root object', () => {
		const text = '{ }';
		const context = getJsonPathContext(text, 2);
		expect(context.path).toEqual([]);
		expect(context.inArray).toBe(false);
	});

	it('should identify nested object', () => {
		const text = '{ "log": { "level": "" } }';
		// Position after "level": "
		const offset = text.indexOf('""') + 1;
		const context = getJsonPathContext(text, offset);
		expect(context.path).toContain('log');
		expect(context.isValue).toBe(true);
		expect(context.currentKey).toBe('level');
	});

	it('should identify array context', () => {
		const text = '{ "inbounds": [ { "type": "" } ] }';
		const offset = text.indexOf('type": "') + 8;
		const context = getJsonPathContext(text, offset);
		expect(context.path).toContain('inbounds');
		expect(context.isValue).toBe(true);
	});

	it('should track current key after colon', () => {
		const text = '{ "dns": { "final": "" } }';
		const offset = text.indexOf('final": "') + 9;
		const context = getJsonPathContext(text, offset);
		expect(context.currentKey).toBe('final');
		expect(context.isValue).toBe(true);
	});
});

describe('getCompletions', () => {
	function createDocument(content: string): TextDocument {
		return TextDocument.create('file:///test.json', 'json', 1, content);
	}

	it('should provide log level completions', () => {
		const doc = createDocument('{ "log": { "level": "" } }');
		const offset = doc.getText().indexOf('level": "') + 9;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('debug');
		expect(labels).toContain('info');
		expect(labels).toContain('warn');
		expect(labels).toContain('error');
	});

	it('should provide DNS strategy completions', () => {
		const doc = createDocument('{ "dns": { "strategy": "" } }');
		const offset = doc.getText().indexOf('strategy": "') + 12;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('prefer_ipv4');
		expect(labels).toContain('prefer_ipv6');
		expect(labels).toContain('ipv4_only');
		expect(labels).toContain('ipv6_only');
	});

	it('should provide inbound type completions', () => {
		const doc = createDocument('{ "inbounds": [ { "type": "" } ] }');
		const offset = doc.getText().indexOf('type": "') + 8;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('tun');
		expect(labels).toContain('mixed');
		expect(labels).toContain('socks');
		expect(labels).toContain('http');
	});

	it('should provide outbound type completions', () => {
		const doc = createDocument('{ "outbounds": [ { "type": "" } ] }');
		const offset = doc.getText().indexOf('type": "') + 8;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('direct');
		expect(labels).toContain('block');
		expect(labels).toContain('selector');
		expect(labels).toContain('vmess');
		expect(labels).toContain('vless');
	});

	it('should provide DNS final completions with DNS server tags', () => {
		const config = {
			dns: {
				servers: [
					{ tag: 'cloudflare', address: '1.1.1.1' },
					{ tag: 'google', address: '8.8.8.8' },
				],
				final: '',
			},
		};
		const text = JSON.stringify(config, null, 2);
		const doc = createDocument(text);
		const offset = text.indexOf('"final": "') + 10;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('cloudflare');
		expect(labels).toContain('google');
	});

	it('should provide route final completions with outbound tags', () => {
		const config = {
			outbounds: [
				{ type: 'direct', tag: 'direct-out' },
				{ type: 'vmess', tag: 'proxy' },
			],
			route: {
				final: '',
			},
		};
		const text = JSON.stringify(config, null, 2);
		const doc = createDocument(text);
		const offset = text.indexOf('"final": "') + 10;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('direct-out');
		expect(labels).toContain('proxy');
	});

	it('should provide rule set type completions', () => {
		const doc = createDocument(
			'{ "route": { "rule_set": [ { "type": "" } ] } }',
		);
		const offset = doc.getText().indexOf('type": "') + 8;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('local');
		expect(labels).toContain('remote');
	});

	it('should provide shadowsocks method completions', () => {
		const doc = createDocument('{ "outbounds": [ { "method": "" } ] }');
		const offset = doc.getText().indexOf('method": "') + 10;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('aes-128-gcm');
		expect(labels).toContain('chacha20-ietf-poly1305');
		expect(labels).toContain('2022-blake3-aes-128-gcm');
	});

	it('should provide network completions', () => {
		const doc = createDocument('{ "inbounds": [ { "network": "" } ] }');
		const offset = doc.getText().indexOf('network": "') + 11;
		const position = doc.positionAt(offset);
		const completions = getCompletions(doc, position);

		expect(completions.length).toBeGreaterThan(0);
		const labels = completions.map((c) => c.label);
		expect(labels).toContain('tcp');
		expect(labels).toContain('udp');
	});
});

describe('resolveCompletionItem', () => {
	it('should add documentation for tag references', () => {
		const item = {
			label: 'direct-out',
			kind: CompletionItemKind.Reference,
			detail: 'Outbound tag',
		};
		const resolved = resolveCompletionItem(item);

		expect(resolved.documentation).toBeDefined();
		expect(typeof resolved.documentation).toBe('object');
		if (typeof resolved.documentation === 'object' && resolved.documentation) {
			expect(resolved.documentation.kind).toBe('markdown');
			expect(resolved.documentation.value).toContain('Reference');
		}
	});

	it('should not add documentation for non-tag items', () => {
		const item = {
			label: 'debug',
			kind: CompletionItemKind.EnumMember,
			detail: 'Debug level logging',
		};
		const resolved = resolveCompletionItem(item);

		expect(resolved.documentation).toBeUndefined();
	});
});
