type Props = { count: number; onCart: () => void; onHome: () => void };

export function Header({ count, onCart, onHome }: Props) {
  return (
    <header className="header">
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">K&amp;C</span>
        <span className="brand-name">Kettle &amp; Crane</span>
      </button>
      <span className="header-note">Order ahead · pick up in 5 min</span>
      <button className="cart-button" onClick={onCart} aria-label={`Cart, ${count} items`}>
        Cart
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </header>
  );
}
