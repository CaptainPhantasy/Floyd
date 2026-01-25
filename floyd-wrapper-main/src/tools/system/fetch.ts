/**
 * Fetch Tool - Floyd Wrapper
 *
 * HTTP requests with timeout and error handling
 * Tool #47 of 50
 */

import { z } from 'zod';
import type { ToolDefinition, ToolResult } from '../../types.js';

// ============================================================================
// Zod Schema
// ============================================================================

const inputSchema = z.object({
	url: z.string().url('Invalid URL'),
	method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']).optional().default('GET'),
	headers: z.record(z.string()).optional(),
	body: z.string().optional(),
	timeout_ms: z.number().optional().default(30000),
});

// ============================================================================
// Tool Execution
// ============================================================================

async function execute(input: z.infer<typeof inputSchema>): Promise<ToolResult> {
	const { url, method, headers, body, timeout_ms } = input;

	try {
		// Create abort controller for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout_ms);

		const fetchOptions: RequestInit = {
			method,
			headers: headers || {},
			signal: controller.signal,
		};

		if (body && method !== 'GET' && method !== 'HEAD') {
			fetchOptions.body = body;
		}

		const response = await fetch(url, fetchOptions);
		clearTimeout(timeoutId);

		// Read response body
		const contentType = response.headers.get('content-type') || '';
		let responseData: unknown;

		if (contentType.includes('application/json')) {
			responseData = await response.json();
		} else {
			responseData = await response.text();
		}

		// Handle non-2xx responses
		if (!response.ok) {
			return {
				success: false,
				error: {
					code: response.status >= 500 ? 'NETWORK_ERROR' : 'INVALID_INPUT',
					message: `HTTP ${response.status}: ${response.statusText}`,
					details: {
						status: response.status,
						statusText: response.statusText,
						body: responseData,
					},
				},
			};
		}

		return {
			success: true,
			data: {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				body: responseData,
			},
		};
	} catch (error) {
		const errorMessage = (error as Error).message || String(error);

		// Check for timeout (abort)
		if (errorMessage.includes('abort') || errorMessage.includes('timeout')) {
			return {
				success: false,
				error: {
					code: 'TIMEOUT',
					message: `Request timed out after ${timeout_ms}ms`,
					details: { url, timeout_ms },
				},
			};
		}

		// Check for network errors
		if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
			return {
				success: false,
				error: {
					code: 'NETWORK_ERROR',
					message: `Network error: ${errorMessage}`,
					details: { url },
				},
			};
		}

		return {
			success: false,
			error: {
				code: 'NETWORK_ERROR',
				message: errorMessage,
				details: { url, method },
			},
		};
	}
}

// ============================================================================
// Tool Definition
// ============================================================================

export const fetchTool: ToolDefinition = {
	name: 'fetch',
	description: 'Make HTTP requests with timeout and error handling. Supports all HTTP methods.',
	category: 'build',
	inputSchema,
	permission: 'moderate',
	execute,
} as ToolDefinition;
