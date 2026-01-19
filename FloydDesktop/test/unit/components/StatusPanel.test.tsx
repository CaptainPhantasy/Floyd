/**
 * StatusPanel component tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPanel } from '@/components/StatusPanel';

describe('StatusPanel', () => {
  it('renders connected status', () => {
    render(<StatusPanel status={{ connected: true, model: 'glm-4.7', isProcessing: false, sessionId: 'test-123' }} />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('glm-4.7')).toBeInTheDocument();
  });

  it('renders disconnected status', () => {
    render(<StatusPanel status={{ connected: false, model: '', isProcessing: false, sessionId: null }} />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('renders processing state', () => {
    render(<StatusPanel status={{ connected: true, model: 'glm-4.7', isProcessing: true, sessionId: 'test-123' }} />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('does not render processing indicator when not processing', () => {
    render(<StatusPanel status={{ connected: true, model: 'glm-4.7', isProcessing: false, sessionId: 'test-123' }} />);
    expect(screen.queryByText('Processing')).not.toBeInTheDocument();
  });

  it('renders model name when connected', () => {
    render(<StatusPanel status={{ connected: true, model: 'glm-4.7', isProcessing: false, sessionId: 'test-123' }} />);
    expect(screen.getByText('glm-4.7')).toBeInTheDocument();
  });

  it('does not render model when empty', () => {
    render(<StatusPanel status={{ connected: true, model: '', isProcessing: false, sessionId: 'test-123' }} />);
    expect(screen.queryByText('glm-4.7')).not.toBeInTheDocument();
  });
});
