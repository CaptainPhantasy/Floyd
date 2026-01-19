/**
 * App component smoke tests
 * TDD approach: Write tests first to identify rendering issues
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';

// Mock window.floydAPI
const mockFloydAPI = {
  listSessions: vi.fn().mockResolvedValue([]),
  createSession: vi.fn().mockResolvedValue({ id: 'test-session', messages: [] }),
  loadSession: vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  getAgentStatus: vi.fn().mockResolvedValue({ connected: false, model: 'glm-4.7', isProcessing: false }),
  getSettings: vi.fn().mockResolvedValue({}),
  setSetting: vi.fn().mockResolvedValue({ success: true }),
  listProjects: vi.fn().mockResolvedValue([]),
  createProject: vi.fn().mockResolvedValue({ id: 'test-proj', name: 'Test' }),
  loadProject: vi.fn().mockResolvedValue(null),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  selectWorkingDirectory: vi.fn().mockResolvedValue('/test/path'),
  listFiles: vi.fn().mockResolvedValue({ success: true, files: [] }),
  sendStreamedMessage: vi.fn().mockResolvedValue(undefined),
  removeStreamListener: vi.fn(),
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { floydAPI: typeof mockFloydAPI }).floydAPI = mockFloydAPI;
  });

  it('renders without crashing', async () => {
    // This test should catch any initial render errors
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', async () => {
    render(<App />);
    // Should show loading indicator on initial render
    expect(screen.getByText(/Starting Floyd/i)).toBeInTheDocument();
  });

  it('shows welcome screen when no sessions exist', async () => {
    mockFloydAPI.listSessions.mockResolvedValue([]);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Starting Floyd/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Should show welcome screen with "Floyd" title
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Floyd/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('transitions from loading to main UI without errors', async () => {
    mockFloydAPI.listSessions.mockResolvedValue([
      { id: 'session-1', messages: [], createdAt: Date.now() }
    ]);
    
    render(<App />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Starting Floyd/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
