import { useEffect, useState } from "react";
import {
  DEFAULT_CARD,
  restoreDraft,
  STYLES,
  LAYOUTS,
  CARD_LOGOS,
  COMPANIONS,
  serializeCard,
  parseCard,
  validateCard,
  validateAddress,
  cardLinks,
} from "./card-data.js";
import { renderCard, resizeCompanion, upperBodyCompanion } from "./card-render.js";
import { loadCardAsset, svgUrl, downloadPng, serviceBase } from "./browser.js";
import "./online.css";
import CardPreview, { companionOverlapsQr } from "./CardPreview.jsx";
import { CardTypeNav } from "../CardTypeNav.jsx";

function Icon({ kind = "arrow" }) {
  const paths = {
    arrow: "M7 17 17 7M7 7h10v10",
    phone: "M8 3h8v18H8zM11 18h2",
    moon: "M20 13A8 8 0 0 1 11 4a8 8 0 1 0 9 9",
    card: "M3 5h18v14H3zM6 9h6M6 13h9",
    qr: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h4v4h-6z",
    copy: "M8 8h12v13H8zM16 8V3H3v13h5",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}
function Arrow() {
  return <Icon />;
}

export default function OnlineStudio() {
  const [attempted, setAttempted] = useState(false);
  const [showAllCompanions, setShowAllCompanions] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [draft, setDraft] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("online-card-draft") || "null");
      return restoreDraft(saved);
    } catch {}
    return { ...DEFAULT_CARD };
  });
  const [result, setResult] = useState({
    key: "",
    svg: "",
    card: null,
    error: "",
  });
  const [context, setContext] = useState("light");
  const [readme, setReadme] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [format, setFormat] = useState("markdown");
  const [service, setService] = useState("checking");
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const key = serializeCard(draft);
  const update = (name, value) => {
    setMessage("");
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    try { sessionStorage.setItem("online-card-draft", JSON.stringify(draft)); } catch {}
  }, [draft]);

  useEffect(() => {
    let active = true;
    let generation = 0;
    async function restore() {
      const current = ++generation;
      if (location.hash.length <= 1) return;
      try {
        const card = await parseCard(location.hash.slice(1));
        if (active && current === generation) {
          setDraft(card);
          setMessage("");
        }
      } catch (error) {
        if (active && current === generation)
          setMessage(`Could not restore card: ${error.message}`);
      }
    }
    restore();
    window.addEventListener("hashchange", restore);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(new URL("api/health", serviceBase()), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const value = await response.json();
        if (value.service !== "zcash-support-cards" || value.version !== 1)
          throw new Error();
        if (active) setService("ready");
      })
      .catch(() => {
        if (active) setService("unavailable");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      window.removeEventListener("hashchange", restore);
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        await validateAddress(draft.address);
        if (active) setAddressError("");
      } catch (error) {
        if (active) setAddressError(error.message);
      }
      let card = null;
      let error = "";
      try {
        card = await validateCard(draft);
      } catch (reason) {
        error = reason.message;
      }
      try {
        const svg = await renderCard(card || draft, loadCardAsset, {
          demo: !card,
        });
        if (active) setResult({ key, svg, card, error });
      } catch (reason) {
        if (active)
          setResult({ key, svg: "", card: null, error: reason.message });
      }
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);

  const ready = result.key === key && Boolean(result.card);
  const links = ready
    ? cardLinks(result.card, location.href, serviceBase())
    : null;
  const isLocal =
    ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) ||
    ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(serviceBase()).hostname,
    );
  async function copy(value, success) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(success);
    } catch {
      setMessage(
        "Clipboard access is unavailable. Select and copy the code below.",
      );
    }
  }
  function requireReady() {
    if (ready) return true;
    setAttempted(true);
    const id = !draft.name.trim()
      ? "oc-name"
      : addressError
        ? "oc-address"
        : "oc-payment-details";
    const field = document.getElementById(id);
    if (id === "oc-payment-details") field.open = true;
    field?.focus();
    setMessage(result.error || "Complete your card details first.");
    return false;
  }
  async function exportPng() {
    if (!requireReady()) return;
    setExporting(true);
    try {
      await downloadPng(result.svg, "zcash-support-card.png");
      setMessage(
        "PNG downloaded. Link the image to your payment request on sites that allow zcash: links.",
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="oc-app">
      <header className="oc-topbar">
        <a className="oc-brand" href="./">
          <img src="./assets/vizorcat-icon.png" alt="" width="32" height="32" />
          <span>
            QR Card Studio<span className="oc-brand-note">Made for Zcash</span>
          </span>
        </a>
        <CardTypeNav current="embed" />
        <a
          className="oc-source"
          href="https://github.com/piatoss3612/zcash-qr-card-studio"
          target="_blank"
          rel="noreferrer"
        >
          Open source <Arrow />
        </a>
      </header>
      <div className="oc-page-heading">
        <div>
          <span className="oc-kicker">A SMALL CARD. A DIRECT CONNECTION.</span>
          <h1>Create an embed card.</h1>
          <p>
            Add a Zcash payment card to your README or website.
          </p>
        </div>
        <span className="oc-heading-note">
          Made by you.
          <br />
          Backed by your community.
        </span>
      </div>
      <main className="oc-workspace">
        <section className="oc-controls" aria-label="Card settings">
          <div className="oc-section-title">
            <span>01</span>
            <h2>Your details</h2>
          </div>
          <label className="oc-field">
            Display name
            <input
              id="oc-name"
              aria-invalid={attempted && !draft.name.trim()}
              aria-describedby={
                attempted && !draft.name.trim() ? "oc-name-error" : undefined
              }
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              maxLength={32}
              placeholder="Your name or nickname"
              autoComplete="off"
            />
          </label>
          {attempted && !draft.name.trim() && (
            <p id="oc-name-error" className="oc-field-error">
              Enter your name or handle.
            </p>
          )}
          <label className="oc-field">
            One-line introduction <span className="oc-optional">Optional</span>
            <input
              value={draft.bio}
              onChange={(event) => update("bio", event.target.value)}
              maxLength={80}
              placeholder="Building tools for everyday privacy."
            />
          </label>
          <label className="oc-field">
            Zcash receiving address
            <textarea
              id="oc-address"
              aria-invalid={attempted && Boolean(addressError)}
              value={draft.address}
              onChange={(event) => update("address", event.target.value)}
              rows={2}
              maxLength={1024}
              placeholder="Paste your receiving address"
              spellCheck={false}
              autoComplete="off"
              aria-describedby={
                attempted && addressError
                  ? "oc-address-note oc-address-error"
                  : "oc-address-note"
              }
            />
          </label>
          {attempted && addressError && (
            <p id="oc-address-error" className="oc-field-error">
              {addressError}
            </p>
          )}
          <p id="oc-address-note" className="oc-hint">
            Copy from your wallet. Your address and card details will be public
            when shared.
          </p>
          <div className="oc-section-title">
            <span>02</span>
            <h2>Card design</h2>
          </div>
          <fieldset className="oc-fieldset">
            <legend>Card format</legend>
            <div className="oc-format-options oc-layout-options">
              {Object.entries(LAYOUTS).map(([id, layout]) => (
                <button key={id} aria-pressed={draft.layout === id} onClick={() => update("layout", id)}>
                  <span className={`oc-layout-sketch oc-layout-sketch-${id}`} aria-hidden="true"><i /><b /><em /></span>
                  <strong>{layout.label}</strong>
                  <small>{layout.description}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <p className="oc-hint">Shared cards use an HTTPS link to open the wallet. All formats except Profile include a QR.</p>
          <fieldset className="oc-fieldset">
            <legend>Style</legend>
            <div className="oc-style-options">
              {Object.entries(STYLES).map(([id, style]) => (
                <button
                  key={id}
                  aria-label={style.label}
                  aria-pressed={draft.style === id}
                  onClick={() => update("style", id)}
                  title={style.description}
                >
                  <span
                    style={{
                      background: style.bg,
                      color: style.ink,
                      borderColor: style.border,
                    }}
                  >
                    <span className={`oc-style-mini oc-style-mini-${id}`}>
                      <b>
                        YOUR
                        <br />
                        NAME
                      </b>
                      <i />

                    </span>
                  </span>
                  {style.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="oc-fieldset">
            <legend>Companion</legend>
            <div className="oc-companion-grid" id="oc-companion-options">
              {Object.entries(COMPANIONS).filter(([id], index) => showAllCompanions || index < 6 || id === "none" || id === draft.companion).map(([id, companion]) => (
                <button key={id} aria-pressed={draft.companion === id} onClick={() => update("companion", id)}>
                  {companion.path ? <img src={`./${companion.path}`} alt="" loading="lazy" /> : <span className="oc-no-companion" aria-hidden="true">—</span>}
                  <span>{companion.label}</span>
                </button>
              ))}
            </div>
            <button type="button" className="oc-companion-more" aria-expanded={showAllCompanions} aria-controls="oc-companion-options" onClick={() => setShowAllCompanions(value => !value)}>
              {showAllCompanions ? "Show fewer companions" : "Explore all 14 companions"}
            </button>
          </fieldset>
          {draft.companion !== "none" && (
            <div className="oc-size-control">
              <label htmlFor="oc-companion-size">
                Vizorcat size{" "}
                <output htmlFor="oc-companion-size">
                  {draft.companionScale}%
                </output>
              </label>
              <input
                id="oc-companion-size"
                type="range"
                min="50"
                max="400"
                step="1"
                value={draft.companionScale}
                onChange={(event) =>
                  setDraft(previous => ({ ...previous, ...resizeCompanion(previous, Number(event.target.value)) }))
                }
                aria-describedby="oc-size-note"
              />
              <button type="button" className="oc-companion-more" onClick={() => setDraft(previous => ({ ...previous, ...upperBodyCompanion(previous) }))}>Upper body</button>
              <div className="oc-size-footer">
                <p id="oc-size-note" className="oc-hint">
                  Drag beyond the edge to crop. Keep the QR clear.
                </p>
                <button onClick={() => setDraft(previous => ({ ...previous, companionScale: "100", companionPosition: "fit", companionX: "", companionY: "" }))}>
                  Reset
                </button>
              </div>
            </div>
          )}
          <fieldset className="oc-fieldset">
            <legend>Corner logo</legend>
            <div className="oc-companion-grid oc-logo-grid">
              {Object.entries(CARD_LOGOS).map(([id, logo]) => (
                <button key={id} aria-pressed={draft.logo === id} onClick={() => update("logo", id)}>
                  {logo.path ? <img src={`./${logo.path}`} alt="" loading="lazy" /> : <span aria-hidden="true">—</span>}
                  <span>{logo.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <details
            id="oc-payment-details"
            tabIndex={-1}
            className="oc-advanced"
          >
            <summary>
              Payment details <span>Optional</span>
            </summary>
            <p className="oc-hint">
              Leave the amount empty so supporters can choose.
            </p>
            <label className="oc-field">
              Fixed amount · ZEC
              <input
                value={draft.amount}
                onChange={(event) => update("amount", event.target.value)}
                inputMode="decimal"
                placeholder="Any amount"
              />
            </label>
            <label className="oc-field">
              Payment memo
              <input
                value={draft.memo}
                onChange={(event) => update("memo", event.target.value)}
                maxLength={80}
                placeholder="Optional message for your wallet"
              />
            </label>
            <p className="oc-hint">
              Memos are public in the shared link. Supported for unified and
              Sapling addresses.
            </p>
          </details>
        </section>
        <section className="oc-preview-area" aria-label="Preview and share">
          <div className="oc-preview-toolbar">
            <div>
              <span className="oc-kicker">LIVE PREVIEW</span>
              <h2>Your card</h2>
            </div>
            <div className="oc-preview-options">
              <button aria-pressed={readme} onClick={() => setReadme(!readme)}>
                README
              </button>
              <button
                aria-pressed={mobile}
                onClick={() => setMobile(!mobile)}
                aria-label="Mobile width"
              >
                <Icon kind="phone" />
              </button>
              <button
                aria-pressed={context === "dark"}
                onClick={() =>
                  setContext(context === "light" ? "dark" : "light")
                }
                aria-label="Dark README background"
              >
                <Icon kind="moon" />
              </button>
            </div>
          </div>
          <div
            className={`oc-readme-wrap ${mobile ? "is-mobile" : ""} ${readme ? "" : "is-canvas"}`}
          >
            <div className={`oc-readme ${context === "dark" ? "is-dark" : ""}`}>
              <div className="oc-readme-bar">
                <span>
                  <span aria-hidden="true">▤</span> README.md
                </span>
                <span aria-hidden="true">···</span>
              </div>
              <div className="oc-readme-content">
                <span className="oc-readme-heading">
                  Hi, I’m {draft.name.trim() || "your name"}{" "}
                  <span aria-hidden="true">✳</span>
                </span>
                <p>
                  Open-source projects, experiments, and things I’m building.
                </p>
                <div className="oc-readme-lines" aria-hidden="true">
                  <i />
                  <i />
                </div>
                <div className="oc-card-slot" aria-busy={result.key !== key}>
                  {result.svg ? (
                    <CardPreview card={draft} svg={result.svg} onResize={changes => { setMessage(""); setDraft(previous => ({ ...previous, ...changes })); }} onPosition={position => {
                      setMessage("");
                      setDraft(previous => ({ ...previous, ...position }));
                    }} />
                  ) : (
                    <div className="oc-card-loading">
                      {result.key === key
                        ? result.error || "Preparing your card…"
                        : "Updating your card…"}
                    </div>
                  )}
                </div>
                <div className="oc-readme-bottom">
                  <span aria-hidden="true">⌁</span> Support independent work
                  with Zcash.
                </div>
              </div>
            </div>
          </div>
          <p className="oc-preview-caption">
            <span id="oc-position-help">Drag the companion to move it, or its corner handle to resize. Arrow keys adjust the focused handle; Shift makes larger steps.</span>
            {draft.companion !== "none" && <button className="oc-position-reset" onClick={() => setDraft(previous => ({ ...previous, companionPosition: "fit", companionX: "", companionY: "" }))}>Reset position</button>}
            <span>Use Open wallet below to test the payment link.</span>
            {companionOverlapsQr(draft) && <span className="oc-position-warning" role="status">Companion overlaps the QR or its quiet zone. Move it away before sharing.</span>}
          </p>
          <section className="oc-share" aria-label="Share your card">
            <div className="oc-section-title">
              <span>03</span>
              <h2>Share your card</h2>
            </div>
            <div className="oc-share-heading">
              <p>Paste into your README or website.</p>
              <div className="oc-segment" aria-label="Embed format">
                <button
                  aria-pressed={format === "markdown"}
                  onClick={() => setFormat("markdown")}
                >
                  Markdown
                </button>
                <button
                  aria-pressed={format === "html"}
                  onClick={() => setFormat("html")}
                >
                  HTML
                </button>
              </div>
            </div>
            <p className="oc-hint">
              The card and link open a wallet launch page that attempts to open Zcash automatically. If your browser blocks it, select Open wallet.
            </p>
            <textarea
              className="oc-code"
              readOnly
              aria-label="Embed code"
              value={
                links && service === "ready"
                  ? links[format]
                  : "Your embed code will appear here."
              }
              onFocus={(event) => event.target.select()}
            />
            <div className="oc-share-actions">
              <button
                className="oc-primary"
                disabled={result.key !== key || service !== "ready"}
                onClick={() =>
                  requireReady() &&
                  copy(
                    links[format],
                    `${format === "markdown" ? "Markdown" : "HTML"} copied. Paste it into your profile or website.`,
                  )
                }
              >
                Copy {format === "markdown" ? "Markdown" : "HTML"}{" "}
                <Icon kind="copy" />
              </button>
              <button
                className="oc-secondary"
                disabled={result.key !== key || exporting}
                onClick={exportPng}
              >
                {exporting ? "Exporting…" : "Download PNG"}
              </button>
              {ready && (
                <a href={links.payment}>
                  Open wallet <Arrow />
                </a>
              )}
            </div>
            <p className="oc-validation" role="status">
              {result.key !== key
                ? "Updating preview…"
                : ready
                  ? "Ready to share. Payment details are linked to this card."
                  : attempted
                    ? result.error
                    : "Add your name and receiving address to create your card."}
            </p>
            {service === "unavailable" && (
              <p className="oc-notice">
                Image links are not available on this host yet. You can download
                a PNG and copy the payment request.
              </p>
            )}
            {service === "ready" && isLocal && (
              <p className="oc-hint">
                Local preview: these links work on this computer. Public embeds
                become available after hosting the service.
              </p>
            )}
            <p className="oc-feedback" role="status">
              {message}
            </p>
            {ready && (
              <div className="oc-small-actions">
                <button
                  onClick={() => copy(links.payment, "ZIP-321 payment request copied.")}
                >
                  Copy payment request
                </button>
                <button
                  onClick={() =>
                    copy(
                      links.edit,
                      "Editing link copied. Save it to return to this design.",
                    )
                  }
                >
                  Save editing link
                </button>
              </div>
            )}
          </section>
          <footer className="oc-footer">
            Direct support. Powered by Zcash.
            <span>
              Card details are public. Funds go directly to the receiving
              wallet.
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}
