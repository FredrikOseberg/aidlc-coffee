import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { CartPanel } from './components/CartPanel';
import { Checkout } from './components/Checkout';
import { Confirmation } from './components/Confirmation';
import { UsualCard } from './components/UsualCard';
import { track } from './lib/analytics';
import { useCart } from './lib/cart';
import { useDarkMode, useFlagsReady, useReorderUsual } from './lib/flags';
import { lastOrder, type Order, type Usual } from './lib/orders';
import { useTheme } from './lib/theme';

type View = { name: 'menu' } | { name: 'checkout' } | { name: 'done'; order: Order };

export default function App() {
  const cart = useCart();
  const [view, setView] = useState<View>({ name: 'menu' });
  const [cartOpen, setCartOpen] = useState(false);
  const reorderOn = useReorderUsual();
  const [fromReorder, setFromReorder] = useState(false);
  const darkOn = useDarkMode();
  const { theme, toggle } = useTheme(darkOn, useFlagsReady());

  // With dark mode on, re-fires once the flag resolves so the session is counted with its theme (darkSessionShare).
  // `theme` is deliberately not a dependency: toggling it isn't a new menu view.
  useEffect(() => {
    if (view.name !== 'menu') return;
    if (darkOn) track('view_menu', undefined, { theme });
    else track('view_menu');
  }, [view.name, darkOn]);

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
      <Header
        count={cart.count}
        onCart={() => setCartOpen(true)}
        onHome={() => setView({ name: 'menu' })}
        theme={darkOn ? theme : undefined}
        onToggleTheme={darkOn ? toggle : undefined}
      />
      <main className="page">
        {view.name === 'menu' && (
          <Menu
            onAdd={(id) => cart.dispatch({ type: 'add', itemId: id })}
            banner={usual ? <UsualCard usual={usual} onReorder={() => reorder(usual)} /> : undefined}
          />
        )}
        {view.name === 'checkout' && (
          <Checkout
            cart={cart}
            source={reorderOn && fromReorder ? 'reorder' : undefined}
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
