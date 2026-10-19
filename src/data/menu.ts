export type Category = 'coffee' | 'tea' | 'bakery';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: Category;
  emoji: string;
};

export const MENU: MenuItem[] = [
  { id: 'espresso', name: 'Espresso', description: 'Double shot, chocolate and cherry notes.', priceCents: 300, category: 'coffee', emoji: '☕' },
  { id: 'flat-white', name: 'Flat white', description: 'Velvety microfoam over a double ristretto.', priceCents: 420, category: 'coffee', emoji: '🥛' },
  { id: 'cappuccino', name: 'Cappuccino', description: 'Equal parts espresso, milk and foam.', priceCents: 400, category: 'coffee', emoji: '☕' },
  { id: 'oat-latte', name: 'Oat latte', description: 'Silky oat milk, house espresso.', priceCents: 460, category: 'coffee', emoji: '🌾' },
  { id: 'cold-brew', name: 'Cold brew', description: 'Steeped 18 hours, served over ice.', priceCents: 450, category: 'coffee', emoji: '🧊' },
  { id: 'chai', name: 'Chai latte', description: 'Spiced black tea with steamed milk.', priceCents: 430, category: 'tea', emoji: '🫖' },
  { id: 'matcha', name: 'Matcha latte', description: 'Ceremonial grade, lightly sweet.', priceCents: 480, category: 'tea', emoji: '🍵' },
  { id: 'croissant', name: 'Butter croissant', description: 'Baked this morning.', priceCents: 320, category: 'bakery', emoji: '🥐' },
  { id: 'cardamom-bun', name: 'Cardamom bun', description: 'Swedish-style, pearl sugar on top.', priceCents: 380, category: 'bakery', emoji: '🥯' },
  { id: 'banana-bread', name: 'Banana bread', description: 'Thick slice, walnuts, a little salt.', priceCents: 350, category: 'bakery', emoji: '🍌' },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'bakery', label: 'Bakery' },
];

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export const itemById = (id: string) => MENU.find((m) => m.id === id);
