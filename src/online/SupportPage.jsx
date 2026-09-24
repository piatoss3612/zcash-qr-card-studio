import { useEffect, useState } from "react";
import { parseCard, paymentUri, STYLES, COMPANIONS } from "./card-data.js";
import { qrSvg } from "./card-render.js";
import { svgUrl } from "./browser.js";
import "./online.css";

export default function SupportPage() {
  const [state, setState] = useState({ card: null, error: "", loading: true });
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    let generation = 0;
    async function load() {
      const current = ++generation;
      document.title = "Support with Zcash";
      setState({ card: null, error: "", loading: true });
      setAmount("");
      setOpened(false);
      setMessage("");
      try {
        const card = await parseCard(location.hash.slice(1));
        if (generation === current) {
          setState({ card, error: "", loading: false });
          document.title = `Support ${card.name} · Zcash`;
        }
      } catch (error) {
        if (generation === current)
          setState({ card: null, error: error.message, loading: false });
      }
    }
    load();
    window.addEventListener("hashchange", load);
    return () => {
      generation++;
      window.removeEventListener("hashchange", load);
    };
  }, []);

  const card = state.card;
  let uri = "";
  let amountError = "";
  let qr = "";
  if (card) {
    try {
      uri = paymentUri(card, amount);
      qr = qrSvg(uri);
    } catch (error) {
      uri = "";
      amountError = error.message;
    }
  }
  async function copy(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied.`);
    } catch {
      setMessage(
        "Clipboard access is unavailable. Select and copy the receiving address below.",
      );
    }
  }
  const theme = card ? STYLES[card.style] : STYLES.paper;
  const companion = card ? COMPANIONS[card.companion] : null;
  return (
    <main
      className="oc-support"
      data-style={card?.style}
      style={{
        "--support-bg": theme.bg,
        "--support-ink": theme.ink,
        "--support-muted": theme.muted,
        "--support-border": theme.border,
        "--support-accent": theme.accent,
      }}
    >
      <a className="oc-support-brand" href="./">
        <img src="./assets/vizorcat-icon.png" width="28" height="28" alt="" />{" "}
        QR Card Studio
      </a>
      {state.loading ? (
        <p role="status">Opening support card…</p>
      ) : !card ? (
        <section className="oc-support-panel">
          <h1>This link needs another look.</h1>
          <p role="alert">{state.error}</p>
          <p>Ask the creator for a new support link.</p>
          <a className="oc-primary" href="./">
            Create your own card
          </a>
        </section>
      ) : (
        <>
          <section className="oc-support-panel">
            <div className="oc-support-identity">
              <div>
                <span className="oc-kicker">A LITTLE SUPPORT FOR</span>
                <h1>{card.name}</h1>
                <p>{card.bio || "Independent work, made with care."}</p>
              </div>
              {companion.path && (
                <img
                  className="oc-support-cat"
                  src={`./${companion.path}`}
                  alt={companion.label}
                />
              )}
            </div>
            <div className="oc-support-payment">
              <div className="oc-support-form">
                {card.amount ? (
                  <div className="oc-fixed-amount">
                    <span>Requested amount</span>
                    <strong>
                      {card.amount} <small>ZEC</small>
                    </strong>
                  </div>
                ) : (
                  <label className="oc-field">
                    Your support · ZEC
                    <input
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setOpened(false);
                      }}
                      placeholder="Choose an amount"
                      aria-describedby="support-amount-note"
                    />
                  </label>
                )}
                <p className="oc-hint" id="support-amount-note">
                  {card.amount
                    ? "This amount is included in the payment request."
                    : "Leave blank to choose an amount in your wallet."}
                </p>
                {card.memo && (
                  <p className="oc-payment-memo">
                    <strong>Memo</strong>
                    {card.memo}
                  </p>
                )}
                {amountError && (
                  <p role="alert" className="oc-validation">
                    {amountError}
                  </p>
                )}
                {uri ? (
                  <a
                    className="oc-primary oc-wallet-button"
                    href={uri}
                    onClick={() => setOpened(true)}
                  >
                    Open wallet <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <button className="oc-primary" disabled>
                    Open wallet
                  </button>
                )}
                <button
                  className="oc-copy-request"
                  disabled={!uri}
                  onClick={() => copy(uri, "Payment request")}
                >
                  Copy payment request
                </button>
                {opened && (
                  <p className="oc-hint" role="status">
                    Continue in your wallet and review the recipient and amount.
                    If nothing opened, copy the request or scan the QR with a
                    compatible wallet.
                  </p>
                )}
              </div>
              <div className="oc-support-qr">
                {qr ? (
                  <img
                    src={svgUrl(qr)}
                    alt="Scan this ZIP-321 request with a Zcash wallet"
                  />
                ) : (
                  <div className="oc-qr-empty">
                    Enter a valid amount to show the QR.
                  </div>
                )}
                <span>Or scan with your Zcash wallet</span>
              </div>
            </div>
            <details className="oc-address-details">
              <summary>Receiving address</summary>
              <p>Check the destination in your wallet before sending.</p>
              <code>{card.address}</code>
              <button
                className="oc-secondary"
                onClick={() => copy(card.address, "Address")}
              >
                Copy address
              </button>
            </details>
            <p className="oc-feedback" role="status">
              {message}
            </p>
            <p className="oc-support-note">
              Sent directly to the creator’s wallet. This page does not hold
              funds or confirm payments.
            </p>
          </section>
          <p className="oc-wallet-help">
            New to Zcash?{" "}
            <a href="https://vizor.cash/get" target="_blank" rel="noreferrer">
              Get Vizor ↗
            </a>
            <span>
              Or use another wallet that supports Zcash payment requests.
            </span>
          </p>
          <a className="oc-create-own" href="./">
            Make a little card of your own <span aria-hidden="true">→</span>
          </a>
        </>
      )}
    </main>
  );
}
