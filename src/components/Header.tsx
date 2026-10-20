import type { Theme } from '../lib/theme';

type Props = { count: number; onCart: () => void; onHome: () => void; theme?: Theme; onToggleTheme?: () => void };

export function Header({ count, onCart, onHome, theme, onToggleTheme }: Props) {
  return (
    <header className={onToggleTheme ? 'header header-themed' : 'header'}>
      <button className="brand" onClick={onHome}>
        <span className="brand-mark">K&amp;C</span>
        <span className="brand-name">Kettle &amp; Crane</span>
      </button>
      <span className="header-note">Order ahead · pick up in 5 min</span>
      {onToggleTheme && (
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      )}
      <button className="cart-button" onClick={onCart} aria-label={`Cart, ${count} items`}>
        Cart
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </header>
  );
}
