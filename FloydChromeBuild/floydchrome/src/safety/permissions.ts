/**
 * Safety Layer
 * Validates actions and enforces security policies
 */

import { hasSuspiciousContent } from './sanitizer.js';

const DESTRUCTIVE_ACTIONS = [
  'submit',
  'download',
  'delete',
  'remove'
];

const TRUSTED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0'
];

export interface SafetyCheckResult {
  allowed: boolean;
  reason: string | null;
}

export class SafetyLayer {
  private userConfirmations = new Map<string, boolean>();

  /**
   * Check if an action is allowed
   */
  async checkAction(method: string, params: Record<string, unknown>): Promise<SafetyCheckResult> {
    // Check for suspicious content in params
    if (hasSuspiciousContent(params)) {
      return {
        allowed: false,
        reason: 'Suspicious content detected in parameters'
      };
    }

    // Check for destructive actions
    const isDestructive = DESTRUCTIVE_ACTIONS.some(action =>
      method.toLowerCase().includes(action)
    );

    if (isDestructive) {
      // For now, allow but log warning
      // In production, this would require user confirmation
      console.warn(`[Safety] Destructive action detected: ${method}`);
    }

    // Check domain trust for URL-based actions
    if (params.url && typeof params.url === 'string') {
      try {
        const urlObj = new URL(params.url);
        const isTrusted = TRUSTED_DOMAINS.some(domain =>
          urlObj.hostname.includes(domain)
        );

        if (!isTrusted) {
          // Log warning for untrusted domains
          console.warn(`[Safety] Untrusted domain: ${urlObj.hostname}`);
        }
      } catch {
        // Invalid URL, will be caught elsewhere
      }
    }

    return {
      allowed: true,
      reason: null
    };
  }

  /**
   * Request user confirmation for destructive action
   */
  async requestConfirmation(actionId: string, actionDescription: string): Promise<boolean> {
    // Stub for user confirmation UI
    // In production, this would show a notification or side panel prompt

    return new Promise((resolve) => {
      // For now, auto-confirm after 5 seconds
      // In production, this would wait for user input
      setTimeout(() => {
        this.userConfirmations.set(actionId, true);
        resolve(true);
      }, 5000);
    });
  }

  /**
   * Check if domain is trusted
   */
  isTrustedDomain(hostname: string): boolean {
    return TRUSTED_DOMAINS.some(domain => hostname.includes(domain));
  }
}
