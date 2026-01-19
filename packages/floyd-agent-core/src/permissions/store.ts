/**
 * Permission Store - Persistent storage for permission decisions
 * Rewritten for core package using fs/promises (not fs-extra)
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  PermissionPolicy, PermissionRule, PermissionDecision, PermissionScope,
  DEFAULT_POLICIES, cleanExpiredRules, mergeRule, createPermissionRule,
} from './policies.js';

const PERMISSIONS_FILE_VERSION = '1.0.0';

export interface PermissionsFile {
  version: string;
  decisions: Record<string, PermissionRule>;
  rememberUntil: 'session' | 'forever';
  updatedAt: number;
}

export class PermissionStore {
  private filePath: string;
  private policies: PermissionPolicy;
  private loaded = false;

  constructor(cwd: string = process.cwd()) {
    this.filePath = path.join(cwd, '.floyd', 'permissions.json');
    this.policies = DEFAULT_POLICIES;
  }

  async load(): Promise<PermissionPolicy> {
    try {
      if (existsSync(this.filePath)) {
        const content = await fs.readFile(this.filePath, 'utf-8');
        const data = JSON.parse(content) as PermissionsFile;
        const rules = Object.values(data.decisions || {});
        this.policies = {
          rules: cleanExpiredRules({ rules, defaultBehavior: 'ask', rememberUntil: 'session' }).rules,
          defaultBehavior: 'ask',
          rememberUntil: data.rememberUntil || 'session',
        };
      } else {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        this.policies = DEFAULT_POLICIES;
      }
    } catch {
      this.policies = DEFAULT_POLICIES;
    }
    this.loaded = true;
    return this.policies;
  }

  async save(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    this.policies = cleanExpiredRules(this.policies);
    const data: PermissionsFile = {
      version: PERMISSIONS_FILE_VERSION,
      decisions: {},
      rememberUntil: this.policies.rememberUntil,
      updatedAt: Date.now(),
    };
    for (const rule of this.policies.rules) {
      data.decisions[`${rule.toolName}:${rule.decision}:${rule.scope}`] = rule;
    }
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async getPolicies(): Promise<PermissionPolicy> {
    if (!this.loaded) await this.load();
    return this.policies;
  }

  async checkPermission(toolName: string): Promise<PermissionDecision | null> {
    const policies = await this.getPolicies();
    const rule = policies.rules.find(r => r.toolName === toolName && r.expiresAt && r.expiresAt > Date.now());
    return rule ? rule.decision : null;
  }

  async recordDecision(toolName: string, decision: PermissionDecision, scope: PermissionScope): Promise<void> {
    const policies = await this.getPolicies();
    this.policies = mergeRule(policies, createPermissionRule(toolName, decision, scope, policies.rememberUntil));
    await this.save();
  }

  async clearAll(): Promise<void> { this.policies = DEFAULT_POLICIES; await this.save(); }
  async clearTool(toolName: string): Promise<void> {
    const policies = await this.getPolicies();
    this.policies = { ...policies, rules: policies.rules.filter(r => r.toolName !== toolName) };
    await this.save();
  }
}
