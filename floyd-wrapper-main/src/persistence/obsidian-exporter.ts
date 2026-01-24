/**
 * Obsidian Markdown Exporter - Floyd Wrapper
 * 
 * Exports conversation history to Obsidian-compatible markdown format with frontmatter
 */

import fs from 'fs-extra';
import path from 'node:path';
import { logger } from '../utils/logger.js';
import type { FloydMessage, Session } from '../types.js';

export interface ObsidianExportOptions {
    /** Output directory for exports */
    outputDir: string;
    /** Include frontmatter metadata */
    includeFrontmatter?: boolean;
    /** Include timestamps in messages */
    includeTimestamps?: boolean;
    /** Custom tags to add */
    tags?: string[];
}

/**
 * Export conversation history to Obsidian-compatible markdown
 */
export class ObsidianExporter {
    /**
     * Export a session to markdown
     */
    static async exportSession(
        session: Session,
        messages: FloydMessage[],
        options: ObsidianExportOptions
    ): Promise<string> {
        const {
            outputDir,
            includeFrontmatter = true,
            includeTimestamps = true,
            tags = []
        } = options;

        // Ensure output directory exists
        await fs.ensureDir(outputDir);

        // Generate filename from session name and timestamp
        const safeSessionName = session.name.replace(/[^a-zA-Z0-9-_]/g, '_');
        const timestamp = new Date(session.createdAt).toISOString().split('T')[0];
        const filename = `${timestamp}_${safeSessionName}.md`;
        const filepath = path.join(outputDir, filename);

        // Build markdown content
        let markdown = '';

        // Add frontmatter if requested
        if (includeFrontmatter) {
            markdown += '---\n';
            markdown += `title: "${session.name}"\n`;
            markdown += `created: ${new Date(session.createdAt).toISOString()}\n`;
            markdown += `updated: ${new Date(session.updatedAt).toISOString()}\n`;
            markdown += `session_id: ${session.id}\n`;

            if (tags.length > 0) {
                markdown += `tags:\n`;
                tags.forEach(tag => {
                    markdown += `  - ${tag}\n`;
                });
            }

            if (session.metadata && Object.keys(session.metadata).length > 0) {
                markdown += `metadata:\n`;
                for (const [key, value] of Object.entries(session.metadata)) {
                    markdown += `  ${key}: ${JSON.stringify(value)}\n`;
                }
            }

            markdown += '---\n\n';
        }

        // Add title
        markdown += `# ${session.name}\n\n`;
        markdown += `Created: ${new Date(session.createdAt).toLocaleString()}\n`;
        markdown += `Last Updated: ${new Date(session.updatedAt).toLocaleString()}\n\n`;
        markdown += `---\n\n`;

        // Add conversation messages
        for (const message of messages) {
            const roleLabel = this.getRoleLabel(message.role);

            if (includeTimestamps && message.timestamp) {
                const time = new Date(message.timestamp).toLocaleTimeString();
                markdown += `## ${roleLabel} (${time})\n\n`;
            } else {
                markdown += `## ${roleLabel}\n\n`;
            }

            // Format content based on role
            if (message.role === 'assistant') {
                // Assistant messages might have tool use or thinking
                markdown += this.formatAssistantContent(message.content);
            } else {
                markdown += `${message.content}\n\n`;
            }

            if (message.toolUseId) {
                markdown += `> Tool Use ID: \`${message.toolUseId}\`\n\n`;
            }

            markdown += '---\n\n';
        }

        // Summary footer
        markdown += `## Session Summary\n\n`;
        markdown += `- **Total Messages**: ${messages.length}\n`;
        markdown += `- **Session ID**: \`${session.id}\`\n`;

        const roleCounts: Record<string, number> = {};
        messages.forEach(msg => {
            roleCounts[msg.role] = (roleCounts[msg.role] || 0) + 1;
        });

        markdown += `- **Message Breakdown**:\n`;
        for (const [role, count] of Object.entries(roleCounts)) {
            markdown += `  - ${this.getRoleLabel(role)}: ${count}\n`;
        }

        // Write to file
        await fs.writeFile(filepath, markdown, 'utf-8');
        logger.info('Exported session to Obsidian', { filepath, messageCount: messages.length });

        return filepath;
    }

    /**
     * Get human-readable role label
     */
    private static getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            'user': '👤 User',
            'assistant': '🤖 Floyd',
            'system': '⚙️ System',
            'tool': '🔧 Tool'
        };

        return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }

    /**
     * Format assistant content with special handling for code blocks and thinking
     */
    private static formatAssistantContent(content: string): string {
        // Check if content has <think> tags
        if (content.includes('<think>')) {
            // Extract thinking and response
            const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
            const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();

            let formatted = '';

            if (thinkMatch && thinkMatch[1]) {
                formatted += '> **💭 Internal Thinking**\n>\n';
                const thinkingLines = thinkMatch[1].trim().split('\n');
                thinkingLines.forEach(line => {
                    formatted += `> ${line}\n`;
                });
                formatted += '\n';
            }

            if (mainContent) {
                formatted += `${mainContent}\n\n`;
            }

            return formatted;
        }

        return `${content}\n\n`;
    }

    /**
     * Export all sessions in a workspace
     */
    static async exportAll(
        sessions: Session[],
        getHistoryFn: (sessionId: string) => FloydMessage[],
        options: ObsidianExportOptions
    ): Promise<string[]> {
        const exportedPaths: string[] = [];

        for (const session of sessions) {
            const messages = getHistoryFn(session.id);
            if (messages.length > 0) {
                const filepath = await this.exportSession(session, messages, options);
                exportedPaths.push(filepath);
            }
        }

        logger.info('Exported all sessions', { count: exportedPaths.length });
        return exportedPaths;
    }
}
