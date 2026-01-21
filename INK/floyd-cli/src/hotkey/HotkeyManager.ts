/**
 * HotkeyManager
 *
 * Centralized hotkey management system that coordinates all hotkey handlers
 * with priority-based dispatch. This prevents hotkey conflicts by ensuring
 * only the highest-priority handler for a given key receives events.
 *
 * Priority system: lower number = higher priority (1 is highest)
 */

export interface HotkeyHandler {
    /** The key to listen for (e.g., 'escape', '?', 'a', 'ctrl+c') */
    key: string;

    /** Priority level (1 = highest, larger numbers = lower priority) */
    priority: number;

    /** Optional condition function - handler only fires if this returns true */
    condition?: (context: Record<string, unknown>) => boolean;

    /** Action to execute when the hotkey is pressed.
     *  Return `true` to stop propagation (event was handled).
     *  Return `false` to allow propagation to next handler.
     *  Return `undefined` or void to stop propagation (default behavior).
     */
    action: (input: string, key: any, context: HotkeyContext) => boolean | void;
}

export interface HotkeyContext {
    /** Whether the user is currently typing input */
    isTyping?: boolean;

    /** Whether the input field is empty */
    inputEmpty?: boolean;

    /** Whether an overlay is currently active */
    overlayActive?: boolean;

    /** Which overlay is active (if any) */
    activeOverlay?: 'help' | 'promptLibrary' | 'agentBuilder' | 'commandPalette' | null;
}

export class HotkeyManager {
    private handlers: Map<string, HotkeyHandler[]> = new Map();

    /**
     * Register a hotkey handler.
     * Handlers with the same key are sorted by priority (lower number = higher priority).
     */
    register(handler: HotkeyHandler): void {
        const key = handler.key;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        this.handlers.get(key)!.push(handler);
        // Sort by priority (ascending - lower numbers win)
        this.handlers.get(key)!.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Handle a keypress.
     * Returns `false` if the event was handled (should not propagate).
     * Returns `true` if the event was not handled (should propagate).
     */
    handle(input: string, key: any, context: HotkeyContext = {}): boolean {
        const handlers = this.handlers.get(input) || [];

        for (const handler of handlers) {
            // Check condition if provided
            if (handler.condition && !handler.condition(context as Record<string, unknown>)) {
                continue;
            }

            // Execute the handler
            const result = handler.action(input, key, context);

            // If handler returns false, stop propagation immediately
            if (result === false) {
                return false; // Stop propagation
            }

            // If handler returns true, continue to next handler
            // If handler returns undefined, stop propagation (default)
            if (result !== true) {
                return false; // Handler didn't explicitly propagate
            }

            // Continue to next handler (result === true)
        }

        // All handlers propagated, or no handlers matched
        return true;
    }

    /**
     * Unregister a handler by key and priority.
     * Useful for cleanup when components unmount.
     */
    unregister(key: string, priority: number): void {
        const handlers = this.handlers.get(key);
        if (handlers) {
            const filtered = handlers.filter(h => h.priority !== priority);
            if (filtered.length === 0) {
                this.handlers.delete(key);
            } else {
                this.handlers.set(key, filtered);
            }
        }
    }

    /**
     * Clear all handlers for a specific key.
     */
    clearKey(key: string): void {
        this.handlers.delete(key);
    }

    /**
     * Clear all registered handlers.
     */
    clearAll(): void {
        this.handlers.clear();
    }

    /**
     * Get the number of handlers registered for a key.
     */
    getHandlerCount(key: string): number {
        return this.handlers.get(key)?.length || 0;
    }
}

// Singleton instance for global use
let globalInstance: HotkeyManager | null = null;

export function getGlobalHotkeyManager(): HotkeyManager {
    if (!globalInstance) {
        globalInstance = new HotkeyManager();
    }
    return globalInstance;
}
