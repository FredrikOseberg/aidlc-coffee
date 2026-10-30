import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { CartPanel } from './components/CartPanel';
import { Checkout } from './components/Checkout';
import { Confirmation } from './components/Confirmation';
import { UsualCard } from './components/UsualCard';
import { track } from './lib/analytics';
import { useCart } from './lib/cart';
import { useFavourites } from './lib/favourites';
import { useAllergenInfo, useFavouriteDrinks, useReorderUsual, useScheduledPickup } from './lib/flags';
import { lastOrder, type Order, type Usual } from './lib/orders';

type View = { name: 'menu' } | { name: 'checkout' } | { name: 'done'; order: Order };

export default function App() {
  const cart = useCart();
  const [view, setView] = useState<View>({ name: 'menu' });
  const [cartOpen, setCartOpen] = useState(false);
  const reorderOn = useReorderUsual();
  const [fromReorder, setFromReorder] = useState(false);
  const allergensOn = useAllergenInfo();
  const favouritesOn = useFavouriteDrinks();
  const favourites = useFavourites(favouritesOn);
  const scheduledPickupOn = useScheduledPickup();

  useEffect(() => {
    if (view.name === 'menu') track('view_menu');
  }, [view.name]);

  // Re-read on every return to the menu so a just-placed order becomes the usual.
  const usual = useMemo(() => (reorderOn && view.name === 'menu' ? lastOrder() : null), [reorderOn, view.name]);

  useEffect(() => {
    if (cart.count === 0) setFromReorder(false);
  }, [cart.count]);

  const reorder = (u: Usual) => {
    cart.dispatch({ type: 'addLines', lines: u.lines });
    track('reorder_used', u.totalCents, { items: u.lines.reduce((n, l) => n + l.quantity, 0), skipped: u.skipped.length });
    setFromReorder(true);
    setCartOpen(true);
  };

  return (
    <div className="shell">
      <Header count={cart.count} onCart={() => setCartOpen(true)} onHome={() => setView({ name: 'menu' })} />
      <main className="page">
        {view.name === 'menu' && (
          <Menu
            onAdd={(id) => cart.dispatch({ type: 'add', itemId: id })}
            banner={usual ? <UsualCard usual={usual} onReorder={() => reorder(usual)} /> : undefined}
            showAllergens={allergensOn}
            favourites={favouritesOn ? favourites : undefined}
          />
        )}
        {view.name === 'checkout' && (
          <Checkout
            cart={cart}
            source={reorderOn && fromReorder ? 'reorder' : undefined}
            scheduledPickupOn={scheduledPickupOn}
            onBack={() => setView({ name: 'menu' })}
            onPlaced={(order) => {
              cart.dispatch({ type: 'clear' });
              setFromReorder(false);
              setView({ name: 'done', order });
            }}
          />
        )}
        {view.name === 'done' && <Confirmation order={view.order} onNew={() => setView({ name: 'menu' })} />}
      </main>
      <CartPanel
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setView({ name: 'checkout' });
        }}
      />
      <footer className="footer">Kettle &amp; Crane is a demo shop for ai-dlc. No real orders are placed.</footer>
    </div>
  );
}
