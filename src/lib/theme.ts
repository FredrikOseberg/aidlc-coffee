import { useCallback, useEffect, useState } from 'react';
import { track } from './analytics';

export type Theme = 'light' | 'dark';

/** The customer's saved choice on this device. Kept when the flag goes off, so it comes back with the flag. */
const CHOICE_KEY = 'kc.theme';
/** Set only while coffee-dark-mode is on; the pre-paint script in index.html reads it before Unleash can. */
const ENABLED_KEY = 'kc.themeEnabled';
const DARK_QUERY = '(prefers-color-scheme: dark)';

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

function storedChoice(): Theme | null {
  const value = read(CHOICE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

function systemTheme(): Theme {
  try {
    return matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Applies the theme while `enabled` (the coffee-dark-mode flag). Flags read as off until they load,
 * so nothing is cleared until `ready`; otherwise flag-on users would flash light on every load.
 */
export function useTheme(enabled: boolean, ready: boolean): { theme: Theme; toggle: () => void } {
  const [choice, setChoice] = useState<Theme | null>(storedChoice);
  const [system, setSystem] = useState<Theme>(systemTheme);
  const theme = choice ?? system;

  // Follow the phone's setting live until the customer picks a theme themselves.
  useEffect(() => {
    if (!enabled || choice) return;
    try {
      const query = matchMedia(DARK_QUERY);
      const onChange = () => setSystem(query.matches ? 'dark' : 'light');
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    } catch {
      return;
    }
  }, [enabled, choice]);

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
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setChoice(next);
    write(CHOICE_KEY, next);
    track('theme_changed', undefined, { theme: next, source: 'toggle' });
  }, [theme]);

  return { theme, toggle };
}
