import { useEffect, useMemo, useRef, useState } from 'react';
import { formatPrice, itemById } from '../data/menu';
import { track } from '../lib/analytics';
import type { useCart } from '../lib/cart';
import { saveOrder, type Order } from '../lib/orders';
import { upcomingSlots } from '../lib/pickupSlots';
import { PickupSlotPicker } from './PickupSlotPicker';

/** `source` tags `order_placed` when the cart came from somewhere other than the menu. */
type Props = {
  cart: ReturnType<typeof useCart>;
  onBack: () => void;
  onPlaced: (order: Order) => void;
  source?: 'reorder';
  scheduledPickupOn?: boolean;
};

export function Checkout({ cart, onBack, onPlaced, source, scheduledPickupOn }: Props) {
  const [name, setName] = useState('');
  const [placing, setPlacing] = useState(false);
  const started = useRef(performance.now());
  const slots = useMemo(() => (scheduledPickupOn ? upcomingSlots(new Date()) : []), [scheduledPickupOn]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(() => (scheduledPickupOn ? slots[0]?.startIso ?? null : null));

  useEffect(() => {
    started.current = performance.now();
    track('checkout_started', cart.totalCents);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    // Stands in for a payment round trip.
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    const pickupSlot = scheduledPickupOn ? slots.find((s) => s.startIso === selectedSlot) : undefined;
    const order: Order = {
      id: `KC-${Date.now().toString(36).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      lines: cart.lines,
      totalCents: cart.totalCents,
      pickupName: name.trim(),
      ...(pickupSlot && { pickupSlot }),
    };
    saveOrder(order);
    track('order_placed', order.totalCents, {
      latencyMs: Math.round(performance.now() - started.current),
      items: cart.count,
      ...(source && { source }),
      ...(pickupSlot && { pickupSlotMinutesAhead: Math.round((new Date(pickupSlot.startIso).getTime() - Date.now()) / 60000) }),
    });
    onPlaced(order);
  };

  return (
    <section className="checkout">
      <button className="link" onClick={onBack}>← Back to menu</button>
      <h1 className="page-title">Checkout</h1>
      <ul className="lines summary">
        {cart.lines.map((l) => {
          const item = itemById(l.itemId);
          return item ? (
            <li key={l.itemId}>
              <span>{l.quantity}× {item.name}</span>
              <span className="price">{formatPrice(item.priceCents * l.quantity)}</span>
            </li>
          ) : null;
        })}
      </ul>
      <div className="total">
        <span>Total</span>
        <strong>{formatPrice(cart.totalCents)}</strong>
      </div>
      <form onSubmit={place} className="checkout-form">
        <label>
          Name for pickup
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" required />
        </label>
        {scheduledPickupOn && <PickupSlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />}
        <button className="primary" disabled={placing || cart.lines.length === 0 || (scheduledPickupOn && !selectedSlot)}>
          {placing ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </section>
  );
}
