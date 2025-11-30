// Shared utilities for A-Cup extension

/**
 * Validates if a string is a valid JSON
 */
export function isValidJSON(str: string): boolean {
	try {
		JSON.parse(str);
		return true;
	} catch {
		return false;
	}
}

/**
 * Safely parses JSON with error handling
 */
export function safeParseJSON<T>(str: string): T | null {
	try {
		return JSON.parse(str) as T;
	} catch {
		return null;
	}
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}
