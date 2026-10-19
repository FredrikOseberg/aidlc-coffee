import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Menu } from './components/Menu';
import { CartPanel } from './components/CartPanel';
import { Checkout } from './components/Checkout';
import { Confirmation } from './components/Confirmation';
import { track } from './lib/analytics';
import { useCart } from './lib/cart';
import type { Order } from './lib/orders';

type View = { name: 'menu' } | { name: 'checkout' } | { name: 'done'; order: Order };

export default function App() {
  const cart = useCart();
  const [view, setView] = useState<View>({ name: 'menu' });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (view.name === 'menu') track('view_menu');
  }, [view.name]);

  return (
    <div className="shell">
      <Header count={cart.count} onCart={() => setCartOpen(true)} onHome={() => setView({ name: 'menu' })} />
      <main className="page">
        {view.name === 'menu' && <Menu onAdd={(id) => cart.dispatch({ type: 'add', itemId: id })} />}
        {view.name === 'checkout' && (
          <Checkout
            cart={cart}
            onBack={() => setView({ name: 'menu' })}
            onPlaced={(order) => {
              cart.dispatch({ type: 'clear' });
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
