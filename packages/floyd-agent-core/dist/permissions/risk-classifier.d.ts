/**
 * Risk Classifier for Permission Requests
 *
 * Classifies tool calls by risk level based on:
 * - Tool name patterns (read vs write, dangerous operations)
 * - Argument content analysis (file paths, URLs, commands)
 * - Context (whether it modifies data, accesses network, etc.)
 */
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export interface RiskAssessment {
    level: RiskLevel;
    reasons: string[];
    confidence: number;
}
/**
 * Classify a tool call by risk level
 */
export declare function classifyRisk(toolName: string, arguments_?: Record<string, unknown>): RiskAssessment;
/**
 * Get a human-readable description of the risk level
 */
export declare function getRiskDescription(level: RiskLevel): string;
/**
 * Get recommended action for a risk level
 */
export declare function getRecommendedAction(level: RiskLevel): 'allow' | 'ask' | 'deny';
//# sourceMappingURL=risk-classifier.d.ts.map