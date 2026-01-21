/**
 * CopyButton Component Tests - Phase 1, Task 1.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from './CopyButton';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the copy button', () => {
    render(<CopyButton content="Test content" />);
    const button = screen.getByRole('button', { name: /copy message/i });
    expect(button).toBeInTheDocument();
  });

  it('should copy content to clipboard on click', async () => {
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    render(<CopyButton content="Test content" />);
    const button = screen.getByRole('button', { name: /copy message/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test content');
    });
  });

  it('should show check icon when copied (via title attribute)', async () => {
    mockClipboard.writeText.mockResolvedValueOnce(undefined);

    render(<CopyButton content="Test content" />);
    const button = screen.getByRole('button', { name: /copy message/i });

    // Initially title is "Copy to clipboard" or "Copy message"
    expect(button).toHaveAttribute('title', expect.stringMatching(/copy/i));

    fireEvent.click(button);

    // After clicking, title should be "Copied!"
    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Copied!');
    });
  });

  it('should handle clipboard errors gracefully', async () => {
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    // Mock execCommand fallback
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<CopyButton content="Test content" />);
    const button = screen.getByRole('button', { name: /copy message/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CopyButton content="Test content" className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should support different sizes', () => {
    const { container: small } = render(<CopyButton content="Test" size="sm" />);
    const { container: medium } = render(<CopyButton content="Test" size="md" />);

    expect(small.querySelector('.w-5')).toBeInTheDocument();
    expect(medium.querySelector('.w-6')).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(<CopyButton content="Test content" />);
    const button = screen.getByRole('button', { name: /copy message/i });

    expect(button).toHaveAttribute('aria-label', 'Copy message');
  });
});
