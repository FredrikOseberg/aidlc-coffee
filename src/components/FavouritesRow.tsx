import { useEffect, useRef } from 'react';
import { formatPrice, itemById, type MenuItem } from '../data/menu';
import { track } from '../lib/analytics';
import type { Favourites } from '../lib/favourites';
import { FavouriteStar } from './FavouriteStar';

type Props = { favourites: Favourites; added: string | null; onAdd: (item: MenuItem) => void };

/** "Your favourites" chips above the category tabs. Only rendered when coffee-favourite-drinks is on. */
export function FavouritesRow({ favourites, added, onAdd }: Props) {
  // Ids that left the menu are skipped here but kept in storage, so they reappear if the item comes back.
  const items = favourites.ids.map(itemById).filter((i): i is MenuItem => !!i);
  const shown = useRef(false);

  useEffect(() => {
    // Once per menu view; the ref keeps StrictMode's double effect from counting twice.
    if (shown.current) return;
    shown.current = true;
    track('favourites_shown', undefined, { count: items.length });
  }, []);

  return (
    <aside className="favourites" aria-label="Your favourites">
      <h2>Your favourites</h2>
      {items.length === 0 ? (
        <p className="favourites-empty">Tap ☆ on anything to keep it here.</p>
      ) : (
        <ul className="favourites-row">
          {items.map((item) => (
            <li key={item.id} className="fav-chip">
              <span className="fav-chip-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="fav-chip-body">
                <span className="fav-chip-name">{item.name}</span>
                <span className="price">{formatPrice(item.priceCents)}</span>
              </span>
              <button className={`add ${added === item.id ? 'added' : ''}`} onClick={() => onAdd(item)} aria-label={`Add ${item.name} to cart`}>
                {added === item.id ? 'Added' : 'Add'}
              </button>
              <FavouriteStar name={item.name} on onToggle={() => favourites.toggle(item.id)} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
