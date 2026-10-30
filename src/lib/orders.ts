import { itemById } from '../data/menu';
import type { CartLine } from './cart';

export type Order = {
  id: string;
  placedAt: string;
  lines: CartLine[];
  totalCents: number;
  pickupName: string;
  /** Set only when the scheduled-pickup picker was shown; absent means "as soon as possible" (today's default). */
  pickupSlot?: { startIso: string; label: string };
};

/** Orders are kept in the browser only; this is a demo shop. */
export function saveOrder(order: Order) {
  try {
    const all = JSON.parse(localStorage.getItem('kc.orders') ?? '[]') as Order[];
    localStorage.setItem('kc.orders', JSON.stringify([order, ...all].slice(0, 20)));
  } catch {
    /* private mode */
  }
}

export function pastOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem('kc.orders') ?? '[]') as Order[];
  } catch {
    return [];
  }
}

export type Usual = { lines: CartLine[]; skipped: string[]; totalCents: number };

/** Saved orders keep only item ids, so an item that left the menu is named from its id ("banana-bread" → "Banana bread"). */
const nameFromId = (id: string) => (id.charAt(0).toUpperCase() + id.slice(1)).replace(/-/g, ' ');

/** The newest order, priced at today's menu with items no longer on it left out. Null when there's nothing usable; never throws. */
export function lastOrder(): Usual | null {
  try {
    const all: unknown = pastOrders();
    const newest: unknown = Array.isArray(all) ? all[0] : undefined;
    if (!newest || typeof newest !== 'object' || !Array.isArray((newest as Order).lines)) return null;
    const usual: Usual = { lines: [], skipped: [], totalCents: 0 };
    for (const line of (newest as Order).lines as unknown[]) {
      if (!line || typeof line !== 'object') continue;
      const { itemId, quantity } = line as Partial<CartLine>;
      if (typeof itemId !== 'string' || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) continue;
      const item = itemById(itemId);
      if (!item) {
        usual.skipped.push(nameFromId(itemId));
        continue;
      }
      usual.lines.push({ itemId, quantity });
      usual.totalCents += item.priceCents * quantity;
    }
    return usual.lines.length ? usual : null;
  } catch {
    return null;
  }
}
