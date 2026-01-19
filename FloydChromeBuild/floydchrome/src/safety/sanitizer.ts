/**
 * Content Sanitizer
 * Protects against prompt injection attacks
 */

const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all)\s+(instructions?|commands?)/i,
  /forget\s+(everything|all)/i,
  /you\s+are\s+now/i,
  /system\s*:\s*/i,
  /<\|(system|user|assistant)\|>/i,
  /\[INST\]/i,
  /\[SYSTEM\]/i,
  /override/i,
  /bypass/i,
  /ignore\s+the\s+above/i
];

const MAX_CONTENT_LENGTH = 1000000; // 1MB limit

export interface SanitizedContent {
  text?: string;
  dom?: SanitizedNode | undefined;
  accessibility?: SanitizedAccessibility | undefined;
}

export interface SanitizedNode {
  nodeName?: string;
  nodeValue?: string;
  attributes?: Array<{ name: string; value: string }>;
  children?: SanitizedNode[];
  [key: string]: unknown;
}

export interface SanitizedAccessibility {
  nodes?: SanitizedA11yNode[];
  role?: string;
  name?: string;
  value?: string;
  description?: string;
  children?: SanitizedA11yNode[];
  [key: string]: unknown;
}

export interface SanitizedA11yNode {
  role?: string;
  name?: string;
  value?: string;
  description?: string;
  children?: SanitizedA11yNode[];
  [key: string]: unknown;
}

/**
 * Sanitize content before sending to AI
 */
export function sanitizeContent(content: {
  text?: string;
  dom?: any;
  accessibility?: any;
}): SanitizedContent {
  const sanitized: SanitizedContent = {};

  // Handle text content
  if (content.text) {
    sanitized.text = sanitizeText(content.text);
  }

  // Handle DOM structure
  if (content.dom) {
    sanitized.dom = sanitizeDOM(content.dom);
  }

  // Handle accessibility tree
  if (content.accessibility) {
    sanitized.accessibility = sanitizeAccessibility(content.accessibility);
  }

  return sanitized;
}

/**
 * Sanitize plain text
 */
function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Check length
  if (text.length > MAX_CONTENT_LENGTH) {
    text = text.substring(0, MAX_CONTENT_LENGTH) + '...[truncated]';
  }

  // Check for suspicious patterns
  const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));

  if (hasSuspiciousPattern) {
    // Flag but don't block - log warning
    console.warn('[Sanitizer] Suspicious pattern detected in text content');
  }

  return text;
}

/**
 * Sanitize DOM structure
 */
function sanitizeDOM(dom: any): SanitizedNode | undefined {
  if (!dom || typeof dom !== 'object') {
    return undefined;
  }

  // Recursively sanitize node text content
  const sanitizeNode = (node: any): SanitizedNode | undefined => {
    if (!node) return undefined;

    const sanitized: SanitizedNode = { ...node };

    // Sanitize text content
    if (sanitized.nodeValue && typeof sanitized.nodeValue === 'string') {
      sanitized.nodeValue = sanitizeText(sanitized.nodeValue);
    }

    // Sanitize attributes
    if (Array.isArray(sanitized.attributes)) {
      sanitized.attributes = sanitized.attributes.map((attr: any) => ({
        ...attr,
        value: sanitizeText(attr.value || '')
      }));
    }

    // Recursively sanitize children
    if (Array.isArray(sanitized.children)) {
      sanitized.children = sanitized.children.map(sanitizeNode).filter(Boolean) as SanitizedNode[];
    }

    return sanitized;
  };

  return sanitizeNode(dom);
}

/**
 * Sanitize accessibility tree
 */
function sanitizeAccessibility(accessibility: any): SanitizedAccessibility | undefined {
  if (!accessibility || typeof accessibility !== 'object') {
    return undefined;
  }

  const sanitizeNode = (node: any): SanitizedA11yNode | undefined => {
    if (!node) return undefined;

    const sanitized: SanitizedA11yNode = { ...node };

    // Sanitize text properties
    if (sanitized.name && typeof sanitized.name === 'string') {
      sanitized.name = sanitizeText(sanitized.name);
    }

    if (sanitized.value && typeof sanitized.value === 'string') {
      sanitized.value = sanitizeText(sanitized.value);
    }

    if (sanitized.description && typeof sanitized.description === 'string') {
      sanitized.description = sanitizeText(sanitized.description);
    }

    // Recursively sanitize children
    if (Array.isArray(sanitized.children)) {
      sanitized.children = sanitized.children.map(sanitizeNode).filter(Boolean) as SanitizedA11yNode[];
    }

    return sanitized;
  };

  // Handle both single node and nodes array
  if (Array.isArray(accessibility.nodes)) {
    return {
      ...accessibility,
      nodes: accessibility.nodes.map(sanitizeNode).filter(Boolean) as SanitizedA11yNode[]
    };
  }

  return sanitizeNode(accessibility);
}

/**
 * Check if content contains suspicious patterns
 */
export function hasSuspiciousContent(content: string | Record<string, unknown>): boolean {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
}
