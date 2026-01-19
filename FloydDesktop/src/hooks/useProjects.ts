/**
 * FloydDesktop - Projects Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!window.floydAPI?.listProjects) return;

    try {
      setIsLoading(true);
      const result = await window.floydAPI.listProjects();
      if (result.success && result.projects) {
        setProjects(result.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, path: string): Promise<Project | null> => {
    if (!window.floydAPI?.createProject) return null;

    try {
      const result = await window.floydAPI.createProject({ name, path });
      if (result.success && result.project) {
        setProjects((prev) => [...prev, result.project!]);
        return result.project;
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
    return null;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    if (!window.floydAPI?.deleteProject) return;

    try {
      const result = await window.floydAPI.deleteProject(id);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (currentProject?.id === id) {
          setCurrentProject(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, [currentProject]);

  const loadProject = useCallback(async (id: string): Promise<Project | null> => {
    if (!window.floydAPI?.loadProject) return null;

    try {
      const result = await window.floydAPI.loadProject(id);
      if (result.success && result.project) {
        setCurrentProject(result.project);
        return result.project;
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
    return null;
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    createProject,
    deleteProject,
    loadProject,
    loadProjects,
  };
}
