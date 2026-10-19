import { formatPrice, itemById } from '../data/menu';
import { track } from '../lib/analytics';
import type { useCart } from '../lib/cart';

type Props = { open: boolean; cart: ReturnType<typeof useCart>; onClose: () => void; onCheckout: () => void };

export function CartPanel({ open, cart, onClose, onCheckout }: Props) {
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="cart-panel" aria-label="Cart">
        <div className="cart-head">
          <h2>Your order</h2>
          <button className="link" onClick={onClose}>Close</button>
        </div>
        {cart.lines.length === 0 && <p className="muted">Nothing here yet.</p>}
        <ul className="lines">
          {cart.lines.map((l) => {
            const item = itemById(l.itemId);
            if (!item) return null;
            return (
              <li key={l.itemId}>
                <span>{item.emoji} {item.name}</span>
                <span className="qty">
                  <button
                    className="qty-btn"
                    onClick={() => {
                      cart.dispatch({ type: 'remove', itemId: l.itemId });
                      track('remove_from_cart', item.priceCents, { itemId: l.itemId });
                    }}
                    aria-label={`Remove one ${item.name}`}
                  >
                    −
                  </button>
                  {l.quantity}
                  <button className="qty-btn" onClick={() => cart.dispatch({ type: 'add', itemId: l.itemId })} aria-label={`Add one ${item.name}`}>+</button>
                </span>
                <span className="price">{formatPrice(item.priceCents * l.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <div className="total">
          <span>Total</span>
          <strong>{formatPrice(cart.totalCents)}</strong>
        </div>
        <button className="primary" disabled={cart.lines.length === 0} onClick={onCheckout}>Checkout</button>
      </aside>
    </>
  );
}
