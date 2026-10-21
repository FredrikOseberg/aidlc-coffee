import { useId, useState } from 'react';
import { ALLERGEN_LABEL, ALLERGENS_SIGNED_OFF, CROSS_CONTACT_NOTE, allergensFor } from '../data/allergens';
import { track } from '../lib/analytics';

/** Tap-to-open allergen list on a menu card. Only rendered when coffee-allergen-info is on. */
export function AllergenInfo({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const allergens = allergensFor(itemId);

  const toggle = () => {
    if (!open) track('allergen_info_viewed', undefined, { itemId });
    setOpen(!open);
  };

  return (
    <div className="allergens">
      <button type="button" className="link allergen-toggle" aria-expanded={open} aria-controls={panelId} onClick={toggle}>
        Allergens <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      <div id={panelId} className="allergen-panel" hidden={!open}>
        {allergens === null ? (
          <p className="allergen-list">No allergen information for this item yet. Please ask a barista.</p>
        ) : allergens.length ? (
          <ul className="allergen-list">
            {allergens.map((a) => (
              <li key={a}>{ALLERGEN_LABEL[a]}</li>
            ))}
          </ul>
        ) : (
          <p className="allergen-list">None of the 14 major allergens</p>
        )}
        <p className="allergen-note">{CROSS_CONTACT_NOTE}</p>
        {!ALLERGENS_SIGNED_OFF && <p className="allergen-placeholder">Placeholder: pending kitchen sign-off</p>}
      </div>
    </div>
  );
}
