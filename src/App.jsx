import { memo, useEffect, useRef, useState } from "react";
import { GooeyNav } from "./components/GooeyNav.tsx";
import { mountApp } from "./main.js";

const STEPS = ["content", "design", "review"];

const EditorMarkup = memo(function EditorMarkup() {
  return     <div className="react-shell">
  {/* ══════════════════════════ TOP BAR ══════════════════════════ */}
  <header className="app-bar">
    <div className="app-bar__left">
      <a className="brand-link" href="./" aria-label="Zcash QR Card Studio">
        <img className="brand-mark" src="./assets/vizorcat-icon.png" alt="" width={40} height={40} />
        <span className="brand-name">QR Card Studio</span>
      </a>
      <div className="doc-name-field">
        <label className="sr-only" htmlFor="document-name">Document name</label>
        <input id="document-name" type="text" defaultValue="Untitled card" spellCheck="false" autoComplete="off" />
      </div>
      <div className="file-wrap">
        <button id="file-button" className="ghost-button ghost-button--menu" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="file-menu">
          <span>File</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
        </button>
        <div id="file-menu" className="popover-menu popover-menu--left" role="menu" aria-label="File" hidden>
          <button type="button" role="menuitem" data-file-action="new">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 3.5h6l3 3v10h-9z" /><path d="M11.5 3.5v3h3" /></svg>
            <span>New card</span>
          </button>
          <div className="popover-menu__separator" role="separator" />
          <button type="button" role="menuitem" data-file-action="open">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6.5h5l1.5 1.5h6.5v8h-13z" /><path d="M3.5 6.5v-2h4" /></svg>
            <span>Open design…</span>
            <kbd>⌘O</kbd>
          </button>
          <button type="button" role="menuitem" data-file-action="save">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4h9.5L16 6.5V16H4z" /><path d="M7 4v4h6V4" /><path d="M6.5 16v-5h7v5" /></svg>
            <span>Save design</span>
            <kbd>⌘S</kbd>
          </button>
          <p className="popover-menu__note">Designs save as a .json file on your device. Gift links are never written to the file.</p>
        </div>
        <input id="file-input" type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-hidden="true" />
      </div>
    </div>
    <div className="app-bar__center">
    </div>
    <div className="app-bar__right">
      <a className="icon-button github-link" href="https://github.com/piatoss3612/zcash-qr-card-studio" target="_blank" rel="noopener noreferrer" aria-label="View QR Card Studio on GitHub (opens in a new tab)" title="View on GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.23c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18A11 11 0 0 1 12 5.95c.98 0 1.97.13 2.9.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.25c0 .31.21.68.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" /></svg>
      </a>
      <div className="button-group" aria-label="History">
        <button id="undo-button" className="icon-button" type="button" aria-label="Undo" disabled>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.5 3.5 9 7 12.5" /><path d="M3.5 9h7.75A4.25 4.25 0 0 1 15.5 13.25v0a4.25 4.25 0 0 1-4.25 4.25H8" /></svg>
        </button>
        <button id="redo-button" className="icon-button" type="button" aria-label="Redo" disabled>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 5.5 16.5 9 13 12.5" /><path d="M16.5 9H8.75A4.25 4.25 0 0 0 4.5 13.25v0a4.25 4.25 0 0 0 4.25 4.25H12" /></svg>
        </button>
      </div>
      <div className="zoom-group" aria-label="Zoom">
        <button id="zoom-out-button" className="icon-button icon-button--sm" type="button" aria-label="Zoom out">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10h11" /></svg>
        </button>
        <span id="zoom-label" className="zoom-label" aria-live="off">100%</span>
        <button id="zoom-in-button" className="icon-button icon-button--sm" type="button" aria-label="Zoom in">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10h11" /><path d="M10 4.5v11" /></svg>
        </button>
        <button id="zoom-fit-button" className="ghost-button" type="button">Fit</button>
      </div>
      <output id="render-status" className="render-status" data-state="ready" aria-live="polite" title="">Ready</output>
      <button id="help-button" className="icon-button icon-button--sm" type="button" aria-label="Keyboard shortcuts and tips" title="Shortcuts (?)">
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={10} cy={10} r={7} /><path d="M7.75 8a2.25 2.25 0 1 1 3.2 2.05c-.6.3-.95.75-.95 1.45v.25" /><path d="M10 14.25h.01" /></svg>
      </button>
      <div className="export-wrap">
        <button id="export-button" className="button button--primary" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="export-menu">
          <svg className="button__icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5v9" /><path d="M6.25 9.25 10 13l3.75-3.75" /><path d="M4 15.5h12" /></svg>
          <span>Review &amp; print</span>
        </button>
        <div id="export-menu" className="popover-menu popover-menu--export" role="menu" aria-label="Export options" hidden>
          <div className="preflight" aria-label="Preflight">
            <div id="preflight-summary" className="preflight__summary" data-level="pass">
              <span className="preflight__badge" aria-hidden="true" />
              <span id="preflight-summary-text">Ready to print</span>
            </div>
            <ul id="preflight-list" className="preflight__list" />
          </div>
          <div className="popover-menu__separator" role="separator" />
          <button type="button" role="menuitem" data-export-action="png" className="popover-menu__item--rich">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5v9" /><path d="M6.25 9.25 10 13l3.75-3.75" /><path d="M4 15.5h12" /></svg>
            <span className="popover-menu__text">
              <span>Download PNG</span>
              <small>300 ppi with 3 mm bleed on every side. Send this to a print shop.</small>
            </span>
          </button>
          <button type="button" role="menuitem" data-export-action="print" className="popover-menu__item--rich">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8V3.5h8V8" /><path d="M6 14H4V8h12v6h-2" /><path d="M6 11.5h8v5H6z" /></svg>
            <span className="popover-menu__text">
              <span>Print / PDF</span>
              <small>Trimmed A6 card. In the print dialog pick A6 paper, 100% scale, no margins. On A4, print at actual size and cut along the edge.</small>
            </span>
          </button>
          <div className="popover-menu__separator" role="separator" />
          <button type="button" role="menuitem" data-export-action="batch" className="popover-menu__item--rich">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6.5h8v9h-8z" /><path d="M6.5 4h8v9" /></svg>
            <span className="popover-menu__text">
              <span>Batch export…</span>
              <small>One PNG per line of values, packed as a ZIP.</small>
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
  {/* ══════════════════════════ WORKBENCH ══════════════════════════ */}
  <div className="workbench">
    <div className="studio-sidebar">
      <section id="studio-content" className="studio-step" >
        <header className="studio-section-head">
          <h1>Create an event card</h1>
          <p>Choose a purpose and enter the card details.</p>
        </header>
        <div className="event-fields">
          <label className="field" htmlFor="event-name"><span className="field-label">Event name <em>Optional</em></span><input type="text" id="event-name" maxLength={40} placeholder="Your event name" autoComplete="off" /></label>
          <label className="field" htmlFor="event-heading"><span className="field-label">Card heading</span><input type="text" id="event-heading" maxLength={32} autoComplete="off" /></label>
        </div>
                <section id="content-panel" className="prop-section prop-section--hero">
          <header className="prop-head prop-head--hero">
            <span className="eyebrow">QR content</span>
            <strong className="hero-title">
              <span data-hero-mode="payment">Who gets paid</span>
              <span data-hero-mode="link">Where the QR leads</span>
              <span data-hero-mode="giftcard">The gift link on the card</span>
            </strong>
            <span className="hero-status" aria-hidden="true">
              <svg className="hero-status__check" viewBox="0 0 20 20"><path d="m5 10.5 3.5 3.5L15 7" /></svg>
              <span className="hero-status__pending">Start here</span>
              <span className="hero-status__ready">QR ready</span>
            </span>
          </header>
          <div className="mode-picker" role="radiogroup" aria-label="Card type" id="mode-switch">
            <label className="mode-tile" data-mode-tile="payment">
              <input type="radio" name="mode" defaultValue="payment" defaultChecked />
              <span className="mode-tile__icon" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx={10} cy={10} r={7} /><path d="M7.25 7.25h5.5l-5.5 5.5h5.5" /><path d="M10 5.25v2M10 12.75v2" /></svg></span>
              <span className="mode-tile__label">Payment</span>
            </label>
            <label className="mode-tile" data-mode-tile="giftcard">
              <input type="radio" name="mode" defaultValue="giftcard" />
              <span className="mode-tile__icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M3.5 8.5h13v8h-13z" /><path d="M10 8.5v8" /><path d="M3 5.5h14v3H3z" /><path d="M10 5.5c-1.2-2.4-4.4-2.6-4.4-.6 0 .6.6.6 4.4.6Zm0 0c1.2-2.4 4.4-2.6 4.4-.6 0 .6-.6.6-4.4.6Z" /></svg></span>
              <span className="mode-tile__label">Gift card</span>
            </label>
            <label className="mode-tile" data-mode-tile="link">
              <input type="radio" name="mode" defaultValue="link" />
              <span className="mode-tile__icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M8.5 11.5 11.5 8.5" /><path d="M7 13a3 3 0 0 1 0-4.25L8.75 7A3 3 0 0 1 13 11.25" /><path d="M13 7a3 3 0 0 1 0 4.25L11.25 13A3 3 0 0 1 7 8.75" /></svg></span>
              <span className="mode-tile__label">Link</span>
            </label>
          </div>
          <p className="mode-picker__hint">
            <span data-hero-mode="payment">A payment request for a Zcash wallet.</span>
            <span data-hero-mode="giftcard">A Vizor gift link. Whoever scans it can claim the funds.</span>
            <span data-hero-mode="link">Any web link, with an optional Get Vizor card.</span>
          </p>
          <fieldset className="mode-fields" data-mode-fields="payment">
            <legend className="sr-only">Payment request details</legend>
            <label className="field" htmlFor="field-address">
              <span className="field-label">Zcash address</span>
              <input id="field-address" type="text" spellCheck="false" autoComplete="off" placeholder="u1… / zs1… / t1…" />
            </label>
            <div className="field-row">
              <label className="field" htmlFor="field-amount">
                <span className="field-label">Amount (ZEC)</span>
                <input id="field-amount" type="text" inputMode="decimal" autoComplete="off" placeholder="0.05" />
              </label>
              <label className="field" htmlFor="field-label">
                <span className="field-label">Label</span>
                <input id="field-label" type="text" autoComplete="off" placeholder="Coffee stand" />
              </label>
            </div>
            <details className="studio-details">
  <summary>Additional details · optional</summary>
<label className="field" htmlFor="field-memo">
              <span className="field-label">
                Memo
                <em className="field-counter"><span id="memo-count">0</span> / 512 bytes</em>
              </span>
              <textarea id="field-memo" rows={2} placeholder="Shielded addresses only." defaultValue={""} />
            </label>
            <label className="field" htmlFor="field-message">
              <span className="field-label">Message</span>
              <input id="field-message" type="text" autoComplete="off" placeholder="Thanks!" />
            </label>
            </details>
<label className="check-row" htmlFor="show-summary">
              <input id="show-summary" type="checkbox" />
              <span className="check-row__box" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5 10.5 3.5 3.5L15 7" /></svg></span>
              <span className="check-row__text">
                <strong>Show amount and label on the card</strong>
                <small>A text line under the QR that follows the fields above.</small>
              </span>
            </label>
          </fieldset>
          <fieldset className="mode-fields" data-mode-fields="link" hidden>
            <legend className="sr-only">Link details</legend>
            <label className="field" htmlFor="field-url">
              <span className="field-label">Link to open</span>
              <input id="field-url" type="url" inputMode="url" spellCheck="false" autoComplete="off" defaultValue placeholder="https://example.com" />
            </label>
            <label className="check-row" htmlFor="include-install">
              <input id="include-install" type="checkbox" defaultChecked />
              <span className="check-row__box" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5 10.5 3.5 3.5L15 7" /></svg></span>
              <span className="check-row__text">
                <strong>Include the Get Vizor card</strong>
                <small>A small install QR in the bottom corner.</small>
              </span>
            </label>
          </fieldset>
          <fieldset className="mode-fields" data-mode-fields="giftcard" hidden>
            <legend className="sr-only">Gift card details</legend>
            <label className="field" htmlFor="field-gift-link">
              <span className="field-label">Vizor gift link</span>
              <input id="field-gift-link" type="url" inputMode="url" spellCheck="false" autoComplete="off" placeholder="https://link.vizor.cash/…#v1=…" />
            </label>
            <p className="field-note">The part after <code>#</code> is the secret that controls the funds. It is never logged or written to a file name.</p>
          </fieldset>
          <p id="content-error" className="field-error" role="alert" aria-live="assertive" />
          <p id="content-warning" className="field-warning" aria-live="polite" />
          <details className="studio-details">
  <summary>Encoded QR value</summary>
<div className="value-preview">
            <span className="eyebrow">Encoded value</span>
            <output id="qr-value-preview" className="value-preview__code">https://vizor.cash</output>
          </div>
</details>
        </section>
        <button type="button" className="button button--primary studio-next" data-next-step="design">Choose theme →</button>
      </section>
      <section id="studio-design" className="studio-step" >
        <header className="studio-section-head"><h1>Theme, character &amp; logo</h1><p>Changes here keep your card details.</p></header>
        <label className="studio-advanced">
          <input type="checkbox" role="switch" id="free-editing" className="sr-only" aria-labelledby="free-editing-title" aria-describedby="free-editing-help" />
          <span className="studio-advanced__copy"><strong id="free-editing-title">Free positioning &amp; layers</strong><span id="free-editing-help">Move, resize and arrange elements on your card.</span></span>
          <span className="studio-advanced__switch" aria-hidden="true" />
        </label>
            {/* ─────────── Tool rail ─────────── */}
    <nav className="tool-rail" aria-label="Design tools">
      <button className="tool-tab" type="button" data-panel="templates" aria-pressed="true" aria-controls="tool-drawer">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 3.5h5.25v5.25H3.5z" /><path d="M11.25 3.5h5.25v5.25h-5.25z" /><path d="M3.5 11.25h5.25v5.25H3.5z" /><path d="M11.25 11.25h5.25v5.25h-5.25z" /></svg>
        <span>Templates</span>
      </button>
      <button className="tool-tab" type="button" data-panel="backgrounds" aria-pressed="false" aria-controls="tool-drawer">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4.5h14v11H3z" /><path d="m3 13 4-4 3.5 3.5L13 10l4 3.5" /><path d="M7.25 7.75h.01" /></svg>
        <span>Backgrounds</span>
      </button>
      <button className="tool-tab" type="button" data-panel="characters" aria-pressed="false" aria-controls="tool-drawer">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 8.5 3.75 3.5l4 2.25h4.5l4-2.25-.75 5" /><path d="M4.5 8.5a5.5 5.5 0 0 0 11 0" /><path d="M4.5 8.5c0 4.5 2.5 8 5.5 8s5.5-3.5 5.5-8" /><path d="M8 10.25h.01M12 10.25h.01" /><path d="M9 13h2" /></svg>
        <span>Vizorcat</span>
      </button>
      <button className="tool-tab" type="button" data-panel="logos" aria-pressed="false" aria-controls="tool-drawer">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.75 2.2 4.55 5 .72-3.6 3.5.85 4.98L10 14.15l-4.45 2.35.85-4.98-3.6-3.5 5-.72Z" /></svg>
        <span>Logos</span>
      </button>
      <button className="tool-tab" type="button" data-panel="text" aria-pressed="false" aria-controls="tool-drawer">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5V3.5h12V5" /><path d="M10 3.75v12.5" /><path d="M7.25 16.25h5.5" /></svg>
        <span>Text</span>
      </button>
    </nav>
    {/* ─────────── Tool drawer ─────────── */}
    <div id="tool-drawer" className="tool-drawer">
      {/* Templates */}
      <section className="tool-panel" data-panel="templates" aria-label="Templates">
        <header className="drawer-head">
          <h2>Templates</h2>
          <button id="drawer-close-button" className="icon-button icon-button--sm drawer-close" type="button" aria-label="Close panel">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
          </button>
        </header>
        <div className="drawer-group">
          <span className="eyebrow">Arrangement</span>
          <div id="layout-choices" className="choice-row choice-row--three" role="radiogroup" aria-label="Arrangement">
            <label className="asset-choice asset-choice--mini">
              <input type="radio" name="layout" defaultValue="center" defaultChecked />
              <span className="layout-thumb" aria-hidden="true"><canvas width={84} height={117} /></span>
              <span className="asset-name">Centered</span>
            </label>
            <label className="asset-choice asset-choice--mini">
              <input type="radio" name="layout" defaultValue="qr-left" />
              <span className="layout-thumb" aria-hidden="true"><canvas width={84} height={117} /></span>
              <span className="asset-name">QR left</span>
            </label>
            <label className="asset-choice asset-choice--mini">
              <input type="radio" name="layout" defaultValue="qr-right" />
              <span className="layout-thumb" aria-hidden="true"><canvas width={84} height={117} /></span>
              <span className="asset-name">QR right</span>
            </label>
          </div>
          <p className="field-help">Moves the QR, the main Vizorcat and the Get Vizor card. Other layers stay put.</p>
        </div>
        <div className="drawer-group">
          <span className="eyebrow">Templates</span>
          <p className="drawer-note">Choose a theme. Your QR content, event name and heading are kept.</p>
        </div>
        <div id="template-grid" className="template-grid">
          <button className="template-card" type="button" data-template-id="link-launch" aria-pressed="true">
            <span className="template-card__thumb"><canvas width={180} height={250} /></span>
            <span className="template-card__label">Vizor Launch</span>
          </button>
          <button className="template-card" type="button" data-template-id="link-commons" aria-pressed="false">
            <span className="template-card__thumb"><canvas width={180} height={250} /></span>
            <span className="template-card__label">Modernist Commons</span>
          </button>
        </div>
      </section>
      {/* Backgrounds */}
      <section className="tool-panel" data-panel="backgrounds" aria-label="Backgrounds" hidden>
        <header className="drawer-head">
          <h2>Backgrounds</h2>
          <button className="icon-button icon-button--sm drawer-close" type="button" aria-label="Close panel" data-drawer-close>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
          </button>
        </header>
        <div className="asset-grid" role="radiogroup" aria-label="Background">
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="wave" defaultChecked />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/samurai-wave-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Indigo Wave</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="blossom" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/blossom-drift-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Blossom Drift</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="forest" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/whispering-grove-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Whispering Grove</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="dragon" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/dragon-flight-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Dragon Flight</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="frost" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/frost-archive-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Frost Archive</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="hearth" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/hearthlight-exchange-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Hearthlight Exchange</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="workshop" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/alchemist-workshop-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Alchemist Workshop</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="rampart" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/brass-rampart-v3.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Brass Rampart</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="lunar" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/lunar-orbit-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Lunar Orbit</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="astral" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/astral-chart-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Astral Chart</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="crimson" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/crimson-core-v3.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Crimson Core</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="dark" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/dark-core-v3.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Dark Core</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="commons" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/modernist-commons-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Modernist Commons</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="journey" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/first-journey-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">First Journey</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="moonlit" />
            <span className="asset-thumb asset-thumb--scene"><img src="./assets/backgrounds/moonlit-village-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Moonlit Village</span>
          </label>
          <label className="asset-choice">
            <input type="radio" name="background" defaultValue="paper" />
            <span className="asset-thumb asset-thumb--paper" aria-hidden="true" />
            <span className="asset-name">Quiet Paper</span>
          </label>
        </div>
      </section>
      {/* Vizorcat */}
      <section className="tool-panel" data-panel="characters" aria-label="Vizorcat" hidden>
        <header className="drawer-head">
          <h2>Vizorcat</h2>
          <button className="icon-button icon-button--sm drawer-close" type="button" aria-label="Close panel" data-drawer-close>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
          </button>
        </header>
        <p className="drawer-note">Choose a Vizorcat to replace the character on your card.</p>
        <div className="asset-grid">
          <button className="asset-card" type="button" data-character-id="classic" aria-pressed="true">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/classic-guardian.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Classic Guardian</span>
          </button>
          <button className="asset-card" type="button" data-character-id="samurai" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure" style={{background: '#111d2b'}}><img src="./assets/characters/samurai.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Samurai</span>
          </button>
          <button className="asset-card" type="button" data-character-id="oni" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure" style={{background: '#111d2b'}}><img src="./assets/characters/oni-samurai-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Oni Samurai</span>
          </button>
          <button className="asset-card" type="button" data-character-id="orbital" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure" style={{background: '#0d3156'}}><img src="./assets/characters/orbital-rescue-ranger.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Orbital Ranger</span>
          </button>
          <button className="asset-card" type="button" data-character-id="astral" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure" style={{background: '#2f2857'}}><img src="./assets/characters/astral-wayfinder-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Astral Wayfinder</span>
          </button>
          <button className="asset-card" type="button" data-character-id="commons" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/commons-guide.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Commons Guide</span>
          </button>
          <button className="asset-card" type="button" data-character-id="grove" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/crimson-grove-ranger.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Crimson Grove Ranger</span>
          </button>
          <button className="asset-card" type="button" data-character-id="snow" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/siberian-snow-surveyor-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Snow Surveyor</span>
          </button>
          <button className="asset-card" type="button" data-character-id="stonehold" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/stonehold-warden-v5.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Stonehold Warden</span>
          </button>
          <button className="asset-card" type="button" data-character-id="hearthlight" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/hearthlight-host-v2.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Hearthlight Host</span>
          </button>
          <button className="asset-card" type="button" data-character-id="alchemist" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/workshop-alchemist-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Workshop Alchemist</span>
          </button>
          <button className="asset-card" type="button" data-character-id="swordsman" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/wandering-swordsman-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Wandering Swordsman</span>
          </button>
          <button className="asset-card" type="button" data-character-id="strongman" aria-pressed="false">
            <span className="asset-thumb asset-thumb--figure"><img src="./assets/characters/tal-strongman-v1.png" alt="" loading="lazy" /></span>
            <span className="asset-name">Tal Strongman</span>
          </button>
        </div>
        <button id="add-character-button" className="button button--secondary button--block" type="button">
          <svg className="button__icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11" /><path d="M4.5 10h11" /></svg>
          <span>Add as new layer</span>
        </button>
      </section>
      {/* Logos */}
      <section className="tool-panel" data-panel="logos" aria-label="Logos" hidden>
        <header className="drawer-head">
          <h2>Logos</h2>
          <button className="icon-button icon-button--sm drawer-close" type="button" aria-label="Close panel" data-drawer-close>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
          </button>
        </header>
        <div className="drawer-group">
          <span className="eyebrow">Vizor &amp; Zcash</span>
          <div className="asset-grid asset-grid--logos">
            <button className="asset-card" type="button" data-logo-id="vizor" aria-pressed="true">
              <span className="asset-thumb asset-thumb--mark asset-thumb--wordmark"><img src="./assets/vizor-logo-dark.svg" alt="" /></span>
              <span className="asset-name">Vizor</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="vizor-mark" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/vizor-icon.svg" alt="" style={{filter: 'brightness(0.12)'}} /></span>
              <span className="asset-name">Vizor Mark</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="vizorcat-head" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark asset-thumb--pixel"><img src="./assets/logos/vizorcat-classic-head.png" alt="" /></span>
              <span className="asset-name">Vizorcat Classic</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="vizorcat-samurai-head" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark asset-thumb--pixel"><img src="./assets/logos/vizorcat-samurai-head.png" alt="" /></span>
              <span className="asset-name">Vizorcat Samurai</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="zcash-coin" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/zcash-coin.png" alt="" loading="lazy" /></span>
              <span className="asset-name">Zcash Coin</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="zcash" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/zcash.svg" alt="" /></span>
              <span className="asset-name">Zcash Mark</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="zechub" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/zechub.png" alt="" loading="lazy" /></span>
              <span className="asset-name">ZecHub</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="keplr" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/keplr.svg" alt="" /></span>
              <span className="asset-name">Keplr</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="cipherscan" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark" style={{background: '#11110f'}}><img src="./assets/logos/cipherscan.png" alt="" loading="lazy" /></span>
              <span className="asset-name">CipherScan</span>
            </button>
          </div>
        </div>
        <details className="drawer-fold">
          <summary className="drawer-fold__summary">
            <span className="eyebrow">Partner logos</span>
            <svg className="drawer-fold__chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
          </summary>
          <p className="drawer-note drawer-note--caution">Third-party marks. Check with the brand owner before printing them on a card, and keep their original colours unless their guidelines allow a single-colour version.</p>
          <div className="asset-grid asset-grid--logos">
            <button className="asset-card" type="button" data-logo-id="cypherpunk" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/cypherpunk.svg" alt="" /></span>
              <span className="asset-name">Cypherpunk</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="tachyon" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/tachyon.png" alt="" loading="lazy" /></span>
              <span className="asset-name">Project Tachyon</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="near" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark asset-thumb--wordmark"><img src="./assets/logos/near-intents.svg" alt="" /></span>
              <span className="asset-name">NEAR Intents</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="keystone" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/keystone.svg" alt="" /></span>
              <span className="asset-name">Keystone</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="ledger" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/ledger.svg" alt="" /></span>
              <span className="asset-name">Ledger</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="valar" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark" style={{background: '#11110f'}}><img src="./assets/logos/valar-group.png" alt="" loading="lazy" /></span>
              <span className="asset-name">Valar Group</span>
            </button>
            <button className="asset-card" type="button" data-logo-id="zakura" aria-pressed="false">
              <span className="asset-thumb asset-thumb--mark"><img src="./assets/logos/zakura.svg" alt="" /></span>
              <span className="asset-name">Zakura</span>
            </button>
          </div>
        </details>
        <button id="add-logo-button" className="button button--secondary button--block" type="button">
          <svg className="button__icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11" /><path d="M4.5 10h11" /></svg>
          <span>Add as new layer</span>
        </button>
      </section>
      {/* Text */}
      <section className="tool-panel" data-panel="text" aria-label="Text" hidden>
        <header className="drawer-head">
          <h2>Text</h2>
          <button className="icon-button icon-button--sm drawer-close" type="button" aria-label="Close panel" data-drawer-close>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
          </button>
        </header>
        <p className="drawer-note">Pick a style to add a text box. Start typing to replace the placeholder, or double-click any text on the card to edit it.</p>
        <div className="text-presets">
          <button id="add-heading-button" className="text-preset" type="button">
            <span className="text-preset__sample text-preset__sample--heading">Your headline</span>
            <span className="text-preset__meta">Heading · Zarathustra 64</span>
          </button>
          <button id="add-body-button" className="text-preset" type="button">
            <span className="text-preset__sample text-preset__sample--body">Add a short line of text.</span>
            <span className="text-preset__meta">Body text · Geist 34</span>
          </button>
        </div>
      </section>
      {/* Layout */}
    </div>
        <aside className="properties" aria-label="Properties">
          <div className="properties__scroll">
        {/* Selected layer */}
        <section id="selection-panel" className="prop-section">
          <header className="prop-head prop-head--split">
            <span className="eyebrow">Selected layer</span>
            <strong id="selected-layer-name">Samurai</strong>
          </header>
          <div className="selection-block" data-selection-kind="none" hidden>
            <p className="empty-note">Nothing selected. Click a layer on the canvas or in the list below.</p>
          </div>
          <div className="selection-block" data-selection-kind="background" hidden>
            <p className="empty-note">The background fills the whole card. Change it from the Backgrounds panel.</p>
          </div>
          <div className="selection-block" data-selection-kind="character" />
          <div className="selection-block" data-selection-kind="logo" hidden>
            <div className="swatch-block">
              <span className="eyebrow">Logo colour</span>
              <div className="swatch-row" role="radiogroup" aria-label="Logo colour">
                <label className="swatch" title="Original">
                  <input type="radio" name="logo-color" defaultValue="original" defaultChecked />
                  <span className="swatch__dot swatch__dot--original" aria-hidden="true" />
                  <span className="sr-only">Original</span>
                </label>
                <label className="swatch" title="Ink">
                  <input type="radio" name="logo-color" defaultValue="ink" />
                  <span className="swatch__dot" style={{"--swatch": '#141818'}} aria-hidden="true" />
                  <span className="sr-only">Ink</span>
                </label>
                <label className="swatch" title="White">
                  <input type="radio" name="logo-color" defaultValue="white" />
                  <span className="swatch__dot" style={{"--swatch": '#ffffff'}} aria-hidden="true" />
                  <span className="sr-only">White</span>
                </label>
                <label className="swatch" title="Crimson">
                  <input type="radio" name="logo-color" defaultValue="crimson" />
                  <span className="swatch__dot" style={{"--swatch": '#b90a4a'}} aria-hidden="true" />
                  <span className="sr-only">Crimson</span>
                </label>
                <label className="swatch" title="Zcash Gold">
                  <input type="radio" name="logo-color" defaultValue="gold" />
                  <span className="swatch__dot" style={{"--swatch": '#f4b728'}} aria-hidden="true" />
                  <span className="sr-only">Zcash Gold</span>
                </label>
                <label className="swatch swatch--custom" title="Custom colour">
                  <input type="radio" name="logo-color" defaultValue="custom" />
                  <span className="swatch__dot swatch__dot--custom" aria-hidden="true" />
                  <span className="sr-only">Custom</span>
                </label>
                <label className="color-input">
                  <span className="sr-only">Custom logo colour value</span>
                  <input id="logo-color-custom" type="color" defaultValue="#b90a4a" />
                </label>
              </div>
              <p id="logo-color-note" className="field-help" hidden>This mark keeps its original colours.</p>
            </div>
          </div>
          <div className="selection-block" data-selection-kind="text" hidden>
            <label className="field" htmlFor="text-content">
              <span className="field-label">Text</span>
              <textarea id="text-content" rows={3} defaultValue={"Scan to open"} />
            </label>
            <p id="text-bound-note" className="field-help" hidden>This line follows the amount and label fields. Untick “Show amount and label” to remove it.</p>
            <div className="field-row field-row--3-2">
              <label className="field" htmlFor="text-font">
                <span className="field-label">Font</span>
                <select id="text-font" defaultValue="Zarathustra">
                  <option value="Zarathustra">Zarathustra (serif)</option>
                  <option value="Geist">Geist (sans)</option>
                  <option value="SpaceGrotesk">Space Grotesk (geometric)</option>
                  <option value="Silkscreen">Silkscreen (pixel)</option>
                  <option value="GeistMono">Geist Mono</option>
                </select>
              </label>
              <label className="field" htmlFor="text-size">
                <span className="field-label">Size</span>
                <input id="text-size" type="number" inputMode="numeric" min={12} max={240} step={1} defaultValue={56} />
              </label>
            </div>
            <div className="field-row">
              <label className="field" htmlFor="text-weight">
                <span className="field-label">Weight</span>
                <select id="text-weight">
                  <option value={400}>Regular</option>
                  <option value={500}>Medium</option>
                  <option value={700}>Bold</option>
                </select>
              </label>
              <label className="check-row check-row--compact" htmlFor="text-uppercase">
                <input id="text-uppercase" type="checkbox" />
                <span className="check-row__box" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5 10.5 3.5 3.5L15 7" /></svg></span>
                <span className="check-row__text"><strong>Uppercase</strong></span>
              </label>
            </div>
            <div className="field">
              <span className="field-label">Alignment</span>
              <div className="segmented segmented--sm" role="radiogroup" aria-label="Text alignment">
                <label className="segmented__item" title="Align left">
                  <input type="radio" name="text-align" defaultValue="left" defaultChecked />
                  <span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12" /><path d="M4 10h8" /><path d="M4 14h10" /></svg><span className="sr-only">Left</span></span>
                </label>
                <label className="segmented__item" title="Align centre">
                  <input type="radio" name="text-align" defaultValue="center" />
                  <span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12" /><path d="M6 10h8" /><path d="M5 14h10" /></svg><span className="sr-only">Centre</span></span>
                </label>
                <label className="segmented__item" title="Align right">
                  <input type="radio" name="text-align" defaultValue="right" />
                  <span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12" /><path d="M8 10h8" /><path d="M6 14h10" /></svg><span className="sr-only">Right</span></span>
                </label>
              </div>
            </div>
            <div className="swatch-block">
              <span className="eyebrow">Colour</span>
              <div className="swatch-row" role="radiogroup" aria-label="Text colour">
                <label className="swatch" title="Ink">
                  <input type="radio" name="text-color" defaultValue="ink" defaultChecked />
                  <span className="swatch__dot" style={{"--swatch": '#141818'}} aria-hidden="true" />
                  <span className="sr-only">Ink</span>
                </label>
                <label className="swatch" title="Graphite">
                  <input type="radio" name="text-color" defaultValue="secondary" />
                  <span className="swatch__dot" style={{"--swatch": '#5d6262'}} aria-hidden="true" />
                  <span className="sr-only">Graphite</span>
                </label>
                <label className="swatch" title="White">
                  <input type="radio" name="text-color" defaultValue="white" />
                  <span className="swatch__dot" style={{"--swatch": '#ffffff'}} aria-hidden="true" />
                  <span className="sr-only">White</span>
                </label>
                <label className="swatch" title="Crimson">
                  <input type="radio" name="text-color" defaultValue="crimson" />
                  <span className="swatch__dot" style={{"--swatch": '#b90a4a'}} aria-hidden="true" />
                  <span className="sr-only">Crimson</span>
                </label>
                <label className="swatch" title="Zcash Gold">
                  <input type="radio" name="text-color" defaultValue="gold" />
                  <span className="swatch__dot" style={{"--swatch": '#f4b728'}} aria-hidden="true" />
                  <span className="sr-only">Zcash Gold</span>
                </label>
                <label className="swatch" title="Indigo">
                  <input type="radio" name="text-color" defaultValue="indigo" />
                  <span className="swatch__dot" style={{"--swatch": '#1d2c3a'}} aria-hidden="true" />
                  <span className="sr-only">Indigo</span>
                </label>
                <label className="swatch swatch--custom" title="Custom colour">
                  <input type="radio" name="text-color" defaultValue="custom" />
                  <span className="swatch__dot swatch__dot--custom" aria-hidden="true" />
                  <span className="sr-only">Custom</span>
                </label>
                <label className="color-input">
                  <span className="sr-only">Custom text colour value</span>
                  <input id="text-color-custom" type="color" defaultValue="#141818" />
                </label>
              </div>
            </div>
          </div>
          <div className="selection-block" data-selection-kind="qr" hidden>
            <div className="swatch-block">
              <span className="eyebrow">QR style</span>
              <div className="choice-row choice-row--three" role="radiogroup" aria-label="QR style">
                <label className="asset-choice asset-choice--mini">
                  <input type="radio" name="qr-style" defaultValue="clean" defaultChecked />
                  <span className="qr-style-preview qr-style-preview--clean" aria-hidden="true"><i /></span>
                  <span className="asset-name">Clean</span>
                </label>
                <label className="asset-choice asset-choice--mini">
                  <input type="radio" name="qr-style" defaultValue="ink" />
                  <span className="qr-style-preview qr-style-preview--ink" aria-hidden="true"><i /></span>
                  <span className="asset-name">Ink</span>
                </label>
                <label className="asset-choice asset-choice--mini">
                  <input type="radio" name="qr-style" defaultValue="soft" />
                  <span className="qr-style-preview qr-style-preview--soft" aria-hidden="true"><i /></span>
                  <span className="asset-name">Soft</span>
                </label>
              </div>
            </div>
            <div className="swatch-block">
              <span className="eyebrow">Modules</span>
              <div className="segmented segmented--sm segmented--fill" role="radiogroup" aria-label="Module shape">
                <label className="segmented__item"><input type="radio" name="qr-shape" defaultValue="square" defaultChecked /><span>Square</span></label>
                <label className="segmented__item"><input type="radio" name="qr-shape" defaultValue="rounded" /><span>Rounded</span></label>
                <label className="segmented__item"><input type="radio" name="qr-shape" defaultValue="dots" /><span>Dots</span></label>
              </div>
            </div>
            <div className="swatch-block">
              <span className="eyebrow">Module colour</span>
              <div className="swatch-row" role="radiogroup" aria-label="Module colour">
                <label className="swatch" title="Ink">
                  <input type="radio" name="qr-color" defaultValue="ink" defaultChecked />
                  <span className="swatch__dot" style={{"--swatch": '#151919'}} aria-hidden="true" />
                  <span className="sr-only">Ink</span>
                </label>
                <label className="swatch" title="Indigo">
                  <input type="radio" name="qr-color" defaultValue="indigo" />
                  <span className="swatch__dot" style={{"--swatch": '#1d2c3a'}} aria-hidden="true" />
                  <span className="sr-only">Indigo</span>
                </label>
                <label className="swatch" title="Forest">
                  <input type="radio" name="qr-color" defaultValue="forest" />
                  <span className="swatch__dot" style={{"--swatch": '#1f3d2b'}} aria-hidden="true" />
                  <span className="sr-only">Forest</span>
                </label>
                <label className="swatch" title="Crimson">
                  <input type="radio" name="qr-color" defaultValue="crimson" />
                  <span className="swatch__dot" style={{"--swatch": '#8f0838'}} aria-hidden="true" />
                  <span className="sr-only">Crimson</span>
                </label>
                <label className="swatch swatch--custom" title="Custom colour">
                  <input type="radio" name="qr-color" defaultValue="custom" />
                  <span className="swatch__dot swatch__dot--custom" aria-hidden="true" />
                  <span className="sr-only">Custom</span>
                </label>
                <label className="color-input">
                  <span className="sr-only">Custom module colour value</span>
                  <input id="qr-color-custom" type="color" defaultValue="#151919" />
                </label>
              </div>
            </div>
            <div className="swatch-block">
              <span className="eyebrow">Centre emblem</span>
              <div className="emblem-row" role="radiogroup" aria-label="Centre emblem">
                <label className="emblem-choice" title="None">
                  <input type="radio" name="qr-emblem" defaultValue="none" />
                  <span className="emblem-choice__box emblem-choice__box--none" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg></span>
                  <span className="emblem-choice__label">None</span>
                </label>
                <label className="emblem-choice" title="Vizorcat">
                  <input type="radio" name="qr-emblem" defaultValue="vizorcat" />
                  <span className="emblem-choice__box emblem-choice__box--pixel" aria-hidden="true"><img src="./assets/logos/vizorcat-classic-head.png" alt="" /></span>
                  <span className="emblem-choice__label">Vizorcat</span>
                </label>
                <label className="emblem-choice" title="Samurai">
                  <input type="radio" name="qr-emblem" defaultValue="samurai" />
                  <span className="emblem-choice__box emblem-choice__box--pixel" aria-hidden="true"><img src="./assets/logos/vizorcat-samurai-head.png" alt="" /></span>
                  <span className="emblem-choice__label">Samurai</span>
                </label>
                <label className="emblem-choice" title="Vizor mark">
                  <input type="radio" name="qr-emblem" defaultValue="vizor-mark" />
                  <span className="emblem-choice__box" aria-hidden="true"><img src="./assets/vizor-icon.svg" alt="" style={{filter: 'brightness(0.12)'}} /></span>
                  <span className="emblem-choice__label">Vizor</span>
                </label>
                <label className="emblem-choice" title="Zcash">
                  <input type="radio" name="qr-emblem" defaultValue="zcash" />
                  <span className="emblem-choice__box" aria-hidden="true"><img src="./assets/logos/zcash.svg" alt="" /></span>
                  <span className="emblem-choice__label">Zcash</span>
                </label>
              </div>
              <p className="field-help">An emblem uses higher error correction. Test a printed sample with your wallet.</p>
            </div>
            <p className="empty-note">The QR is always on the card. Resize it, but keep it inside the safe area.</p>
          </div>
          <div className="selection-block" data-selection-kind="install" hidden>
            <p className="empty-note">The Get Vizor card links to vizor.cash/get. Move it, but it can't be deleted.</p>
          </div>
          <div id="transform-block" className="transform-block">
            <div className="layer-actions">
              <button id="flip-button" className="icon-button icon-button--outline" type="button" title="Flip horizontal" aria-label="Flip horizontal">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14" /><path d="M7.5 6.5 3.5 10l4 3.5z" /><path d="M12.5 6.5 16.5 10l-4 3.5z" /></svg>
              </button>
              <button id="lock-button" className="icon-button icon-button--outline" type="button" title="Lock layer" aria-label="Lock layer" aria-pressed="false">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 5 0v2.25" /></svg>
              </button>
              <button id="duplicate-button" className="icon-button icon-button--outline" type="button" title="Duplicate" aria-label="Duplicate layer">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 7h9v9H7z" /><path d="M13 4H4v9" /></svg>
              </button>
              <button id="delete-button" className="icon-button icon-button--outline icon-button--danger" type="button" title="Delete" aria-label="Delete layer">
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11" /><path d="M8 6V4.25h4V6" /><path d="M6.25 6l.75 10h6l.75-10" /></svg>
              </button>
            </div>
            <details className="transform-details">
              <summary className="transform-summary">
                <span className="eyebrow">Transform</span>
                <span id="transform-readout" className="transform-readout">286, 250 · 740 × 740</span>
                <svg className="transform-summary__chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
              </summary>
              <div className="transform-grid">
                <label className="number-field" htmlFor="transform-x"><span>X</span><input id="transform-x" type="number" inputMode="numeric" defaultValue={690} /></label>
                <label className="number-field" htmlFor="transform-y"><span>Y</span><input id="transform-y" type="number" inputMode="numeric" defaultValue={1005} /></label>
                <label className="number-field" htmlFor="transform-width"><span>W</span><input id="transform-width" type="number" inputMode="numeric" defaultValue={500} /></label>
                <label className="number-field" htmlFor="transform-height"><span>H</span><input id="transform-height" type="number" inputMode="numeric" defaultValue={650} /></label>
                <label className="number-field number-field--wide" htmlFor="transform-rotation"><span>Rotation</span><input id="transform-rotation" type="number" inputMode="decimal" step="0.5" defaultValue={0} /></label>
              </div>
            </details>
          </div>
        </section>

                  <section className="prop-section prop-section--layers">
        <header className="prop-head prop-head--split">
          <span className="eyebrow">Layers</span>
          <small className="prop-hint">Top first</small>
        </header>
        <ol id="layer-list" className="layer-list">
          <li>
            <button className="layer-select" type="button" data-layer-id="text-1">
              <span className="layer-kind">TEXT</span>
              <span><strong>Scan to open</strong><small>Zarathustra · 56</small></span>
              <span className="layer-lock layer-lock--open" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6" /></svg>
              </span>
            </button>
            <button className="layer-menu-trigger" type="button" aria-label="Actions for Scan to open" aria-haspopup="menu" aria-expanded="false">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={5} cy={10} r="1.35" /><circle cx={10} cy={10} r="1.35" /><circle cx={15} cy={10} r="1.35" /></svg>
            </button>
          </li>
          <li>
            <button className="layer-select" type="button" data-layer-id="logo-1">
              <span className="layer-kind">LOGO</span>
              <span><strong>Vizor</strong><small>Original colour</small></span>
              <span className="layer-lock layer-lock--open" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6" /></svg>
              </span>
            </button>
            <button className="layer-menu-trigger" type="button" aria-label="Actions for Vizor" aria-haspopup="menu" aria-expanded="false">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={5} cy={10} r="1.35" /><circle cx={10} cy={10} r="1.35" /><circle cx={15} cy={10} r="1.35" /></svg>
            </button>
          </li>
          <li className="is-selected">
            <button className="layer-select" type="button" data-layer-id="character-1" aria-current="true">
              <span className="layer-kind">CHAR</span>
              <span><strong>Samurai</strong><small>500 × 650</small></span>
              <span className="layer-lock layer-lock--open" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6" /></svg>
              </span>
            </button>
            <button className="layer-menu-trigger" type="button" aria-label="Actions for Samurai" aria-haspopup="menu" aria-expanded="false">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={5} cy={10} r="1.35" /><circle cx={10} cy={10} r="1.35" /><circle cx={15} cy={10} r="1.35" /></svg>
            </button>
          </li>
          <li>
            <button className="layer-select" type="button" data-layer-id="install">
              <span className="layer-kind">CARD</span>
              <span><strong>Get Vizor</strong><small>Install QR</small></span>
              <span className="layer-lock layer-lock--open" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6" /></svg>
              </span>
            </button>
            <button className="layer-menu-trigger" type="button" aria-label="Actions for Get Vizor" aria-haspopup="menu" aria-expanded="false">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={5} cy={10} r="1.35" /><circle cx={10} cy={10} r="1.35" /><circle cx={15} cy={10} r="1.35" /></svg>
            </button>
          </li>
          <li>
            <button className="layer-select" type="button" data-layer-id="qr">
              <span className="layer-kind">QR</span>
              <span><strong>Payment QR</strong><small>740 × 740</small></span>
              <span className="layer-lock layer-lock--open" aria-hidden="true">
                <svg viewBox="0 0 20 20"><path d="M5.5 8.75h9v7.75h-9z" /><path d="M7.5 8.75V6.5a2.5 2.5 0 0 1 4.9-.6" /></svg>
              </span>
            </button>
            <button className="layer-menu-trigger" type="button" aria-label="Actions for Payment QR" aria-haspopup="menu" aria-expanded="false">
              <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx={5} cy={10} r="1.35" /><circle cx={10} cy={10} r="1.35" /><circle cx={15} cy={10} r="1.35" /></svg>
            </button>
          </li>
        </ol>
        <p className="privacy-note">Nothing leaves this browser. No storage, no network.</p>
      </section>
          </div>
        </aside>
        <button type="button" className="button button--primary studio-next" data-next-step="review">Review &amp; print →</button>
      </section>
    </div>
      <section id="studio-review" className="studio-step" >
        <header className="studio-section-head"><h1>Review &amp; print</h1><p>Check the destination, then test one printed copy.</p></header>
        <section className="review-section"><h2>Card details</h2><dl className="review-facts"><div><dt>Event</dt><dd id="review-event" /></div><div><dt>Heading</dt><dd id="review-heading" /></div><div className="review-destination"><dt>QR destination</dt><dd id="review-destination" /></div></dl><button type="button" id="review-edit" className="ghost-button">Edit details</button></section>
        <section className="review-section"><h2 id="review-check-summary">Print checks</h2><ul id="review-checks" /><p className="scan-reminder">Print a sample and scan it with the intended wallet before printing the full batch. Layout checks do not verify the receiving wallet or gift balance.</p></section>
        <section className="review-section"><h2>How will you use it?</h2><div className="output-options"><button type="button" id="print-a4"><strong>Office printer</strong><small>A6 card on A4, with cut marks</small></button><button type="button" id="print-png"><strong>Print shop</strong><small>300 ppi PNG with 3 mm bleed</small></button><button type="button" id="print-a6"><strong>A6 / PDF</strong><small>Actual size, without bleed</small></button><button type="button" id="present-card"><strong>Display on screen</strong><small>Card only, without editing tools</small></button></div></section>
        <section className="review-section"><h2>Multiple cards</h2><p>One QR value per line. Gift links are checked for duplicates.</p><div className="batch-actions"><button type="button" id="batch-sheet" className="button button--secondary">Print A4 sheets</button><button type="button" id="batch-zip" className="button button--secondary">Download PNGs / ZIP</button></div></section>
      </section>

    {/* ─────────── Workspace ─────────── */}
    <section className="workspace" aria-label="Card canvas">
      <header className="studio-preview-head">
        <span>Card preview <small>A6 · 105 × 148 mm</small></span>
        <button type="button" id="mobile-preview" aria-expanded="false">Show preview</button>
      </header>
      <div id="gift-warning" className="gift-warning" role="status" hidden>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.25 17.5 16.5h-15L10 3.25Z" /><path d="M10 8.25v3.5" /><path d="M10 14h.01" /></svg>
        <p><strong>This QR <em>is</em> the gift.</strong> Anyone who scans it can claim the funds. Print, don't share.</p>
      </div>
      <div id="canvas-stage" className="canvas-stage">
        <div id="canvas-frame" className="canvas-frame">
          <canvas id="card-canvas" width={1311} height={1819} aria-label="Card preview" />
          <div id="card-loading" className="card-loading" role="status" aria-live="polite">
            <div className="card-loading__message">
              <strong id="card-loading-title">Loading your card…</strong>
              <p id="card-loading-detail">Preparing fonts and artwork</p>
              <progress id="card-loading-progress" aria-label="Artwork loaded" />
            </div>
          </div>
          <svg id="proof-guides" className="proof-guides" viewBox="0 0 1311 1819" preserveAspectRatio="none" aria-hidden="true">
            <rect className="trim-line" x={35} y={35} width={1240} height={1748} />
            <rect className="safe-line" x={94} y={94} width={1122} height={1630} />
            <rect id="qr-guide" className="qr-line" x={286} y={250} width={740} height={740} />
          </svg>
          <svg id="editor-overlay" className="editor-overlay" viewBox="0 0 1311 1819" preserveAspectRatio="none" aria-hidden="true">
            <g id="snap-guides" className="snap-guides" />
            <g id="selection-box" className="selection-box" hidden>
              <line id="rotation-stem" className="rotation-stem" />
              <rect id="selection-rect" className="selection-rect" data-handle="move" />
              <rect className="resize-handle" data-handle="resize-nw" />
              <rect className="resize-handle" data-handle="resize-ne" />
              <rect className="resize-handle" data-handle="resize-se" />
              <rect className="resize-handle" data-handle="resize-sw" />
              <circle id="rotation-handle" className="rotation-handle" data-handle="rotate" />
            </g>
          </svg>
        </div>
      </div>
      <footer className="stage-footer">
        <div className="stage-toggles">
          <label className="mini-switch">
            <input id="guide-toggle" type="checkbox" />
            <span className="mini-switch__track" aria-hidden="true" />
            <span className="mini-switch__label">Print guides</span>
          </label>
          <label className="mini-switch">
            <input id="snap-toggle" type="checkbox" defaultChecked />
            <span className="mini-switch__track" aria-hidden="true" />
            <span className="mini-switch__label">Snap</span>
          </label>
        </div>
        <p className="stage-legend">
          <span><i className="legend legend--trim" />Trim</span>
          <span><i className="legend legend--safe" />Safe area</span>
          <span><i className="legend legend--qr" />QR zone</span>
          <span className="stage-legend__spec">A6 · 1311 × 1819 px · 300 ppi</span>
        </p>
      </footer>
      <button type="button" id="live-print-check" aria-live="polite"></button>
    </section>
  </div>
  {/* ══════════════════════════ OVERLAYS ══════════════════════════ */}
  <canvas id="print-canvas" width={1240} height={1748} aria-hidden="true" />
  <div id="layer-context-menu" className="popover-menu context-menu" role="menu" aria-label="Layer actions" tabIndex={-1} hidden>
    <button type="button" role="menuitem" data-layer-action="duplicate">Duplicate</button>
    <button type="button" role="menuitem" data-layer-action="lock">Lock layer</button>
    <button type="button" role="menuitem" data-layer-action="flip-x">Flip horizontal</button>
    <div className="popover-menu__separator" role="separator" />
    <button type="button" role="menuitem" data-layer-action="front">Bring to front</button>
    <button type="button" role="menuitem" data-layer-action="up">Move up</button>
    <button type="button" role="menuitem" data-layer-action="down">Move down</button>
    <button type="button" role="menuitem" data-layer-action="back">Send to back</button>
    <div className="popover-menu__separator" role="separator" />
    <button className="popover-menu__danger" type="button" role="menuitem" data-layer-action="delete">
      Delete
    </button>
  </div>
  <dialog id="help-dialog" className="dialog dialog--help" aria-labelledby="help-dialog-title">
    <form method="dialog" className="dialog__form">
      <header className="dialog__head dialog__head--row">
        <div>
          <h2 id="help-dialog-title">Shortcuts &amp; tips</h2>
          <p className="dialog__hint">Press <kbd>?</kbd> any time to open this sheet.</p>
        </div>
        <button className="icon-button icon-button--sm" type="submit" aria-label="Close">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5.5 5.5 9 9" /><path d="m14.5 5.5-9 9" /></svg>
        </button>
      </header>
      <div className="help-columns">
        <section className="help-group">
          <h3>Canvas</h3>
          <dl>
            <div><dt>Drag</dt><dd>Move a layer. Guides snap to the centre, safe area and other layers.</dd></div>
            <div><dt><kbd>Alt</kbd> + drag</dt><dd>Move without snapping</dd></div>
            <div><dt><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></dt><dd>Nudge 1 px, <kbd>Shift</kbd> for 10 px</dd></div>
            <div><dt>Double-click text</dt><dd>Edit its content</dd></div>
            <div><dt>Right-click</dt><dd>Layer menu: order, lock, flip, delete</dd></div>
            <div><dt><kbd>Esc</kbd></dt><dd>Deselect</dd></div>
          </dl>
        </section>
        <section className="help-group">
          <h3>Layers</h3>
          <dl>
            <div><dt><kbd>⌘</kbd><kbd>D</kbd></dt><dd>Duplicate</dd></div>
            <div><dt><kbd>Delete</kbd></dt><dd>Remove the selected layer</dd></div>
            <div><dt><kbd>⌘</kbd><kbd>Z</kbd></dt><dd>Undo</dd></div>
            <div><dt><kbd>⌘</kbd><kbd>⇧</kbd><kbd>Z</kbd></dt><dd>Redo</dd></div>
          </dl>
        </section>
        <section className="help-group">
          <h3>View</h3>
          <dl>
            <div><dt><kbd>⌘</kbd> + wheel</dt><dd>Zoom around the pointer</dd></div>
            <div><dt><kbd>⌘</kbd><kbd>0</kbd></dt><dd>Fit the card</dd></div>
            <div><dt><kbd>⌘</kbd><kbd>=</kbd> / <kbd>⌘</kbd><kbd>−</kbd></dt><dd>Zoom in / out</dd></div>
          </dl>
        </section>
        <section className="help-group">
          <h3>File</h3>
          <dl>
            <div><dt><kbd>⌘</kbd><kbd>S</kbd></dt><dd>Save the design as .json</dd></div>
            <div><dt><kbd>⌘</kbd><kbd>O</kbd></dt><dd>Open a design file</dd></div>
            <div><dt>Export</dt><dd>Runs a print preflight first: QR size, overlaps, safe area</dd></div>
          </dl>
        </section>
      </div>
      <p className="help-foot">On Windows and Linux use <kbd>Ctrl</kbd> for <kbd>⌘</kbd>. Nothing leaves this browser: no storage, no network.</p>
    </form>
  </dialog>
  <dialog id="batch-dialog" className="dialog dialog--batch" aria-labelledby="batch-dialog-title" aria-describedby="batch-description">
    <form method="dialog" className="dialog__form">
      <header className="dialog__head">
        <p className="batch-eyebrow">MULTIPLE CARDS</p>
        <h2 id="batch-dialog-title">One design. A card for every line.</h2>
        <p id="batch-description" className="dialog__hint">Use your current design with a different QR on each card. Your list stays in this browser.</p>
      </header>
      <div className="batch-workspace">
        <section className="batch-entry" aria-labelledby="batch-input-label">
          <div className="batch-section-head">
            <label id="batch-input-label" className="field-label" htmlFor="batch-input">1. Add your list</label>
            <button id="batch-import-button" className="button button--secondary" type="button">Add .txt file</button>
            <input id="batch-file" type="file" accept=".txt,text/plain" hidden />
          </div>
          <p id="batch-hint" className="dialog__hint">One URL per line.</p>
          <textarea id="batch-input" rows={10} spellCheck="false" autoCapitalize="off" autoComplete="off" aria-describedby="batch-hint" placeholder="https://example.com/one
https://example.com/two" defaultValue={""} />
          <p className="dialog__hint">Paste a column from your spreadsheet, or append a text file. Blank lines are ignored.</p>
          <div className="batch-validation">
            <p id="batch-count" className="batch-count" role="status">No cards yet</p>
            <ul id="batch-errors" className="batch-errors" aria-label="Rows to fix" />
            <label id="batch-exclude-row" className="batch-exclude" hidden><input id="batch-exclude" type="checkbox" /><span id="batch-exclude-text" /></label>
          </div>
        </section>
        <section className="batch-output" aria-labelledby="batch-output-title">
          <h3 id="batch-output-title" className="field-label">2. Choose your output</h3>
          <fieldset id="batch-formats" className="batch-formats">
            <legend className="sr-only">Output format</legend>
            <label><input type="radio" name="batch-format" defaultValue="zip" defaultChecked /><span><strong>PNG images / ZIP</strong><small>One print-ready image per card<br />300 ppi, with bleed</small></span></label>
            <label><input type="radio" name="batch-format" defaultValue="sheet" /><span><strong>A4 print sheets</strong><small>Two A6 cards per sheet<br />Landscape, with cut marks</small></span></label>
          </fieldset>
          <div className="batch-output-summary">
            <p className="batch-eyebrow">YOUR OUTPUT</p>
            <p id="batch-preview" className="batch-preview" aria-live="polite" />
          </div>
          <p id="batch-gift-note" className="dialog__hint" hidden>Gift numbers identify printed copies, not claim status. Reprinting a card does not create a new gift.</p>
        </section>
      </div>
      <footer className="batch-footer">
        <div className="batch-feedback">
          <p id="batch-status" className="dialog__hint" role="status" />
          <p id="batch-failure" className="batch-failure" role="alert" hidden />
          <progress id="batch-progress" className="batch-progress" max={100} value={0} aria-label="Cards prepared" hidden />
        </div>
        <div className="dialog__actions">
          <button id="batch-cancel-button" className="button button--secondary" type="button">Close</button>
          <button id="batch-run-button" className="button button--primary" type="button">Download ZIP</button>
        </div>
      </footer>
    </form>
</dialog>
</div>;
});


export default function App() {
  const [step, setStep] = useState(0);
  const appRef = useRef(null);

  useEffect(() => {
    for (const [id, index] of [["studio-content", 0], ["studio-design", 1], ["studio-review", 2]]) {
      const section = document.getElementById(id);
      if (section) section.hidden = step !== index;
    }
  }, [step]);

  useEffect(() => {
    const controller = mountApp({ onStepChange: setStep });
    appRef.current = controller;
    return () => {
      appRef.current = null;
      controller.destroy();
    };
  }, []);

  function changeStep(index) {
    setStep(index);
    appRef.current?.showStep(STEPS[index]);
  }

  return <>
    <GooeyNav
      aria-label="Card creation"
      className="react-step-nav"
      items={["Content", "Design", "Review & print"]}
      value={step}
      onChange={changeStep}
      size="sm"
      activeColor="var(--accent, #d51f62)"
      activeLabelColor="#fff"
    />
    <EditorMarkup />
  </>;
}
