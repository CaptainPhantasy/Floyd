/**
 * Patch Tools - Floyd Wrapper
 *
 * Patch tools copied from FLOYD_CLI patch-server.ts and wrapped
 */

import { z } from 'zod';
import type { ToolDefinition } from '../../types.js';
import * as patchCore from './patch-core.js';

// ============================================================================
// Apply Unified Diff Tool
// ============================================================================

export const applyUnifiedDiffTool: ToolDefinition = {
	name: 'apply_unified_diff',
	description: 'Apply a unified diff patch to files with dry-run support',
	category: 'patch',
	inputSchema: z.object({
		diff: z.string(),
		dryRun: z.boolean().optional().default(false),
		rootPath: z.string().optional(),
		assessRisk: z.boolean().optional().default(true),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { diff, dryRun, rootPath, assessRisk: shouldAssess } = input as z.infer<typeof applyUnifiedDiffTool.inputSchema>;

		const parsed = patchCore.parseUnifiedDiff(diff);
		if (parsed.length === 0) {
			return { success: false, error: { code: 'NO_VALID_DIFF', message: 'No valid diff found in input', details: {} } };
		}

		let risk: patchCore.RiskAssessment | undefined;
		if (shouldAssess) {
			risk = patchCore.assessRisk(parsed);
		}

		const result = await patchCore.applyUnifiedDiff(diff, { dryRun, rootPath });

		return {
			success: result.success,
			data: {
				...result,
				risk,
				parsedFiles: parsed.map(f => ({ path: f.path, status: f.status, hunks: f.hunks.length }))
			}
		};
	}
} as ToolDefinition;

// ============================================================================
// Edit Range Tool
// ============================================================================

export const editRangeTool: ToolDefinition = {
	name: 'edit_range',
	description: 'Edit a specific range of lines in a file with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		startLine: z.number(),
		endLine: z.number(),
		content: z.string(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, startLine, endLine, content, dryRun } = input as z.infer<typeof editRangeTool.inputSchema>;
		const result = await patchCore.editRange(filePath, startLine, endLine, content, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'EDIT_RANGE_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Insert At Tool
// ============================================================================

export const insertAtTool: ToolDefinition = {
	name: 'insert_at',
	description: 'Insert content at a specific line with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		lineNumber: z.number(),
		content: z.string(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, lineNumber, content, dryRun } = input as z.infer<typeof insertAtTool.inputSchema>;
		const result = await patchCore.insertAt(filePath, lineNumber, content, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'INSERT_AT_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Delete Range Tool
// ============================================================================

export const deleteRangeTool: ToolDefinition = {
	name: 'delete_range',
	description: 'Delete a range of lines from a file with automatic backups',
	category: 'patch',
	inputSchema: z.object({
		filePath: z.string(),
		startLine: z.number(),
		endLine: z.number(),
		dryRun: z.boolean().optional().default(false),
	}),
	permission: 'dangerous',
	execute: async (input) => {
		const { filePath, startLine, endLine, dryRun } = input as z.infer<typeof deleteRangeTool.inputSchema>;
		const result = await patchCore.deleteRange(filePath, startLine, endLine, { dryRun });
		return { success: result.success, data: result, error: result.error ? { code: 'DELETE_RANGE_ERROR', message: result.error, details: { filePath } } : undefined };
	}
} as ToolDefinition;

// ============================================================================
// Assess Patch Risk Tool
// ============================================================================

export const assessPatchRiskTool: ToolDefinition = {
	name: 'assess_patch_risk',
	description: 'Assess the risk level of a patch before applying',
	category: 'patch',
	inputSchema: z.object({
		diff: z.string(),
	}),
	permission: 'none',
	execute: async (input) => {
		const { diff } = input as z.infer<typeof assessPatchRiskTool.inputSchema>;
		const parsed = patchCore.parseUnifiedDiff(diff);
		const risk = patchCore.assessRisk(parsed);
		return {
			success: true,
			data: {
				...risk,
				files: parsed.map(f => ({ path: f.path, status: f.status, hunkCount: f.hunks.length }))
			}
		};
	}
} as ToolDefinition;
