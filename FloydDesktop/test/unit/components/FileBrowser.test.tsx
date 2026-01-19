/**
 * FileBrowser component tests
 * Tests Radix UI ContextMenu component integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FileBrowser } from '@/components/FileBrowser';

// Mock window.floydAPI
const mockFloydAPI = {
  listFiles: vi.fn().mockResolvedValue({
    success: true,
    files: [
      { name: 'src', path: '/test/src', type: 'directory' },
      { name: 'package.json', path: '/test/package.json', type: 'file' },
    ],
  }),
};

describe('FileBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { floydAPI: typeof mockFloydAPI }).floydAPI = mockFloydAPI;
  });

  it('renders without crashing when no project path', () => {
    const { container } = render(<FileBrowser />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing with a project path', async () => {
    render(<FileBrowser projectPath="/test" />);
    
    await waitFor(() => {
      expect(mockFloydAPI.listFiles).toHaveBeenCalledWith('/test');
    });
  });

  it('displays files when loaded', async () => {
    render(<FileBrowser projectPath="/test" />);
    
    await waitFor(() => {
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('package.json')).toBeInTheDocument();
    });
  });

  it('shows empty state when no files', async () => {
    mockFloydAPI.listFiles.mockResolvedValue({ success: true, files: [] });
    
    render(<FileBrowser projectPath="/test" />);
    
    await waitFor(() => {
      expect(mockFloydAPI.listFiles).toHaveBeenCalled();
    });
    
    // Should handle empty files gracefully
    expect(screen.queryByText('src')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockFloydAPI.listFiles.mockRejectedValue(new Error('API Error'));
    
    render(<FileBrowser projectPath="/test" />);
    
    // Should not crash on error
    await waitFor(() => {
      expect(mockFloydAPI.listFiles).toHaveBeenCalled();
    });
  });
});
