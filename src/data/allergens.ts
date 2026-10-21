/** The 14 major allergens (UK/EU). A typo here or in ALLERGENS fails the typecheck. */
export type Allergen =
  | 'celery'
  | 'gluten'
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'lupin'
  | 'milk'
  | 'molluscs'
  | 'mustard'
  | 'tree-nuts'
  | 'peanuts'
  | 'sesame'
  | 'soya'
  | 'sulphites';

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  celery: 'Celery',
  gluten: 'Cereals containing gluten',
  crustaceans: 'Crustaceans',
  eggs: 'Eggs',
  fish: 'Fish',
  lupin: 'Lupin',
  milk: 'Milk',
  molluscs: 'Molluscs',
  mustard: 'Mustard',
  'tree-nuts': 'Tree nuts',
  peanuts: 'Peanuts',
  sesame: 'Sesame',
  soya: 'Soya',
  sulphites: 'Sulphur dioxide and sulphites',
};

/** Every id in MENU (src/data/menu.ts). Add new menu items here too, or the item shows "ask a barista" instead of a list. */
type MenuItemId =
  | 'espresso' | 'flat-white' | 'cappuccino' | 'oat-latte' | 'cold-brew'
  | 'chai' | 'matcha' | 'croissant' | 'cardamom-bun' | 'banana-bread';

/**
 * PLACEHOLDER DATA, inferred from the menu descriptions only. Not authoritative.
 * The kitchen lead must sign off every list before ALLERGENS_SIGNED_OFF flips to true
 * and before coffee-allergen-info is rolled out in production.
 */
export const ALLERGENS: Record<MenuItemId, Allergen[]> = {
  espresso: [],
  'flat-white': ['milk'],
  cappuccino: ['milk'],
  'oat-latte': ['gluten'],
  'cold-brew': [],
  chai: ['milk'],
  matcha: ['milk'],
  croissant: ['gluten', 'milk', 'eggs'],
  'cardamom-bun': ['gluten', 'milk', 'eggs'],
  'banana-bread': ['gluten', 'eggs', 'milk', 'tree-nuts'],
};

/** Only the kitchen lead's sign-off may flip this. While false the panel says the data is a placeholder. */
export const ALLERGENS_SIGNED_OFF = false;

export const CROSS_CONTACT_NOTE =
  'Made in a shared kitchen, so any item may contain traces of other allergens. Please ask a barista if you have a severe allergy.';

/** Null for an id with no entry, so the UI never claims "none" for an item it knows nothing about. */
export const allergensFor = (itemId: string): Allergen[] | null =>
  Object.hasOwn(ALLERGENS, itemId) ? ALLERGENS[itemId as MenuItemId] : null;
