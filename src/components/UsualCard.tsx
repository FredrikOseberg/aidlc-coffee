import { useEffect, useRef, useState } from 'react';
import { formatPrice, itemById } from '../data/menu';
import { track } from '../lib/analytics';
import type { Usual } from '../lib/orders';

type Props = { usual: Usual; onReorder: () => void };

export function UsualCard({ usual, onReorder }: Props) {
  const [added, setAdded] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    // Once per menu view; the ref keeps StrictMode's double effect from counting twice.
    if (shown.current) return;
    shown.current = true;
    track('reorder_shown');
  }, []);

  const reorder = () => {
    onReorder();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const summary = usual.lines.map((l) => `${l.quantity}× ${itemById(l.itemId)?.name ?? l.itemId}`).join(' · ');

  return (
    <aside className="usual">
      <div className="usual-body">
        <h2>Your usual</h2>
        <p className="usual-lines">
          {summary} · <span className="price">{formatPrice(usual.totalCents)}</span>
        </p>
        {usual.skipped.length > 0 && (
          <p className="usual-note">
            {usual.skipped.join(', ')} {usual.skipped.length === 1 ? "isn't" : "aren't"} on the menu today
          </p>
        )}
      </div>
      <button className={`add ${added ? 'added' : ''}`} onClick={reorder} disabled={added} aria-label="Reorder your usual">
        {added ? 'Added' : 'Reorder'}
      </button>
    </aside>
  );
}
