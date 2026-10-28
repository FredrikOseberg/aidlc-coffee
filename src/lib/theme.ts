import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** The customer's saved choice on this device. */
const CHOICE_KEY = 'kc.theme';
/** Set only while coffee-dark-mode is on; the pre-paint script in index.html reads it before Unleash can. */
const ENABLED_KEY = 'kc.themeEnabled';

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode: the theme just isn't remembered.
  }
}

function storedChoice(): Theme {
  const value = read(CHOICE_KEY);
  return value === 'dark' ? 'dark' : 'light';
}

/**
 * Applies the theme while `enabled` (the coffee-dark-mode flag). Flags read as off until they load,
 * so nothing is cleared until `ready`; otherwise flag-on users would flash light on every load.
 */
export function useTheme(enabled: boolean, ready: boolean): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(storedChoice);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.dataset.theme = theme;
      write(ENABLED_KEY, '1');
    } else if (ready) {
      delete root.dataset.theme;
      write(ENABLED_KEY, null);
    }
  }, [enabled, ready, theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      write(CHOICE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
