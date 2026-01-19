/**
 * FloydDesktop - Settings Modal Component
 */

import { useState, useEffect, useCallback, useId, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '../lib/utils';
import type { FloydSettings } from '../types';
import { MCPSettings } from './MCPSettings';
import { PROVIDERS, getProvider, getProviderIds, DEFAULT_PROVIDER, DEFAULT_MODEL, type ProviderId } from '../config/providers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SETTINGS: FloydSettings = {
  provider: DEFAULT_PROVIDER,
  apiKey: '',
  apiEndpoint: 'https://api.anthropic.com',
  model: DEFAULT_MODEL,
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<FloydSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const formId = useId();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!window.floydAPI) {
        console.error('floydAPI not available');
        setIsLoading(false);
        return;
      }
      const savedSettings = await window.floydAPI.getSettings();
      
      // Get provider - default to anthropic
      let provider = (savedSettings.provider as ProviderId) || DEFAULT_PROVIDER;
      
      // Validate provider is in our list
      const validProviders = getProviderIds();
      if (!validProviders.includes(provider)) {
        provider = DEFAULT_PROVIDER;
      }
      
      const providerConfig = getProvider(provider);
      
      // Use saved endpoint or provider default
      const endpoint = (savedSettings.apiEndpoint as string) || providerConfig.endpoint;
      
      // Ensure model is valid for provider
      let model = (savedSettings.model as string) || DEFAULT_MODEL;
      const modelExists = providerConfig.models.some(m => m.id === model);
      if (!modelExists && providerConfig.models.length > 0) {
        model = providerConfig.models[0].id;
      }
      
      setSettings({
        provider,
        apiKey: (savedSettings.apiKey as string) || '',
        apiEndpoint: endpoint,
        model,
        systemPrompt: savedSettings.systemPrompt as string | undefined,
        workingDirectory: savedSettings.workingDirectory as string | undefined,
        allowedTools: savedSettings.allowedTools as string[] | undefined,
        mcpServers: savedSettings.mcpServers as Record<string, unknown> | undefined,
        theme: savedSettings.theme as 'dark' | 'light' | 'system' | undefined,
        autoSave: savedSettings.autoSave as boolean | undefined,
        extensionAutoConnect: savedSettings.extensionAutoConnect as boolean | undefined,
        extensionPort: savedSettings.extensionPort as number | undefined,
        showTokenCount: savedSettings.showTokenCount as boolean | undefined,
        showTimestamps: savedSettings.showTimestamps as boolean | undefined,
        streamResponses: savedSettings.streamResponses as boolean | undefined,
        confirmDestructive: savedSettings.confirmDestructive as boolean | undefined,
        maxContextFiles: savedSettings.maxContextFiles as number | undefined,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      if (!window.floydAPI) {
        setSaveMessage('Error: floydAPI not available. Please restart the app.');
        setIsSaving(false);
        return;
      }
      
      // Save each setting individually
      if (settings.provider !== undefined) {
        const result = await window.floydAPI.setSetting('provider', settings.provider);
        if (result && typeof result === 'object' && 'success' in result && !result.success) {
          throw new Error(result.error || 'Failed to save provider');
        }
      }
      // Save core settings (provider, apiKey, endpoint, model) - these are critical
      const coreResults = await Promise.all([
        window.floydAPI.setSetting('apiKey', settings.apiKey),
        window.floydAPI.setSetting('apiEndpoint', settings.apiEndpoint),
        window.floydAPI.setSetting('model', settings.model),
      ]);
      
      // Check for errors in core settings
      for (const result of coreResults) {
        if (result && !result.success) {
          throw new Error(result.error || 'Failed to save setting');
        }
      }
      
      // Save optional settings (don't fail if these error, but log)
      const optionalSettings = [
        { key: 'systemPrompt', value: settings.systemPrompt },
        { key: 'workingDirectory', value: settings.workingDirectory },
        { key: 'allowedTools', value: settings.allowedTools },
        { key: 'mcpServers', value: settings.mcpServers },
        { key: 'theme', value: settings.theme },
        { key: 'autoSave', value: settings.autoSave },
        { key: 'extensionAutoConnect', value: settings.extensionAutoConnect },
        { key: 'extensionPort', value: settings.extensionPort },
        { key: 'showTokenCount', value: settings.showTokenCount },
        { key: 'showTimestamps', value: settings.showTimestamps },
        { key: 'streamResponses', value: settings.streamResponses },
        { key: 'confirmDestructive', value: settings.confirmDestructive },
        { key: 'maxContextFiles', value: settings.maxContextFiles },
      ];
      
      for (const { key, value } of optionalSettings) {
        if (value !== undefined) {
          try {
            await window.floydAPI.setSetting(key, value);
          } catch (err) {
            console.warn(`Failed to save ${key}:`, err);
          }
        }
      }

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Clear save message when closing
    setSaveMessage('');
    onClose();
  };

  const handleProviderChange = (providerId: ProviderId) => {
    console.log('[SettingsModal] Provider changed to:', providerId);
    const provider = getProvider(providerId);
    console.log('[SettingsModal] Provider config:', provider.name, provider.endpoint, provider.models.length, 'models');
    
    const newSettings = {
      ...settings,
      provider: providerId,
      apiEndpoint: provider.endpoint,
    };
    
    // If current model isn't in the new provider's models, use the first one
    const modelExists = provider.models.some(m => m.id === settings.model);
    if (!modelExists && provider.models.length > 0) {
      newSettings.model = provider.models[0].id;
      console.log('[SettingsModal] Model changed to:', newSettings.model);
    }
    
    console.log('[SettingsModal] New settings:', { provider: newSettings.provider, endpoint: newSettings.apiEndpoint, model: newSettings.model });
    setSettings(newSettings);
  };

  // Get current provider's models - useMemo to ensure it updates when provider changes
  const availableModels = useMemo(() => {
    const currentProvider = settings.provider || DEFAULT_PROVIDER;
    const providerConfig = getProvider(currentProvider);
    console.log('[SettingsModal] Computing availableModels for provider:', currentProvider, 'models:', providerConfig.models.length);
    return providerConfig.models;
  }, [settings.provider]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Tabs.Root defaultValue="api" className="flex flex-col flex-1 min-h-0">
              <Tabs.List className="flex gap-1 border-b border-slate-700 mb-4">
                <Tabs.Trigger
                  value="general"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  General
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="api"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  API
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="projects"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  Projects
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="mcp"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  MCP
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="extensions"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  Extensions
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="keyboard"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  Keyboard
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="advanced"
                  className="px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-colors"
                >
                  Advanced
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto">
                <Tabs.Content value="general" className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Theme</label>
                    <select
                      value={settings.theme || 'dark'}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'dark' | 'light' | 'system' })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-100"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.autoSave !== false}
                        onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Auto-save sessions</span>
                    </label>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="api" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-provider`} className="block text-sm font-medium text-slate-300">
                      Provider
                    </label>
                    <select
                      id={`${formId}-provider`}
                      value={settings.provider || DEFAULT_PROVIDER}
                      onChange={(e) => handleProviderChange(e.target.value as ProviderId)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-100"
                    >
                      {getProviderIds().map((id) => (
                        <option key={id} value={id}>
                          {PROVIDERS[id].name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">Select the AI provider to use.</p>
                  </div>
                  <SettingField
                    id={`${formId}-api-key`}
                    label="API Key"
                    value={settings.apiKey}
                    onChange={(value) => setSettings({ ...settings, apiKey: value })}
                    type="password"
                    placeholder="Enter your API key"
                    description="Your API key for accessing the AI service."
                  />
                  <SettingField
                    id={`${formId}-api-endpoint`}
                    label="API Endpoint"
                    value={settings.apiEndpoint}
                    onChange={(value) => setSettings({ ...settings, apiEndpoint: value })}
                    type="text"
                    placeholder="https://api.anthropic.com"
                    description="The API endpoint to use for requests. Auto-filled when you select a provider."
                  />
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-model`} className="block text-sm font-medium text-slate-300">
                      Model
                    </label>
                    <div className="relative">
                      <select
                        id={`${formId}-model`}
                        value={settings.model}
                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-100"
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-slate-400">The AI model to use for this provider.</p>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="projects" className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`${formId}-working-directory`} className="block text-sm font-medium text-slate-300">
                      Default Working Directory
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`${formId}-working-directory`}
                        type="text"
                        value={settings.workingDirectory || ''}
                        onChange={(e) => setSettings({ ...settings, workingDirectory: e.target.value })}
                        placeholder="/path/to/workspace"
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-100 placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const selected = await window.floydAPI.selectWorkingDirectory();
                          if (selected) {
                            setSettings({ ...settings, workingDirectory: selected });
                          }
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors"
                      >
                        Browse
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Choose the default folder Floyd can access for file operations.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.maxContextFiles ? settings.maxContextFiles > 0 : false}
                        onChange={(e) => setSettings({ ...settings, maxContextFiles: e.target.checked ? 10 : 0 })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Watch project files for changes</span>
                    </label>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="mcp" className="h-full">
                  <div className="h-[400px]">
                    <MCPSettings />
                  </div>
                </Tabs.Content>

                <Tabs.Content value="extensions" className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.extensionAutoConnect !== false}
                        onChange={(e) => setSettings({ ...settings, extensionAutoConnect: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Auto-connect to Chrome extension</span>
                    </label>
                    <p className="text-xs text-slate-400">Automatically connect to Floyd Chrome Extension when available.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Extension Port</label>
                    <input
                      type="number"
                      value={settings.extensionPort || 8765}
                      onChange={(e) => setSettings({ ...settings, extensionPort: parseInt(e.target.value) || 8765 })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-100"
                    />
                    <p className="text-xs text-slate-400">WebSocket port for Chrome extension connection.</p>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="keyboard" className="space-y-4">
                  <div className="text-sm text-slate-400">
                    Keyboard shortcuts configuration coming soon.
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">New Session</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd+N</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Open Project</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd+O</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Settings</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd+,</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Toggle Sidebar</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd+/</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Send Message</span>
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Cmd+Enter</kbd>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.showTokenCount !== false}
                        onChange={(e) => setSettings({ ...settings, showTokenCount: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Show token count</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.showTimestamps === true}
                        onChange={(e) => setSettings({ ...settings, showTimestamps: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Show timestamps</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.streamResponses !== false}
                        onChange={(e) => setSettings({ ...settings, streamResponses: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Stream responses</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.confirmDestructive === true}
                        onChange={(e) => setSettings({ ...settings, confirmDestructive: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-slate-300">Confirm destructive actions</span>
                    </label>
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className={cn(
              'text-sm text-center py-2 rounded-lg mt-4',
              saveMessage.includes('success') ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
            )}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              isSaving || isLoading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            )}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SettingFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password';
  placeholder: string;
  description: string;
}

function SettingField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  description,
}: SettingFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-slate-100 placeholder:text-slate-500"
      />
      <p className="text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}
