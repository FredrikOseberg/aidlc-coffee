import type { CartLine } from './cart';

export type Order = { id: string; placedAt: string; lines: CartLine[]; totalCents: number; pickupName: string };

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
