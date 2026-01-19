/**
 * FloydDesktop - Projects Panel Component
 * 
 * Left sidebar showing projects and their sessions
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import type { Project, SessionData } from '../types';
import { Folder, FolderOpen, MessageSquare, Plus, X, ChevronRight, ChevronDown } from 'lucide-react';

interface ProjectsPanelProps {
  projects: Project[];
  sessions: SessionData[];
  currentProjectId?: string;
  currentSessionId?: string;
  onNewProject: () => void;
  onNewSession?: (projectId?: string) => void;
  onSelectProject: (id: string) => void;
  onSelectSession: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export function ProjectsPanel({
  projects,
  sessions,
  currentProjectId,
  currentSessionId,
  onNewProject,
  onNewSession,
  onSelectProject,
  onSelectSession,
  onDeleteProject,
  onDeleteSession,
  onClose,
}: ProjectsPanelProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const projectSessions = (projectId: string) => {
    return sessions.filter((s) => {
      const project = projects.find((p) => p.id === projectId);
      return project?.sessions.includes(s.id);
    });
  };

  return (
    <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="font-semibold">Projects</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewProject}
            className="p-1 hover:bg-slate-700 rounded"
            aria-label="New project"
            title="New Project"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-slate-400 mb-3">No projects yet</p>
            <button
              onClick={onNewProject}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              Create your first project
            </button>
          </div>
        ) : (
          projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);
            const isActive = project.id === currentProjectId;
            const projectSessionsList = projectSessions(project.id);

            return (
              <div key={project.id} className="space-y-1">
                {/* Project Item */}
                <div
                  className={cn(
                    'group relative rounded-lg px-2 py-1.5 cursor-pointer transition-colors',
                    isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                  )}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProject(project.id);
                      }}
                      className="p-0.5 hover:bg-slate-600 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Folder className="w-4 h-4 text-sky-400" />
                    )}
                    <span className="text-sm font-medium truncate flex-1">
                      {project.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-600 rounded transition-opacity"
                      aria-label="Delete project"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sessions under project */}
                {isExpanded && (
                  <div className="ml-6 space-y-0.5">
                    {onNewSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNewSession(project.id);
                        }}
                        className="w-full text-left px-2 py-1 text-xs text-sky-400 hover:text-sky-300 hover:bg-slate-700/50 rounded flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        New Session
                      </button>
                    )}
                    {projectSessionsList.length === 0 ? (
                      <div className="text-xs text-slate-500 px-2 py-1">
                        No sessions
                      </div>
                    ) : (
                      projectSessionsList.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={session.id === currentSessionId}
                          onClick={() => onSelectSession(session.id)}
                          onDelete={() => onDeleteSession(session.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer - New Project Button */}
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={onNewProject}
          className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </div>
  );
}

interface SessionItemProps {
  session: SessionData;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function SessionItem({ session, isActive, onClick, onDelete }: SessionItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={cn(
        'group relative rounded-lg px-2 py-1.5 cursor-pointer transition-colors flex items-center gap-2',
        isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <MessageSquare className="w-3 h-3 text-slate-400" />
      <span className="text-xs font-medium truncate flex-1">
        {session.title}
      </span>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-0.5 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete session"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
