import { isMac } from '@renderer/config/constant'
import { useSettings } from '@renderer/hooks/useSettings'
import { ThemeMode } from '@renderer/types'
import { IpcChannel } from '@shared/IpcChannel'
import React, { createContext, PropsWithChildren, use, useEffect, useState } from 'react'

interface ThemeContextType {
  theme: ThemeMode
  settingTheme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeMode.auto,
  settingTheme: ThemeMode.auto,
  toggleTheme: () => {}
})

interface ThemeProviderProps extends PropsWithChildren {
  defaultTheme?: ThemeMode
}

// Define a helper to check for Electron renderer environment
const isElectronRenderer = () =>
  typeof window !== 'undefined' &&
  typeof window.electron !== 'undefined' &&
  typeof window.electron.ipcRenderer !== 'undefined';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme }) => {
  const { theme, setTheme } = useSettings();
  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  const toggleTheme = () => {
    switch (theme) {
      case ThemeMode.light:
        setTheme(ThemeMode.dark);
        break;
      case ThemeMode.dark:
        setTheme(ThemeMode.auto);
        break;
      case ThemeMode.auto:
        setTheme(ThemeMode.light);
        break;
    }
  };

  useEffect(() => {
    // Only attempt to set theme via API if in Electron environment and window.api is available
    if (isElectronRenderer() && window.api?.setTheme) {
      window.api.setTheme(defaultTheme || theme);
    }
  }, [defaultTheme, theme]);

  useEffect(() => {
    document.body.setAttribute('theme-mode', effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    document.body.setAttribute('os', isMac ? 'mac' : 'windows');

    let themeChangeListenerRemover: (() => void) | undefined;

    // Only register IPC listener if in Electron environment and ipcRenderer is available
    if (isElectronRenderer() && window.electron.ipcRenderer) {
      themeChangeListenerRemover = window.electron.ipcRenderer.on(
        IpcChannel.ThemeChange,
        (_: any, realTheam: ThemeMode) => {
          setEffectiveTheme(realTheam);
        }
      );
    }

    return () => {
      // Only attempt to remove listener if it was registered
      if (themeChangeListenerRemover) {
        themeChangeListenerRemover();
      }
    };
  }, []); // Empty dependency array to run once on mount and clean up on unmount

  // Add useEffect to sync effectiveTheme with theme setting
  useEffect(() => {
    setEffectiveTheme(theme);
  }, [theme]);

  return <ThemeContext value={{ theme: effectiveTheme, settingTheme: theme, toggleTheme }}>{children}</ThemeContext>;
};

export const useTheme = () => use(ThemeContext);
