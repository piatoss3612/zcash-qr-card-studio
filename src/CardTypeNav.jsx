import "./card-type-nav.css";

export function CardTypeNav({ current }) {
  return (
    <nav className="card-type-nav" aria-label="Card type">
      <a href="./" aria-current={current === "print" ? "page" : undefined}>
        Print <span>· A6</span>
      </a>
      <a href="./online.html" aria-current={current === "embed" ? "page" : undefined}>
        Embed <span>· README &amp; Web</span>
      </a>
    </nav>
  );
}
