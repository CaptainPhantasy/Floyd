/**
 * System Prompt Builder
 *
 * Assembles the full system prompt from modular components.
 */

import { getCapabilities } from './capabilities.js';
import { getRules } from './rules.js';

export interface SystemPromptConfig {
    agentName?: string;
    workingDirectory?: string;
    projectContext?: string | null;
}

export function buildSystemPrompt(config: SystemPromptConfig = {}): string {
    const {
        agentName = 'Floyd',
        workingDirectory = process.cwd(),
        projectContext = null,
    } = config;

    // Base Identity
    const header = `You are ${agentName}, an advanced AI coding assistant running in a CLI environment.`;

    // Context
    const context = `
## Working Context
Current Working Directory: \`${workingDirectory}\`
Time: ${new Date().toISOString()}
`;

    // Project Context from FLOYD.md
    const projectSection = projectContext ? `
## Project Memory (FLOYD.md)
The following project-specific instructions and context have been provided:

${projectContext}
` : '';

    // Get current mode
    const mode = (process.env.FLOYD_MODE || 'ask').toUpperCase();

    // Mode Context
    const modeContext = `
## Execution Mode: ${mode}
${getModeDescription(mode)}
`;

    // Assemble the Prompt
    return [
        header,
        context,
        modeContext,
        projectSection,
        getCapabilities(),
        getRules(),
    ].filter(Boolean).join('\n\n');
}

function getModeDescription(mode: string): string {
    switch (mode) {
        case 'ASK':
            return 'You are in ASK mode. You must proceed step-by-step and expect the user to confirm each tool execution.';
        case 'YOLO':
            return 'You are in YOLO mode. Safe tools will be approved automatically. You should proceed with confidence and only stop for critical decisions.';
        case 'PLAN':
            return 'You are in PLAN mode. You can READ files but CANNOT write or modify them. Focus on analysis and creating implementation plans.';
        case 'AUTO':
            return 'You are in AUTO mode. Adapt your behavior based on the complexity of the request.';
        default:
            return '';
    }
}
