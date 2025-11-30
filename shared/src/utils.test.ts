import { describe, expect, it } from 'vitest';
import { deepClone, isValidJSON, safeParseJSON } from './utils.js';

describe('utils', () => {
	describe('isValidJSON', () => {
		it('should return true for valid JSON', () => {
			expect(isValidJSON('{"key": "value"}')).toBe(true);
		});

		it('should return false for invalid JSON', () => {
			expect(isValidJSON('not json')).toBe(false);
		});
	});

	describe('safeParseJSON', () => {
		it('should parse valid JSON', () => {
			expect(safeParseJSON('{"key": "value"}')).toEqual({ key: 'value' });
		});

		it('should return null for invalid JSON', () => {
			expect(safeParseJSON('not json')).toBe(null);
		});
	});

	describe('deepClone', () => {
		it('should deep clone an object', () => {
			const original = { nested: { value: 1 } };
			const cloned = deepClone(original);
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.nested).not.toBe(original.nested);
		});
	});
});
