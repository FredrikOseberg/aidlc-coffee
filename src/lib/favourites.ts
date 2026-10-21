import { useCallback, useEffect, useState } from 'react';
import { track } from './analytics';
import { userId } from './identity';

export type Favourites = { ids: string[]; isFavourite: (id: string) => boolean; toggle: (id: string) => void };

const KEY = `kc.favourites.${userId}`;

/** Starred item ids, oldest first. Anything that isn't an array of strings reads as empty; never throws. */
function load(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw) || !raw.every((id): id is string => typeof id === 'string')) return [];
    return [...new Set(raw)];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode */
  }
}

/**
 * Favourites kept in the browser per userId. `enabled` is coffee-favourite-drinks, read in App.tsx: while it's off
 * the list is empty and localStorage isn't touched. Ids no longer on the menu stay stored so they come back with the item.
 */
export function useFavourites(enabled: boolean): Favourites {
  const [ids, setIds] = useState<string[]>([]);

  // The flag can resolve after first render, so load when it turns on rather than at mount.
  useEffect(() => {
    setIds(enabled ? load() : []);
  }, [enabled]);

  const toggle = useCallback(
    (id: string) => {
      if (!enabled) return;
      const on = ids.includes(id);
      const next = on ? ids.filter((i) => i !== id) : [...ids, id];
      setIds(next);
      save(next);
      track(on ? 'favourite_removed' : 'favourite_added', undefined, { itemId: id });
    },
    [enabled, ids],
  );

  const isFavourite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, isFavourite, toggle };
}
