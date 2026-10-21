import { useState, type ReactNode } from 'react';
import { CATEGORIES, MENU, formatPrice, type Category } from '../data/menu';
import { track } from '../lib/analytics';
import type { Favourites } from '../lib/favourites';
import { AllergenInfo } from './AllergenInfo';
import { FavouriteStar } from './FavouriteStar';
import { FavouritesRow } from './FavouritesRow';

/**
 * `banner` renders between the title and the category tabs. `showAllergens` is coffee-allergen-info and `favourites`
 * is only passed when coffee-favourite-drinks is on, both read in App.tsx.
 */
type Props = { onAdd: (itemId: string) => void; banner?: ReactNode; showAllergens?: boolean; favourites?: Favourites };

export function Menu({ onAdd, banner, showAllergens, favourites }: Props) {
  const [category, setCategory] = useState<Category>('coffee');
  const [added, setAdded] = useState<string | null>(null);

  const add = (id: string, priceCents: number, source?: 'favourites') => {
    onAdd(id);
    track('add_to_cart', priceCents, source ? { itemId: id, source } : { itemId: id });
    setAdded(id);
    setTimeout(() => setAdded((a) => (a === id ? null : a)), 1200);
  };

  return (
    <section>
      <h1 className="page-title">What can we make you?</h1>
      {banner}
      {favourites && <FavouritesRow favourites={favourites} added={added} onAdd={(item) => add(item.id, item.priceCents, 'favourites')} />}
      <nav className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`tab ${c.id === category ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </nav>
      <div className="grid">
        {MENU.filter((m) => m.category === category).map((item) => (
          <article key={item.id} className="item">
            <div className="item-emoji">{item.emoji}</div>
            <div className="item-body">
              {favourites ? (
                <div className="item-head">
                  <h2>{item.name}</h2>
                  <FavouriteStar name={item.name} on={favourites.isFavourite(item.id)} onToggle={() => favourites.toggle(item.id)} />
                </div>
              ) : (
                <h2>{item.name}</h2>
              )}
              <p>{item.description}</p>
            </div>
            {showAllergens && <AllergenInfo itemId={item.id} />}
            <div className="item-foot">
              <span className="price">{formatPrice(item.priceCents)}</span>
              <button className={`add ${added === item.id ? 'added' : ''}`} onClick={() => add(item.id, item.priceCents)}>
                {added === item.id ? 'Added' : 'Add'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
