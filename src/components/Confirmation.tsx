import { formatPrice } from '../data/menu';
import type { Order } from '../lib/orders';

export function Confirmation({ order, onNew }: { order: Order; onNew: () => void }) {
  return (
    <section className="confirmation">
      <div className="check">✓</div>
      <h1 className="page-title">Thanks, {order.pickupName}!</h1>
      <p className="muted">Order {order.id} · {formatPrice(order.totalCents)} · ready in about 5 minutes.</p>
      <button className="primary" onClick={onNew}>Order something else</button>
    </section>
  );
}
