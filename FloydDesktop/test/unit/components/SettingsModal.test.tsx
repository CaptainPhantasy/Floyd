/**
 * SettingsModal component tests
 * Tests Radix UI Tabs component integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '@/components/SettingsModal';

// Mock window.floydAPI
const mockFloydAPI = {
  getSettings: vi.fn().mockResolvedValue({
    provider: 'anthropic',
    apiKey: 'test-key',
    apiEndpoint: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-20250514',
  }),
  setSetting: vi.fn().mockResolvedValue({ success: true }),
  getMCPServers: vi.fn().mockResolvedValue([]),
};

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { floydAPI: typeof mockFloydAPI }).floydAPI = mockFloydAPI;
  });

  it('returns null when closed', () => {
    const { container } = render(
      <SettingsModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders without crashing when open', async () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('renders Radix Tabs without Floating UI errors', async () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      // Should have tab triggers
      expect(screen.getByRole('tab', { name: /API/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument();
    });
  });

  it('loads and displays settings correctly', async () => {
    render(<SettingsModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      // Should show loading spinner initially, then settings
      expect(mockFloydAPI.getSettings).toHaveBeenCalled();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});
