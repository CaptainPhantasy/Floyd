/**
 * Test Radix UI components with and without StrictMode
 * to identify if StrictMode double-rendering causes issues
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as ContextMenu from '@radix-ui/react-context-menu';

// Mock floydAPI for components that need it
vi.stubGlobal('floydAPI', {
  getSettings: vi.fn().mockResolvedValue({}),
});

describe('Radix UI with StrictMode', () => {
  it('Tabs renders correctly in StrictMode', () => {
    render(
      <React.StrictMode>
        <Tabs.Root defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">Content 1</Tabs.Content>
          <Tabs.Content value="tab2">Content 2</Tabs.Content>
        </Tabs.Root>
      </React.StrictMode>
    );
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
  });

  it('ContextMenu renders correctly in StrictMode', () => {
    render(
      <React.StrictMode>
        <ContextMenu.Root>
          <ContextMenu.Trigger asChild>
            <button>Right click me</button>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Item>Item 1</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </React.StrictMode>
    );
    
    expect(screen.getByRole('button', { name: 'Right click me' })).toBeInTheDocument();
  });

  it('Multiple Radix components mount/unmount without error', async () => {
    const { unmount, rerender } = render(
      <React.StrictMode>
        <Tabs.Root defaultValue="tab1">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </React.StrictMode>
    );

    // Rerender to simulate update
    rerender(
      <React.StrictMode>
        <Tabs.Root defaultValue="tab2">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </React.StrictMode>
    );

    // Unmount to simulate navigation away
    unmount();

    // If we got here without error, the test passes
    expect(true).toBe(true);
  });
});

describe('Radix UI without StrictMode (sanity check)', () => {
  it('Tabs renders correctly without StrictMode', () => {
    render(
      <Tabs.Root defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    );
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
  });
});
