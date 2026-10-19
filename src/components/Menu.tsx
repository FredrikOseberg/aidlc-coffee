import { useState } from 'react';
import { CATEGORIES, MENU, formatPrice, type Category } from '../data/menu';
import { track } from '../lib/analytics';

type Props = { onAdd: (itemId: string) => void };

export function Menu({ onAdd }: Props) {
  const [category, setCategory] = useState<Category>('coffee');
  const [added, setAdded] = useState<string | null>(null);

  const add = (id: string, priceCents: number) => {
    onAdd(id);
    track('add_to_cart', priceCents, { itemId: id });
    setAdded(id);
    setTimeout(() => setAdded((a) => (a === id ? null : a)), 1200);
  };

  return (
    <section>
      <h1 className="page-title">What can we make you?</h1>
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
              <h2>{item.name}</h2>
              <p>{item.description}</p>
            </div>
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
