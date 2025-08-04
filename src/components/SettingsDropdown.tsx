import React, { useState, useEffect, useRef } from 'react';
import { Gear, CheckCircle, Clock, XCircle, CaretDown } from '@phosphor-icons/react';

interface SelfImprovementSettings {
  isEnabled: boolean;
  mode: 'auto' | 'manual' | 'disabled';
  promptInterval: number;
}

interface SettingsDropdownProps {
  className?: string;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SelfImprovementSettings>({
    isEnabled: false,
    mode: 'manual',
    promptInterval: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const response = await fetch('/api/self-improvement/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || 'Failed to load settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SelfImprovementSettings>) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }
      
      const updatedSettings = { ...settings, ...newSettings };
      
      const response = await fetch('/api/self-improvement/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'auto':
        return <CheckCircle size={16} className="text-green-500" weight="fill" />;
      case 'manual':
        return <Clock size={16} className="text-yellow-500" weight="fill" />;
      case 'disabled':
        return <XCircle size={16} className="text-red-500" weight="fill" />;
      default:
        return <Clock size={16} className="text-gray-500" weight="fill" />;
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'auto':
        return `Automatically improve every ${settings.promptInterval} prompts`;
      case 'manual':
        return `Show approval popup every ${settings.promptInterval} prompts`;
      case 'disabled':
        return 'Self-improvement is disabled';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center space-x-1"
        title="Self-Improvement Settings"
      >
        <Gear size={20} />
        <CaretDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Gear size={20} />
              <span>Self-Improving Agent</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure how your AI agents evolve and improve over time
            </p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Loading settings...</span>
              </div>
            ) : (
              <>
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Enable Self-Improvement
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Allow agents to analyze conversations and improve their prompts
                    </p>
                  </div>
                  <button
                    onClick={() => updateSettings({ isEnabled: !settings.isEnabled })}
                    className={`ml-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      settings.isEnabled
                        ? 'bg-gray-900 dark:bg-white focus:ring-gray-900 dark:focus:ring-white'
                        : 'bg-gray-200 dark:bg-gray-700 focus:ring-gray-300 dark:focus:ring-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                        settings.isEnabled 
                          ? 'translate-x-6 bg-white dark:bg-black' 
                          : 'translate-x-1 bg-white dark:bg-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {settings.isEnabled && (
                  <>
                    {/* Mode Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Improvement Mode
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'auto', label: 'Automatic', description: 'Apply improvements automatically' },
                          { value: 'manual', label: 'Manual Approval', description: 'Ask for permission before applying' },
                          { value: 'disabled', label: 'Analyze Only', description: 'Show suggestions but don\'t apply' },
                        ].map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => updateSettings({ mode: mode.value as any })}
                            className={`w-full p-3 rounded-lg border text-left transition-colors duration-200 ${
                              settings.mode === mode.value
                                ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-black'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {getModeIcon(mode.value)}
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${
                                  settings.mode === mode.value
                                    ? 'text-white dark:text-black'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {mode.label}
                                </div>
                                <div className={`text-xs ${
                                  settings.mode === mode.value
                                    ? 'text-white/70 dark:text-black/70'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {mode.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prompt Interval */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Analysis Frequency
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Every</span>
                        <select
                          value={settings.promptInterval}
                          onChange={(e) => updateSettings({ promptInterval: parseInt(e.target.value) })}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                        >
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                        </select>
                        <span className="text-sm text-gray-600 dark:text-gray-400">prompts</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {getModeDescription(settings.mode)}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};