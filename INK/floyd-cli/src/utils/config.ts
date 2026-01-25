import fs from 'fs-extra';
import path from 'path';
import { buildHardenedSystemPrompt } from '../prompts/hardened-prompt.js';

export interface Config {
	systemPrompt: string;
	allowedTools: string[];
	mcpServers: Record<string, any>;
}

export class ConfigLoader {
	static async loadProjectConfig(cwd: string = process.cwd()): Promise<Config> {
		// Use hardened prompt stack v1.3.0 aligned with floyd-wrapper-main
		// This provides GLM-4.7 optimizations, prompt injection defense, and MIT self-improvement
		const basePrompt = buildHardenedSystemPrompt({
			agentName: 'FLOYD',
			workingDirectory: cwd,
			projectContext: null, // Will be loaded from CLAUDE.md below
			enablePreservedThinking: true,
			enableTurnLevelThinking: true,
			maxTurns: 20,
			safetyMode: 'ask',
		});

		const config: Config = {
			systemPrompt: basePrompt,
			allowedTools: [],
			mcpServers: {},
		};

		const claudeMdPath = path.join(cwd, 'CLAUDE.md');
		if (await fs.pathExists(claudeMdPath)) {
			const content = await fs.readFile(claudeMdPath, 'utf-8');
			config.systemPrompt += `\n\nProject Context (from CLAUDE.md):\n${content}`;
		}

		const settingsPath = path.join(cwd, '.floyd', 'settings.json');
		if (await fs.pathExists(settingsPath)) {
			try {
				const settings = await fs.readJson(settingsPath);
				if (settings.systemPrompt) config.systemPrompt += `\n${settings.systemPrompt}`;
				if (settings.allowedTools) config.allowedTools = settings.allowedTools;
				if (settings.mcpServers) config.mcpServers = settings.mcpServers;
			} catch (e) {
				console.error('Failed to parse settings.json', e);
			}
		}

		return config;
	}
}