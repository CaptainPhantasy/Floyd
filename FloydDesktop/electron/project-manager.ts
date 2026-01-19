/**
 * FloydDesktop - Project Manager
 * 
 * Manages project data persistence and operations
 */

import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { randomUUID } from 'crypto';

// Project types (duplicated from src/types.ts to avoid cross-boundary imports)
interface Project {
  id: string;
  name: string;
  path: string;
  created: number;
  updated: number;
  sessions: string[];
  contextFiles: string[];
  mcpServers: string[];
  settings: ProjectSettings;
}

interface ProjectSettings {
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  autoSave?: boolean;
  watchFiles?: boolean;
}

const PROJECTS_DIR = path.join(app.getPath('userData'), 'projects');
const PROJECTS_FILE = path.join(PROJECTS_DIR, 'projects.json');

export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private initialized = false;
  private initPromise: Promise<void>;

  constructor() {
    // Bug #73 fix: Use initPromise pattern to avoid race condition
    this.initPromise = this.doInit();
  }

  private async doInit(): Promise<void> {
    await this.ensureProjectsDir();
    // Load projects on initialization - call internal version to avoid deadlock
    try {
      await this.loadProjectsInternal();
    } catch (error) {
      console.error('[ProjectManager] Failed to load projects on init:', error);
    }
    this.initialized = true;
  }

  /**
   * Internal load that doesn't wait for init (called FROM init)
   */
  private async loadProjectsInternal(): Promise<Project[]> {
    try {
      await this.ensureProjectsDir();
      const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
      const projects: Project[] = JSON.parse(data);
      this.projects = new Map(projects.map((p) => [p.id, p]));
      return projects;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist yet, return empty array
        return [];
      }
      console.error('[ProjectManager] Failed to load projects:', error);
      return [];
    }
  }

  private async waitForInit(): Promise<void> {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  private async ensureProjectsDir(): Promise<void> {
    try {
      await fs.mkdir(PROJECTS_DIR, { recursive: true });
    } catch (error) {
      console.error('[ProjectManager] Failed to create projects directory:', error);
    }
  }

  async loadProjects(): Promise<Project[]> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    // After init, just return what's in memory (already loaded)
    return Array.from(this.projects.values());
  }

  async saveProjects(): Promise<void> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    try {
      await this.ensureProjectsDir();
      const projects = Array.from(this.projects.values());
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    } catch (error) {
      console.error('[ProjectManager] Failed to save projects:', error);
      throw error;
    }
  }

  async createProject(name: string, projectPath: string, settings?: Partial<ProjectSettings>): Promise<Project> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    // Bug #16 fix: Use cryptographically random UUID to prevent ID collision
    const project: Project = {
      id: `proj_${randomUUID()}`,
      name,
      path: projectPath,
      created: Date.now(),
      updated: Date.now(),
      sessions: [],
      contextFiles: [],
      mcpServers: [],
      settings: {
        autoSave: true,
        watchFiles: true,
        ...settings,
      },
    };

    this.projects.set(project.id, project);
    await this.saveProjects();
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    return this.projects.get(id) || null;
  }

  async listProjects(): Promise<Project[]> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    return Array.from(this.projects.values());
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    const project = this.projects.get(id);
    if (!project) {
      return null;
    }

    const updated: Project = {
      ...project,
      ...updates,
      updated: Date.now(),
    };

    this.projects.set(id, updated);
    await this.saveProjects();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    const existed = this.projects.delete(id);
    if (existed) {
      await this.saveProjects();
    }
    return existed;
  }

  async addSessionToProject(projectId: string, sessionId: string): Promise<boolean> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }

    // Bug #26 fix: Create new array instead of mutating in place
    if (!project.sessions.includes(sessionId)) {
      const newSessions = [...project.sessions, sessionId];
      await this.updateProject(projectId, { sessions: newSessions });
    }
    return true;
  }

  async addContextFile(projectId: string, filePath: string): Promise<boolean> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }

    // Bug #26 fix: Create new array instead of mutating in place
    if (!project.contextFiles.includes(filePath)) {
      const newContextFiles = [...project.contextFiles, filePath];
      await this.updateProject(projectId, { contextFiles: newContextFiles });
    }
    return true;
  }

  async removeContextFile(projectId: string, filePath: string): Promise<boolean> {
    await this.waitForInit();  // Bug #73 fix: Wait for initialization
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }

    // Bug #26 fix: Create new array instead of mutating in place
    const newContextFiles = project.contextFiles.filter((f) => f !== filePath);
    await this.updateProject(projectId, { contextFiles: newContextFiles });
    return true;
  }
}
