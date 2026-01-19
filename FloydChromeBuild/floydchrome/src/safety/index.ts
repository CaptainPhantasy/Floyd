/**
 * Safety module exports
 */

export { SafetyLayer } from './permissions.js';
export { sanitizeContent, hasSuspiciousContent } from './sanitizer.js';
export type {
  SanitizedContent,
  SanitizedNode,
  SanitizedAccessibility,
  SanitizedA11yNode
} from './sanitizer.js';
export type { SafetyCheckResult } from './permissions.js';
