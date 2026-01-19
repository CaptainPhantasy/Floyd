/**
 * WelcomeScreen - First-run experience for new users
 * 
 * Shows when no projects or sessions exist, guiding users through setup.
 */

import React from 'react';

interface WelcomeScreenProps {
  onNewProject: () => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
}

export function WelcomeScreen({ onNewProject, onNewSession, onOpenSettings }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-3">
          Floyd
        </h1>
        <p className="text-slate-400 text-lg">
          Your AI-powered coding assistant
        </p>
      </div>

      {/* Quick Start Actions */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wide mb-4">
          Get Started
        </h2>

        <button
          onClick={onNewProject}
          className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sky-500/20 rounded-lg">
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-slate-100">Open Project</div>
            <div className="text-sm text-slate-400">Start working on an existing codebase</div>
          </div>
          <div className="ml-auto text-slate-500 text-xs">⌘O</div>
        </button>

        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-emerald-500/20 rounded-lg">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-slate-100">New Chat</div>
            <div className="text-sm text-slate-400">Start a quick conversation without a project</div>
          </div>
          <div className="ml-auto text-slate-500 text-xs">⌘N</div>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-amber-500/20 rounded-lg">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-slate-100">Configure API</div>
            <div className="text-sm text-slate-400">Set up your API key and preferences</div>
          </div>
          <div className="ml-auto text-slate-500 text-xs">⌘,</div>
        </button>
      </div>

      {/* Tips Section */}
      <div className="w-full max-w-md">
        <h2 className="text-slate-300 text-sm font-medium uppercase tracking-wide mb-4">
          Tips
        </h2>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-400">
              Use <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">⌘K</kbd> to open the command palette
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-400">
              Projects keep your sessions organized by codebase
            </span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <span className="text-sky-400">•</span>
            <span className="text-slate-400">
              Floyd can read files, run commands, and help you code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
