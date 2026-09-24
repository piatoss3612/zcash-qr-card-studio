import "./card-type-nav.css";

export function CardTypeNav({ current }) {
  return (
    <nav className="card-type-nav" aria-label="Card type">
      <a href="./" title="Embed cards in README and websites" aria-current={current === "embed" ? "page" : undefined}>
        Embed
      </a>
      <a href="./print" title="Print A6 cards" aria-current={current === "print" ? "page" : undefined}>
        Print
      </a>
    </nav>
  );
}
