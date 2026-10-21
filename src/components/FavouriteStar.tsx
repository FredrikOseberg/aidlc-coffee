/** ☆/★ toggle on a menu card or favourites chip. Only rendered when coffee-favourite-drinks is on. */
export function FavouriteStar({ name, on, onToggle }: { name: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`fav-star ${on ? 'on' : ''}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <span aria-hidden="true">{on ? '★' : '☆'}</span>
    </button>
  );
}
