import { describe, expect, it } from 'vitest';

describe('Extension', () => {
	it('should export activate and deactivate functions', async () => {
		const extension = await import('./extension.js');
		expect(typeof extension.activate).toBe('function');
		expect(typeof extension.deactivate).toBe('function');
	});
});
