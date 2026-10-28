import { useCallback, useEffect, useState } from 'react';
import { track } from './analytics';

export type Theme = 'light' | 'dark';

/** The customer's saved choice on this device. */
const CHOICE_KEY = 'kc.theme';

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: the theme just isn't remembered.
  }
}

function storedChoice(): Theme {
  const value = read(CHOICE_KEY);
  return value === 'dark' ? 'dark' : 'light';
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(storedChoice);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      write(CHOICE_KEY, next);
      track('theme_changed', undefined, { theme: next });
      return next;
    });
  }, []);

  return { theme, toggle };
}
