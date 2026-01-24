/**
 * Type definitions for monitoring-module.js
 */

export class MonitoringModule {
  private isActive: boolean;
  private thinkingMessage: string;
  private currentTool: string | null;
  private todos: string[];
  private lastLineCount: number;

  startThinking(): void;
  stopThinking(): void;
  setTool(toolName: string): void;
  clearTool(): void;
  addTodo(todo: string): void;
  removeTodo(todo: string): void;
  clearTodos(): void;
  render(): void;
  clear(): void;
}

export function getMonitoringModule(): MonitoringModule;
