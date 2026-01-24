import chalk from 'chalk';
import { CRUSH_THEME } from '../constants.js';

/**
 * Enhanced Terminal Markdown Renderer for "CRUSH" Theme
 * Provides beautiful markdown rendering with full syntax support
 * WITHOUT using HTML output - renders directly to terminal with chalk styling
 */

/**
 * Render markdown text directly to styled terminal output
 */
export function renderMarkdown(text: string): string {
    const renderer = new TerminalMarkdownRenderer();
    return renderer.render(text);
}

/**
 * Terminal-focused Markdown Renderer
 * Parses markdown and renders directly with chalk styling
 */
class TerminalMarkdownRenderer {
    private lines: string[] = [];
    private inList = false;
    private orderedListIndex = 1;
    private inCodeBlock = false;
    private codeBlockLang = '';
    private codeBlockLines: string[] = [];

    /**
     * Main render method
     */
    render(text: string): string {
        this.lines = [];
        this.inList = false;
        this.orderedListIndex = 1;
        this.inCodeBlock = false;
        this.codeBlockLines = [];

        const lines = text.split('\n');
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // If already in code block, check for end first
            if (this.inCodeBlock) {
                if (this.isCodeBlockEnd(line)) {
                    this.flushCodeBlock();
                    this.inCodeBlock = false;
                    i++;
                    continue;
                }
                this.codeBlockLines.push(line);
                i++;
                continue;
            }

            // Not in code block, check for start
            if (this.isCodeBlockStart(line)) {
                const lang = this.extractCodeBlockLang(line);
                this.codeBlockLang = lang;
                this.inCodeBlock = true;
                this.codeBlockLines = [];
                i++;
                continue;
            }

            // Process non-code lines
            this.processLine(line);
            i++;
        }

        // Flush any remaining content
        if (this.inCodeBlock) {
            this.flushCodeBlock();
        }

        return this.lines.join('\n');
    }

    /**
     * Process a single line of markdown
     */
    private processLine(line: string): void {
        // Empty lines
        if (!line.trim()) {
            this.flushListIfNeeded();
            this.lines.push('');
            return;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            this.flushListIfNeeded();
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            this.lines.push(this.renderHeading(text, level));
            return;
        }

        // Horizontal rule
        if (line.match(/^[-*_]{3,}$/)) {
            this.flushListIfNeeded();
            this.lines.push(this.renderHr());
            return;
        }

        // Blockquote
        if (line.startsWith('>')) {
            this.flushListIfNeeded();
            const quote = line.replace(/^>\s*/, '');
            this.lines.push(this.renderBlockquote(quote));
            return;
        }

        // Task list items
        const taskMatch = line.match(/^(\s*)- \[([ x])\]\s+(.+)$/);
        if (taskMatch) {
            const indent = taskMatch[1];
            const checked = taskMatch[2] === 'x';
            const text = taskMatch[3];
            this.lines.push(this.renderTaskListItem(text, checked, indent.length / 2));
            return;
        }

        // Unordered list items
        const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
        if (ulMatch) {
            const indent = ulMatch[1];
            const text = ulMatch[2];
            this.lines.push(this.renderListItem(text, false, indent.length / 2));
            return;
        }

        // Ordered list items
        const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
        if (olMatch) {
            const indent = olMatch[1];
            const text = olMatch[2];
            this.lines.push(this.renderListItem(text, true, indent.length / 2));
            return;
        }

        // Regular paragraph text with inline formatting
        this.flushListIfNeeded();
        this.lines.push(this.renderInlineElements(line));
    }

    /**
     * Render a heading
     */
    private renderHeading(text: string, level: number): string {
        const colors = [
            CRUSH_THEME.semantic.headerTitle,  // H1: Pink
            CRUSH_THEME.colors.primary,        // H2: Violet
            CRUSH_THEME.colors.info,           // H3: Blue
            CRUSH_THEME.colors.accent,         // H4: Teal
            CRUSH_THEME.colors.highlight,      // H5: Yellow
            CRUSH_THEME.colors.success,        // H6: Green
        ];

        const color = colors[level - 1] || CRUSH_THEME.colors.muted;
        const styledText = this.renderInlineElements(text);

        if (level === 1) {
            return `\n${chalk.hex(color).bold.underline(styledText)}\n${chalk.hex(CRUSH_THEME.colors.muted)('═'.repeat(Math.min(text.length + 4, 80)))}`;
        }
        return `\n${chalk.hex(color).bold(`${'#'.repeat(level)} ${styledText}`)}`;
    }

    /**
     * Render inline elements (bold, italic, code, links)
     */
    private renderInlineElements(text: string): string {
        let result = text;

        // Process code spans first (to avoid interference with other formatting)
        result = result.replace(/`([^`]+)`/g, (_, code) => {
            return chalk.hex(CRUSH_THEME.colors.accent).bold(code);
        });

        // Process bold text
        result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
            return chalk.hex(CRUSH_THEME.colors.highlight).bold(content);
        });

        // Process italic text
        result = result.replace(/\*([^*]+)\*/g, (_, content) => {
            return chalk.hex(CRUSH_THEME.colors.highlight).italic(content);
        });

        // Process links
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
            return chalk.hex(CRUSH_THEME.colors.info).underline(text) +
                   chalk.hex(CRUSH_THEME.colors.textSubtle)(` → ${href}`);
        });

        // Process images
        result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
            const altText = alt || 'Image';
            return `${chalk.hex(CRUSH_THEME.colors.accent).bold('🖼 ' + altText)} ${chalk.hex(CRUSH_THEME.colors.muted)(`(${src}`)}`;
        });

        return result;
    }

    /**
     * Render a list item
     */
    private renderListItem(text: string, ordered: boolean, depth: number): string {
        const indent = '  '.repeat(depth);
        const styledText = this.renderInlineElements(text);

        if (ordered) {
            return `${indent}${chalk.hex(CRUSH_THEME.semantic.headerTitle).bold(`${this.orderedListIndex}.`)} ${styledText}`;
        } else {
            const bullets = ['•', '◦', '▪', '▫'];
            const bullet = bullets[Math.min(depth, bullets.length - 1)];
            return `${indent}${chalk.hex(CRUSH_THEME.colors.accent).bold(bullet)} ${styledText}`;
        }
    }

    /**
     * Render a task list item
     */
    private renderTaskListItem(text: string, checked: boolean, depth: number): string {
        const indent = '  '.repeat(depth);
        const checkbox = checked
            ? chalk.hex(CRUSH_THEME.colors.success).bold('☒')
            : chalk.hex(CRUSH_THEME.colors.muted)('☐');
        const styledText = this.renderInlineElements(text);
        return `${indent}${checkbox} ${styledText}`;
    }

    /**
     * Render a blockquote
     */
    private renderBlockquote(text: string): string {
        const styledText = this.renderInlineElements(text);
        return `${chalk.hex(CRUSH_THEME.colors.accent).bold('│')} ${chalk.hex(CRUSH_THEME.colors.textSecondary).italic(styledText)}`;
    }

    /**
     * Render horizontal rule
     */
    private renderHr(): string {
        return chalk.hex(CRUSH_THEME.colors.muted)('─'.repeat(80));
    }

    /**
     * Flush a code block with syntax highlighting
     */
    private flushCodeBlock(): void {
        const lang = this.codeBlockLang || 'text';
        const code = this.codeBlockLines.join('\n');
        const highlighted = this.highlightCode(code, lang);

        const formattedLang = chalk.hex(CRUSH_THEME.colors.accent).bold(` ${lang} `);
        this.lines.push(
            `\n${chalk.hex(CRUSH_THEME.colors.muted).bold('┌──')} ${formattedLang}${chalk.hex(CRUSH_THEME.colors.muted).bold('─'.repeat(Math.max(0, 75 - lang.length - 4)))}\n` +
            `${chalk.hex(CRUSH_THEME.colors.muted).bold('│')}\n` +
            `${highlighted}\n` +
            `${chalk.hex(CRUSH_THEME.colors.muted).bold('└')}${chalk.hex(CRUSH_THEME.colors.muted)('─'.repeat(80))}`
        );

        this.codeBlockLines = [];
        this.codeBlockLang = '';
    }

    /**
     * Highlight code with language-specific syntax
     */
    private highlightCode(code: string, language: string): string {
        const lines = code.split('\n');

        return lines.map((line, i) => {
            const lineNum = chalk.hex(CRUSH_THEME.colors.muted)((i + 1).toString().padStart(3, ' '));
            const lineContent = this.highlightLine(line, language);
            return `${chalk.hex(CRUSH_THEME.colors.muted).bold('│')} ${lineNum}  ${lineContent}`;
        }).join('\n');
    }

    /**
     * Highlight individual code line based on language
     */
    private highlightLine(line: string, language: string): string {
        const lang = language.toLowerCase();

        if (['javascript', 'js', 'typescript', 'ts'].includes(lang)) {
            return this.highlightJavaScript(line);
        } else if (['python', 'py'].includes(lang)) {
            return this.highlightPython(line);
        } else if (['bash', 'sh'].includes(lang)) {
            return this.highlightBash(line);
        } else if (lang === 'json') {
            return this.highlightJson(line);
        } else if (['markdown', 'md'].includes(lang)) {
            return this.highlightMarkdownCode(line);
        }

        return line;
    }

    /**
     * JavaScript/TypeScript syntax highlighting
     */
    private highlightJavaScript(line: string): string {
        let result = line;

        // Keywords
        const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|async|await|try|catch|throw|typeof|instanceof|in|of|null|undefined|true|false)\b/g;
        result = result.replace(keywords, match => chalk.hex(CRUSH_THEME.colors.primary).bold(match));

        // Strings
        result = result.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, match => chalk.hex(CRUSH_THEME.colors.success)(match));

        // Comments
        result = result.replace(/(\/\/.*$)/gm, match => chalk.hex(CRUSH_THEME.colors.muted).italic(match));
        result = result.replace(/(\/\*[\s\S]*?\*\/)/g, match => chalk.hex(CRUSH_THEME.colors.muted).italic(match));

        // Numbers
        result = result.replace(/\b(\d+\.?\d*)\b/g, match => chalk.hex(CRUSH_THEME.colors.accent)(match));

        // Function calls
        result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, (_, name) => `${chalk.hex(CRUSH_THEME.semantic.headerTitle)(name)}(`);

        return result;
    }

    /**
     * Python syntax highlighting
     */
    private highlightPython(line: string): string {
        let result = line;

        // Keywords
        const keywords = /\b(def|class|return|if|elif|else|for|while|try|except|finally|with|as|import|from|raise|pass|break|continue|and|or|not|in|is|None|True|False|lambda|yield|async|await)\b/g;
        result = result.replace(keywords, match => chalk.hex(CRUSH_THEME.colors.primary).bold(match));

        // Strings
        result = result.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')/g, match => chalk.hex(CRUSH_THEME.colors.success)(match));

        // Comments
        result = result.replace(/(#.*$)/gm, match => chalk.hex(CRUSH_THEME.colors.muted).italic(match));

        // Numbers
        result = result.replace(/\b(\d+\.?\d*)\b/g, match => chalk.hex(CRUSH_THEME.colors.accent)(match));

        // Decorators
        result = result.replace(/(@\w+)/g, match => chalk.hex(CRUSH_THEME.colors.highlight)(match));

        return result;
    }

    /**
     * Bash syntax highlighting
     */
    private highlightBash(line: string): string {
        let result = line;

        // Comments
        result = result.replace(/(#.*$)/gm, match => chalk.hex(CRUSH_THEME.colors.muted).italic(match));

        // Strings
        result = result.replace(/(["'])[^"']*\1/g, match => chalk.hex(CRUSH_THEME.colors.success)(match));

        // Variables
        result = result.replace(/\$\{?[\w]+\}?/g, match => chalk.hex(CRUSH_THEME.colors.accent)(match));

        // Commands
        const commands = /\b(git|npm|yarn|pnpm|bun|node|python|pip|cargo|rust|go|docker|kubectl|aws|az|gcloud|ls|cd|mkdir|rm|cp|mv|cat|grep|sed|awk|find|xargs|curl|wget|tar|zip|unzip|chmod|chown|ps|kill|top|htop|df|du|mount|umount|export|env|echo|printf|sleep|watch|tail|head|less|more|sort|uniq|cut|paste|tr|split|join|tee|xargs)\b/g;
        result = result.replace(commands, match => chalk.hex(CRUSH_THEME.colors.primary).bold(match));

        // Flags
        result = result.replace(/\s(--?[\w-]+)/g, (_, flag) => ` ${chalk.hex(CRUSH_THEME.colors.highlight)(flag)}`);

        return result;
    }

    /**
     * JSON syntax highlighting
     */
    private highlightJson(line: string): string {
        let result = line;

        // Strings (keys and values)
        result = result.replace(/"([^"]+)"(\s*:)/g, (_, key, colon) => `${chalk.hex(CRUSH_THEME.semantic.headerTitle)(`"${key}"`)}${colon}`);
        result = result.replace(/:\s*"([^"]*)"/g, (_, value) => `: ${chalk.hex(CRUSH_THEME.colors.success)(`"${value}"`)}`);

        // Numbers
        result = result.replace(/:\s*(\d+\.?\d*)/g, (_, num) => `: ${chalk.hex(CRUSH_THEME.colors.accent)(num)}`);

        // Booleans and null
        result = result.replace(/:\s*(true|false)/g, (_, bool) => `: ${chalk.hex(CRUSH_THEME.colors.primary).bold(bool)}`);
        result = result.replace(/:\s*(null)/g, (_, n) => `: ${chalk.hex(CRUSH_THEME.colors.muted).bold(n)}`);

        return result;
    }

    /**
     * Markdown syntax highlighting (for markdown code blocks)
     */
    private highlightMarkdownCode(line: string): string {
        let result = line;

        // Headers
        result = result.replace(/^(#{1,6}\s.*)$/g, match => chalk.hex(CRUSH_THEME.semantic.headerTitle).bold(match));

        // Bold
        result = result.replace(/\*\*([^*]+)\*\*/g, (_, text) => chalk.hex(CRUSH_THEME.colors.primary).bold(text));

        // Italic
        result = result.replace(/\*([^*]+)\*/g, (_, text) => chalk.hex(CRUSH_THEME.colors.primary).italic(text));

        // Code spans
        result = result.replace(/`([^`]+)`/g, (_, code) => chalk.hex(CRUSH_THEME.colors.accent)(code));

        // Links
        result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, (_, text) => chalk.hex(CRUSH_THEME.colors.info).underline(text));

        return result;
    }

    /**
     * Check if line starts a code block
     */
    private isCodeBlockStart(line: string): boolean {
        return line.trim().startsWith('```');
    }

    /**
     * Check if line ends a code block
     */
    private isCodeBlockEnd(line: string): boolean {
        return line.trim() === '```';
    }

    /**
     * Extract code block language
     */
    private extractCodeBlockLang(line: string): string {
        const match = line.match(/^```(\w*)/);
        return match?.[1] || 'text';
    }

    /**
     * Flush list state when leaving a list
     */
    private flushListIfNeeded(): void {
        if (this.inList) {
            this.inList = false;
            this.orderedListIndex = 1;
        }
    }
}
