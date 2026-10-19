import { useEffect, useReducer } from 'react';
import { itemById } from '../data/menu';

export type CartLine = { itemId: string; quantity: number };
type Action = { type: 'add'; itemId: string } | { type: 'remove'; itemId: string } | { type: 'clear' };

function reducer(lines: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const line = lines.find((l) => l.itemId === action.itemId);
      return line ? lines.map((l) => (l === line ? { ...l, quantity: l.quantity + 1 } : l)) : [...lines, { itemId: action.itemId, quantity: 1 }];
    }
    case 'remove':
      return lines.flatMap((l) => (l.itemId !== action.itemId ? [l] : l.quantity > 1 ? [{ ...l, quantity: l.quantity - 1 }] : []));
    case 'clear':
      return [];
  }
}

function load(): CartLine[] {
  try {
    return JSON.parse(localStorage.getItem('kc.cart') ?? '[]') as CartLine[];
  } catch {
    return [];
  }
}

export function useCart() {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem('kc.cart', JSON.stringify(lines));
    } catch {
      /* private mode */
    }
  }, [lines]);
  const totalCents = lines.reduce((sum, l) => sum + (itemById(l.itemId)?.priceCents ?? 0) * l.quantity, 0);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return { lines, totalCents, count, dispatch };
}
